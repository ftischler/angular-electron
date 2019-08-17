import { Injectable } from '@angular/core';
import { readFile, utils, WorkBook, WorkSheet } from 'xlsx';
import { join } from 'path';
import { Schueler } from '../schueler.model';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  EXCEL_PATH_KEY,
  GEBDATUM_SPALTE_KEY,
  GESCHLECHT_SPALTE_KEY,
  ID_SPALTE_KEY,
  KLASSE_SPALTE_KEY,
  NACHNAME_SPALTE_KEY,
  VORNAME_SPALTE_KEY
} from '../localstorage-keys';
import { MatSnackBar } from '@angular/material';
import { InitializeStorageService } from '../initialize-storage/initialize-storage.service';

@Injectable({
  providedIn: 'root'
})
export class ReadExcelService {

  constructor(private snackBar: MatSnackBar, private initializeStorageService: InitializeStorageService) {
    this.initializeStorageService.initializeAll();

    this.parseExcel();
  }
  private readonly DATEFORMAT = 'YYYY/MM/DD';

  private data: ReplaySubject<Map<string, Schueler[]>> = new ReplaySubject();

  klassen$: Observable<string[]> = this.data.pipe(map(x => Array.from(x.keys())));
  klassenWithSchueler$: Observable<Map<string, Schueler[]>> = this.data;

  colLetter(key: string): string {
    return JSON.parse(window.localStorage.getItem(key));
  }

  minmaxCols(): { min: string; max: string } {
    const sortedCols = [ID_SPALTE_KEY, VORNAME_SPALTE_KEY, NACHNAME_SPALTE_KEY, GEBDATUM_SPALTE_KEY, KLASSE_SPALTE_KEY]
      .map(key => this.colLetter(key))
      .sort((first: string, second: string) => parseInt(first, 36) - parseInt(second, 36));
    return { min: sortedCols[0], max: sortedCols[sortedCols.length - 1] };
  }

  parseExcel(): void {
    try {
      const wb: WorkBook = readFile(join(JSON.parse(window.localStorage.getItem(EXCEL_PATH_KEY))), {
        type: 'string',
        dateNF: this.DATEFORMAT
      });
      const ws: WorkSheet = wb.Sheets[wb.SheetNames[0]];

      // limit range to the needed columns for performance reasons
      const range = utils.decode_range(ws['!ref']);
      range.s.c = utils.decode_col(this.minmaxCols().min);
      range.e.c = utils.decode_col(this.minmaxCols().max);
      const new_range = utils.encode_range(range);

      const data = utils
        .sheet_to_json(ws, { header: 'A', raw: false, range: new_range })
        .filter((_, index) => index !== 0)
        .map(schueler => ({
          id: schueler[this.colLetter(ID_SPALTE_KEY)],
          klasse: schueler[this.colLetter(KLASSE_SPALTE_KEY)],
          nachname: schueler[this.colLetter(NACHNAME_SPALTE_KEY)],
          vorname: schueler[this.colLetter(VORNAME_SPALTE_KEY)],
          gebdatum: schueler[this.colLetter(GEBDATUM_SPALTE_KEY)]
            ? new Date(schueler[this.colLetter(GEBDATUM_SPALTE_KEY)])
            : new Date(2000, 0, 1),
          geschlecht: schueler[this.colLetter(GESCHLECHT_SPALTE_KEY)]
        }))
        .reduce((newMap, schueler) => {
          if (newMap.has(schueler.klasse)) {
            newMap.get(schueler.klasse).push({
              id: schueler.id,
              nachname: schueler.nachname,
              vorname: schueler.vorname,
              gebdatum: schueler.gebdatum,
              geschlecht: schueler.geschlecht
            });
          } else {
            newMap.set(schueler.klasse, [
              {
                id: schueler.id,
                nachname: schueler.nachname,
                vorname: schueler.vorname,
                gebdatum: schueler.gebdatum,
                geschlecht: schueler.geschlecht
              }
            ]);
          }
          return newMap;
        }, new Map<string, Schueler[]>());

      console.log('data from excel: ', data);
      this.data.next(data);
      this.snackBar.dismiss();
    } catch (e) {
      this.snackBar.open(
        'Die Excel Datei mit den Schülerdaten kann nicht gelesen werden. ' +
          'Bitte öffnen Sie die Einstellungen und stellen Sie sicher, dass die Datei in dem Laufwerk liegt, das Sie dort angegeben haben.',
        'x'
      );
    }
  }
}
