import React, { useState } from 'react';

interface ScheduleInterviewLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (scheduleData: {
    applicationId: string;
    interviewerId: string;
    modality: string;
    startDate: string;
    endDate: string;
  }) => void;
  candidateName?: string;
  applicationId?: string;
}

const ScheduleInterviewLightbox: React.FC<ScheduleInterviewLightboxProps> = ({
  isOpen,
  onClose,
  onSubmit,
  candidateName = "Nombre del candidato",
  applicationId = "ID de postulación"
}) => {
  const [formData, setFormData] = useState({
    interviewerId: '',
    modality: 'presencial',
    startDate: '',
    endDate: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      applicationId: applicationId,
      interviewerId: formData.interviewerId,
      modality: formData.modality,
      startDate: formData.startDate,
      endDate: formData.endDate
    });
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="lightbox-overlay" 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        backdropFilter: 'blur(2px)'
      }}
    >
      <div 
        className="lightbox-content" 
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--background)',
          borderRadius: 'var(--radius-lg)',
          padding: 0,
          width: '90%',
          maxWidth: '500px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
          animation: 'slideIn 0.3s ease-out',
          border: '1px solid var(--border)'
        }}
      >
        <div 
          className="lightbox-header"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0'
          }}
        >
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 'var(--font-weight-medium)' }}>
            Agendar Cita
          </h2>
          <button 
            className="close-button" 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '2rem',
              color: 'var(--muted-foreground)',
              cursor: 'pointer',
              padding: 0,
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
          >
            ×
          </button>
        </div>
        
        <form 
          onSubmit={handleSubmit} 
          className="schedule-form"
          style={{ padding: '24px' }}
        >
          <div 
            className="form-info"
            style={{
              backgroundColor: 'var(--muted)',
              padding: '16px',
              borderRadius: 'var(--radius)',
              marginBottom: '20px',
              borderLeft: '4px solid var(--primary)'
            }}
          >
            <p style={{ margin: '8px 0', color: 'var(--foreground)' }}>
              <strong>Candidato:</strong> {candidateName}
            </p>
            <p style={{ margin: '8px 0', color: 'var(--foreground)' }}>
              <strong>Número de postulación:</strong> {applicationId}
            </p>
          </div>

          <div 
            className="form-group"
            style={{ marginBottom: '20px' }}
          >
            <label 
              htmlFor="interviewerId"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--foreground)',
                fontSize: '0.9rem'
              }}
            >
              ID del Entrevistador:
            </label>
            <input
              type="text"
              id="interviewerId"
              name="interviewerId"
              value={formData.interviewerId}
              onChange={handleChange}
              required
              placeholder="Ingresa el ID del entrevistador"
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
                backgroundColor: 'var(--input-background)',
                color: 'var(--foreground)'
              }}
            />
          </div>

          <div 
            className="form-group"
            style={{ marginBottom: '20px' }}
          >
            <label 
              htmlFor="modality"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--foreground)',
                fontSize: '0.9rem'
              }}
            >
              Modalidad:
            </label>
            <select
              id="modality"
              name="modality"
              value={formData.modality}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
                backgroundColor: 'var(--input-background)',
                color: 'var(--foreground)'
              }}
            >
              <option value="presencial">Presencial</option>
              <option value="virtual">Virtual</option>
            </select>
          </div>

          <div 
            className="form-group"
            style={{ marginBottom: '20px' }}
          >
            <label 
              htmlFor="startDate"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--foreground)',
                fontSize: '0.9rem'
              }}
            >
              Fecha Inicio:
            </label>
            <input
              type="datetime-local"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
                backgroundColor: 'var(--input-background)',
                color: 'var(--foreground)'
              }}
            />
          </div>

          <div 
            className="form-group"
            style={{ marginBottom: '20px' }}
          >
            <label 
              htmlFor="endDate"
              style={{
                display: 'block',
                marginBottom: '6px',
                fontWeight: 'var(--font-weight-medium)',
                color: 'var(--foreground)',
                fontSize: '0.9rem'
              }}
            >
              Fecha Fin:
            </label>
            <input
              type="datetime-local"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid var(--border)',
                borderRadius: 'var(--radius)',
                fontSize: '1rem',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxSizing: 'border-box',
                backgroundColor: 'var(--input-background)',
                color: 'var(--foreground)'
              }}
            />
          </div>

          <div 
            className="form-actions"
            style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border)'
            }}
          >
            <button 
              type="button" 
              onClick={onClose} 
              className="cancel-button"
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: '0.95rem',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'var(--muted-foreground)',
                color: 'var(--primary-foreground)'
              }}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="submit-button"
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: 'var(--radius)',
                fontSize: '0.95rem',
                fontWeight: 'var(--font-weight-medium)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'var(--primary)',
                color: 'var(--primary-foreground)'
              }}
            >
              Agendar Entrevista
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .lightbox-content input:focus,
          .lightbox-content select:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px var(--ring);
          }

          .close-button:hover {
            background-color: var(--accent);
          }

          .cancel-button:hover {
            background-color: var(--muted);
            color: var(--foreground);
          }

          .submit-button:hover {
            background-color: var(--primary);
            opacity: 0.9;
            transform: translateY(-1px);
          }
        `}
      </style>
    </div>
  );
};

export default ScheduleInterviewLightbox;