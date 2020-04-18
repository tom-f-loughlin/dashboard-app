import { TestBed } from '@angular/core/testing';

import { HeaderStrategyService } from './header-strategy.service';

describe('HeaderService', () => {
  let service: HeaderStrategyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HeaderStrategyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
