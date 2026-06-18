import { Injectable } from '@nestjs/common';
import { IdentificationCardType } from '@prisma/client';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

function validateIdType(value: string, type: IdentificationCardType) {
  switch (type) {
    case 'DRIVERS_LICENSE':
      return value.length > 7;
    case 'INTERNATIONAL_PASSPORT':
      return value.length > 4;
    case 'VOTERS_CARD':
      return value.length > 16;
    case 'NATIONAL_ID':
      return value.length > 10;
    default:
      return false;
  }
}

export function IsValidID(validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidIDConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'IsValidID' })
@Injectable()
export class IsValidIDConstraint implements ValidatorConstraintInterface {
  validate(
    value: string,
    args: ValidationArguments,
  ): boolean | Promise<boolean> {
    const idType = args.object['idType'] as IdentificationCardType;
    return validateIdType(value, idType);
  }
  defaultMessage() {
    return '$property is not valid for the selected type';
  }
}
