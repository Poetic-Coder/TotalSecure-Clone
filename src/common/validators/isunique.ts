
import { PrismaService } from '@database/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';


export function IsUnique({ model, field }: { model: string, field?: string }, validationOptions?: ValidationOptions) {
  return (object: any, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [model, field],
      validator: IsUniqueConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isUnique', async: true })
@Injectable()
export class IsUniqueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly prisma: PrismaService) { }
  async validate(value: string, validationArguments: ValidationArguments) {
    const model = validationArguments.constraints[0];
    const field = validationArguments.constraints[1]
      ? validationArguments.constraints[1]
      : validationArguments.property;

      const modelDelegate = this.prisma[model] as any;

    const user = await modelDelegate?.findUnique({
      where: {
        [field]: value,
      },
    });

    return !user;
  }

  defaultMessage() {
    return '$property $value already exists';
  }
}