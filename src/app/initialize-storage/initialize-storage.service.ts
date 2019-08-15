import { Injectable } from '@angular/core';
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

@Injectable({
  providedIn: 'root'
})
export class InitializeStorageService {
  // TODO test this on windows -> send to dad, tell him to create c:\schuelerfotos and atlantis_schülerliste.xlsx
  private readonly DEFAULT_PICTURE_PATH = 'c:\\Schuelerfotos\\';
  private readonly DEFAULT_EXCEL_PATH = 'c:\\Schuelerfotos\\Atlantis_Schülerliste.xlsx';
  private readonly DEFAULT_KLASSE_SPALTE = 'AF';
  private readonly DEFAULT_ID_SPALTE = 'A';
  private readonly DEFAULT_VORNAME_SPALTE = 'D';
  private readonly DEFAULT_NACHNAME_SPALTE = 'C';
  private readonly DEFAULT_GEBDATUM_SPALTE = 'N';
  private readonly DEFAULT_GESCHLECHT_SPALTE = 'T';

  initializeAll(): void {
    this.initializeIfEmpty(PICTURE_PATH_KEY, this.DEFAULT_PICTURE_PATH);
    this.initializeIfEmpty(EXCEL_PATH_KEY, this.DEFAULT_EXCEL_PATH);
    this.initializeIfEmpty(KLASSE_SPALTE_KEY, this.DEFAULT_KLASSE_SPALTE);
    this.initializeIfEmpty(ID_SPALTE_KEY, this.DEFAULT_ID_SPALTE);
    this.initializeIfEmpty(VORNAME_SPALTE_KEY, this.DEFAULT_VORNAME_SPALTE);
    this.initializeIfEmpty(NACHNAME_SPALTE_KEY, this.DEFAULT_NACHNAME_SPALTE);
    this.initializeIfEmpty(GEBDATUM_SPALTE_KEY, this.DEFAULT_GEBDATUM_SPALTE);
    this.initializeIfEmpty(GESCHLECHT_SPALTE_KEY, this.DEFAULT_GESCHLECHT_SPALTE);
  }

  initializeIfEmpty(key: string, value: string): void {
    if (!window.localStorage.getItem(key)) {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  }
}
