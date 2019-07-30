import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReadExcelService {

  getKlassen(): string[] { // use Set to filter out duplicates automatically? enum/map to avoid different spellings of same klassenname?
    return ['2BFM Metall', 'BK 1/2', 'BVE']; // TODO aus excel auslesen
  }
}
