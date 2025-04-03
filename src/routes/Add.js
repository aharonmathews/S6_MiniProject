import React, { useRef, useEffect } from 'react'
import AddData from './AddData'
import AddMedicalData from './AddMedicalData'
import { Card, CircularProgress } from '@material-ui/core'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'

export default function Add(props) {
  const cardRef = useRef()
  const {
    patientBio,
    setPatientBio,
    patientMedicalData,
    setPatientMedicalData,
    addUpdatePatientMedicalData,
    loading
  } = props

  useEffect(() => {
    if(cardRef.current && cardRef.current.scrollLeft > 0)
      window.addEventListener('resize', correctPosition)
    return () => {
      window.removeEventListener('resize', correctPosition)
    }
  }, [])

  const correctPosition = () => {
    if(cardRef.current)
      cardRef.current.scrollTo(cardRef.current.scrollWidth/2, 0)
  }

  const next = () => {
    if(cardRef.current)
      cardRef.current.scrollBy({
        left: cardRef.current.scrollWidth, 
        behavior: 'smooth'
      })
  }
  
  const handleBack = () => {
    if(cardRef.current)
      cardRef.current.scrollTo({
        left: 0, 
        behavior: 'smooth'
      })
  }
  
  // Navigation indicators
  const renderStepIndicator = () => {
    return (
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        marginBottom: '1rem',
        gap: '0.5rem'
      }}>
        <div style={{
          width: '10px', 
          height: '10px', 
          borderRadius: '50%', 
          backgroundColor: '#3f51b5',
          transition: 'all 0.3s ease'
        }}></div>
        <div style={{
          width: '10px', 
          height: '10px', 
          borderRadius: '50%', 
          backgroundColor: '#e0e0e0',
          transition: 'all 0.3s ease'
        }}></div>
      </div>
    );
  }

  return (
    <div className="fadeIn">
      {loading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 9999
        }}>
          <CircularProgress />
        </div>
      )}
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h2 style={{margin: 0, color: '#3f51b5'}}>Add New Medical Record</h2>
        {renderStepIndicator()}
      </div>
      
      <Card className="cardsContainer" ref={cardRef}>
        <AddData
          patientBio={patientBio}
          setPatientBio={(obj) => setPatientBio(obj)}
          next={next}
        />
        <AddMedicalData
          patientMedicalData={patientMedicalData}
          setPatientMedicalData={(obj) => setPatientMedicalData(obj)}
          addUpdatePatientMedicalData={addUpdatePatientMedicalData}
          handleBack={handleBack}
        />
      </Card>
      
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '1rem',
        padding: '0 1rem'
      }}>
        <div style={{display: 'flex', alignItems: 'center', color: '#757575'}}>
          <ArrowBackIcon style={{fontSize: '1rem', marginRight: '0.5rem'}} />
          <span style={{fontSize: '0.85rem'}}>Swipe or use buttons to navigate</span>
          <ArrowForwardIcon style={{fontSize: '1rem', marginLeft: '0.5rem'}} />
        </div>
      </div>
    </div>
  )
}