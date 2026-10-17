import { TestBed } from '@angular/core/testing';

import { CentroAcademico } from './centro-academico';

describe('CentroAcademico', () => {
  let service: CentroAcademico;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CentroAcademico);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
