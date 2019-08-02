import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-change-path',
  templateUrl: './change-path.component.html',
  styleUrls: ['./change-path.component.scss']
})
export class ChangePathComponent {
  formGroup = new FormGroup({
    input: new FormControl(JSON.parse(window.localStorage.getItem('path')))
  });

  constructor(private router: Router) {
  }

  save() {
    const value = this.formGroup.get('input').value;
    window.localStorage.setItem('path', JSON.stringify(value));
  }

  back() {
    this.router.navigate(['']);
  }
}
