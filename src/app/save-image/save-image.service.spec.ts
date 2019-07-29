import { TestBed } from '@angular/core/testing';

import { SaveImageService } from './save-image.service';

describe('SaveImageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SaveImageService = TestBed.get(SaveImageService);
    expect(service).toBeTruthy();
  });
});
