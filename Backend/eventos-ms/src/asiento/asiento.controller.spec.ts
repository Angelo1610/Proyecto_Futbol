import { Test, TestingModule } from '@nestjs/testing';
import { AsientoController } from './asiento.controller';
import { AsientoService } from './asiento.service';

describe('AsientoController', () => {
  let controller: AsientoController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AsientoController],
      providers: [AsientoService],
    }).compile();

    controller = module.get<AsientoController>(AsientoController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
