import { PrismaClient, ClientType, OnboardingMethod } from '@prisma/client';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import * as bcrypt from 'bcrypt';

async function hash(data: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(data, salt);
}

function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const argv = yargs(hideBin(process.argv))
  .option('email', { type: 'string', demandOption: true })
  .option('password', { type: 'string', demandOption: true })
  .option('name', { type: 'string', demandOption: true, description: 'Company or estate name' })
  .option('type', { type: 'string', default: 'ORGANIZATION', description: 'ClientType' })
  .parseSync();

async function main() {
  const prisma = new PrismaClient();
  const slug = generateSlug(argv.name);

  const client = await prisma.client.create({
    data: {
      email: argv.email,
      password: await hash(argv.password),
      name: argv.name,
      slug,
      clientType: argv.type as ClientType,
      onboardingMethod: OnboardingMethod.STAFF_ONBOARDED,
      emailVerified: true,
    },
  });

  console.log('\n Client created');
  console.log(`ID: ${client.id}`);
  console.log(`Email: ${client.email}`);
  console.log(`Name: ${client.name}`);
}

main().catch((e) => {
  if (e.code === 'P2002') console.error('Error: Client with this email or slug already exists.');
  else console.error(e);
}).finally(async () => {
  await new PrismaClient().$disconnect();
});