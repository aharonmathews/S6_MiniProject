import { useEffect, useState } from 'react'
import './routes/block.css'
import {
  PATIENT_DATA_LIST_ADDRESS,
  PATIENT_DATA_LIST_ABI,
} from './contracts/PatientData'
import {
  SAVE_DATA_LIST_ADDRESS,
  SAVE_DATA_LIST_ABI
} from './contracts/SaveData'
import Add from './routes/Add'
import CryptoJS from 'crypto-js'
import sendToServerForSecondEncryption from './server/sendToServerForSecondEncryption'
import { useNavigate } from 'react-router-dom';
import { Container, Button, Typography, Grid, Paper } from '@material-ui/core';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Web3 from 'web3';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { collection, getDocs } from 'firebase/firestore';

function Block() {
  const [web3, setweb3] = useState()
  const [account, setAccount] = useState('')
  const [saveDataContract, setSaveDataContract] = useState([])
  const [patientBioMedList, setPatientBioMedList] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();
  const auth = getAuth();
  const [patientBio, setPatientBio] = useState({
    id: '',
    name: '',
    birthDate: '01 jan 1970',
    phoneNumber: '',
    _address: '',
  })
  const [patientMedicalData, setPatientMedicalData] = useState({
    medReportId: 'MEDREP' + Math.ceil(Math.random() * 1000000000),
    weight: '',
    height: '',
    bloodGroup: 'B+',
    diseaseName: '',
    diseaseDescription: 'caused by long exposure to harmful artificial blue light',
    diseaseStartedOn: '1 apr 2016',
  })

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/');
      }
    });
  }, [auth, navigate]);

  useEffect(() => {
    const initializeBlockchain = async () => {
      try {
        setLoading(true);
        const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545')
        const accounts = await web3.eth.requestAccounts()
        setAccount(accounts[0])

        const saveDataContractCopy = new web3.eth.Contract(
          SAVE_DATA_LIST_ABI,
          SAVE_DATA_LIST_ADDRESS,
        )

        setSaveDataContract(saveDataContractCopy)
        await decryptEncryptedList()
      } catch (error) {
        console.error("Blockchain initialization error:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeBlockchain();
  }, []);

  const decryptEncryptedList = async () => {
    try {
      const snapshot = await getDocs(collection(db, "patientRecords"));
      let list = [];

      snapshot.forEach((docSnap) => {
        const record = docSnap.data();
        if (record.account === account) {
          fetch(`http://127.0.0.1:8080/ipfs/${record.cid}`)
            .then((res) => res.text())
            .then((secondCipherText) => {
              
              const hash = record.hash;


              if (!hash) {
                console.warn(`⚠️ Missing hash for ${account + record.medReportId}`);
                return;
              }

              let firstCiphertext = '';
              try {
                firstCiphertext = sendToServerForSecondEncryption.decryptSecondCipherText(
                  secondCipherText,
                  account,
                  record.medReportId
                );
              } catch (err) {
                console.error("❌ Decrypt secondCipherText error:", err.message);
                return;
              }

              let decrypted = '';
              try {
                decrypted = CryptoJS.AES.decrypt(firstCiphertext, hash).toString(CryptoJS.enc.Utf8);
                if (!decrypted) throw new Error("Decryption returned empty string.");
              } catch (err) {
                console.error("❌ AES decryption error:", err.message);
                return;
              }

              let originalDataObject = null;
              try {
                originalDataObject = JSON.parse(decrypted);
              } catch (err) {
                console.error("❌ JSON parse error:", err.message);
                return;
              }

              list.push({
                ...originalDataObject.patientBio,
                ...originalDataObject.patientMedicalData
              });
              setPatientBioMedList([...list]);

            })
            .catch((err) => console.error("IPFS fetch error:", err));
        }
      });
      setPatientBioMedList(list);
    } catch (err) {
      console.error("Error loading IPFS data:", err);
    }
  }

  const addUpdatePatientMedicalData = () => {
    if (
      !patientBio.name ||
      !patientBio.phoneNumber ||
      !patientBio._address ||
      !patientMedicalData.weight ||
      !patientMedicalData.height ||
      !patientMedicalData.bloodGroup ||
      !patientMedicalData.diseaseName
    ) {
      alert("All fields are required. Please complete the form.");
      return;
    }
  
    setLoading(true);
  
    let JSONStringData = JSON.stringify({ patientBio, patientMedicalData });
    let hash = CryptoJS.SHA256(JSONStringData).toString(CryptoJS.enc.Hex);
    localStorage.setItem(account + patientMedicalData.medReportId, hash);
    let firstCiphertext = CryptoJS.AES.encrypt(JSONStringData, hash).toString();
    let secondCiphertext = sendToServerForSecondEncryption.encryptFirstCipherText(
      firstCiphertext,
      account,
      patientMedicalData.medReportId
    );
  
    const uploadToIPFS = async (data) => {
      const formData = new FormData();
      formData.append("file", new Blob([data], { type: "text/plain" }));
    
      const response = await fetch("http://localhost:4000/upload", {
        method: "POST",
        body: formData,
        headers: {
          "Connection": "keep-alive"
        }
      });
    
      const { cid } = await response.json();
      return cid;
    };
    
  
    (async () => {
      try {
        const cid = await uploadToIPFS(secondCiphertext);
        if (!cid) {
          throw new Error("IPFS upload failed, no CID returned");
        }
        const { getFirestore, doc, setDoc } = await import("firebase/firestore");
        const db = getFirestore();
  
        // 👇 Use a custom document ID
        await setDoc(doc(db, "patientRecords", `${account}_${patientMedicalData.medReportId}`), {
          account,
          cid,
          medReportId: patientMedicalData.medReportId,
          hash, // 👈 Add the hash for decryption
        });
        
  
        console.log("✅ Uploaded to IPFS and saved to Firestore");
      } catch (err) {
        console.error("🔥 Error uploading to IPFS or saving to Firestore:", err);
        alert("Upload to IPFS/Firestore failed!");
      }
    })();
  
    // 👇 Blockchain call (unchanged)
    saveDataContract.methods
      .saveData(secondCiphertext, hash, patientMedicalData.medReportId)
      .send({ from: account })
      .once("receipt", (receipt) => {
        console.log("saved", receipt);
        setPatientMedicalData({
          ...patientMedicalData,
          medReportId: "MEDREP" + Math.ceil(Math.random() * 1000000000),
        });
        decryptEncryptedList(saveDataContract);
        setLoading(false);
        alert("Medical record saved successfully!");
      })
      .on("error", (error) => {
        console.error("Transaction error:", error);
        setLoading(false);
        alert("Transaction failed. Please try again.");
      });
  };
  
  

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <Container className="container fadeIn">
      <div className="dashboard-header">
        <div>
          <Typography variant="h4" className="dashboard-title">Healthcare Blockchain</Typography>
          <Typography variant="body2" className="dashboard-subtitle">Secure patient records management system</Typography>
        </div>
        <div className="dashboard-actions">
          <Button onClick={() => navigate('/patient-data')} variant="contained" color="primary" startIcon={<VisibilityIcon />} style={{ borderRadius: '20px' }}>View Records</Button>
          <Button onClick={handleLogout} color="secondary" variant="contained" startIcon={<ExitToAppIcon />} style={{ borderRadius: '20px' }}>Logout</Button>
        </div>
      </div>

      <Paper style={{ padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', backgroundColor: 'rgba(63, 81, 181, 0.05)' }}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item><AccountBalanceWalletIcon style={{ color: '#3f51b5' }} /></Grid>
          <Grid item xs>
            <Typography variant="body2" style={{ fontWeight: 500, color: '#3f51b5' }}>Connected wallet</Typography>
            <Typography variant="body2" style={{ fontSize: '0.9rem', wordBreak: 'break-all' }}>{account}</Typography>
          </Grid>
        </Grid>
      </Paper>

      <Add
        patientBio={patientBio}
        setPatientBio={setPatientBio}
        patientMedicalData={patientMedicalData}
        setPatientMedicalData={setPatientMedicalData}
        addUpdatePatientMedicalData={addUpdatePatientMedicalData}
        loading={loading}
      />

      {patientBioMedList.length > 0 && (
        <div className="fadeIn" style={{ marginTop: '2rem' }}>
          <Typography variant="h6" style={{ marginBottom: '1rem', color: '#3f51b5' }}>Recent Medical Records</Typography>
          <div style={{ overflowX: 'auto' }}>
            <table className="records-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Medical ID</th>
                  <th>Disease</th>
                  <th>Blood Group</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patientBioMedList.slice(0, 3).map((record, index) => (
                  <tr key={index}>
                    <td>{record.name}</td>
                    <td><span className="medical-id">{record.medReportId}</span></td>
                    <td>{record.diseaseName}</td>
                    <td>{record.bloodGroup}</td>
                    <td>
                      <Button onClick={() => navigate('/patient-data')} className="view-btn" size="small" startIcon={<VisibilityIcon style={{ fontSize: '1rem' }} />}>View</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Container>
  )
}

export default Block