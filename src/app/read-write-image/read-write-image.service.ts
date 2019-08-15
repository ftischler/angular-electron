import { Injectable } from '@angular/core';
import { join } from 'path';
import * as fs from 'fs';
import { PICTURE_PATH_KEY } from '../localstorage-keys';
import { ElectronService } from '../electron/electron.service';

@Injectable({
  providedIn: 'root'
})
export class ReadWriteImageService {
  fs: typeof fs;

  constructor(private electronService: ElectronService) {
    if (this.electronService.isElectron) {
      this.fs = window.require('fs');
    }
  }

  writeImage(image: string, classname: string, name: string): void {
    const base64Data = image.replace(/^data:image\/png;base64,/, '');
    this.createFolder(classname);
    try {
      this.fs.writeFileSync(join(this.basepath, classname, name + '.png'), base64Data, 'base64');
    } catch (e) {
      console.log('write file sync failed.', e);
    }
  }

  readImage(classname: string, name: string): string {
    return 'data:image/png;base64,' + this.fs.readFileSync(join(this.basepath, classname, name + '.png'), 'base64');
  }

  private get basepath() {
    return JSON.parse(window.localStorage.getItem(PICTURE_PATH_KEY));
  }

  private createFolder(foldername: string) {
    try {
      if (!this.fs.existsSync(join(this.basepath, foldername))) {
        this.fs.mkdirSync(join(this.basepath, foldername));
      }
    } catch (e) {
      console.log('create folder function failed.', e);
    }
  }
}
