import { SetMetadata } from '@nestjs/common';


export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export const PERMISSIONS_KEY = 'permissions';

export const Permissions = (permissions: string) => SetMetadata(PERMISSIONS_KEY, permissions);