export const validatePassword = (password: string) => {
    // 1. Must be at least 8 characters long
    // 2. Must contain at least one uppercase letter
    // 3. Must contain at least one lowercase letter
    // 4. Must contain at least one number
    // 5. Must contain at least one special character
    // 6. Must not contain any spaces
    if (password.length < 8) {
        return false;
    }

    if (!password.match(/[A-Z]/)) {
        return false;
    }

    if (!password.match(/[a-z]/)) {
        return false;
    }

    if (!password.match(/[0-9]/)) {
        return false;
    }

    if (!password.match(/[^a-zA-Z0-9]/)) {
        return false;
    }

    if (password.match(/\s/)) {
        return false;
    }

    return true;
}