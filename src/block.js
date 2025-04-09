import { useEffect, useState } from 'react'
import './routes/block.css' // Using our new CSS file
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
import { Container, Button, Typography, Grid, Paper, Chip } from '@material-ui/core';
import AccountBalanceWalletIcon from '@material-ui/icons/AccountBalanceWallet';
import PersonIcon from '@material-ui/icons/Person';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import VisibilityIcon from '@material-ui/icons/Visibility';
import Web3 from 'web3';
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";

function Block() {
  const [web3, setweb3] = useState()
  const [account, setAccount] = useState('')
  const [patientDataList, setPatientDataList] = useState([])
  const [patientDataContract, setPatientDataContract] = useState([])
  const [saveDataContract, setSaveDataContract] = useState([])
  const [patientBioMedList, setPatientBioMedList] = useState([])
  const [patientMedicalDataList, setPatientMedicalDataList] = useState([])
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
    diseaseDescription:
      'caused by long exposure to harmful artificial blue light',
    diseaseStartedOn: '1 apr 2016',
  })

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/'); // Redirect to login page if not authenticated
      }
    });
  }, [auth, navigate]);

  useEffect(() => {
    const initializeBlockchain = async () => {
      try {
        setLoading(true);
        const web3 = new Web3(Web3.givenProvider || 'http://localhost:8545')
        const network = await web3.eth.net.getNetworkType()
        const accounts = await web3.eth.requestAccounts()
        setAccount(accounts[0])
        
        const patientDataContractCopy = new web3.eth.Contract(
          PATIENT_DATA_LIST_ABI,
          PATIENT_DATA_LIST_ADDRESS,
        )
        const saveDataContractCopy = new web3.eth.Contract(
          SAVE_DATA_LIST_ABI,
          SAVE_DATA_LIST_ADDRESS,
        )
        
        setPatientDataContract(patientDataContractCopy)
        setSaveDataContract(saveDataContractCopy)
        await decryptEncryptedList(saveDataContractCopy)
      } catch (error) {
        console.error("Blockchain initialization error:", error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeBlockchain();
  }, []);

  const decryptEncryptedList = async (saveDataContract) => {
    try {
      let patientBioMedList = []

      const totalMedicalReports = await saveDataContract.methods.totalMedicalReports().call()
      for(let i = 0; i < totalMedicalReports; ++i) {
        const {
          hashOfOriginalDataString,
          secondTimeEncryptedString,
          sender,
          medReportId
        } = await saveDataContract.methods.data(i).call()
        let firstCiphertext = sendToServerForSecondEncryption
                .decryptSecondCipherText(secondTimeEncryptedString, sender, medReportId)
        let originalDataObject = JSON.parse(CryptoJS.AES.decrypt(firstCiphertext, hashOfOriginalDataString).toString(CryptoJS.enc.Utf8));
        let rowData = {...originalDataObject.patientBio, ...originalDataObject.patientMedicalData}
        patientBioMedList.push(rowData)
      }
      setPatientBioMedList(patientBioMedList)
    } catch (error) {
      console.error("Error decrypting data:", error);
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
      alert('All fields are required. Please complete the form.');
      return;
    }
    
    setLoading(true);
    
    let JSONStringData = JSON.stringify({patientBio, patientMedicalData})
    let hash = CryptoJS.SHA256(JSONStringData).toString(CryptoJS.enc.Hex)
    let firstCiphertext = CryptoJS.AES.encrypt(JSONStringData, hash).toString();
    let secondCiphertext = sendToServerForSecondEncryption.encryptFirstCipherText(firstCiphertext, account, patientMedicalData.medReportId)
    
    saveDataContract.methods
      .saveData(secondCiphertext, hash, patientMedicalData.medReportId).send({ from: account})
      .once('receipt', receipt => {
        console.log('saved', receipt)
        setPatientMedicalData({
          ...patientMedicalData, 
          medReportId: 'MEDREP' + Math.ceil(Math.random() * 1000000000)
        });
        decryptEncryptedList(saveDataContract);
        setLoading(false);
        alert('Medical record saved successfully!');
      })
      .on('error', (error) => {
        console.error("Transaction error:", error);
        setLoading(false);
        alert('Transaction failed. Please try again.');
      });
  }

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/'); // Redirect to login after logout
  };

  const renderWalletInfo = () => {
    return (
      <Paper className="fadeIn" style={{padding: '1rem', marginBottom: '1.5rem', borderRadius: '8px', backgroundColor: 'rgba(63, 81, 181, 0.05)'}}>
        <Grid container alignItems="center" spacing={2}>
          <Grid item>
            <AccountBalanceWalletIcon style={{color: '#3f51b5'}} />
          </Grid>
          <Grid item xs>
            <Typography variant="body2" style={{fontWeight: 500, color: '#3f51b5'}}>
              Connected wallet
            </Typography>
            <Typography variant="body2" style={{fontSize: '0.9rem', wordBreak: 'break-all'}}>
              {account}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    );
  };

  return (
    <Container className="container fadeIn">
      <div className="dashboard-header">
        <div>
          <Typography variant="h4" className="dashboard-title">Healthcare Blockchain</Typography>
          <Typography variant="body2" className="dashboard-subtitle">
            Secure patient records management system
          </Typography>
        </div>
        <div className="dashboard-actions">
          <Button 
            onClick={() => navigate('/patient-data')} 
            variant="contained" 
            color="primary"
            startIcon={<VisibilityIcon />}
            style={{borderRadius: '20px'}}
          >
            View Records
          </Button>
          <Button 
            onClick={handleLogout} 
            color="secondary" 
            variant="contained" 
            startIcon={<ExitToAppIcon />}
            style={{borderRadius: '20px'}}
          >
            Logout
          </Button>
        </div>
      </div>
      
      {renderWalletInfo()}
      
      <Add
        patientBio={patientBio}
        setPatientBio={(obj) => setPatientBio(obj)}
        patientMedicalData={patientMedicalData}
        setPatientMedicalData={(obj) => setPatientMedicalData(obj)}
        addUpdatePatientMedicalData={addUpdatePatientMedicalData}
        loading={loading}
      />
      
      {patientBioMedList.length > 0 && (
        <div className="fadeIn" style={{marginTop: '2rem'}}>
          <Typography variant="h6" style={{marginBottom: '1rem', color: '#3f51b5'}}>
            Recent Medical Records
          </Typography>
          <div style={{overflowX: 'auto'}}>
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
                    <td>
                      <span className="medical-id">{record.medReportId}</span>
                    </td>
                    <td>{record.diseaseName}</td>
                    <td>{record.bloodGroup}</td>
                    <td>
                      <Button onClick={() => navigate('/patient-data')}
                        className="view-btn"
                        size="small"
                        startIcon={<VisibilityIcon style={{fontSize: '1rem'}} />}
                      >
                        View
                      </Button>
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