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

async function createCustomer() {
  const prisma = new PrismaClient();

  const customer = await prisma.customer.create({
    data: {
      email,
      password: await hash(password),
      emailVerified: true,
    },
  });

  return customer;
}

createCustomer()
  .then((customer) => {
    console.log('\n Customer created successfully!');
    console.log('--------------------------');
    console.log(`ID: ${customer.id}`);
    console.log(`Email: ${customer.email}`);
    console.log('--------------------------');
    process.exit(0);
  })
  .catch((e) => {
    if (e.code === 'P2002') {
      console.error('Error: A customer with this email already exists.');
    } else {
      console.error('An unexpected error occurred:', e);
    }
    process.exit(1);
  })
  .finally(async () => {
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  });