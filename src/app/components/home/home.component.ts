import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ElectronService } from '../../providers/electron.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  @ViewChild('webcam', {static: true}) webcamVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('canvas', {static: true}) canvas: ElementRef<HTMLCanvasElement>;

  private canvasCtx: CanvasRenderingContext2D;

  constructor(private electronService: ElectronService) { }

  ngOnInit() {
    const constraints = {
      audio: false,
      video: {
        mandatory: {
          maxHeight: 480,
          maxWidth: 800,
          minHeight: 480,
          minWidth: 800,
        }
      }
    };

    navigator.getUserMedia(
      constraints as any,
      stream => this.webcamVideo.nativeElement.srcObject = stream,
      error => console.error(error));

    this.canvasCtx = this.canvas.nativeElement.getContext('2d');
  }

  capture(): void {
    this.canvasCtx.drawImage(this.webcamVideo.nativeElement, 0, 0, 640, 480);
    const url = this.canvas.nativeElement.toDataURL('image/jpg', 0.8);
    const base64Data = url.replace(/^data:image\/png;base64,/, '');
    this.electronService.writeImage(base64Data);
  }

}
