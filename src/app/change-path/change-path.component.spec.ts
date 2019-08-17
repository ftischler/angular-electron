import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChangePathComponent } from './change-path.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { RouterTestingModule } from '@angular/router/testing';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ChangePathComponent', () => {
  let component: ChangePathComponent;
  let fixture: ComponentFixture<ChangePathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ChangePathComponent],
      imports: [ReactiveFormsModule, NoopAnimationsModule, MatInputModule, MatSnackBarModule, RouterTestingModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChangePathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
