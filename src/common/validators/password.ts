import { validatePassword } from '@common/utils/password';
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function IsValidPassword(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPasswordConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsValidPassword' })
@Injectable()
export class IsValidPasswordConstraint implements ValidatorConstraintInterface {
  validate(value: string): boolean | Promise<boolean> {
    return validatePassword(value);
  }
  defaultMessage() {
    return '$property must be at least 8 characters long, contain at least \
one uppercase letter, one lowercase letter, one number, one special character and no spaces';
  }
}
