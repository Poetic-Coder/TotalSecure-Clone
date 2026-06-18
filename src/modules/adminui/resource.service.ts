import { PrismaService } from '@database/prisma.service';
import { Injectable } from '@nestjs/common';
import { DMMFClass } from '@prisma/client/runtime';
import { ResourceWithOptions, ResourceOptions } from 'adminjs/types/src';

export class CResource {
  model: any;
  options: ResourceOptions;

  constructor(model: any, options?: ResourceOptions) {
    this.model = model;
    this.options = options || {};
  }
}

@Injectable()
export class CResourceBuilder {
  private readonly resources: Array<CResource> = [];
  dmmf: DMMFClass;

  constructor(private readonly prisma: PrismaService) {
    this.dmmf = ((prisma as any)._baseDmmf as DMMFClass)
  }

  /**
   * Adds a resource to the builder
   * 
   * @param resource string
   * @param options ResourceOptions
   * @returns this
   */
  public addResource(resource: string, options?: ResourceOptions): this {
    const obj = new CResource(this.dmmf.modelMap[resource], options);
    this.resources.push(obj);
    return this;
  }

  /**
   * Compiles the resources into an array of objects
   * that can be passed to the AdminJS module
   * 
   * @returns Array<ResourceWithOptions | any>
   */
  public build(): Array<ResourceWithOptions | any> {
    return this.resources.map((resource) => {
      return {
        resource: {
          model: resource.model,
          client: this.prisma,
        },
        options: resource.options,
      }
    })
  }
}
