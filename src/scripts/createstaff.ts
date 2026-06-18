import { PrismaClient, StaffDepartment } from '@prisma/client';
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

async function createStaff() {
  const prisma = new PrismaClient();

  const staff = await prisma.staff.create({
    data: {
      email,
      password: await hash(password),
      employeeId: `SA-ADMIN-${Math.floor(100 + Math.random() * 900)}`, 
      department: StaffDepartment.MANAGEMENT,
      position: 'Administrator',
      emailVerified: true,
    },
  });

  return staff;
}

createStaff()
  .then((staff) => {
    console.log('\n Staff created successfully!');
    console.log('--------------------------');
    console.log(`ID: ${staff.id}`);
    console.log(`Email: ${staff.email}`);
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