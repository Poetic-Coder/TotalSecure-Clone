import { PrismaClient } from '@prisma/client';
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
  .option('role', { type: 'string', default: 'ADMIN', description: 'Client staff role' })
  .option('client', { type: 'string', demandOption: true, description: 'Client name' })
  .option('branch', { type: 'string', description: 'Branch name (optional)' })
  .parseSync();

async function main() {
  const prisma = new PrismaClient();

  // Look up the client by name
  const client = await prisma.client.findFirst({ where: { name: argv.client } });
  if (!client) throw new Error(`No client found with name ${argv.client}`);

  // Optionally look up branch
  let branch = null;
  if (argv.branch) {
    branch = await prisma.clientBranch.findFirst({ where: { name: argv.branch } });
    if (!branch) throw new Error(`No branch found with name ${argv.branch}`);
  }

  // Create the client staff
  const clientStaff = await prisma.clientStaff.create({
    data: {
      email: argv.email,
      password: await hash(argv.password),
      role: argv.role,
      emailVerified: true,
      client: { connect: {  id: client.id } },
      ...(branch ? { branch: { connect: {  id: branch.id } } } : {}),
    },
  });

  console.log('\n Client Staff created');
  console.log(`ID: ${clientStaff.id}`);
  console.log(`Email: ${clientStaff.email}`);
  console.log(`Role: ${clientStaff.role}`);
  console.log(`Client: ${client.name}`);
  if (branch) console.log(`Branch: ${branch.name}`);
}

main()
  .catch((e) => {
    if (e.code === 'P2002') {
      console.error('Error: Client staff with this email already exists.');
    } else {
      console.error(e);
    }
  })
  .finally(async () => {
    await new PrismaClient().$disconnect();
  });
