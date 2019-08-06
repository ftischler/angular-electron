import { Injectable } from '@angular/core';
import {
  EXCEL_PATH_KEY, GEBDATUM_SPALTE_KEY,
  ID_SPALTE_KEY, KLASSE_SPALTE_KEY,
  NACHNAME_SPALTE_KEY,
  PICTURE_PATH_KEY,
  VORNAME_SPALTE_KEY
} from '../localstorage-keys';

// TODO weitere Fragen an Thomas Amann:
// 1. in excel spalte name_3 evtl als zweitname doch zu berücksichtigen?
// 2. laufwerkpfad für a. bilder speicherort b. excel datei
// 3. navigation mit pfeiltasten: rotation gewünscht, oder lieber nicht (sprung von letztem auf erstes)
// 4. welche excel zellen können leer sein?
// 5.

@Injectable({
  providedIn: 'root'
})
export class InitializeStorageService {

  private readonly DEFAULT_PICTURE_PATH = '/Users/alexanderschuster/Desktop';
  private readonly DEFAULT_EXCEL_PATH = '/Users/alexanderschuster/Desktop/Atlantis_Schülerliste.xlsx';
  private readonly DEFAULT_ID_SPALTE = 'A';
  private readonly DEFAULT_VORNAME_SPALTE = 'D';
  private readonly DEFAULT_NACHNAME_SPALTE = 'C';
  private readonly DEFAULT_GEBDATUM_SPALTE = 'N';
  private readonly DEFAULT_KLASSE_SPALTE = 'AF';

  initializeAll(): void {
    this.initializeIfEmpty(PICTURE_PATH_KEY, this.DEFAULT_PICTURE_PATH);
    this.initializeIfEmpty(EXCEL_PATH_KEY, this.DEFAULT_EXCEL_PATH);
    this.initializeIfEmpty(ID_SPALTE_KEY, this.DEFAULT_ID_SPALTE);
    this.initializeIfEmpty(VORNAME_SPALTE_KEY, this.DEFAULT_VORNAME_SPALTE);
    this.initializeIfEmpty(NACHNAME_SPALTE_KEY, this.DEFAULT_NACHNAME_SPALTE);
    this.initializeIfEmpty(GEBDATUM_SPALTE_KEY, this.DEFAULT_GEBDATUM_SPALTE);
    this.initializeIfEmpty(KLASSE_SPALTE_KEY, this.DEFAULT_KLASSE_SPALTE);
  }

  initializeIfEmpty(key: string, value: string): void {
    if (!window.localStorage.getItem(key)) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }
}
