import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SaveImageService } from '../save-image/save-image.service';
import { ReadExcelService } from '../read-excel/read-excel.service';

// TODO ausgewählten dateiname speichern statt image.png
// TODO .exe icon aktuell angular logo -> evtl bss logo nehmen?
// TODO mit Maustasten oben/unten durch Klassen/Namen switchen
// TODO einstellungs menü für laufwerk erstellen

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('webcam', {static: true}) webcamVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', {static: true}) canvas: ElementRef<HTMLCanvasElement>;

  private readonly SQUARESIZE = 500;

  constructor(private saveImageService: SaveImageService, private readExcelService: ReadExcelService) { }

  ngOnInit() {
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

  get klassen(): string[] {
    return this.readExcelService.getKlassen();
  }

  capture(): void {
    this.drawImage();
    this.saveImage();

    console.log('diana stinkt');
  }

  delete(): void {
    console.log('diana lümmelt rum');

    // TODO löscht nicht das gespeicherte Bild auf dem Laufwerk, so ok?
  }

  drawImage(): void {
    const canvasCtx = this.canvas.nativeElement.getContext('2d');
    canvasCtx.drawImage(this.webcamVideo.nativeElement, 0, 0, this.SQUARESIZE, this.SQUARESIZE);
  }

  saveImage(): void {
    // TODO speichert das aufgenommene automatisch, denkbar auch ein weiterer 'Foto abspeichern'.
    //  Die Idee wäre hierbei erst ein paar Schnappschüsse auszuprobieren und sich dann explizit auf siene Auswahl festlegen kann.
    const url = this.canvas.nativeElement.toDataURL('image/jpg', 0.8);
    const base64Data = url.replace(/^data:image\/png;base64,/, '');
    this.saveImageService.writeImage(base64Data);
  }
}
