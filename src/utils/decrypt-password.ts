import * as CryptoJS from 'crypto-js';

const secretKey = 'secretKey';

function encrypt(password: string) {
    return CryptoJS.AES.encrypt(password, secretKey).toString();
}

export function decrypt(hash: string) {
    return CryptoJS.AES.decrypt(hash, secretKey).toString(CryptoJS.enc.Utf8);
}