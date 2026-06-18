import { PrismaClient, Staff, Agent, Customer } from '@prisma/client';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import { getRandomString } from '../common/utils/general'
import { API_KEY_LENGTH } from '../common/constants'

const argv = yargs(hideBin(process.argv))
  .option('staff', {
    type: 'string',
    description: 'Email of the Staff member to create a key for',
  })
  .option('agent', {
    type: 'string',
    description: 'Email of the Agent to create a key for',
  })
  .option('customer', {
    type: 'string',
    description: 'Email of the Customer to create a key for',
  })
  .check((argv) => {
    const ownerCount = [argv.staff, argv.agent, argv.customer].filter(Boolean).length;
    if (ownerCount !== 1) {
      throw new Error('Error: Please specify exactly one owner type (--staff, --agent, or --customer) with an email.');
    }
    return true;
  })
  .parseSync();

async function createApiKey() {
  const prisma = new PrismaClient();
  
  const ownerEmail = argv.staff || argv.agent || argv.customer;
  const ownerType = argv.staff ? 'staff' : argv.agent ? 'agent' : 'customer';

  let user: Staff | Agent | Customer | null = null;
  switch (ownerType) {
    case 'staff':
      user = await prisma.staff.findUnique({ where: { email: ownerEmail } });
      break;
    case 'agent':
      user = await prisma.agent.findUnique({ where: { email: ownerEmail } });
      break;
    case 'customer':
      user = await prisma.customer.findUnique({ where: { email: ownerEmail } });
      break;
  }

  if (!user) {
    throw new Error(`No ${ownerType} found with email ${ownerEmail}`);
  }
  
  const existingKey = await prisma.apiKey.findFirst({
      where: { [`${ownerType}Id`]: user.id }
  });

  if (existingKey) {
      
      return { key: existingKey.key, user };
  }

  const apiKey = await prisma.apiKey.create({
    data: {
      key: getRandomString(API_KEY_LENGTH),
      description: `Script-generated key for ${ownerType}`,
      [ownerType]: { 
        connect: {
          id: user.id,
        },
      },
    },
  });

  return { key: apiKey.key, user };
}

createApiKey()
  .then(({ key, user }) => {
    console.log('\n API Key created/found successfully!');
    console.log('--------------------------');
    console.log(`Owner Email: ${user.email}`);
    console.log(`API Key: ${key}`);
    console.log('--------------------------');
    process.exit(0);
  })
  .catch((e) => {
    console.error(`Error: ${e.message}`);
    process.exit(1);
  })
  .finally(async () => {
    const prisma = new PrismaClient();
    await prisma.$disconnect();
  });