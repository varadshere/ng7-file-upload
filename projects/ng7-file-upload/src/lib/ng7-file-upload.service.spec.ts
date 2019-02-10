import { TestBed } from '@angular/core/testing';

import { Ng7FileUploadService } from './ng7-file-upload.service';

describe('Ng7FileUploadService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Ng7FileUploadService = TestBed.get(Ng7FileUploadService);
    expect(service).toBeTruthy();
  });
});
