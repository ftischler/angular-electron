import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-change-path',
  templateUrl: './change-path.component.html',
  styleUrls: ['./change-path.component.scss']
})
export class ChangePathComponent {
  private readonly DEFAULT_PICTURE_PATH = '/Users/alexanderschuster/Desktop';
  private readonly DEFAULT_EXCEL_PATH = '/Users/alexanderschuster/Desktop/datei.xlsx';
  private readonly DEFAULT_VORNAME_SPALTE = 'A';
  private readonly DEFAULT_NACHNAME_SPALTE = 'B';
  private readonly DEFAULT_GEBDATUM_SPALTE = 'C';
  private readonly DEFAULT_KLASSE_SPALTE = 'D';

  form = new FormGroup({
    picturePath: new FormControl(JSON.parse(window.localStorage.getItem('picturePath'))),
    excelPath: new FormControl(JSON.parse(window.localStorage.getItem('excelPath'))),
    vornameSpalte: new FormControl(JSON.parse(window.localStorage.getItem('vornameSpalte'))),
    nachnameSpalte: new FormControl(JSON.parse(window.localStorage.getItem('nachnameSpalte'))),
    gebdatumSpalte: new FormControl(JSON.parse(window.localStorage.getItem('gebdatumSpalte'))),
    klasseSpalte: new FormControl(JSON.parse(window.localStorage.getItem('klasseSpalte'))),
  });

  // TODO eine testmöglichkeit button wäre super, ob die excel datei gefunden wurde!

  constructor(private router: Router) {
    this.initializeAll();
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

  initializeAll(): void {
    this.initializeIfEmpty('picturePath', this.DEFAULT_PICTURE_PATH);
    this.initializeIfEmpty('excelPath', this.DEFAULT_EXCEL_PATH);
    this.initializeIfEmpty('vornameSpalte', this.DEFAULT_VORNAME_SPALTE);
    this.initializeIfEmpty('nachnameSpalte', this.DEFAULT_NACHNAME_SPALTE);
    this.initializeIfEmpty('gebdatumSpalte', this.DEFAULT_GEBDATUM_SPALTE);
    this.initializeIfEmpty('klasseSpalte', this.DEFAULT_KLASSE_SPALTE);
  }

  initializeIfEmpty(key: string, value: string): void {
    if (!window.localStorage.getItem(key)) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }
}
