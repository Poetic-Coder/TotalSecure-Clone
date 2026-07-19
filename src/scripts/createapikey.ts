import { PrismaClient } from '@prisma/client';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import { addDays } from 'date-fns';
import { randomBytes } from 'crypto';

const argv = yargs(hideBin(process.argv))
  .option('staff', { type: 'string', description: 'Email of Staff member' })
  .option('guard', { type: 'string', description: 'Email of Guard' })
  .option('client', { type: 'string', description: 'Email of Client' })
  .option('clientstaff', { type: 'string', description: 'Email of Client Staff member' })
  .option('description', { type: 'string', default: 'Script-generated key' })
  .option('expires', { type: 'number', description: 'Days until expiry' })
  .option('rate-limit', { type: 'number', default: 1000, description: 'Max requests per hour' })
  .option('force', { type: 'boolean', default: false, description: 'Rotate if key exists' })
  .check((argv) => {
    const count = [argv.staff, argv.guard, argv.client, argv.clientstaff].filter(Boolean).length;
    if (count !== 1) throw new Error('Specify exactly one: --staff, --guard, --client, or --clientstaff');
    return true;
  })
  .parseSync();

async function main() {
  const prisma = new PrismaClient();

  let ownerType: 'staff' | 'guard' | 'client' | 'clientstaff';
  let email: string;
  if (argv.staff) { ownerType = 'staff'; email = argv.staff; }
  else if (argv.guard) { ownerType = 'guard'; email = argv.guard; }
  else if (argv.client) { ownerType = 'client'; email = argv.client; }
  else { ownerType = 'clientstaff'; email = argv.clientstaff; }

  let user: any;
  switch (ownerType) {
    case 'staff':
      user = await prisma.staff.findUnique({ where: { email } });
      break;
    case 'guard':
      user = await prisma.guard.findUnique({ where: { email } });
      break;
    case 'client':
      user = await prisma.client.findUnique({ where: { email } });
      break;
    case 'clientstaff':
      user = await prisma.clientStaff.findUnique({ where: { email }})
  }

  if (!user) throw new Error(`No ${ownerType} found with email ${email}`);

  // Determine how to scope the API key
  let whereClause: any;
  let connectClause: any;

  if (ownerType === 'staff') {
    whereClause = { staffId: user.id, active: true };
    connectClause = { staff: { connect: { id: user.id } } };
  } else if (ownerType === 'guard') {
    whereClause = { guardId: user.id, active: true };
    connectClause = { guard: { connect: { id: user.id } } };
  } else if (ownerType === 'client') {
    whereClause = { clientId: user.id, active: true };
    connectClause = { client: { connect: { id: user.id } } };
  } else {
    whereClause = { clientId: user.clientId, active: true };
    connectClause = { client: { connect: { id: user.clientId } } };
  }

  const existing = await prisma.apiKey.findFirst({ where: whereClause });

  if (existing && !argv.force) {
    console.log(`Key already exists for ${email}. Use --force to rotate.`);
    console.log(`Existing key: ${existing.key}`);
    process.exit(0);
  }

  if (existing && argv.force) {
    await prisma.apiKey.update({ where: { id: existing.id }, data: { active: false } });
  }

  const plainKey = `tsnl_${randomBytes(32).toString('hex')}`;
  await prisma.apiKey.create({
    data: {
      key: plainKey,
      description: argv.description,
      rateLimit: argv.rateLimit,
      expiresAt: argv.expires ? addDays(new Date(), argv.expires) : null,
      resetAt: new Date(),
      requestCount: 0,
      ...connectClause,
    },
  });

  console.log('\n API Key created successfully!');
  console.log('--------------------------');
  console.log(`Owner: ${ownerType} (${email})`);
  console.log(`API Key: ${plainKey}`);
  if (argv.expires) console.log(`Expires in: ${argv.expires} days`);
  console.log(`Rate limit: ${argv.rateLimit} req/hour`);
  console.log('--------------------------');
}

main().catch(console.error).finally(async () => {
  await new PrismaClient().$disconnect();
});