import { TestBed } from '@angular/core/testing';

import { ReadExcelService } from './read-excel.service';

describe('ReadExcelService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ReadExcelService = TestBed.get(ReadExcelService);
    expect(service).toBeTruthy();
  });
});
