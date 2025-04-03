import { Button, Card, InputAdornment, TextField, Grid, Typography } from '@material-ui/core'
import { KeyboardDatePicker } from '@material-ui/pickers'
import NavigateNextIcon from '@material-ui/icons/NavigateNext';
import PersonIcon from '@material-ui/icons/Person';
import PhoneIcon from '@material-ui/icons/Phone';
import HomeIcon from '@material-ui/icons/Home';
import EventIcon from '@material-ui/icons/Event';
import FingerprintIcon from '@material-ui/icons/Fingerprint';
import React from 'react'

export default function AddData(props) {
  const {
    patientBio,
    setPatientBio,
    next,
  } = props

  const handleChange = (e) => {
    if (
      patientBio.name === '' ||
      patientBio.phoneNumber === '' ||
      patientBio._address === ''
    ) {
      alert('All fields are required')
      return
    }
    next()
  }

  const as = (e) => {
    if(e && e._d)
      setPatientBio({ ...patientBio, birthDate: e._d.toDateString() })
  }

  return (
    <div className="cardContainer fadeIn">
      <Card className="card" elevation={0}>
        <h2 className="h2">Patient Information</h2>
        <Typography variant="body2" style={{marginBottom: '1.5rem', color: '#757575'}}>
          Enter the patient's personal details before proceeding to medical information.
        </Typography>
        
        <form className="form" noValidate autoComplete="off">
          <TextField
            id="outlined-basic"
            label="Patient ID"
            variant="outlined"
            value={patientBio.id}
            placeholder="Enter patient ID"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FingerprintIcon style={{color: '#3f51b5'}} />
                </InputAdornment>
              ),
            }}
            onChange={(e) =>
              setPatientBio({ ...patientBio, id: e.target.value })
            }
          />
          
          <TextField
            id="outlined-basic"
            label="Full Name"
            variant="outlined"
            value={patientBio.name}
            placeholder="Enter patient's full name"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon style={{color: '#3f51b5'}} />
                </InputAdornment>
              ),
            }}
            onChange={(e) =>
              setPatientBio({ ...patientBio, name: e.target.value })
            }
          />
          
          <KeyboardDatePicker
            margin="normal"
            id="date-picker-dialog"
            label="Date of Birth"
            format="DD/MM/yyyy"
            value={patientBio.birthDate}
            inputVariant="outlined"
            placeholder="DD/MM/YYYY"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EventIcon style={{color: '#3f51b5'}} />
                </InputAdornment>
              ),
            }}
            onChange={(e) => as(e)}
            KeyboardButtonProps={{
              'aria-label': 'change date',
            }}
          />
          
          <TextField
            id="outlined-basic"
            label="Phone Number"
            variant="outlined"
            value={patientBio.phoneNumber}
            placeholder="Enter phone number"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneIcon style={{color: '#3f51b5'}} />
                  +91
                </InputAdornment>
              ),
            }}
            onChange={(e) =>
              setPatientBio({ ...patientBio, phoneNumber: e.target.value })
            }
          />
          
          <TextField
            id="outlined-basic"
            label="Address"
            variant="outlined"
            value={patientBio._address}
            placeholder="Enter complete address"
            multiline
            rows={2}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <HomeIcon style={{color: '#3f51b5'}} />
                </InputAdornment>
              ),
            }}
            onChange={(e) =>
              setPatientBio({ ...patientBio, _address: e.target.value })
            }
          />
          
          <Button 
            className="btn" 
            onClick={(e) => handleChange()}
            endIcon={<NavigateNextIcon />}
          >
            Continue to Medical Data
          </Button>
        </form>
      </Card>
    </div>
  )
}