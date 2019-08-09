import {
  ChangeDetectionStrategy,
  Component,
  ElementRef, HostBinding,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ReadWriteImageService } from '../read-write-image/read-write-image.service';
import { ReadExcelService } from '../read-excel/read-excel.service';
import { Observable, Subject, Subscription, timer } from 'rxjs';
import { finalize, map, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Schueler } from '../schueler.model';
import { InitializeStorageService } from '../initialize-storage/initialize-storage.service';
import { isEqual } from 'date-fns';

// TODO performance bei viel daten in excel messen!! -> evtl. excel datei inhalt in localstorage/indexeddb cachen
// TODO evtl. zusätzliches dropdown für namen (vorname nachname zusammen)?

// TODO test this shit

// 3 states
// 1. saved picture available (try von loadExistingImageIfExisting) => aufnehmen + timer, but disabled
// 2. form not valid (klasse ausgewählt und gebdatum ausgewählt -> formsValid(cb)) => gespeichert mit check icon
// 3. can actually take picture => aufnehmen + timer (active)

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('webcam', { static: true }) webcamVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  @HostListener('document:keydown.arrowdown') onArrowDown() {
    this.arrowDownNavigation();
  }

  private arrowDownNavigation() {
    const selectedKlasseIndex = this.klassenPool.findIndex(klasse => klasse === this.selectedKlasseForm.value);
    const nextKlasse = this.klassenPool[ (selectedKlasseIndex + 1) % this.klassenPool.length ];
    this.selectedKlasseForm.setValue(nextKlasse);
  }

  @HostListener('document:keydown.arrowup') onArrowUp() {
    this.arrowUpNavigation();
  }

  private arrowUpNavigation() {
    const selectedKlasseIndex = this.klassenPool.findIndex(klasse => klasse === this.selectedKlasseForm.value);
    const nextKlasse = this.klassenPool[
      selectedKlasseIndex - 1 === -1 || selectedKlasseIndex === -1
        ? this.klassenPool.length - 1
        : selectedKlasseIndex - 1
      ];
    this.selectedKlasseForm.setValue(nextKlasse);
  }

  @HostListener('document:keydown.arrowright') onArrowRight() {
    this.arrowRightNavigation();
  }

  private arrowRightNavigation() {
    if (this.selectedKlasseForm.value) {
      const selectedSchuelerIndex = this.schuelerPool.findIndex(
        schueler => schueler.id === this.schuelerForm.get('id').value
      );
      const nextSchueler = this.schuelerPool[ (selectedSchuelerIndex + 1) % this.schuelerPool.length ];
      this.schuelerForm.patchValue(nextSchueler);
    } else {
      this.selectedKlasseForm.markAsTouched();
    }
  }

  @HostListener('document:keydown.arrowleft') onArrowLeft() {
    this.arrowLeftNavigation();
  }

  private arrowLeftNavigation() {
    if (this.selectedKlasseForm.value) {
      const selectedSchuelerIndex = this.schuelerPool.findIndex(
        schueler => schueler.id === this.schuelerForm.get('id').value
      );
      const nextSchueler = this.schuelerPool[
        selectedSchuelerIndex - 1 === -1 || selectedSchuelerIndex === -1
          ? this.schuelerPool.length - 1
          : selectedSchuelerIndex - 1
        ];
      this.schuelerForm.patchValue(nextSchueler);
    } else {
      this.selectedKlasseForm.markAsTouched();
    }
  }

  countdown$: Observable<number>;

  selectedKlasseForm: FormControl;
  schuelerForm: FormGroup;
  gebdatumForm: FormControl;

  klassenPool: string[];
  schuelerPool: Schueler[];

  canTakePicture = true;
  canTakePictureDisabled = true;

  readonly COUNTDOWN_FROM = 3;
  readonly START_DATEPICKER = new Date(2005, 0, 1);
  private readonly SQUARESIZE = 500;
  private canvasCtx: CanvasRenderingContext2D;

  private destroy$$ = new Subject<void>();

  constructor(
    private initializeStorageService: InitializeStorageService,
    private readExcelService: ReadExcelService,
    private saveImageService: ReadWriteImageService
  ) {
  }

  ngOnInit() {
    this.initializeStorageService.initializeAll();
    this.readExcelService.parseExcel();

    this.canvasCtx = this.canvas.nativeElement.getContext('2d');

    this.selectedKlasseForm = new FormControl('', [Validators.required]);
    this.schuelerForm = new FormGroup({
      id: new FormControl({ value: '', disabled: true }),
      vorname: new FormControl({ value: '', disabled: true }),
      nachname: new FormControl({ value: '', disabled: true }),
      gebdatum: new FormControl({ value: '', disabled: true })
    });
    this.gebdatumForm = new FormControl({ value: '', disabled: true }, [Validators.required]);

    this.selectedKlasseForm.valueChanges
      .pipe(withLatestFrom(this.readExcelService.klassenWithSchueler$), takeUntil(this.destroy$$))
      .subscribe(([selectedKlasse, data]) => {
        this.schuelerPool = data.get(selectedKlasse);
        this.schuelerForm.setValue(this.schuelerPool[ 0 ]);
        this.gebdatumForm.enable();
        this.gebdatumForm.reset();
      });

    this.schuelerForm.valueChanges.pipe(takeUntil(this.destroy$$)).subscribe(schueler => {
      console.log(schueler); // TODO remove this
      this.loadImageIfExisting();
      this.gebdatumForm.reset();
    });

    this.gebdatumForm.valueChanges.pipe(takeUntil(this.destroy$$)).subscribe(() => {
      this.canTakePictureDisabled = !this.gebdatumEnteredCorrectly();
    });

    this.readExcelService.klassen$.subscribe(klassen => (this.klassenPool = klassen));

    const webcamConfig = {
      audio: false,
      video: {
        mandatory: {
          maxHeight: this.SQUARESIZE,
          maxWidth: this.SQUARESIZE,
          minHeight: this.SQUARESIZE,
          minWidth: this.SQUARESIZE
        }
      }
    };

    navigator.getUserMedia(
      webcamConfig as any,
      stream => (this.webcamVideo.nativeElement.srcObject = stream),
      error => console.error(error)
    );
  }

  private loadImageIfExisting() {
    try {
      // TODO try to read both? -> depends on if both images are always created or not
      const base64img = this.saveImageService.readImage(this.selectedKlasseForm.value, this.filenameName);
      const img = new Image();
      img.onload = () => {
        this.canvasCtx.drawImage(img, 0, 0, this.SQUARESIZE, this.SQUARESIZE);
      };
      img.src = base64img;
      this.canTakePicture = false;
    } catch (e) {
      this.clearCanvas();
    }
  }

  private clearCanvas() {
    this.canvasCtx.clearRect(0, 0, this.SQUARESIZE, this.SQUARESIZE);
    this.canTakePicture = true;
  }

  capture(): void {
    if (this.formsValid()) {
      this.drawImage();
      this.saveImage();
      this.canTakePicture = false;
    }
  }

  timedCapture(): void {
    if (this.formsValid()) {
      this.countdown$ = timer(0, 1000).pipe(
        take(this.COUNTDOWN_FROM + 1),
        map(i => this.COUNTDOWN_FROM - i),
        finalize(() => {
          this.capture();
          this.countdown$ = undefined; // reset countdown observable, otherwise ngif="showcamera" restarts the countdown.
        })
      );
    }
  }

  delete(): void {
    this.clearCanvas();
    this.selectedKlasseForm.markAsUntouched();
  }

  drawImage(): void {
    this.canvasCtx.drawImage(this.webcamVideo.nativeElement, 0, 0, this.SQUARESIZE, this.SQUARESIZE);
  }

  formsValid(): boolean {
    if (this.selectedKlasseForm.valid) {
      if (this.gebdatumEnteredCorrectly()) {
        return true;
      } else {
        this.gebdatumForm.markAsTouched();
        return false;
      }
    } else {
      this.selectedKlasseForm.markAsTouched();
      return false;
    }
  }

  gebdatumEnteredCorrectly(): boolean {
    const enteredGebdatum = this.gebdatumForm.value;
    const correctGebdatum = this.schuelerForm.get('gebdatum').value;
    if (enteredGebdatum && correctGebdatum) {
      return isEqual(enteredGebdatum, correctGebdatum);
    } else {
      return false;
    }
  }

  get filenameName(): string {
    const { vorname, nachname } = this.schuelerForm.value;
    return `${nachname}_${vorname}`;
  }

  get filenameId(): string {
    return this.schuelerForm.get('id').value;
  }

  saveImage(): void {
    const url = this.canvas.nativeElement.toDataURL('image/jpg', 0.8);
    this.saveImageService.writeImage(url, this.selectedKlasseForm.value, this.filenameName);
    this.saveImageService.writeImage(url, this.selectedKlasseForm.value, this.filenameId);
  }

  overwriteUp(e) {
    e.stopImmediatePropagation();
    this.arrowUpNavigation();
  }

  overwriteDown(e) {
    e.stopImmediatePropagation();
    this.arrowDownNavigation();
  }

  overwriteLeft(e) {
    e.stopImmediatePropagation();
    this.arrowLeftNavigation();
  }

  overwriteRight(e) {
    e.stopImmediatePropagation();
    this.arrowRightNavigation();
  }

  ngOnDestroy(): void {
    this.destroy$$.next();
  }
}
