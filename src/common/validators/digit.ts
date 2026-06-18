
import { Injectable } from '@nestjs/common';
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';


export type IsDigitOptions = {
  length?: number;
};

export function IsDigit(options?: IsDigitOptions, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [options?.length],
      validator: IsDigitConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsDigit' })
@Injectable()
export class IsDigitConstraint implements ValidatorConstraintInterface {
  validate(value: string, validationArguments: ValidationArguments) {
    const length = validationArguments.constraints[0];
    if (length && value.length !== length) {
      return false;
    }
    
    // Check if value is a digit
    const regex = /^\d+$/;
    return regex.test(value);
  }

  defaultMessage() {
    return '$property must be a valid digit';
  }
}