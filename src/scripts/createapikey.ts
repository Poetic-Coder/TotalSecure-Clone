import { PrismaClient } from '@prisma/client';
import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import { addDays } from 'date-fns';
import { randomBytes } from 'crypto';

const argv = yargs(hideBin(process.argv))
  .option('staff', { type: 'string', description: 'Email of Staff member' })
  .option('guard', { type: 'string', description: 'Email of Guard' })
  .option('client', { type: 'string', description: 'Email of Client' })
  .option('description', { type: 'string', default: 'Script-generated key' })
  .option('expires', { type: 'number', description: 'Days until expiry' })
  .option('rate-limit', { type: 'number', default: 1000, description: 'Max requests per hour' })
  .option('force', { type: 'boolean', default: false, description: 'Rotate if key exists' })
  .check((argv) => {
    const count = [argv.staff, argv.guard, argv.client].filter(Boolean).length;
    if (count !== 1) throw new Error('Specify exactly one: --staff, --guard, or --client');
    return true;
  })
  .parseSync();

async function main() {
  const prisma = new PrismaClient();

  let ownerType: 'staff' | 'guard' | 'client';
  let email: string;
  if (argv.staff) { ownerType = 'staff'; email = argv.staff; }
  else if (argv.guard) { ownerType = 'guard'; email = argv.guard; }
  else { ownerType = 'client'; email = argv.client; }

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
  }

  if (!user) throw new Error(`No ${ownerType} found with email ${email}`);

  const existing = await prisma.apiKey.findFirst({
    where: { [`${ownerType}Id`]: user.id, active: true },
  });

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
      [ownerType]: { connect: { id: user.id } },
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