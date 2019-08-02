import { Injectable } from '@angular/core';
import { join } from "path";
import * as fs from 'fs';

@Injectable({
  providedIn: 'root'
})
export class SaveImageService {

  writeImage(image: string, name: string): void {
    fs.writeFileSync(join(JSON.parse(window.localStorage.getItem('path')), name + '.png'), image, 'base64');
  }
}
