import { Test, TestingModule } from '@nestjs/testing';
import { AsientoService } from './asiento.service';

describe('AsientoService', () => {
  let service: AsientoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AsientoService],
    }).compile();

    service = module.get<AsientoService>(AsientoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
