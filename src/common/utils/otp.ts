
export function generateOtp(maxLength = 6) {
    const otp = Math.floor(Math.random() * 10 ** maxLength);
    return otp.toString().padStart(maxLength, '0');
}