import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

export function isMatch(
  property: string,
  validationOptions?: ValidationOptions,
) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [property],
      validator: MatchFieldConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isMatch' })
export class MatchFieldConstraint implements ValidatorConstraintInterface {
  validate(value: string, validationArguments: ValidationArguments) {
    const field = validationArguments.constraints[0];
    const object = validationArguments.object as any;
    return value === object[field];
  }

  defaultMessage() {
    return '$property does not matc $constraint1';
  }
}
