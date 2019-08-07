import { TestBed } from '@angular/core/testing';

import { ReadWriteImageService } from './read-write-image.service';

describe('SaveImageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReadWriteImageService = TestBed.get(ReadWriteImageService);
    expect(service).toBeTruthy();
  });
});
