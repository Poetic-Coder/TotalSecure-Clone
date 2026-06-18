import { hideBin } from 'yargs/helpers';
import yargs from 'yargs';
import * as bcrypt from 'bcrypt';

async function hash(data: string) {
  const generatedSalt = await bcrypt.genSalt(10);
  return bcrypt.hash(data, generatedSalt);
}

const args = yargs(hideBin(process.argv))
  .option('key', {
    alias: 'k',
    type: 'string',
    description: 'Key to encrypt',
    demandOption: true,
  })
  .parseSync();

const key = args.key;

async function encryptKey() {
  const hashedKey = await hash(key);
  console.log(`Encrypted Key: ${hashedKey}`);
}

encryptKey()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
