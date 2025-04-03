import { Container } from '@material-ui/core'
import { useEffect, useState } from 'react'
import Web3 from 'web3'
import style from './App.module.css'
import {
  PATIENT_DATA_LIST_ADDRESS,
  PATIENT_DATA_LIST_ABI,
} from './contracts/PatientData'
import {
  SAVE_DATA_LIST_ADDRESS,
  SAVE_DATA_LIST_ABI
} from './contracts/SaveData'
import Add from './routes/Add'
import AddData from './routes/AddData'
import AddMedicalData from './routes/AddMedicalData'
import ShowData from './routes/ShowData'
import CryptoJS from 'crypto-js'
import sendToServerForSecondEncryption from './server/sendToServerForSecondEncryption'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./routes/login";
import Register from "./routes/register";
import Block from "./block";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/block" element={<Block />} />
      </Routes>
    </Router>
  );
};

export default App
