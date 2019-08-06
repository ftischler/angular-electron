import { Injectable } from '@angular/core';
import { readFile, utils, WorkBook, WorkSheet } from 'xlsx';
import { join } from 'path';
import { Schueler } from '../schueler.model';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  EXCEL_PATH_KEY,
  GEBDATUM_SPALTE_KEY,
  ID_SPALTE_KEY,
  KLASSE_SPALTE_KEY,
  NACHNAME_SPALTE_KEY,
  VORNAME_SPALTE_KEY
} from '../localstorage-keys';

@Injectable({
  providedIn: 'root'
})
export class ReadExcelService {

  private readonly DATEFORMAT = 'dd"."mm"."yyyy';

  private data: ReplaySubject<Map<string, Schueler[]>> = new ReplaySubject();

  colLetter(key: string): string {
    return JSON.parse(window.localStorage.getItem(key));
  }

  minmaxCols(): { min: string, max: string } {
    const sortedCols = [ID_SPALTE_KEY, VORNAME_SPALTE_KEY, NACHNAME_SPALTE_KEY, GEBDATUM_SPALTE_KEY, KLASSE_SPALTE_KEY]
      .map(key => this.colLetter(key))
      .sort((first: string, second: string) => parseInt(first, 36) - parseInt(second, 36));
    return {min: sortedCols[ 0 ], max: sortedCols[ sortedCols.length - 1 ]};
  }

  klassen$: Observable<string[]> = this.data.asObservable().pipe(map(x => Array.from(x.keys())));
  klassenWithSchueler$: Observable<Map<string, Schueler[]>> = this.data.asObservable();

  parseExcel(): void {
    // TODO only execute this when (valid) excel found
    // this is important, because if no excel file found, everything crashes, try/catch?
    const wb: WorkBook = readFile(join(JSON.parse(window.localStorage.getItem(EXCEL_PATH_KEY))), {
      type: 'string',
      dateNF: this.DATEFORMAT
    });
    const ws: WorkSheet = wb.Sheets[ wb.SheetNames[ 0 ] ];

    // limit range to the needed columns
    let range = utils.decode_range(ws[ '!ref' ]);
    range.s.c = utils.decode_col(this.minmaxCols().min);
    range.e.c = utils.decode_col(this.minmaxCols().max);
    const new_range = utils.encode_range(range);

    const data = utils.sheet_to_json(ws, {header: 'A', raw: false, range: new_range})
      .filter((_, index) => index !== 0)
      .map(schueler => ({
        id: schueler[ this.colLetter(ID_SPALTE_KEY) ],
        vorname: schueler[ this.colLetter(VORNAME_SPALTE_KEY) ],
        nachname: schueler[ this.colLetter(NACHNAME_SPALTE_KEY) ],
        gebdatum: schueler[ this.colLetter(GEBDATUM_SPALTE_KEY) ],
        klasse: schueler[ this.colLetter(KLASSE_SPALTE_KEY) ]
      }))
      .reduce((map, schueler) => {
        if (map.has(schueler.klasse)) {
          map.get(schueler.klasse).push({
            id: schueler.id,
            vorname: schueler.vorname,
            nachname: schueler.nachname,
            gebdatum: schueler.gebdatum
          });
        } else {
          map.set(schueler.klasse, [{
            id: schueler.id,
            vorname: schueler.vorname,
            nachname: schueler.nachname,
            gebdatum: schueler.gebdatum
          }]);
        }
        return map;
      }, new Map<string, Schueler[]>());

    this.data.next(data);
  }
}
