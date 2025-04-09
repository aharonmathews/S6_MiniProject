import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import Web3 from "web3";
import CryptoJS from "crypto-js";
import sendToServerForSecondEncryption from "../server/sendToServerForSecondEncryption";
import './ShowData.css'


const ShowData = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      const web3 = new Web3(Web3.givenProvider);
      const accounts = await web3.eth.requestAccounts();
      const account = accounts[0];
    
      const db = getFirestore();
      const querySnapshot = await getDocs(collection(db, "patientRecords"));
    
      const userRecords = [];
    
      for (let doc of querySnapshot.docs) {
        const data = doc.data();
        if (data.account !== account) continue;
    
        const { cid, medReportId, hash } = data;
    
        try {
          const ipfsResp = await fetch(`http://127.0.0.1:8080/ipfs/${cid}`);
          const secondCipherText = await ipfsResp.text();
    
          const firstCipherText = sendToServerForSecondEncryption.decryptSecondCipherText(
            secondCipherText,
            account,
            medReportId
          );
    
          const decrypted = CryptoJS.AES.decrypt(firstCipherText, hash).toString(CryptoJS.enc.Utf8);
          const obj = JSON.parse(decrypted);
    
          userRecords.push({ ...obj.patientBio, ...obj.patientMedicalData });
        } catch (err) {
          console.error(`❌ Failed to decrypt record ${medReportId}:`, err.message);
        }
      }
    
      setRecords(userRecords);
    };
    

    fetchRecords();
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
            {records.length === 0 ? (
              <tr>
                <td colSpan="10" className="no-data">No records found</td>
              </tr>
            ) : (
              records.map((patient, index) => (
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
