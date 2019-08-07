import { Injectable, NgZone } from '@angular/core';
import { ipcRenderer } from 'electron';
import { Router } from '@angular/router';
import { fromEvent, Observable } from 'rxjs';
import { RxNgZoneScheduler } from 'ngx-rxjs-zone-scheduler';
import { observeOn } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ElectronEventService {
  pathChange$: Observable<any> = fromEvent(ipcRenderer, 'change-paths').pipe(this.rxNgZoneScheduler.observeOnNgZone());

  constructor(private router: Router, private rxNgZoneScheduler: RxNgZoneScheduler) {}
}
