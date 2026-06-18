
import { UserModule } from "@api/user/user.module";
import { AuthUserInterceptor as AUTH } from "@common/interceptors/authenticated-account.interceptor";
import { APP_INTERCEPTOR } from '@nestjs/core';


export const AuthUserInterceptor = Symbol('AuthUserInterceptor');

export const AuthUserInterceptorProvider = {
  provide: APP_INTERCEPTOR,
  import: [UserModule],
};
