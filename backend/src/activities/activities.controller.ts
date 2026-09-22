import {Body, Controller, Get, Param, Patch, Post} from '@nestjs/common';

import type { ClientActivityExportRequest } from './client-json/client-activity-json.interface';

import { ActivitiesService } from './activities.service';

@Controller('activities')
export class ActivitiesController {
  constructor(
    private readonly activitiesService: ActivitiesService,
  ) {}

  @Post('client-json')
  mapActivitiesToClientJson(
    @Body() body: ClientActivityExportRequest,
  ) {
    return this.activitiesService.mapActivitiesToClientJson(
      body,
    );
  }

  @Get(':id')
  getActivity(
    @Param('id') id: string,
  ) {
    return this.activitiesService.getActivity(id);
  }

  @Patch(':id')
  updateActivity(
    @Param('id') id: string,
    @Body()
    body: {
      title: string;
      description: string;
      questions: Array<{
        question: string;
        options?: string[];
        correctAnswers?: string[];
      }>;
    },
  ) {
    return this.activitiesService.updateActivity(id, body);
  }
}