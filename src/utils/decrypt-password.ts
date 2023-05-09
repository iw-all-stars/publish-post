import * as CryptoJS from 'crypto-js';

const secretKey = process.env.PASSWORD_ENCRYPTION_KEY;

export function encrypt(password: string) {
    return CryptoJS.AES.encrypt(password, secretKey).toString();
}

export function decrypt(hash: string) {
    return CryptoJS.AES.decrypt(hash, secretKey).toString(CryptoJS.enc.Utf8);
}