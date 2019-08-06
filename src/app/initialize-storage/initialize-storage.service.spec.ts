import { TestBed } from '@angular/core/testing';

import { InitializeStorageService } from './initialize-storage.service';

describe('InitializeStorageService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: InitializeStorageService = TestBed.get(InitializeStorageService);
    expect(service).toBeTruthy();
  });
});
