import { useState, useEffect } from 'react';
import { getTodayRoutine } from '../services/routineService';
import { registrarEntrenamiento } from '../services/entrenamientoService';

export default function TrainingLog() {
  const [routine, setRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);
  const [toast, setToast] = useState({ msg: '', isError: false });
  
  // Array of { pesoLevantado, repeticionesLogradas, ejercicioRutinaId }
  const [marcas, setMarcas] = useState([]);

  const showToast = (msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast({ msg: '', isError: false }), 4000);
  };

  useEffect(() => {
    loadRoutine();
  }, []);

  const loadRoutine = async () => {
    try {
      setLoading(true);
      const data = await getTodayRoutine();
      setRoutine(data);
      
      // Initialize marcas with empty values for each exercise
      if (data && data.ejercicioRutinas) {
        const initialMarcas = data.ejercicioRutinas.map(ej => ({
          ejercicioRutinaId: ej.id,
          pesoLevantado: '',
          repeticionesLogradas: ''
        }));
        setMarcas(initialMarcas);
      }
    } catch (err) {
      const msg = err.response?.data?.message || '';
      if (msg.includes('No tiene rutina') || msg.includes('no tiene día')) {
        setErrorMsg('No tienes ejercicios programados para hoy.');
      } else {
        setErrorMsg('Error al cargar la rutina.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleMarcaChange = (ejId, field, value) => {
    setMarcas(marcas.map(m => 
      m.ejercicioRutinaId === ejId ? { ...m, [field]: value } : m
    ));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    
    // Validation
    const cleanMarcas = marcas.map(m => ({
      ejercicioRutinaId: m.ejercicioRutinaId,
      pesoLevantado: parseFloat(m.pesoLevantado) || 0,
      repeticionesLogradas: parseInt(m.repeticionesLogradas) || 0
    })).filter(m => m.pesoLevantado > 0 && m.repeticionesLogradas > 0);

    if (cleanMarcas.length === 0) {
      showToast('Debes registrar al menos un ejercicio con peso y repeticiones mayores a 0.', true);
      return;
    }

    const activeRoutineId = localStorage.getItem('activeRoutineId');
    if (!activeRoutineId) {
      showToast('No se pudo identificar la rutina activa. Ve a "Mis Rutinas" y actívala de nuevo.', true);
      return;
    }

    try {
      await registrarEntrenamiento({
        idRutina: parseInt(activeRoutineId),
        marcasEjercicio: cleanMarcas
      });
      setSuccess(true);
      // Reset form
      const initialMarcas = routine.ejercicioRutinas.map(ej => ({
        ejercicioRutinaId: ej.id,
        pesoLevantado: '',
        repeticionesLogradas: ''
      }));
      setMarcas(initialMarcas);
    } catch (err) {
      showToast('Error al guardar el entrenamiento', true);
      console.error(err);
    }
  };

  if (loading) return <div className="animate-pulse card p-lg h-64"></div>;

  if (errorMsg) {
    return (
      <div className="empty-state animate-fade-in card-glow">
        <div className="empty-state-icon" style={{ opacity: 0.7 }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>
        </div>
        <h3>Día Libre</h3>
        <p>{errorMsg}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto">
      <div className="section-header">
        <h2 className="section-title">Registrar Entrenamiento</h2>
      </div>

      {success && (
        <div className="alert alert-success">
          ¡Entrenamiento registrado con éxito! Gran trabajo hoy.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-col gap-md">
        {routine.ejercicioRutinas?.map((ej, index) => {
          const marca = marcas.find(m => m.ejercicioRutinaId === ej.id) || {};
          
          return (
            <div key={ej.id} className="training-card animate-scale-in" style={{ animationDelay: `${index * 100}ms`, opacity: 0 }}>
              <div className="training-card-header">
                <h4 className="font-bold text-lg">{ej.nombreEjercicio}</h4>
                <span className="badge badge-accent">
                  Objetivo: {ej.series}x{ej.repeticiones}
                </span>
              </div>
              
              <div className="training-inputs">
                <div className="form-group">
                  <label>Peso (kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    placeholder="0.0"
                    value={marca.pesoLevantado}
                    onChange={(e) => handleMarcaChange(ej.id, 'pesoLevantado', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Repeticiones (Max)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={marca.repeticionesLogradas}
                    onChange={(e) => handleMarcaChange(ej.id, 'repeticionesLogradas', e.target.value)}
                  />
                </div>
              </div>
            </div>
          );
        })}

        <div className="card p-md mt-md flex justify-end">
          <button type="submit" className="btn btn-primary btn-lg w-full md:w-auto">
            Guardar Entrenamiento
          </button>
        </div>
      </form>

      {/* Toast Notification */}
      {toast.msg && (
        <div className={`toast animate-fade-in-up ${toast.isError ? 'toast-danger' : 'toast-success'}`} style={{ zIndex: 9999 }}>
          <div className={toast.isError ? 'toast-danger-dot' : 'toast-success-dot'}></div>
          <span className="text-sm font-medium">{toast.msg}</span>
        </div>
      )}
    </div>
  );
}
