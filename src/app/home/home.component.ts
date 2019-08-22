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
import { merge, Observable, Subject, timer } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  finalize,
  map,
  mapTo,
  mergeAll,
  switchMapTo,
  take,
  takeUntil,
  withLatestFrom
} from 'rxjs/operators';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Schueler } from '../schueler.model';
import * as moment from 'moment';
import { MatSelect } from '@angular/material/select';
import { ObservableEvent } from '@typebytes/ngx-template-streams';

// TODO amann: besprechen: einstellungen nur mit pw zugang!
// Angular Logo der .exe Datei ersetzen mit was?
// meinen Namen irgendwo rein, Entwickler/Autor: Alexander Schuster

function gebdatumValidator(): ValidatorFn {
  return (group: FormGroup): ValidationErrors => {
    const enteredValue = group.controls['gebdatum'].value;
    const correctValue = group.controls['schueler'].value.gebdatum;
    if (!enteredValue) {
      group.controls['gebdatum'].setErrors({ required: true });
    } else if (!moment(enteredValue).isSame(correctValue)) {
      group.controls['gebdatum'].setErrors({ gebdatumUnequal: true });
    } else {
      group.controls['gebdatum'].setErrors(null);
    }
    return;
  };
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  constructor(private readExcelService: ReadExcelService, private saveImageService: ReadWriteImageService) {}

  get klasseControl(): AbstractControl {
    return this.schuelerForm.get('klasse');
  }

  get schuelerControl(): AbstractControl {
    return this.schuelerForm.get('schueler');
  }

  get gebdatumControl(): AbstractControl {
    return this.schuelerForm.get('gebdatum');
  }

  get displayName(): string {
    const { vorname, nachname } = this.schuelerControl.value;
    if (this.schuelerSelected()) {
      return `${nachname}, ${vorname}`;
    } else {
      return 'Musterfoto';
    }
  }

  get filenameName(): string {
    const { vorname, nachname } = this.schuelerControl.value;
    return `${nachname}_${vorname}`;
  }

  get filenameId(): string {
    return this.schuelerControl.value.id;
  }

  // TODO use reactive version!
  @ViewChild('webcam', { static: true }) webcamVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', { static: true }) canvas: ElementRef<HTMLCanvasElement>;

  captureCountdown$: Observable<number>;
  countdown$: Observable<number>;

  @ObservableEvent()
  clickCapture$: Observable<any>;

  @ObservableEvent()
  clickTimedCapture$: Observable<any>;

  submitted$: Observable<any> = merge([this.clickCapture$, this.clickTimedCapture$]).pipe(
    mergeAll(),
    mapTo(true)
  );

  captured$: Observable<any> = this.clickCapture$.pipe(
    filter(() => this.klasseControl.valid),
    filter(() => this.gebdatumControl.valid)
  );

  timedCaptured$: Observable<any> = this.clickTimedCapture$.pipe(
    filter(() => this.klasseControl.valid),
    filter(() => this.gebdatumControl.valid)
  );

  schuelerForm: FormGroup;

  klassenPool: string[];
  schuelerPool: Schueler[];

  pictureTaken = false;
  pictureLoaded = false;

  readonly COUNTDOWN_FROM = 3;
  readonly START_DATEPICKER = new Date(2005, 0, 1);
  private readonly SQUARE_CAMERA = 500;
  readonly SQUARE_PICTURE = 400;
  private canvasCtx: CanvasRenderingContext2D;

  private destroy$$ = new Subject<void>();

  @HostListener('document:keydown.arrowdown', ['$event']) onArrowDown(event: KeyboardEvent) {
    if (!(event.target instanceof MatSelect)) {
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
    if (!(event.target instanceof MatSelect)) {
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
    if (!(event.target instanceof MatSelect)) {
      this.arrowRightNavigation();
    }
  }

  private arrowRightNavigation() {
    if (this.klasseControl.value) {
      const selectedSchuelerIndex = this.schuelerPool.findIndex(
        schueler => schueler.id === this.schuelerControl.value.id
      );
      if (selectedSchuelerIndex + 1 < this.schuelerPool.length) {
        this.schuelerControl.patchValue(this.schuelerPool[selectedSchuelerIndex + 1]);
      }
    } else {
      this.klasseControl.markAsTouched();
    }
  }

  @HostListener('document:keydown.arrowleft', ['$event']) onArrowLeft(event: KeyboardEvent) {
    if (!(event.target instanceof MatSelect)) {
      this.arrowLeftNavigation();
    }
  }

  private arrowLeftNavigation() {
    if (this.klasseControl.value) {
      const selectedSchuelerIndex = this.schuelerPool.findIndex(
        schueler => schueler.id === this.schuelerControl.value.id
      );
      if (selectedSchuelerIndex - 1 >= 0) {
        this.schuelerControl.patchValue(this.schuelerPool[selectedSchuelerIndex - 1]);
      }
    } else {
      this.klasseControl.markAsTouched();
    }
  }

  ngOnInit() {
    this.captured$.subscribe(() => {
      this.capture();
    });

    this.captureCountdown$ = timer(0, 1000).pipe(
      take(this.COUNTDOWN_FROM + 1),
      map(i => this.COUNTDOWN_FROM - i),
      finalize(() => {
        this.capture();
      })
    );

    this.countdown$ = this.timedCaptured$.pipe(switchMapTo(this.captureCountdown$));

    this.schuelerForm = new FormGroup(
      {
        klasse: new FormControl('', [Validators.required]),
        schueler: new FormControl({ value: '', disabled: true }, [Validators.required]),
        gebdatum: new FormControl({ value: '', disabled: true })
      },
      gebdatumValidator()
    );

    this.readExcelService.klassen$.subscribe(klassen => (this.klassenPool = klassen));

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

    this.canvasCtx = this.canvas.nativeElement.getContext('2d');

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
      webcamConfig as MediaStreamConstraints,
      stream => (this.webcamVideo.nativeElement.srcObject = stream),
      error => console.error('webcam stream ran into error: ', error)
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
      this.pictureTaken = false;
      this.pictureLoaded = true;
    } catch (e) {
      this.clearCanvas();
    }
  }

  private clearCanvas() {
    this.canvasCtx.clearRect(0, 0, this.SQUARE_PICTURE, this.SQUARE_PICTURE);
    this.pictureLoaded = false;
    this.pictureTaken = false;
  }

  nextSchueler(): void {
    this.arrowRightNavigation();
  }

  schuelerSelected(): boolean {
    return this.schuelerControl.value;
  }

  capture(): void {
    this.drawImage();
    this.saveImage();
    this.pictureTaken = true;
    this.pictureLoaded = false;
  }

  drawImage(): void {
    this.canvasCtx.drawImage(this.webcamVideo.nativeElement, 0, 0, this.SQUARE_PICTURE, this.SQUARE_PICTURE);
  }

  isFemaleSelected(): boolean {
    return this.schuelerControl.value.geschlecht === 'W';
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
