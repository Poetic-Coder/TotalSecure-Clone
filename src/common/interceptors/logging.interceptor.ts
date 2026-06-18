import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const now = new Date();
    this.logger.log(`Date: ${now.toISOString()}`);

    const request = context.switchToHttp().getRequest();

    this.logger.log(`Path: ${request.url}`);
    this.logger.log(`Method: ${request.method}`);

    return next
      .handle()
      .pipe(
        tap(() =>
          console.log(`After... ${Date.now() - now.getMilliseconds()}ms`),
        ),
      );
  }
}
