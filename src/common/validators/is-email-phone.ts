import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
  ValidatorConstraintInterface,
  ValidatorConstraint,
} from 'class-validator';
import { Injectable } from '@nestjs/common';

export function IsEmailOrPhone(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isEmailOrPhone',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: IsEmailOrPhoneConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsValidPassword' })
@Injectable()
export class IsEmailOrPhoneConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const email = args.object['email'];
    const phone = args.object['phone'];
    return (email && email.length > 0) || (phone && phone.length > 0);
  }
  defaultMessage() {
    return `At least one of email or phone must be provided.`;
  }
}
