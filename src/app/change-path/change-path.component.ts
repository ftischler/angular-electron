import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AbstractControl, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  EXCEL_PATH_KEY,
  GEBDATUM_SPALTE_KEY,
  GESCHLECHT_SPALTE_KEY,
  ID_SPALTE_KEY,
  KLASSE_SPALTE_KEY,
  NACHNAME_SPALTE_KEY,
  PICTURE_PATH_KEY,
  VORNAME_SPALTE_KEY
} from '../localstorage-keys';
import { AppConfig } from '../../environments/environment';
import { ReadExcelService } from '../read-excel/read-excel.service';

@Component({
  selector: 'app-change-path',
  templateUrl: './change-path.component.html',
  styleUrls: ['./change-path.component.scss']
})
export class ChangePathComponent {
  version;
  form = new FormGroup({
    picturePath: new FormControl(JSON.parse(window.localStorage.getItem(PICTURE_PATH_KEY)), [Validators.required]),
    excelPath: new FormControl(JSON.parse(window.localStorage.getItem(EXCEL_PATH_KEY)), [
      Validators.required,
      Validators.pattern('.*.xlsx$')
    ]),
    idSpalte: new FormControl(JSON.parse(window.localStorage.getItem(ID_SPALTE_KEY)), [
      Validators.required,
      Validators.pattern('[A-Z]{1,3}')
    ]),
    vornameSpalte: new FormControl(JSON.parse(window.localStorage.getItem(VORNAME_SPALTE_KEY)), [
      Validators.required,
      Validators.pattern('[A-Z]{1,3}')
    ]),
    nachnameSpalte: new FormControl(JSON.parse(window.localStorage.getItem(NACHNAME_SPALTE_KEY)), [
      Validators.required,
      Validators.pattern('[A-Z]{1,3}')
    ]),
    gebdatumSpalte: new FormControl(JSON.parse(window.localStorage.getItem(GEBDATUM_SPALTE_KEY)), [
      Validators.required,
      Validators.pattern('[A-Z]{1,3}')
    ]),
    klasseSpalte: new FormControl(JSON.parse(window.localStorage.getItem(KLASSE_SPALTE_KEY)), [
      Validators.required,
      Validators.pattern('[A-Z]{1,3}')
    ]),
    geschlechtSpalte: new FormControl(JSON.parse(window.localStorage.getItem(GESCHLECHT_SPALTE_KEY)), [
      Validators.required,
      Validators.pattern('[A-Z]{1,3}')
    ])
  });

  constructor(private router: Router, private readExcelService: ReadExcelService) {
    this.version = AppConfig.version;
  }

  save(e) {
    e.preventDefault();
    [
      PICTURE_PATH_KEY,
      EXCEL_PATH_KEY,
      ID_SPALTE_KEY,
      VORNAME_SPALTE_KEY,
      NACHNAME_SPALTE_KEY,
      GEBDATUM_SPALTE_KEY,
      KLASSE_SPALTE_KEY,
      GESCHLECHT_SPALTE_KEY
    ].forEach(key => this.saveToLocalStorage(key));
    this.form.markAsPristine();
    this.readExcelService.parseExcel();
  }

  back() {
    this.router.navigate(['']);
  }

  saveToLocalStorage(key: string) {
    const value = this.form.get(key).value;
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  get excelPathControl(): AbstractControl {
    return this.form.get(EXCEL_PATH_KEY);
  }

  get picturePathControl(): AbstractControl {
    return this.form.get(PICTURE_PATH_KEY);
  }

  get idControl(): AbstractControl {
    return this.form.get(ID_SPALTE_KEY);
  }

  get vornameControl(): AbstractControl {
    return this.form.get(VORNAME_SPALTE_KEY);
  }

  get nachnameControl(): AbstractControl {
    return this.form.get(NACHNAME_SPALTE_KEY);
  }

  get gebdatumControl(): AbstractControl {
    return this.form.get(GEBDATUM_SPALTE_KEY);
  }

  get klasseControl(): AbstractControl {
    return this.form.get(KLASSE_SPALTE_KEY);
  }

  get geschlechtControl(): AbstractControl {
    return this.form.get(GESCHLECHT_SPALTE_KEY);
  }
}
