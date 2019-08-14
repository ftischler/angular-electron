import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  OnInit,
  ViewChild
} from '@angular/core';
import { ReadWriteImageService } from '../read-write-image/read-write-image.service';
import { ReadExcelService } from '../read-excel/read-excel.service';
import { Observable, Subject, timer } from 'rxjs';
import { distinctUntilChanged, filter, finalize, map, take, takeUntil, withLatestFrom } from 'rxjs/operators';
import { AbstractControl, Form, FormControl, FormGroup, Validators } from '@angular/forms';
import { Schueler } from '../schueler.model';
import { InitializeStorageService } from '../initialize-storage/initialize-storage.service';
import { isEqual } from 'date-fns';
import { Key } from 'readline';

// TODO test this shit

// TODO bug: year comparison not working when year not entered with 4 digits
// try momentjs

// TODO don't disable aufnehmen button from the start, but show error message (set whole form touched?)
// also show correct message below schueler profile

// TODO vor Testauslieferung: lizenzrechte? schule gehört nicht der schule, sondern nur das benutzungsrecht.

// TODO feature: aus excel datei auch geschlecht auslesen -> musterfoto für männer/frauen unterschiedlich

// TODO erweiterung/anmerkung: was tun bei gleichem namen in der gleichen klasse

// 3 states
// 1. saved picture available (try von loadExistingImageIfExisting) => aufnehmen + timer, but disabled
// 2. form not valid (klasse ausgewählt und gebdatum ausgewählt -> formsValid(cb)) => gespeichert mit check icon
// 3. can actually take picture => aufnehmen + timer (active)

// type saveBtnStatus = 'a' | 'b';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  @ViewChild('webcam', { static: true }) webcamVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  @HostListener('document:keydown.arrowdown', ['$event']) onArrowDown(event: KeyboardEvent) {
    if (event.target instanceof HTMLBodyElement) {
      this.arrowDownNavigation();
    }
  }

  private arrowDownNavigation() {
    const selectedKlasseIndex = this.klassenPool.findIndex(klasse => klasse === this.klasseControl.value);
    if (selectedKlasseIndex + 1 < this.klassenPool.length) {
      this.klasseControl.setValue(this.klassenPool[selectedKlasseIndex + 1]);
    }
  }

  @HostListener('document:keydown.arrowup', ['$event']) onArrowUp(event: KeyboardEvent) {
    if (event.target instanceof HTMLBodyElement) {
      this.arrowUpNavigation();
    }
  }

  private arrowUpNavigation() {
    const selectedKlasseIndex = this.klassenPool.findIndex(klasse => klasse === this.klasseControl.value);
    if (selectedKlasseIndex - 1 >= 0) {
      this.klasseControl.setValue(this.klassenPool[selectedKlasseIndex - 1]);
    }
  }

  @HostListener('document:keydown.arrowright', ['$event']) onArrowRight(event: KeyboardEvent) {
    if (event.target instanceof HTMLBodyElement) {
      this.arrowRightNavigation();
    }
  }

  private arrowRightNavigation() {
    if (this.klasseControl.value) {
      const selectedSchuelerIndex = this.schuelerPool.findIndex(
        schueler => schueler.id === this.schuelerControl.value.id
      );
      if (selectedSchuelerIndex +1 < this.schuelerPool.length) {
        this.schuelerControl.patchValue(this.schuelerPool[selectedSchuelerIndex + 1]);
      }
    } else {
      this.klasseControl.markAsTouched();
    }
  }

  @HostListener('document:keydown.arrowleft', ['$event']) onArrowLeft(event: KeyboardEvent) {
    if (event.target instanceof HTMLBodyElement) {
      this.arrowLeftNavigation();
    }
  }

  private arrowLeftNavigation() {
    if (this.klasseControl.value) {
      const selectedSchuelerIndex = this.schuelerPool.findIndex(
        schueler => schueler.id === this.schuelerControl.value.id
      );
      if (selectedSchuelerIndex - 1 >= 0) {
        this.schuelerControl.patchValue(this.schuelerPool[ selectedSchuelerIndex - 1 ]);
      }
    } else {
      this.klasseControl.markAsTouched();
    }
  }

  countdown$: Observable<number>;
  // saveBtnState$: Observable<saveBtnStatus>; // TODO use this to manage save btn state reactively

  schuelerForm: FormGroup;

  klassenPool: string[];
  schuelerPool: Schueler[];

  canTakePictureDisabled = true;

  readonly COUNTDOWN_FROM = 3;
  readonly START_DATEPICKER = new Date(2005, 0, 1);
  private readonly SQUARE_CAMERA = 500;
  readonly SQUARE_PICTURE = 400;
  private canvasCtx: CanvasRenderingContext2D;

  private destroy$$ = new Subject<void>();

  constructor(
    private initializeStorageService: InitializeStorageService,
    private readExcelService: ReadExcelService,
    private saveImageService: ReadWriteImageService
  ) {}

  ngOnInit() {
    this.initializeStorageService.initializeAll();

    this.readExcelService.parseExcel();

    this.canvasCtx = this.canvas.nativeElement.getContext('2d');

    this.schuelerForm = new FormGroup({
      klasse: new FormControl('', [Validators.required]),
      schueler: new FormControl({ value: '', disabled: true }, [Validators.required]),
      gebdatum: new FormControl({ value: '', disabled: true }, [Validators.required])
    });

    this.klasseControl.valueChanges
      .pipe(
        withLatestFrom(this.readExcelService.klassenWithSchueler$),
        distinctUntilChanged(),
        takeUntil(this.destroy$$)
      )
      .subscribe(([selectedKlasse, data]) => {
        this.schuelerPool = data.get(selectedKlasse);
        this.schuelerControl.enable();
        this.schuelerControl.setValue(this.schuelerPool[0]);
      });

    this.schuelerControl.valueChanges
      .pipe(
        filter(schueler => !!schueler),
        distinctUntilChanged(),
        takeUntil(this.destroy$$)
      )
      .subscribe(schueler => {
        console.log('korrektes gebdatum: ', schueler.gebdatum);
        this.loadImageIfExisting();
        this.gebdatumControl.enable();
        this.gebdatumControl.reset();
      });

    this.gebdatumControl.valueChanges
      .pipe(
        distinctUntilChanged(), // TODO idea: use map instead of logic in subscribe and turn into observable, also combinelatest with schueler valuechanges
        takeUntil(this.destroy$$)
      )
      .subscribe(() => {
        this.canTakePictureDisabled = !this.gebdatumEnteredCorrectly();
      });

    this.readExcelService.klassen$.subscribe(klassen => (this.klassenPool = klassen));

    const webcamConfig = {
      audio: false,
      video: {
        mandatory: {
          maxHeight: this.SQUARE_CAMERA,
          maxWidth: this.SQUARE_CAMERA,
          minHeight: this.SQUARE_CAMERA,
          minWidth: this.SQUARE_CAMERA
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
      const base64img = this.saveImageService.readImage(this.klasseControl.value, this.filenameName);
      const img = new Image();
      img.onload = () => {
        this.canvasCtx.drawImage(img, 0, 0, this.SQUARE_PICTURE, this.SQUARE_PICTURE);
      };
      img.src = base64img;
    } catch (e) {
      this.clearCanvas();
    }
  }

  private clearCanvas() {
    this.canvasCtx.clearRect(0, 0, this.SQUARE_PICTURE, this.SQUARE_PICTURE);
  }

  get klasseControl(): AbstractControl {
    return this.schuelerForm.get('klasse');
  }

  get schuelerControl(): AbstractControl {
    return this.schuelerForm.get('schueler');
  }

  get gebdatumControl(): AbstractControl {
    return this.schuelerForm.get('gebdatum');
  }

  schuelerSelected(): boolean {
    return this.schuelerControl.value;
  }

  get displayName(): string {
    const { vorname, nachname } = this.schuelerControl.value;
    if (this.schuelerSelected()) {
      return `${nachname}, ${vorname}`;
    } else {
      return '';
    }
  }

  capture(): void {
    if (this.formsValid()) {
      this.drawImage();
      this.saveImage();
    }
  }

  timedCapture(): void {
    if (this.formsValid()) {
      // TODO change this since it's probably not necessary in this way anymore
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
    this.klasseControl.markAsUntouched();
  }

  drawImage(): void {
    this.canvasCtx.drawImage(this.webcamVideo.nativeElement, 0, 0, this.SQUARE_PICTURE, this.SQUARE_PICTURE);
  }

  formsValid(): boolean {
    if (this.klasseControl.valid) {
      if (this.gebdatumEnteredCorrectly()) {
        return true;
      } else {
        this.gebdatumControl.markAsTouched();
        return false;
      }
    } else {
      this.klasseControl.markAsTouched();
      return false;
    }
  }

  gebdatumEnteredCorrectly(): boolean {
    const enteredGebdatum = this.gebdatumControl.value;
    const correctGebdatum = this.schuelerControl.value.gebdatum;
    if (enteredGebdatum) {
      console.log('eingegebenes Geburtsdatum: ', enteredGebdatum);
    }
    if (enteredGebdatum && correctGebdatum) {
      return isEqual(enteredGebdatum, correctGebdatum);
    } else {
      return false;
    }
  }

  get filenameName(): string {
    const { vorname, nachname } = this.schuelerControl.value;
    return `${nachname}_${vorname}`;
  }

  get filenameId(): string {
    return this.schuelerControl.value.id;
  }

  saveImage(): void {
    const url = this.canvas.nativeElement.toDataURL('image/jpg', 0.9);
    this.saveImageService.writeImage(url, this.klasseControl.value, this.filenameName);
    this.saveImageService.writeImage(url, this.klasseControl.value, this.filenameId);
  }

  ngOnDestroy(): void {
    this.destroy$$.next();
  }
}
