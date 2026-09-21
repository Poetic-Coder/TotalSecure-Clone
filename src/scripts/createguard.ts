import { PrismaClient, GuardStatus } from '@prisma/client';
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
  .option('status', { type: 'string', default: 'RECRUITED', description: 'GuardStatus' })
  .parseSync();

async function main() {
  const prisma = new PrismaClient();

  const company = await prisma.company.findUnique({
    where: { id: argv.companyId },
  });
  if (!company) {
    throw new Error(`Company not found: ${argv.companyId}`);
  }

  const guard = await prisma.guard.create({
    data: {
      email: argv.email,
      password: await hash(argv.password),
      employeeId: `GD-${Math.floor(100000 + Math.random() * 900000)}`,
      status: argv.status as GuardStatus,
      emailVerified: true,
      company: { connect: { id: company.id } },
    },
  });
  console.log('\n Guard created');
  console.log(`ID: ${guard.id}`);
  console.log(`Email: ${guard.email}`);
  console.log(`Company: ${company.name} (${company.id})`);
}

main().catch((e) => {
  if (e.code === 'P2002') console.error('Error: Guard with this email or employee ID already exists.');
  else console.error(e);
}).finally(async () => {
  await new PrismaClient().$disconnect();
});
