import { Injectable } from '@angular/core';
import { join } from "path";
import * as fs from 'fs';

@Injectable({
  providedIn: 'root'
})
export class SaveImageService {

  writeImage(image: string, name: string): void {
    fs.writeFileSync(join('/Users/alexanderschuster/Desktop', name + '.png'), image, 'base64');
  }
}
