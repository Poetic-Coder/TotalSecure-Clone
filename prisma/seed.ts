import { PrismaClient } from '@prisma/client';
import {
  PERMISSION_CATALOGUE,
  SYSTEM_ROLE_SEEDS,
} from '../src/api/company/rbac/constants/permission-catalogue';

const prisma = new PrismaClient();

async function seedPermissions() {
  for (const perm of PERMISSION_CATALOGUE) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      create: {
        name: perm.name,
        module: perm.module,
        action: perm.action,
        description: perm.description,
      },
      update: {
        module: perm.module,
        action: perm.action,
        description: perm.description,
      },
    });
  }
  console.log(`Seeded ${PERMISSION_CATALOGUE.length} permissions`);
}

async function seedSystemRoles() {
  const allPerms = await prisma.permission.findMany();
  const byName = new Map(allPerms.map((p) => [p.name, p]));

  for (const roleSeed of SYSTEM_ROLE_SEEDS) {
    let role = await prisma.role.findFirst({
      where: { name: roleSeed.name, companyPk: null, isSystem: true },
    });

    if (!role) {
      role = await prisma.role.create({
        data: {
          name: roleSeed.name,
          description: roleSeed.description,
          isSystem: true,
        },
      });
    } else {
      role = await prisma.role.update({
        where: { pk: role.pk },
        data: { description: roleSeed.description, isSystem: true },
      });
    }

    const desired = new Set(roleSeed.permissions);
    const existing = await prisma.rolePermission.findMany({
      where: { rolePk: role.pk },
      include: { permission: true },
    });

    for (const link of existing) {
      if (!desired.has(link.permission.name)) {
        await prisma.rolePermission.delete({ where: { pk: link.pk } });
      }
    }

    const existingNames = new Set(existing.map((l) => l.permission.name));
    for (const permName of desired) {
      if (existingNames.has(permName)) continue;
      const permission = byName.get(permName);
      if (!permission) {
        console.warn(`Missing permission in DB: ${permName}`);
        continue;
      }
      await prisma.rolePermission.create({
        data: {
          rolePk: role.pk,
          roleId: role.id,
          permissionPk: permission.pk,
          permissionId: permission.id,
        },
      });
    }

    console.log(
      `Seeded system role ${roleSeed.name} (${roleSeed.permissions.length} permissions)`,
    );
  }
}

async function main() {
  await seedPermissions();
  await seedSystemRoles();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
