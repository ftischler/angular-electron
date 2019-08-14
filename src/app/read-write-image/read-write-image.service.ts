import { Injectable } from '@angular/core';
import { join } from 'path';
import * as fs from 'fs';
import { PICTURE_PATH_KEY } from '../localstorage-keys';

@Injectable({
  providedIn: 'root'
})
export class ReadWriteImageService {
  writeImage(image: string, classname: string, name: string): void {
    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    this.createFolder(classname);
    try {
      fs.writeFileSync(join(this.basepath, classname, name + '.png'), base64Data, 'base64');
    } catch (e) {
      console.log('write file sync failed.', e);
    }
  }

  readImage(classname: string, name: string): string {
    return 'data:image/png;base64,' + fs.readFileSync(join(this.basepath, classname, name + '.png'), 'base64');
  }

  private get basepath() {
    return JSON.parse(window.localStorage.getItem(PICTURE_PATH_KEY));
  }

  private createFolder(foldername: string) {
    try {
      if (!fs.existsSync(join(this.basepath, foldername))) {
        fs.mkdirSync(join(this.basepath, foldername));
      }
    } catch (e) {
      console.log('create folder function failed.', e);
    }
  }
}
