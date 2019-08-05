import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-change-path',
  templateUrl: './change-path.component.html',
  styleUrls: ['./change-path.component.scss']
})
export class ChangePathComponent {
  form = new FormGroup({
    picturePath: new FormControl(JSON.parse(window.localStorage.getItem('picturePath'))),
    excelPath: new FormControl(JSON.parse(window.localStorage.getItem('excelPath')))
  });

  // TODO hier könnte man noch die Excel datei Konfigurieren => in welcher spalte ist name, vorname und gebdatum

  // TODO eine testmöglichkeit button wäre super, ob die excel datei gefunden wurde!

  constructor(private router: Router) {
  }

  save(e) {
    e.preventDefault();
    const picturePath = this.form.get('picturePath').value;
    window.localStorage.setItem('picturePath', JSON.stringify(picturePath));

    const excelPath = this.form.get('excelPath').value;
    window.localStorage.setItem('excelPath', JSON.stringify(excelPath));

    this.form.markAsPristine();
  }

  back() {
    this.router.navigate(['']);
  }
}
