import { Test, TestingModule } from '@nestjs/testing';
import { FilaService } from './fila.service';

describe('FilaService', () => {
  let service: FilaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FilaService],
    }).compile();

    service = module.get<FilaService>(FilaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
