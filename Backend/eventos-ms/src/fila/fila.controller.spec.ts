import { Test, TestingModule } from '@nestjs/testing';
import { FilaController } from './fila.controller';
import { FilaService } from './fila.service';

describe('FilaController', () => {
  let controller: FilaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilaController],
      providers: [FilaService],
    }).compile();

    controller = module.get<FilaController>(FilaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
