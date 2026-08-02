import { Test, TestingModule } from '@nestjs/testing';
import { EscenarioController } from './escenario.controller';
import { EscenarioService } from './escenario.service';

describe('EscenarioController', () => {
  let controller: EscenarioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EscenarioController],
      providers: [EscenarioService],
    }).compile();

    controller = module.get<EscenarioController>(EscenarioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
