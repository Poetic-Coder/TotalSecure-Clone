import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { AnyUser } from '@common/interfaces';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): AnyUser => {
    const request = ctx.switchToHttp().getRequest();

    const user = request.user;

    if (!user) {
      throw new InternalServerErrorException(
        'CurrentUser decorator used, but no user object was found on the request. Ensure the AuthUserInterceptor is applied to this route.',
      );
    }

    return user;
  },
);