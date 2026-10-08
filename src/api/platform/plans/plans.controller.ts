import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiSecurity, ApiOperation, ApiForbiddenResponse } from '@nestjs/swagger';
import { PlansService } from './plans.service';
import { CreatePlatformPlanDto } from './dto/create-plan.dto';
import { UpdatePlatformPlanDto } from './dto/update-plan.dto';
import { AuthUserInterceptor } from '@api/common/auth/interceptors/authenticated-account.interceptor';
import { RolesGuard } from '@api/common/auth/guards/role.guard';
import { Roles } from '@common/decorators/role.decorator';
import { AccountType } from '@common/enums';


@ApiTags('Platform — Plans')
@ApiBearerAuth('bearer')
@ApiSecurity('api-key')
@UseInterceptors(AuthUserInterceptor)
@UseGuards(RolesGuard)
@Roles(AccountType.PLATFORM_STAFF)
@ApiForbiddenResponse({ description: 'Not platform staff / not super admin' })
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