import { TestBed } from '@angular/core/testing';

import { DateFnsDateAdapterService } from './date-fns-date-adapter.service';

describe('DateFnsDateAdapterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: DateFnsDateAdapterService = TestBed.get(DateFnsDateAdapterService);
    expect(service).toBeTruthy();
  });
});
