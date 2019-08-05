import { TestBed } from '@angular/core/testing';

import { ElectronEventService } from './electron-event.service';

describe('ElectronEventService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ElectronEventService = TestBed.get(ElectronEventService);
    expect(service).toBeTruthy();
  });
});
