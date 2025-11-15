import React, { useState } from 'react';
import ScheduleInterviewLightbox from './ui/ScheduleInterviewLightbox';

const TestSchedulePage: React.FC = () => {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [applicationId, setApplicationId] = useState('');
  const [interviewerId, setInterviewerId] = useState('');

  const handleScheduleSubmit = (scheduleData: {
    applicationId: string;
    interviewerId: string;
    modality: string;
    startDate: string;
    endDate: string;
  }) => {
    console.log('Datos de la entrevista:', scheduleData);
    alert(`Entrevista agendada:\nPostulación: ${scheduleData.applicationId}\nEntrevistador: ${scheduleData.interviewerId}\nModalidad: ${scheduleData.modality}\nInicio: ${scheduleData.startDate}\nFin: ${scheduleData.endDate}`);
  };

  return (
    <div style={{ 
      padding: '40px', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: 'var(--background)',
      color: 'var(--foreground)',
      minHeight: '100vh'
    }}>
      <h1>Página de Prueba - Agendar Entrevistas</h1>
      
      <div style={{ 
        background: 'var(--muted)', 
        padding: '20px', 
        borderRadius: 'var(--radius)',
        marginBottom: '30px',
        border: '1px solid var(--border)'
      }}>
        <h3>Configuración de prueba</h3>
        
        <div style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'var(--font-weight-medium)' 
            }}>
              ID de Postulación:
            </label>
            <input
              type="text"
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              placeholder="Ej: APP-123"
              style={{
                padding: '10px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                width: '200px',
                backgroundColor: 'var(--input-background)',
                color: 'var(--foreground)'
              }}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '5px', 
              fontWeight: 'var(--font-weight-medium)' 
            }}>
              ID del Entrevistador:
            </label>
            <input
              type="text"
              value={interviewerId}
              onChange={(e) => setInterviewerId(e.target.value)}
              placeholder="Ej: INT-456"
              style={{
                padding: '10px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                width: '200px',
                backgroundColor: 'var(--input-background)',
                color: 'var(--foreground)'
              }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => setIsLightboxOpen(true)}
        style={{
          backgroundColor: 'var(--primary)',
          color: 'var(--primary-foreground)',
          padding: '12px 24px',
          border: 'none',
          borderRadius: 'var(--radius)',
          fontSize: '16px',
          cursor: 'pointer',
          fontWeight: 'var(--font-weight-medium)',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.opacity = '0.9';
          e.currentTarget.style.transform = 'translateY(-1px)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.opacity = '1';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        📅 Abrir Lightbox de Agendar Entrevista
      </button>

      <ScheduleInterviewLightbox
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        onSubmit={handleScheduleSubmit}
        candidateName="Juan Pérez"
        applicationId={applicationId}
      />
    </div>
  );
};

export default TestSchedulePage;