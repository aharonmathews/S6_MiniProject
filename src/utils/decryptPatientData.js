// utils/decryptPatientData.js

import CryptoJS from "crypto-js";
import sendToServerForSecondEncryption from "../server/sendToServerForSecondEncryption";

export const fetchAndDecryptPatientData = async (contract) => {
  const decryptedDataList = [];

  try {
    const totalReports = await contract.methods.totalMedicalReports().call();

    for (let i = 0; i < totalReports; i++) {
      try {
        const {
          hashOfOriginalDataString,
          secondTimeEncryptedString,
          sender,
          medReportId,
        } = await contract.methods.data(i).call();

        const firstCiphertext = sendToServerForSecondEncryption.decryptSecondCipherText(
          secondTimeEncryptedString,
          sender,
          medReportId
        );

        if (!firstCiphertext) {
          console.warn(`Skipping record ${i}: Missing first ciphertext`);
          continue;
        }

        const decryptedString = CryptoJS.AES.decrypt(
          firstCiphertext,
          hashOfOriginalDataString
        ).toString(CryptoJS.enc.Utf8);

        if (!decryptedString) {
          console.warn(`Skipping record ${i}: Failed to decrypt firstCiphertext`);
          continue;
        }

        const originalDataObject = JSON.parse(decryptedString);
        const rowData = {
          ...originalDataObject.patientBio,
          ...originalDataObject.patientMedicalData,
        };

        decryptedDataList.push(rowData);
      } catch (error) {
        console.error(`Error processing record ${i}:`, error);
      }
    }
  } catch (error) {
    console.error("Error fetching or decrypting data:", error);
  }

  return decryptedDataList;
};
