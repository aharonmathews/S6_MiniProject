import CryptoJS from 'crypto-js';

const encryptData = (dataObj) => {
  const stringified = JSON.stringify(dataObj);
  const hash = CryptoJS.SHA256(stringified).toString(CryptoJS.enc.Hex);
  const firstCipherText = CryptoJS.AES.encrypt(stringified, hash).toString();
  return { hash, firstCipherText };
};

export default encryptData;
