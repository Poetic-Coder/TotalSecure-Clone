import { PrismaClient } from '@prisma/client';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import * as bcrypt from 'bcrypt';

async function hash(data: string, salt = null) {
  if (salt != null) {
    return bcrypt.hash(data, salt);
  }
  const generatedSalt = await bcrypt.genSalt(10);
  return bcrypt.hash(data, generatedSalt);
}

const args = yargs(hideBin(process.argv))
  .option('email', {
    alias: 'e',
    type: 'string',
    description: 'The email for the new staff member',
    demandOption: true,
  })
  .option('password', {
    alias: 'p',
    type: 'string',
    description: 'The password for the new staff member',
    demandOption: true,
  })
  .parseSync();

const email = args.email
const password = args.password

async function createAgent() {
  const prisma = new PrismaClient();

  const agent = await prisma.agent.create({
    data: {
      email,
      password: await hash(password),
      agentCode: `AG${Math.floor(100000 + Math.random() * 900000)}`,
      emailVerified: true,
    },
  });

  return agent;
}

createAgent()
  .then((agent) => {
    console.log('\n Agent created successfully!');
    console.log('--------------------------');
    console.log(`ID: ${agent.id}`);
    console.log(`Email: ${agent.email}`);
    console.log('--------------------------');
    process.exit(0);
  })
  .catch((e) => {
    if (e.code === 'P2002') {
      console.error('Error: A staff member with this email or employee ID already exists.');
    } else {
      console.error('An unexpected error occurred:', e);
    }
    process.exit(1);
  })
  .finally(async () => {
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  });