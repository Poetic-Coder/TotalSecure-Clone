import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { SubscriptionService } from './subscription.service';
import { AssignPaidPlanDto } from './dto/assign-trial.dto';

@ApiTags('Platform — Subscriptions')
@ApiBearerAuth()
@Controller('platform/subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  @Get()
  @ApiOperation({ summary: 'Get all company subscriptions and their status' })
  getAllSubscriptions() {
    return this.subscriptionService.getAllCompanySubscriptions();
  }

  @Get(':companyId/status')
  @ApiOperation({ summary: 'Get subscription status for a specific company' })
  getStatus(@Param('companyId') companyId: string) {
    return this.subscriptionService.getCompanySubscriptionStatus(companyId);
  }

  @Post(':companyId/assign-plan')
  @ApiOperation({ summary: 'Assign or upgrade a company to a paid plan' })
  assignPlan(
    @Param('companyId') companyId: string,
    @Body() dto: AssignPaidPlanDto,
  ) {
    return this.subscriptionService.assignPaidPlan(
      companyId,
      dto.planId,
      dto.billingCycle,
    );
  }
}