import { minutesToMilliseconds } from 'date-fns';

export const MAX_UPLOAD = 5;

// 5 mb
export const MAX_UPLOAD_SIZE = 5;

export const PAGINATION = 10;

export const OTP_EXPIRY = minutesToMilliseconds(30);

export const UPLOAD_DIR = './uploads/photos/';

// API KEY LENGTH
export const API_KEY_LENGTH = 32;

export const ACCOUNT_TIERS_REF = {
  one: '0x00',
  two: '0x01',
  three: '0x02',
  four: '0x03',
};

export const ACCOUNT_TIERS_MAP = {
  1: ACCOUNT_TIERS_REF.one,
  2: ACCOUNT_TIERS_REF.two,
  3: ACCOUNT_TIERS_REF.three,
  4: ACCOUNT_TIERS_REF.four,
};

export const X_API_USER = 'x-api-user';
export const API_HEADER_KEY = 'x-api-key';
export const WORKSPACE_PREFIX = 'workspace';

export const WORKSPACE_ACCOUNT_NUMBER_LIFETIME = minutesToMilliseconds(0.25); // The time a temporary account is valid for a workspace
export const WORKSPACE_ACCOUNT_CACHE_LIFETIME = minutesToMilliseconds(30);
export const WORKSPACE_ACCOUNT_LIFETIME_KEY =
  'workspace_account_number_lifetime';

export const VERIFY_ME_WEBHOOK_URL = 'verifyme';
export const VERIFY_ME_WEBHOOK_HEADER = 'x-verifyme-signature';

export const APPZONE_WEBHOOK_URL = 'gaTh7nef-appzone';
export const APPZONE_SIGNATURE_HEADER = 'x-appzone-signature';
export const APPZONE_WEBHOOK_SIGNATURE = 'APPZONE_WEBHOOK_SIGNATURE';

export const COMONO_WEBHOOK_URL = 'Kei6aeca-comono-physical';
export const COMONO_DIGITAL_WEBHOOK_URL = 'comono';
export const COMONO_SIGNATURE_HEADER = 'x-comono-signature';
export const COMONO_WEBHOOK_SIGNATURE = 'COMONO_WEBHOOK_SIGNATURE';

export const WEBHOOK_RETRY_DELAY = minutesToMilliseconds(20);
export const WEBHOOK_RETRY_COUNT = 3;

export const MAX_TRANSACTION_RETRY = 5;
export const MAX_TSQ_REQUEST_RETRY = 5;
export const MAX_TSQ_RETRY = 5;
export const TSQ_RETRY_LOCAL_BANK_TRANSFER_DELAY = minutesToMilliseconds(1);
export const TSQ_RETRY_INTER_BANK_TRANSFER_DELAY = minutesToMilliseconds(5);

export const LOCALFUNDTRANSFER = 'LOCALFUNDTRANSFER';
export const INTERBANKTRANSFER = 'INTERBANKTRANSFER';

export const NIBSS_WEBHOOK_URL = 'ieR3tiw2UZ8i_nibss';

export const QR_CODE_EXPIRY = minutesToMilliseconds(0);
export const BUMP_CODE_EXPIRY = minutesToMilliseconds(5);

export const JWT_EXPIRES_IN = '7d';
export const JWT_ACCESS_EXPIRES_IN = '30m';
export const JWT_REFRESH_EXPIRES_IN_DAYS = 7;
export const JWT_MFA_EXPIRES_IN = '10m';

export const INTERSWITCH_CARD_UPDATE_URL = 'cardUpdate';
export const INTERSWITCH_CARD_UPDATE_SIGNATURE = 'x-interswitch-card-update-signature';

export const YOUVERIFY_URL = 'youverify-address-update';
export const YOUVERIFY_SIGNATURE = 'x-youverify-address-signature';
export const OKHI_URL = 'okhi-address-update';



export const DEFAULT_ROLE_NAME = {
  ADMIN: 'Admin',
  MANAGER: 'Manager'
}

export const OTHER_TRANSACTION_TYPE = {
  IMPRESS: "IMPRESS",
  BULK: "BULK"
}