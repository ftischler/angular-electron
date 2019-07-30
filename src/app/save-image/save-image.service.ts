import { Injectable } from '@angular/core';
import { join } from "path";
import * as fs from 'fs';

@Injectable({
  providedIn: 'root'
})
export class SaveImageService {

  writeImage(image: string): void {
    // fs.writeFileSync(join('/Users/ftischler/Desktop', 'image.png'), image, 'base64');
    fs.writeFileSync(join('/Users/alexanderschuster/Desktop', 'image.png'), image, 'base64');
  }
}
