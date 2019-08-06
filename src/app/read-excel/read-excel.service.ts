import { Injectable } from '@angular/core';
import { readFile, utils, WorkBook, WorkSheet } from 'xlsx';
import { join } from 'path';
import { Schueler } from '../schueler.model';
import { Observable, ReplaySubject } from 'rxjs';
import { map } from 'rxjs/operators';

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
    const sortedCols = ['vornameSpalte', 'nachnameSpalte', 'gebdatumSpalte', 'klasseSpalte'].map(key => this.colLetter(key)).sort();
    return {min: sortedCols[ 0 ], max: sortedCols[ sortedCols.length - 1 ]};
  }

  klassen$: Observable<string[]> = this.data.asObservable().pipe(map(x => Array.from(x.keys())));
  klassenWithSchueler$: Observable<Map<string, Schueler[]>> = this.data.asObservable();

  parseExcel(): void {
    // TODO only execute this when (valid) excel found
    const wb: WorkBook = readFile(join(JSON.parse(window.localStorage.getItem('excelPath'))), {
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
        vorname: schueler[ this.colLetter('vornameSpalte') ],
        nachname: schueler[ this.colLetter('nachnameSpalte') ],
        gebdatum: schueler[ this.colLetter('gebdatumSpalte') ],
        klasse: schueler[ this.colLetter('klasseSpalte') ]
      }))
      .reduce((map, schueler) => {
        if (map.has(schueler.klasse)) {
          map.get(schueler.klasse).push({
            vorname: schueler.vorname,
            nachname: schueler.nachname,
            gebdatum: schueler.gebdatum
          });
        } else {
          map.set(schueler.klasse, [{
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
