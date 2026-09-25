import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlatformPlanDto } from './dto/create-plan.dto';
import { UpdatePlatformPlanDto } from './dto/update-plan.dto';

// Note: Replace with actual PlatformStaff guard when auth is built
// @UseGuards(PlatformStaffGuard)

@ApiTags('Platform — Plans')
@ApiBearerAuth()
@Controller('platform/plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new platform plan' })
  create(@Body() dto: CreatePlatformPlanDto) {
    return this.plansService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active platform plans' })
  findAll() {
    return this.plansService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one platform plan by id' })
  findOne(@Param('id') id: string) {
    return this.plansService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a platform plan' })
  update(@Param('id') id: string, @Body() dto: UpdatePlatformPlanDto) {
    return this.plansService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate a platform plan (soft delete)' })
  remove(@Param('id') id: string) {
    return this.plansService.remove(id);
  }
}