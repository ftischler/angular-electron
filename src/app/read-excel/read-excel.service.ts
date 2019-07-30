import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReadExcelService {

  getKlassen(): Set<string> { // use Set to filter out duplicates automatically? enum/map to avoid different spellings of same klassenname?
    return new Set(['2BFM Metall', 'BK 1/2', 'BVE']); // TODO aus excel auslesen
  }
}
