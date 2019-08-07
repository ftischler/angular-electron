import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ReadWriteImageService } from '../read-write-image/read-write-image.service';
import { ReadExcelService } from '../read-excel/read-excel.service';
import { Observable, timer } from 'rxjs';
import { finalize, map, take, withLatestFrom } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Schueler } from '../schueler.model';
import { InitializeStorageService } from '../initialize-storage/initialize-storage.service';

// TODO show info box to check einstellungen on first visit (main.ts -> event)
// TODO was wenn excel zellen leer sind?
// TODO erneute aufnahme nicht erlauben, wenn schon ein bild genommen wurde
// TODO loading previously taken img also when other schueler is selected
// TODO gebdatum input und abfrage ob übereinstimmung mit --> nur dann abspeichern
// TODO evtl. excel datei inhalt in localstorage/indexeddb cachen

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  @ViewChild('webcam', { static: true }) webcamVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  @HostListener('document:keydown.arrowdown') onArrowDown() {
    const selectedKlasseIndex = this.klassenPool.findIndex(klasse => klasse === this.selectedKlasseForm.value);
    const nextKlasse = this.klassenPool[(selectedKlasseIndex + 1) % this.klassenPool.length];
    this.selectedKlasseForm.setValue(nextKlasse);
  }

  @HostListener('document:keydown.arrowup') onArrowUp() {
    const selectedKlasseIndex = this.klassenPool.findIndex(klasse => klasse === this.selectedKlasseForm.value);
    const nextKlasse = this.klassenPool[
      selectedKlasseIndex - 1 === -1 || selectedKlasseIndex === -1
        ? this.klassenPool.length - 1
        : selectedKlasseIndex - 1
    ];
    this.selectedKlasseForm.setValue(nextKlasse);
  }

  @HostListener('document:keydown.arrowright') onArrowRight() {
    if (this.selectedKlasseForm.value) {
      const selectedSchuelerIndex = this.schuelerPool.findIndex(
        schueler => schueler.id === this.schuelerForm.get('id').value
      );
      const nextSchueler = this.schuelerPool[(selectedSchuelerIndex + 1) % this.schuelerPool.length];
      this.schuelerForm.patchValue(nextSchueler);
    } else {
      this.selectedKlasseForm.markAsTouched();
    }
  }

  @HostListener('document:keydown.arrowleft') onArrowLeft() {
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
  klassenPool: string[];
  schuelerPool: Schueler[];

  readonly COUNTDOWN_FROM = 3;
  private readonly SQUARESIZE = 500;
  private canvasCtx: CanvasRenderingContext2D;

  constructor(
    private initializeStorageService: InitializeStorageService,
    private readExcelService: ReadExcelService,
    private saveImageService: ReadWriteImageService
  ) {}

  ngOnInit() {
    this.initializeStorageService.initializeAll();
    this.readExcelService.parseExcel();

    this.canvasCtx = this.canvas.nativeElement.getContext('2d');

    this.selectedKlasseForm = new FormControl('', [Validators.required]);
    this.schuelerForm = new FormGroup({
      id: new FormControl({ value: '', disabled: true }),
      vorname: new FormControl({ value: '', disabled: true }),
      nachname: new FormControl({ value: '', disabled: true })
    });

    this.selectedKlasseForm.valueChanges
      .pipe(withLatestFrom(this.readExcelService.klassenWithSchueler$))
      .subscribe(([selectedKlasse, data]) => {
        this.schuelerPool = data.get(selectedKlasse);
        this.schuelerForm.patchValue(this.schuelerPool[0]);

        this.loadExistingImage();
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

  private loadExistingImage() {
    try {
      // TODO try to read both? -> depends on if both images are always created or not
      const base64img = this.saveImageService.readImage(this.selectedKlasseForm.value, this.filenameName);
      const img = new Image();
      img.onload = () => {
        this.canvasCtx.drawImage(img, 0, 0, this.SQUARESIZE, this.SQUARESIZE);
      };
      img.src = base64img;
    } catch (e) {
      this.canvasCtx.clearRect(0, 0, this.SQUARESIZE, this.SQUARESIZE);
    }
  }

  capture(): void {
    this.drawImage();
    this.saveImage();
  }

  timedCapture(): void {
    this.countdown$ = timer(0, 1000).pipe(
      take(this.COUNTDOWN_FROM + 1),
      map(i => this.COUNTDOWN_FROM - i),
      finalize(() => this.capture())
    );
  }

  delete(): void {
    if (this.canvasCtx) {
      this.canvasCtx.clearRect(0, 0, this.SQUARESIZE, this.SQUARESIZE);
      this.selectedKlasseForm.markAsUntouched();
    }
  }

  drawImage(): void {
    this.canvasCtx.drawImage(this.webcamVideo.nativeElement, 0, 0, this.SQUARESIZE, this.SQUARESIZE);
  }

  get filenameName(): string {
    const { vorname, nachname } = this.schuelerForm.value;
    return `${nachname}_${vorname}`;
  }

  get filenameId(): string {
    return this.schuelerForm.get('id').value;
  }

  saveImage(): void {
    if (this.selectedKlasseForm.valid) {
      const url = this.canvas.nativeElement.toDataURL('image/jpg', 0.8);
      this.saveImageService.writeImage(url, this.selectedKlasseForm.value, this.filenameName);
      this.saveImageService.writeImage(url, this.selectedKlasseForm.value, this.filenameId);
    } else {
      this.selectedKlasseForm.markAsTouched();
    }
  }
}
