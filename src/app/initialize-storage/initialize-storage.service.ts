import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class InitializeStorageService {

  private readonly DEFAULT_PICTURE_PATH = '/Users/alexanderschuster/Desktop';
  private readonly DEFAULT_EXCEL_PATH = '/Users/alexanderschuster/Desktop/datei.xlsx';
  private readonly DEFAULT_VORNAME_SPALTE = 'A';
  private readonly DEFAULT_NACHNAME_SPALTE = 'B';
  private readonly DEFAULT_GEBDATUM_SPALTE = 'C';
  private readonly DEFAULT_KLASSE_SPALTE = 'D';

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
