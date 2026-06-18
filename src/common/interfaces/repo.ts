import { PrismaService } from '@database/prisma.service';
import { Prisma, PrismaPromise } from '@prisma/client';

export interface G<
  QCreate,
  QFindFirst,
  QFindMany,
  QUpdate,
  QDelete,
  QUpdateMany,
  QFindUnique,
  T
> {
  create: (query: QCreate) => Promise<T>;
  findFirst: (query: QFindFirst) => Promise<T>;
  findMany: (query: QFindMany) => Promise<T[]>;
  update: (query: QUpdate) => Promise<T>;
  delete: (query: QDelete) => Promise<T>;
  updateMany: (query: QUpdateMany) => PrismaPromise<Prisma.BatchPayload>;
  findUnique: (query: QFindUnique) => Promise<T>;
}


export abstract class AbstractRepository<
  QCreate,
  QFindFirst,
  QFindMany,
  QUpdate,
  QDelete,
  QUpdateMany,
  QFindUnique,
  T
> {

  M: string;

  constructor(
    private readonly prismaService: PrismaService
  ) { }

  get getModel(): G<
    QCreate,
    QFindFirst,
    QFindMany,
    QUpdate,
    QDelete,
    QUpdateMany,
    QFindUnique,
    T
  > {
    return this.prismaService[this.M];
  }

  public async create(query: QCreate) {
    return this.getModel.create(query);
  }

  public async find(query: QFindFirst) {
    return this.getModel.findFirst(query);
  }

  public async findById(id: string) {
    return this.getModel.findFirst({ where: { id } } as any);
  }

  public async update(query: QUpdate) {
    return this.getModel.update(query);
  }

  public async findMany(query: QFindMany) {
    return this.getModel.findMany(query);
  }

  public async updateMany(query: QUpdateMany) {
    return this.getModel.updateMany(query);
  }

  public async findUnique(query: any) {
    return this.getModel.findUnique(query);
  }

  public async delete(query: QDelete) {
    return this.getModel.delete(query);
  }
}
