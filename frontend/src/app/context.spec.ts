import { TestBed } from '@angular/core/testing';

import { Context } from './context';

describe('Context', () => {
  let service: Context;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Context);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
