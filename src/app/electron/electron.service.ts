import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';
import { RxNgZoneScheduler } from 'ngx-rxjs-zone-scheduler';
import { fromEvent, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  ipcRenderer: typeof ipcRenderer;

  pathChange$: Observable<any>;

  get isElectron() {
    return window && window.process && window.process.type;
  }

  constructor(private rxNgZoneScheduler: RxNgZoneScheduler) {
    if (this.isElectron) {
      this.ipcRenderer = window.require('electron').ipcRenderer;
    }
    this.pathChange$ = fromEvent(this.ipcRenderer, 'change-paths').pipe(this.rxNgZoneScheduler.observeOnNgZone());
  }
}
