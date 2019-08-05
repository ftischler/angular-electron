import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChangePathComponent } from './change-path.component';

describe('ChangePathComponent', () => {
  let component: ChangePathComponent;
  let fixture: ComponentFixture<ChangePathComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChangePathComponent ]
    })
    .compileComponents();
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
