import { Test, TestingModule } from '@nestjs/testing';
import { EscenarioService } from './escenario.service';

describe('EscenarioService', () => {
  let service: EscenarioService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EscenarioService],
    }).compile();

    service = module.get<EscenarioService>(EscenarioService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
