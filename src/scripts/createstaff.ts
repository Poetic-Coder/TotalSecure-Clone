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
  .option('role', { type: 'string', default: 'SUPER_ADMIN', description: 'StaffRole' })
  .parseSync();

async function main() {
  const prisma = new PrismaClient();
  const staff = await prisma.staff.create({
    data: {
      email: argv.email,
      password: await hash(argv.password),
      employeeId: `SA-${Math.floor(100000 + Math.random() * 900000)}`,
      role: argv.role as StaffRole,
      emailVerified: true,
    },
  });
  console.log('\n Staff created');
  console.log(`ID: ${staff.id}`);
  console.log(`Email: ${staff.email}`);
}

main().catch((e) => {
  if (e.code === 'P2002') console.error('Error: Staff with this email or employee ID already exists.');
  else console.error(e);
}).finally(async () => {
  await new PrismaClient().$disconnect();
});