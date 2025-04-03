import React from 'react';
import {
  Card,
  TextField,
  InputAdornment,
  Button,
  Typography,
} from '@material-ui/core';
import { KeyboardDatePicker } from '@material-ui/pickers';
import HealingIcon from '@material-ui/icons/Healing';
import LocalHospitalIcon from '@material-ui/icons/LocalHospital';
import AccessibilityIcon from '@material-ui/icons/Accessibility';
import HeightIcon from '@material-ui/icons/Height';
import EventIcon from '@material-ui/icons/Event';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SaveIcon from '@material-ui/icons/Save';

export default function AddMedicalData({
  patientMedicalData,
  setPatientMedicalData,
  addUpdatePatientMedicalData,
  handleBack,
}) {
  const handleSave = () => {
    if (
      !patientMedicalData.weight ||
      !patientMedicalData.height ||
      !patientMedicalData.bloodGroup ||
      !patientMedicalData.diseaseName ||
      !patientMedicalData.diseaseDescription ||
      !patientMedicalData.diseaseStartedOn
    ) {
      alert('All fields are required');
      return;
    }
    if (window.confirm('Are you sure you want to save this data?')) {
      addUpdatePatientMedicalData();
    }
  };

  return (
    <div className="cardContainer fadeIn">
      <Card className="card" elevation={0}>
        <h2 className="h2">Patient Medical Data</h2>
        <Typography variant="body2" style={{ marginBottom: '1.5rem', color: '#757575' }}>
          Provide the patient's medical details accurately.
        </Typography>
        
        <form className="form" noValidate autoComplete="off">
          <TextField
            label="Medical Report ID"
            variant="outlined"
            value={patientMedicalData.medReportId || ''}
            onChange={(e) => setPatientMedicalData({ ...patientMedicalData, medReportId: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LocalHospitalIcon style={{ color: '#3f51b5' }} />
                </InputAdornment>
              ),
            }}
          />
          
          <div className="textFieldGroup">
            <TextField
              label="Weight"
              variant="outlined"
              value={patientMedicalData.weight || ''}
              InputProps={{
                endAdornment: <InputAdornment position="end">KG</InputAdornment>,
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessibilityIcon style={{ color: '#3f51b5' }} />
                  </InputAdornment>
                ),
              }}
              onChange={(e) => setPatientMedicalData({ ...patientMedicalData, weight: e.target.value })}
            />
            <TextField
              label="Height"
              variant="outlined"
              value={patientMedicalData.height || ''}
              InputProps={{
                endAdornment: <InputAdornment position="end">cm</InputAdornment>,
                startAdornment: (
                  <InputAdornment position="start">
                    <HeightIcon style={{ color: '#3f51b5' }} />
                  </InputAdornment>
                ),
              }}
              onChange={(e) => setPatientMedicalData({ ...patientMedicalData, height: e.target.value })}
            />
          </div>
          
          <TextField
            label="Blood Group"
            variant="outlined"
            value={patientMedicalData.bloodGroup || ''}
            onChange={(e) => setPatientMedicalData({ ...patientMedicalData, bloodGroup: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HealingIcon style={{ color: '#3f51b5' }} />
                </InputAdornment>
              ),
            }}
          />
          
          <TextField
            label="Disease Name"
            variant="outlined"
            value={patientMedicalData.diseaseName || ''}
            onChange={(e) => setPatientMedicalData({ ...patientMedicalData, diseaseName: e.target.value })}
          />
          
          <TextField
            label="Disease Description"
            variant="outlined"
            multiline
            rows={3}
            value={patientMedicalData.diseaseDescription || ''}
            onChange={(e) => setPatientMedicalData({ ...patientMedicalData, diseaseDescription: e.target.value })}
          />
          
          <KeyboardDatePicker
            margin="normal"
            label="Disease Started On"
            format="DD/MM/yyyy"
            value={patientMedicalData.diseaseStartedOn || null}
            inputVariant="outlined"
            placeholder="DD/MM/YYYY"
            onChange={(date) => setPatientMedicalData({ ...patientMedicalData, diseaseStartedOn: date?._d?.toDateString() || '' })}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EventIcon style={{ color: '#3f51b5' }} />
                </InputAdornment>
              ),
            }}
          />
          
          <div className="buttonGroup">
            <Button className="btn" onClick={handleBack} startIcon={<ArrowBackIcon />}>
              Back
            </Button>
            <Button className="btn" onClick={handleSave} startIcon={<SaveIcon />}>
              Save Medical Data
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}