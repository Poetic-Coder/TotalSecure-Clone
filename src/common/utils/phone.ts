

/**
 * Takes a phone is this format `+2348077678765` and returns `08077678765`
 * @param phone 
 */
export function cleanPhone(phone: string){
    return phone.replace('+234', '0');
}
