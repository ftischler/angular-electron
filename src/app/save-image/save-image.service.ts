import { Injectable } from '@angular/core';
import { join } from 'path';
import * as fs from 'fs';
import { PICTURE_PATH_KEY } from '../localstorage-keys';

@Injectable({
  providedIn: 'root'
})
export class SaveImageService {
  writeImage(image: string, classname: string, name: string): void {
    this.createFolder(classname);
    fs.writeFileSync(join(this.basepath, classname, name + '.png'), image, 'base64');
  }

  private get basepath() {
    return JSON.parse(window.localStorage.getItem(PICTURE_PATH_KEY));
  }

  private createFolder(foldername: string) {
    if (!fs.existsSync(join(this.basepath, foldername))) {
      fs.mkdirSync(join(this.basepath, foldername));
    }
  }
}
