export const SMALL_LETTERS = "abcdefghijklmnopqrstuvwxyz"
export const BIG_LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
export const NUMBERS = "0123456789"


export function getRandomString(length: number, chars? : string) {
    let result = '';
    const characters = chars ? chars : SMALL_LETTERS + BIG_LETTERS + NUMBERS;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export function randomEmail(prefix = '') {
    if (prefix) {
        prefix += '.'
    }
    return `${prefix}${getRandomString(10)}@dummy.com`;
}

export function generateRandomNumber(length: number) {
    return getRandomString(length, NUMBERS);
}


export function formatNaira(amount: number): string {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(amount);
  }