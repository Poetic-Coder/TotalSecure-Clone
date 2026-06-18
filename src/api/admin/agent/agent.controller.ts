import { AuthUserInterceptor } from '@common/interceptors/authenticated-account.interceptor';
import { Body, Controller, Get, Param, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { AgentService } from './agent.service';
import { Roles } from '@common/decorators/role.decorator';
import { RolesGuard } from '@api/authentication/guards/role.guard';
import { AccountType } from '@common/enums';

@Controller('admin-agent')
export class AgentController {
    constructor( private readonly agentService: AgentService){}

    @ApiBearerAuth()
    @UseInterceptors(AuthUserInterceptor)
    @UseGuards(RolesGuard)
    @Roles(AccountType.STAFF)
    @ApiOperation({ summary: 'send agent account for approval' })
    @Post('send-agent-account-for-approval/:id')
    async ApproveAgentAccount(@Param('id') id: string) {
      return this.agentService.sendAgentToBank(id)
    }

  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @UseGuards(RolesGuard)
  @Roles(AccountType.STAFF)
  @Get('get-all-agents')
  @ApiQuery({ name: 'status', required: false, description: 'Filter by KYC status: APPROVED, PROCESSING, REJECTED' })
  @ApiQuery({ name: 'page', required: false, description: 'Page number', type: Number })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of items per page', type: Number })
  public async getAllAgents(
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.agentService.getAllAgents({ status, page, limit });
  }


  @ApiBearerAuth()
  @UseInterceptors(AuthUserInterceptor)
  @UseGuards(RolesGuard)
  @Roles(AccountType.STAFF)
  @Get('get-agent-by/:id')
  @ApiParam({ name: 'id', required: true, description: 'Agent ID' })
  public async getAgentById(@Param('id') id: string) {
    return this.agentService.getAgentById(id);
  }


}
