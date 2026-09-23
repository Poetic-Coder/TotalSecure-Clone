import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditAction } from '@prisma/client';
import { Request } from 'express';
import { AuditLogService } from '@api/rbac/services/audit-log.service';
import { AuthenticatedRequestUser } from '@common/interfaces';

/**
 * When a platform staff is impersonating a company, log every mutating
 * request (and its outcome) so support actions are attributable.
 */
@Injectable()
export class ImpersonationAuditInterceptor implements NestInterceptor {
  constructor(private readonly auditLog: AuditLogService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthenticatedRequestUser | undefined;
    const method = request.method.toUpperCase();

    if (!user?.impersonatedBy || ['GET', 'HEAD', 'OPTIONS'].includes(method)) {
      return next.handle();
    }

    const path = request.route?.path
      ? `${request.baseUrl}${request.route.path}`
      : request.originalUrl;

    return next.handle().pipe(
      tap({
        next: () => {
          void this.auditLog.log({
            action: AuditAction.IMPERSONATE,
            module: 'IMPERSONATION',
            targetId: user.id,
            targetType: user.accountType,
            description: `Impersonated ${method} ${path}`,
            companyPk: 'pk' in user ? (user.pk as number) : undefined,
            companyId: user.companyId ?? user.id,
            metadata: {
              impersonatedBy: user.impersonatedBy,
              method,
              path,
              status: 'success',
            },
          });
        },
        error: (err) => {
          void this.auditLog.log({
            action: AuditAction.IMPERSONATE,
            module: 'IMPERSONATION',
            targetId: user.id,
            targetType: user.accountType,
            description: `Impersonated ${method} ${path} failed`,
            companyPk: 'pk' in user ? (user.pk as number) : undefined,
            companyId: user.companyId ?? user.id,
            metadata: {
              impersonatedBy: user.impersonatedBy,
              method,
              path,
              status: 'error',
              error: err?.message ?? 'unknown',
            },
          });
        },
      }),
    );
  }
}
