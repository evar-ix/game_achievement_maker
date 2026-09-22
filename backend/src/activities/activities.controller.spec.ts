import {jest} from '@jest/globals';
import {Test, TestingModule} from '@nestjs/testing';
import {ActivitiesController} from './activities.controller';
import {ActivitiesService} from './activities.service';

describe('ActivitiesController', () => {
  let controller: ActivitiesController;

  const activitiesService = {
    getActivity: jest.fn(),
    updateActivity: jest.fn(),
    mapActivitiesToClientJson: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        {
          provide: ActivitiesService,
          useValue: activitiesService,
        },
      ],
    }).compile();

    controller = module.get<ActivitiesController>(ActivitiesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});