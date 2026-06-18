
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';


export function IsPin(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsPinConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsPin' })
@Injectable()
export class IsPinConstraint implements ValidatorConstraintInterface {
  validate(value: string) {
    if (value.length !== 4) {
      return false;
    }
    return true;
  }

  defaultMessage() {
    return '$property must be a valid pin';
  }
}