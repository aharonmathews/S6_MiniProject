import { useEffect, useState } from "react";
import Web3 from "web3";
import CryptoJS from "crypto-js";
import sendToServerForSecondEncryption from "../server/sendToServerForSecondEncryption";
import { SAVE_DATA_LIST_ADDRESS, SAVE_DATA_LIST_ABI } from "../contracts/SaveData";
import "./ShowData.css";

function ShowData() {
  const [patientBioMedList, setPatientBioMedList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
        const saveDataContract = new web3.eth.Contract(SAVE_DATA_LIST_ABI, SAVE_DATA_LIST_ADDRESS);

        const totalMedicalReports = await saveDataContract.methods.totalMedicalReports().call();
        console.log("Total reports:", totalMedicalReports);

        const dataList = [];

        for (let i = 0; i < totalMedicalReports; i++) {
          try {
            const {
              hashOfOriginalDataString,
              secondTimeEncryptedString,
              sender,
              medReportId,
            } = await saveDataContract.methods.data(i).call();

            // Step 1: Decrypt the second ciphertext to get the first ciphertext
            const firstCiphertext = sendToServerForSecondEncryption.decryptSecondCipherText(
              secondTimeEncryptedString,
              sender,
              medReportId
            );

            if (!firstCiphertext) {
              console.warn(`Skipping record ${i}: firstCiphertext is empty.`);
              continue;
            }

            // Step 2: Decrypt the first ciphertext using the hash
            const decrypted = CryptoJS.AES.decrypt(firstCiphertext, hashOfOriginalDataString).toString(CryptoJS.enc.Utf8);

            if (!decrypted) {
              console.warn(`Skipping record ${i}: failed to decrypt firstCiphertext.`);
              continue;
            }

            // Step 3: Parse decrypted JSON
            let originalDataObject;
            try {
              originalDataObject = JSON.parse(decrypted);
            } catch (err) {
              console.error(`JSON parse error at record ${i}:`, err);
              continue;
            }

            const rowData = {
              ...originalDataObject.patientBio,
              ...originalDataObject.patientMedicalData,
            };

            dataList.push(rowData);
          } catch (err) {
            console.error(`Error processing record ${i}:`, err);
          }
        }

        setPatientBioMedList(dataList);
      } catch (err) {
        console.error("General fetch error:", err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="show-data-container">
      <h2 className="table-title">All Patient Records</h2>
      <div className="table-wrapper">
        <table className="styled-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Birth Date</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Weight</th>
              <th>Height</th>
              <th>Blood Group</th>
              <th>Disease</th>
              <th>Description</th>
              <th>Started On</th>
            </tr>
          </thead>
          <tbody>
            {patientBioMedList.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">No records found</td>
              </tr>
            ) : (
              patientBioMedList.map((patient, index) => (
                <tr key={index}>
                  <td>{patient.name}</td>
                  <td>{patient.birthDate}</td>
                  <td>{patient.phoneNumber}</td>
                  <td>{patient._address}</td>
                  <td>{patient.weight}</td>
                  <td>{patient.height}</td>
                  <td>{patient.bloodGroup}</td>
                  <td>{patient.diseaseName}</td>
                  <td>{patient.diseaseDescription}</td>
                  <td>{patient.diseaseStartedOn}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ShowData;
