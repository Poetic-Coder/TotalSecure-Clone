import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { timeout } from 'rxjs';
import { FaceAndLivenessDTO, FaceDTO, FaceExpressionDTO, IdDocVerificationDTO } from '../interfaces/virtualSwitchAi/virtualSwitchAi.dto';


@Injectable()
export class VirtualSwitchAIService {
  private readonly baseUrl: string;
  private readonly xApiKey: string;
  private readonly logger = new Logger(VirtualSwitchAIService.name);
  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('VSI_AI_BASE_URL');
    this.xApiKey = this.configService.get<string>('VSI_AI_X_API_KEY');
  }

  public async faceAndLivenessDetection(data: FaceAndLivenessDTO): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/face-match`;
      const headers = {
        'x-api-key': this.xApiKey, 
        'Content-Type': 'application/json',
      };
      const body = {
        static_image_url: data.profilePhoto,
        neutral_image_url: data.neutralPhoto,
        eyes_closed_image_url: data.eyesClosedPhoto,
        face_up_image_url: data.faceUpPhoto,
        face_down_image_url: data.faceDownPhoto 
      };
      const response = await axios.post(url, body, { headers,  timeout: 240000, },);
      const result = response.data;
      this.logger.debug(result);
      if (!result) {
          this.logger.error(result);
          throw new BadRequestException('Error contacting Virtual Switch AI');
      }
      return result;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Error contacting Virtual Switch AI');
    }
      
  }
  

  public async faceDetection(data: FaceDTO): Promise<any> {
    const url = `${this.baseUrl}/api/detect`;
    const headers = {
      'x-api-key': this.xApiKey, 
      'Content-Type': 'application/json',
    };
    const body = {
      image_url: data.image_url,
    };
    const response = await axios.post(url, body, { headers });
    const result = response.data;
    this.logger.debug(result);
    if (!result) {
        this.logger.error(result);
        throw new BadRequestException('Error contacting Virtual Switch AI');
    }
    return result;
  }

  public async verifyIdDoc(data: IdDocVerificationDTO): Promise<any> {
    const url = `${this.baseUrl}/api/verify-id`;
    const headers = {
      'x-api-key': this.xApiKey, 
      'Content-Type': 'application/json',
    };
    const body = {
      file_url: data.file_url,
      id_number: data.id_number,
      id_type: data.id_type,
    };
    const response = await axios.post(url, body, { headers });
    const result = response.data;
    this.logger.debug(result);
    if (!result) {
        this.logger.error(result);
        throw new BadRequestException('Error contacting Virtual Switch AI');
    }
    return result;
  }


  public async faceExpression(data: FaceExpressionDTO): Promise<any> {
    try {
      const url = `${this.baseUrl}/api/facial-expression`;
    const headers = {
      'x-api-key': this.xApiKey, 
      'Content-Type': 'application/json',
    };

  const body = {
    image_url: data.image_url,
    image_expression: data.type
  };


    const response = await axios.post(url, body, { headers });
    const result = response.data;
    this.logger.debug(result);
    if (!result) {
        this.logger.error(result);
        throw new BadRequestException('Error contacting Virtual Switch AI');
    }
    return result;
    } catch (error) {
      this.logger.debug(error);
      throw new BadRequestException(error?.message || 'Error contacting Virtual Switch AI');
    }
    
  }



    public async faceMatchAndExpression(data: FaceAndLivenessDTO): Promise<any> {
      try {
        const url = `${this.baseUrl}/api/verify-same-person`;
      const headers = {
        'x-api-key': this.xApiKey, 
        'Content-Type': 'application/json',
      };
      const body = {
        static_image_url: data.profilePhoto,
        neutral_image_url: data.neutralPhoto,
        eyes_closed_image_url: data.eyesClosedPhoto,
        face_up_image_url: data.faceUpPhoto,
        face_down_image_url: data.faceDownPhoto 
      };
      const response = await axios.post(url, body, { headers, timeout: 240000, });
      const result = response.data;
      this.logger.debug(result);
      if (!result) {
          this.logger.error(result);
          throw new BadRequestException('Error contacting Virtual Switch AI');
      }
      return result;
      } catch (error) {
        this.logger.debug(error);
      throw new BadRequestException(error?.message || 'Error contacting Virtual Switch AI');
      }
      
  }
}

