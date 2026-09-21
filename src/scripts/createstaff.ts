import { PrismaClient, StaffRole } from '@prisma/client';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import * as bcrypt from 'bcrypt';

async function hash(data: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(data, salt);
}

const argv = yargs(hideBin(process.argv))
  .option('email', { type: 'string', demandOption: true })
  .option('password', { type: 'string', demandOption: true })
  .option('companyId', {
    type: 'string',
    demandOption: true,
    description: 'Company (tenant) UUID',
  })
  .option('role', { type: 'string', default: 'SUPER_ADMIN', description: 'StaffRole' })
  .parseSync();

async function main() {
  const prisma = new PrismaClient();

  const company = await prisma.company.findUnique({
    where: { id: argv.companyId },
  });
  if (!company) {
    throw new Error(`Company not found: ${argv.companyId}`);
  }

  const staff = await prisma.staff.create({
    data: {
      email: argv.email,
      password: await hash(argv.password),
      employeeId: `SA-${Math.floor(100000 + Math.random() * 900000)}`,
      role: argv.role as StaffRole,
      emailVerified: true,
      company: { connect: { id: company.id } },
    },
  });
  console.log('\n Staff created');
  console.log(`ID: ${staff.id}`);
  console.log(`Email: ${staff.email}`);
  console.log(`Company: ${company.name} (${company.id})`);
}

main().catch((e) => {
  if (e.code === 'P2002') console.error('Error: Staff with this email or employee ID already exists.');
  else console.error(e);
}).finally(async () => {
  await new PrismaClient().$disconnect();
});
