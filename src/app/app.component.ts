import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ElectronService } from './electron/electron.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
  private destroy$$ = new Subject();

  constructor(private electronService: ElectronService, private router: Router) {}

  ngOnInit(): void {
    this.electronService.pathChange$.pipe(takeUntil(this.destroy$$)).subscribe(async () => {
      await this.router.navigate(['changepath']);
    });
  }

  ngOnDestroy(): void {
    this.destroy$$.next();
  }
}
