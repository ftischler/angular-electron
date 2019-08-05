import { Injectable } from '@angular/core';
import { readFile, utils, WorkBook, WorkSheet } from 'xlsx';
import { join } from 'path';
import { Schueler, SchuelerMitKlasse } from '../schueler.model';

@Injectable({
  providedIn: 'root'
})
export class ReadExcelService {

  private readonly DATEFORMAT = 'dd"."mm"."yyyy';

  private data: SchuelerMitKlasse[];

  constructor() {
    this.parseExcel();
  }

  colNumber(key: string) {
    return JSON.parse(window.localStorage.getItem(key));
  }

  minmaxCols(): {min: string, max: string} {
    const sortedCols = ['vornameSpalte', 'nachnameSpalte', 'gebdatumSpalte', 'klasseSpalte'].map(key => JSON.parse(window.localStorage.getItem(key))).sort();
    return {min: sortedCols[0], max: sortedCols[sortedCols.length - 1]};
  }

  getKlassen(): Set<string> { // TODO return undef if no data and handle in home cmp, also for other getter
    return new Set(this.data.map(x => x.klasse));
  }

  getKlasseAndSchueler(): Map<string, Schueler[]> {
    const klasseMitSchuelern = new Map<string, Schueler[]>();
    this.getKlassen().forEach(klasse => {
      const schuelerGruppe = this.data
        .filter(schueler => schueler.klasse === klasse)
        .map(schueler => ({vorname: schueler.vorname, nachname: schueler.nachname, gebdatum: schueler.gebdatum}));
      klasseMitSchuelern.set(klasse, schuelerGruppe);
    });
    return klasseMitSchuelern;
  }

  parseExcel(): void {
    // TODO only execute this when (valid) excel found
    if (true) {
      const wb: WorkBook = readFile(join(JSON.parse(window.localStorage.getItem('excelPath'))), {type: 'string', dateNF: this.DATEFORMAT});
      const ws: WorkSheet = wb.Sheets[ wb.SheetNames[ 0 ] ];

      // limit range to the needed columns
      let range = utils.decode_range(ws['!ref']);
      range.s.c = utils.decode_col(this.minmaxCols().min);
      range.e.c = utils.decode_col(this.minmaxCols().max);
      const new_range = utils.encode_range(range);
      // use default header still, then map as wanted (or consider "A", then loop over first row to get relevant cols, then filter out everything not needed)
      this.data = utils.sheet_to_json(ws, {header: ['vorname', 'nachname', 'gebdatum', 'klasse'], raw: false, range: new_range}).filter((_, index) => index !== 0) as SchuelerMitKlasse[];
    } else {
      console.log('wurstfinger');
    }
  }
}
