import { Component, OnDestroy, OnInit } from '@angular/core';
import { ElectronEventService } from './change-path/electron-event.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$$ = new Subject();

  constructor(public electronEventService: ElectronEventService, private router: Router) {
  }

  ngOnInit(): void {
    this.electronEventService.pathChange$.pipe(
      takeUntil(this.destroy$$)
    ).subscribe(async () => {
      await this.router.navigate(['changepath']);
    });
  }

  ngOnDestroy(): void {
    this.destroy$$.next();
  }
}
