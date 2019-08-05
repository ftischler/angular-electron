import { Injectable } from '@angular/core';
import { readFile, utils, WorkBook, WorkSheet } from 'xlsx';
import { join } from 'path';
import { Schueler } from '../schueler.model';

type AOA = any[][];

@Injectable({
  providedIn: 'root'
})
export class ReadExcelService {

  private readonly DATEFORMAT = 'dd"."mm"."yyyy';

  private klassen: Set<string>;
  private klasseMitSchuelern: Map<string, Schueler[]> = new Map();

  constructor() {
    this.parseExcel();
  }

  data: AOA = [ [1, 2], [3, 4] ];

  getKlassen(): Set<string> {
    return this.klassen;
  }

  getKlasseAndSchueler(): Map<string, Schueler[]> {
    return this.klasseMitSchuelern;
  }

  parseExcel(): void {
    // TODO only execute this when (valid) excel found
    if (true) {
      const wb: WorkBook = readFile(join(JSON.parse(window.localStorage.getItem('excelPath'))), {type: 'string', dateNF: this.DATEFORMAT});
      const ws: WorkSheet = wb.Sheets[ wb.SheetNames[ 0 ] ];

      this.data = <AOA>(utils.sheet_to_json(ws, {header: 1,raw: false}));

      // TODO move this to getters
      this.klassen = new Set(this.data.filter((_, index) => index !== 0).map(x => x[ 3 ]));
      this.klassen.forEach(klasse => {
        const schueler = this.data
          .filter((_, index) => index !== 0)
          .filter(x => x[3] === klasse)
          .map(x => ({vorname: x[ 0 ], nachname: x[1], gebdatum: x[2]}));
        this.klasseMitSchuelern.set(klasse, schueler);
      });
    } else {
      console.log('wurstfinger');
    }
  }
}
