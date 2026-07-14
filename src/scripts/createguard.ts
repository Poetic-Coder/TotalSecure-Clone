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
  .option('status', { type: 'string', default: 'RECRUITED', description: 'GuardStatus' })
  .parseSync();

async function main() {
  const prisma = new PrismaClient();
  const guard = await prisma.guard.create({
    data: {
      email: argv.email,
      password: await hash(argv.password),
      employeeId: `GD-${Math.floor(100000 + Math.random() * 900000)}`,
      status: argv.status as GuardStatus,
      emailVerified: true,
    },
  });
  console.log('\n Guard created');
  console.log(`ID: ${guard.id}`);
  console.log(`Email: ${guard.email}`);
}

main().catch((e) => {
  if (e.code === 'P2002') console.error('Error: Guard with this email or employee ID already exists.');
  else console.error(e);
}).finally(async () => {
  await new PrismaClient().$disconnect();
});