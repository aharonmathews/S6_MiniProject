import { useEffect, useState } from "react";
import Web3 from "web3";
import CryptoJS from "crypto-js";
import sendToServerForSecondEncryption from "../server/sendToServerForSecondEncryption";
import { SAVE_DATA_LIST_ADDRESS, SAVE_DATA_LIST_ABI } from "../contracts/SaveData";
import "./ShowData.css"; // Import the new CSS file

function ShowData() {
  const [patientBioMedList, setPatientBioMedList] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const web3 = new Web3(Web3.givenProvider || "http://localhost:8545");
      const saveDataContract = new web3.eth.Contract(SAVE_DATA_LIST_ABI, SAVE_DATA_LIST_ADDRESS);

      let patientBioMedList = [];
      const totalMedicalReports = await saveDataContract.methods.totalMedicalReports().call();

      for (let i = 0; i < totalMedicalReports; ++i) {
        const {
          hashOfOriginalDataString,
          secondTimeEncryptedString,
          sender,
          medReportId,
        } = await saveDataContract.methods.data(i).call();

        let firstCiphertext = sendToServerForSecondEncryption.decryptSecondCipherText(
          secondTimeEncryptedString,
          sender,
          medReportId
        );

        let originalDataObject = JSON.parse(
          CryptoJS.AES.decrypt(firstCiphertext, hashOfOriginalDataString).toString(CryptoJS.enc.Utf8)
        );

        let rowData = { ...originalDataObject.patientBio, ...originalDataObject.patientMedicalData };
        patientBioMedList.push(rowData);
      }

      setPatientBioMedList(patientBioMedList);
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
