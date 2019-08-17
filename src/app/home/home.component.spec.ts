import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { RxNgZoneSchedulerModule } from 'ngx-rxjs-zone-scheduler';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { Component, NgZone } from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';

@Component({
  template: '<router-outlet></router-outlet>'
})
class RouterOutletComponent {}

describe('HomeComponent', () => {
  let component: RouterOutletComponent;
  let fixture: ComponentFixture<RouterOutletComponent>;
  let nativeElement: HTMLElement;
  let ngZone: NgZone;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [HomeComponent, RouterOutletComponent],
      imports: [
        ReactiveFormsModule,
        NoopAnimationsModule,
        RxNgZoneSchedulerModule,
        MatSelectModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatSnackBarModule,
        MatDatepickerModule,
        MatMomentDateModule,
        RouterTestingModule.withRoutes([{ path: '', component: HomeComponent }])
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouterOutletComponent);
    component = fixture.componentInstance;
    nativeElement = fixture.nativeElement;
    ngZone = TestBed.get(NgZone);
    router = TestBed.get(Router);
  });

  beforeEach(async () => {
    await ngZone.run(() => router.navigateByUrl(''));
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('initial state', () => {
    it('should display logo', () => {
      expect(nativeElement.querySelector('img.logo')).toBeDefined();
    });

    it('should display form', () => {
      expect(klasseSelect()).toBeDefined();
      expect(klasseError()).toBeFalsy();

      expect(schuelerSelect()).toBeDefined();
      expect(schuelerError()).toBeFalsy();

      expect(gebdatumInput()).toBeDefined();
    });

    it('should display default schueler card', () => {
      expect(nativeElement.querySelector('mat-card')).toBeDefined();
      expect(nativeElement.querySelector('mat-card mat-card-title').textContent).toContain('Musterfoto');
      expect(nativeElement.querySelector('mat-card img').getAttribute('src')).toContain('persona_mann.jpg');
      expect(nativeElement.querySelector('mat-card mat-card-content').textContent).toEqual('');
    });

    it('should display figure with camera', () => {
      expect(nativeElement.querySelector('figure.foto')).toBeDefined();
    });
  });

  function klasseSelect(): HTMLElement {
    return nativeElement.querySelector('mat-form-field.klasse mat-select');
  }

  function klasseError(): HTMLElement {
    return nativeElement.querySelector('mat-form-field.klasse mat-error');
  }

  function schuelerSelect(): HTMLElement {
    return nativeElement.querySelector('mat-form-field.schueler mat-select');
  }

  function schuelerError(): HTMLElement {
    return nativeElement.querySelector('mat-form-field.schueler mat-error');
  }

  function gebdatumInput(): HTMLElement {
    return nativeElement.querySelector('mat-form-field.gebdatum input');
  }
});
