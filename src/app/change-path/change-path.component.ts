import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import {
  EXCEL_PATH_KEY, GEBDATUM_SPALTE_KEY,
  ID_SPALTE_KEY, KLASSE_SPALTE_KEY,
  NACHNAME_SPALTE_KEY,
  PICTURE_PATH_KEY,
  VORNAME_SPALTE_KEY
} from '../localstorage-keys';

@Component({
  selector: 'app-change-path',
  templateUrl: './change-path.component.html',
  styleUrls: ['./change-path.component.scss']
})
export class ChangePathComponent {

  // TODO validierung einfügen!

  form = new FormGroup({
    picturePath: new FormControl(JSON.parse(window.localStorage.getItem(PICTURE_PATH_KEY))),
    excelPath: new FormControl(JSON.parse(window.localStorage.getItem(EXCEL_PATH_KEY))),
    idSpalte: new FormControl(JSON.parse(window.localStorage.getItem(ID_SPALTE_KEY))),
    vornameSpalte: new FormControl(JSON.parse(window.localStorage.getItem(VORNAME_SPALTE_KEY))),
    nachnameSpalte: new FormControl(JSON.parse(window.localStorage.getItem(NACHNAME_SPALTE_KEY))),
    gebdatumSpalte: new FormControl(JSON.parse(window.localStorage.getItem(GEBDATUM_SPALTE_KEY))),
    klasseSpalte: new FormControl(JSON.parse(window.localStorage.getItem(KLASSE_SPALTE_KEY))),
  });

  // TODO eine testmöglichkeit button wäre super, ob die excel datei gefunden wurde!

  constructor(private router: Router) {}

  save(e) {
    e.preventDefault();
    [PICTURE_PATH_KEY, EXCEL_PATH_KEY, ID_SPALTE_KEY, VORNAME_SPALTE_KEY, NACHNAME_SPALTE_KEY, GEBDATUM_SPALTE_KEY, KLASSE_SPALTE_KEY].forEach(
      key => this.saveToLocalStorage(key)
    );
    this.form.markAsPristine();
  }

  back() {
    this.router.navigate(['']);
  }

  saveToLocalStorage(key: string) {
    const value = this.form.get(key).value;
    window.localStorage.setItem(key, JSON.stringify(value));
  }
}
