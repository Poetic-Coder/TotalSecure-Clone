import { Injectable, Logger, BadRequestException, Body } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { createTicketDTO, replyTicketDTO, supportLoginDTO } from '../interfaces/helpAndSupport/support.dto';


@Injectable()
export class SupportTicketService {
  
  private readonly baseUrl: string;
  private readonly logger = new Logger(SupportTicketService.name);
  private authToken: string;
  private apiKey: string 
  
  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('SUPPORT_API_BASE_URL');
    this.authToken = '';
    this.apiKey = this.configService.get<string>('SUPPORT_X_API_KEY');
  }
  
  private getHeaders() {
  return {
      'Content-Type': 'application/json',
      Token: `${this.authToken}`,
      x_api_key: `${this.apiKey}`
  };
  }

 public async login(data: supportLoginDTO): Promise<any> {
  const url = `${this.baseUrl}/appApiSupportLogin?email=${encodeURIComponent(
    data?.email
  )}&token=${encodeURIComponent(data?.token)}`;

  try {
    const response = await axios.post(url, null, { headers: this.getHeaders() });
    const result = response.data; 

    if (result.error) {
      this.logger.error(`Login failed: ${result.error}`);
      throw new BadRequestException(result.error);
    }

    this.authToken = result.token;
    this.logger.debug(`Login successful. Token set for user.`, this.authToken);

    return result;
  } catch (error) {
    this.logger.error(`Login request failed: ${error.message}`);
    throw new BadRequestException('Login to support service failed');
  }
}


  public async createTicket(data: createTicketDTO): Promise<any> {
    const url = `${this.baseUrl}/ticket/post`;

      const body = {
        subject: data.subject,
        message: data.message,
        priority: data.priority,
        department_id: data.department_id,
        attachments: data.file ? [data.file] : [],
      }
      const response = await axios.post(url, body, { headers: this.getHeaders() });
      const result = response.data;

      this.logger.debug(`Ticket created successfully: ${JSON.stringify(result)}`);
      if (!result) {
          this.logger.error(result);
          throw new BadRequestException(' Error contacting support service');
      }
      return result;
  }

  public async replyTicket(data: replyTicketDTO): Promise<any> {
    const url = `${this.baseUrl}/ticket/reply`;
    const body = {
      ticket_id: data.ticket_id,
      message: data.message,
       attachments: data.file ? [data.file] : [],
    }
    const response = await axios.post(url, body, { headers: this.getHeaders() });
    const result = response.data;
    if (!result) {
          this.logger.error(result);
          throw new BadRequestException('Error contacting Support service');
      }
      return result;
  }

   public async getAllTickets(): Promise<any> {
    const url = `${this.baseUrl}/ticket/all`;
    const response = await axios.get(url,  { headers: this.getHeaders() });
    return response.data;
  }


  public async getSingleTicket(ticketId: string): Promise<any> {
    const url = `${this.baseUrl}/ticket/show/${ticketId}`;

    const response = await axios.get(url, { headers: this.getHeaders() });
    return response.data;
  }

  public async getDepartments(): Promise<any> {
    const url = `${this.baseUrl}/ticket/department`;

    const response = await axios.get(url, { headers: this.getHeaders() });
    return response.data;
  }

public async uploadFile(file: Express.Multer.File): Promise<any> {
    const url = `${this.baseUrl}/fileupload`;

    const blob = new Blob([file.buffer], { type: file.mimetype });
    
    const formData = new FormData();
    formData.append('file', blob, file.originalname);

    try {
      const response = await axios.post(url, formData, {
        headers: {
          ...this.getHeaders(),
          'Content-Type': 'multipart/form-data',
        }
      });
      
      const result = response.data;
      if (!result || !result.data?.secure_url) {
        this.logger.error('Invalid response structure or missing secure_url', result);
        throw new BadRequestException('Error uploading file: Invalid response from support service');
      }
      
      return result;
      
    } catch (error) {
      this.logger.error('File upload failed', error.response?.data || error.message);
      throw new BadRequestException('Failed to upload file to support service');
    }
}
}
