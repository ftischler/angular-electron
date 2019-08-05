import { ChangeDetectionStrategy, Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { SaveImageService } from '../save-image/save-image.service';
import { ReadExcelService } from '../read-excel/read-excel.service';
import { Observable, timer } from 'rxjs';
import { finalize, map, take } from 'rxjs/operators';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Schueler } from '../schueler.model';
import _ from "lodash";

// TODO .exe icon aktuell angular logo -> evtl bss logo nehmen?

// TODO check if paths are present --> if not show a info message

// TODO zusätzliches feature: evtl ein Suchfeld nach Name

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  @ViewChild('webcam', {static: true}) webcamVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', {static: true}) canvas: ElementRef<HTMLCanvasElement>;

  @HostListener('document:keydown.arrowdown') onArrowDown() {
    const selectedKlasseIndex = this.klassenPool.findIndex(klasse => klasse === this.selectedKlasseForm.value);
    const nextKlasse = this.klassenPool[(selectedKlasseIndex + 1) % this.klassenPool.length];
    this.selectedKlasseForm.setValue(nextKlasse);
  }

  @HostListener('document:keydown.arrowup') onArrowUp() {
    const selectedKlasseIndex = this.klassenPool.findIndex(klasse => klasse === this.selectedKlasseForm.value);
    const nextKlasse = this.klassenPool[(selectedKlasseIndex - 1) === -1 || (selectedKlasseIndex === -1) ? this.klassenPool.length - 1 : selectedKlasseIndex - 1 ];
    this.selectedKlasseForm.setValue(nextKlasse);
  }

  @HostListener('document:keydown.arrowright') onArrowRight() {
    if (this.selectedKlasseForm.value) {
      const selectedSchuelerIndex = this.schuelerPool.findIndex(schueler => _.isEqual(schueler, this.schuelerForm.value));
      const nextSchueler = this.schuelerPool[(selectedSchuelerIndex + 1) % this.schuelerPool.length];
      this.schuelerForm.setValue(nextSchueler);
    } else {
      this.selectedKlasseForm.markAsTouched();
    }
  }

  @HostListener('document:keydown.arrowleft') onArrowLeft() {
    if (this.selectedKlasseForm.value) {
      const selectedSchuelerIndex = this.schuelerPool.findIndex(schueler => _.isEqual(schueler, this.schuelerForm.value));
      const nextSchueler = this.schuelerPool[(selectedSchuelerIndex - 1) === -1 || (selectedSchuelerIndex === -1) ? this.schuelerPool.length - 1 : selectedSchuelerIndex - 1 ];
      this.schuelerForm.setValue(nextSchueler);
    } else {
      this.selectedKlasseForm.markAsTouched();
    }
  }

  countdown$: Observable<number>;
  selectedKlasseForm: FormControl;
  schuelerForm: FormGroup;
  klassenPool = Array.from(this.klassen);
  schuelerPool: Schueler[];

  private readonly SQUARESIZE = 500;
  private canvasCtx: CanvasRenderingContext2D;

  constructor(private saveImageService: SaveImageService, private readExcelService: ReadExcelService) {
  }

  ngOnInit() {
    this.selectedKlasseForm =  new FormControl('', [Validators.required]);
    this.schuelerForm = new FormGroup({
      vorname: new FormControl({value: '', disabled: true}),
      nachname: new FormControl({value: '', disabled: true}),
      gebdatum: new FormControl({value: '', disabled: true})
    });

    this.selectedKlasseForm.valueChanges.subscribe(selectedKlasse => {
      this.schuelerPool = this.klasseAndSchueler.get(selectedKlasse);
      this.schuelerForm.setValue(this.schuelerPool[ 0 ]);
    });

    const webcamConfig = {
      audio: false,
      video: {
        mandatory: {
          maxHeight: this.SQUARESIZE,
          maxWidth: this.SQUARESIZE,
          minHeight: this.SQUARESIZE,
          minWidth: this.SQUARESIZE,
        }
      }
    };

    navigator.getUserMedia(
      webcamConfig as any,
      stream => this.webcamVideo.nativeElement.srcObject = stream,
      error => console.error(error));
  }

  get klassen(): Set<string> {
    return this.readExcelService.getKlassen();
  }

  get klasseAndSchueler(): Map<string, Schueler[]> {
    return this.readExcelService.getKlasseAndSchueler();
  }

  capture(): void {
    this.drawImage();
    this.saveImage();
  }

  timedCapture(): void {
    const CNTDWNFRM = 3;
    this.countdown$ = timer(0, 1000).pipe(
      take(CNTDWNFRM + 1),
      map(i => CNTDWNFRM - i),
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
    this.canvasCtx = this.canvas.nativeElement.getContext('2d');
    this.canvasCtx.drawImage(this.webcamVideo.nativeElement, 0, 0, this.SQUARESIZE, this.SQUARESIZE);
  }

  get filename(): string {
    const {vorname, nachname, gebdatum} = this.schuelerForm.value;
    return `${vorname}_${nachname}_${gebdatum}`;
  }

  saveImage(): void {
    if (this.selectedKlasseForm.valid) {
      const url = this.canvas.nativeElement.toDataURL('image/jpg', 0.8);
      const base64Data = url.replace(/^data:image\/png;base64,/, '');
      this.saveImageService.writeImage(base64Data, this.selectedKlasseForm.value, this.filename);
    } else {
      this.selectedKlasseForm.markAsTouched();
    }
  }
}
