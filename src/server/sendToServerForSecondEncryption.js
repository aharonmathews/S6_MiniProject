import CryptoJS from 'crypto-js'

const sendToServerForSecondEncryption = {
    encryptFirstCipherText: (firstCipherText, sender, medicalReportId) => {
        let hash = CryptoJS.SHA256(firstCipherText).toString(CryptoJS.enc.Hex)
        let secondCipherText = CryptoJS.AES.encrypt(firstCipherText, hash).toString();
        localStorage.setItem(sender+medicalReportId, hash)
        return secondCipherText
    },
    decryptSecondCipherText: (secondCipherText, sender, medicalReportId) => {
        console.log("Decrypting second ciphertext:", secondCipherText, sender, medicalReportId);
        try {
            let hash = localStorage.getItem(sender + medicalReportId)
            let firstCipherText = CryptoJS.AES.decrypt(secondCipherText, hash).toString(CryptoJS.enc.Utf8);
            return firstCipherText
        } catch (e) {
          console.error("Second decryption failed:", e);
          return null;
        }
      }
      
}

export default sendToServerForSecondEncryption

