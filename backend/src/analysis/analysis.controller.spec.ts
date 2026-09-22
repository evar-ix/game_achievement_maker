import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { ANALYSIS_REPOSITORY } from './persistence/analysis.repository';

describe('AnalysisController', () => {
  let controller: AnalysisController;

  const mockRepository = {
    save: async () => {},
    findByGameId: async () => null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalysisController],
      providers: [
        AnalysisService,
        {
          provide: ANALYSIS_REPOSITORY,
          useValue: mockRepository,
        },
      ],
    }).compile();

    controller = module.get<AnalysisController>(AnalysisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});