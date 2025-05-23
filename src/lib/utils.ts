import CryptoJS from 'crypto-js';

export const encryptPassword = (password: string, key: string): string => {
  return CryptoJS.AES.encrypt(password, key).toString();
};

export const decryptPassword = (encryptedPassword: string, key: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedPassword, key);
  return bytes.toString(CryptoJS.enc.Utf8);
};

export const generatePassword = (length = 16): string => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export const getWebsiteIcon = (website: string): string => {
  try {
    const url = new URL(website);
    return `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
  } catch {
    return `https://www.google.com/s2/favicons?domain=${website}&sz=128`;
  }
};