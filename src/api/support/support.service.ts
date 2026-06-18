import { Injectable } from '@nestjs/common';
import { SupportTicketService } from '@modules/clients/clients/helpAndSupport/supportService';
import { createTicketDTO, supportLoginDTO, replyTicketDTO  } from '@modules/clients/clients/interfaces/helpAndSupport/support.dto';

@Injectable()
export class SupportService {
constructor(private readonly supportTicketService: SupportTicketService) {}

  async login(data: supportLoginDTO) {
    const res = this.supportTicketService.login(data);
    console.log('Support service login response:', res);
    return res;
  }

  async createTicket( data: createTicketDTO) {
    return this.supportTicketService.createTicket(data);
  }

  async replyTicket(data: replyTicketDTO) {
    return this.supportTicketService.replyTicket(data);
  }

  async getAllTickets() {
    return this.supportTicketService.getAllTickets();
  }

  async getSingleTicket(ticketId: string) {
    return this.supportTicketService.getSingleTicket(ticketId);
  }

  async getDepartments() {
    return this.supportTicketService.getDepartments();
  }

  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new Error('File is required');
    }
    return this.supportTicketService.uploadFile(file);
  }

}

