import { useState, useEffect } from 'react';
import { getAllEjercicios } from '../services/ejercicioService';
import { createRutina, updateRutina, activarRutina } from '../services/routineService';
import { useAuth } from '../context/AuthContext';

const DAYS_OF_WEEK = [
  { value: 'MONDAY', label: 'Lunes' },
  { value: 'TUESDAY', label: 'Martes' },
  { value: 'WEDNESDAY', label: 'Miércoles' },
  { value: 'THURSDAY', label: 'Jueves' },
  { value: 'FRIDAY', label: 'Viernes' },
  { value: 'SATURDAY', label: 'Sábado' },
  { value: 'SUNDAY', label: 'Domingo' },
];

export default function CreateRoutine({ onNavigate, editingRoutine, setEditingRoutine }) {
  const { user, refreshUser } = useAuth();
  const [allEjercicios, setAllEjercicios] = useState([]);
  
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [dias, setDias] = useState([]); 
  
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  const generateId = () => Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    getAllEjercicios().then(data => setAllEjercicios(data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (editingRoutine) {
      setNombre(editingRoutine.nombre);
      setPrecio(editingRoutine.precio || '');
      
      const loadedDias = (editingRoutine.diaRutinas || []).map((dia, idx) => ({
        tempId: generateId(),
        diaDeLaSemana: dia.diaDeLaSemana,
        ejercicios: (dia.ejercicioRutinas || []).map((ex, exIdx) => ({
          tempId: generateId(),
          ejercicioId: ex.ejercicioId?.toString() || '',
          series: ex.series,
          repeticiones: ex.repeticiones
        }))
      }));
      setDias(loadedDias);
    } else {
      setNombre('');
      setPrecio('');
      setDias([]);
    }
  }, [editingRoutine]);

  const handleAddDay = () => {
    setDias(prev => [...prev, { tempId: generateId(), diaDeLaSemana: 'MONDAY', ejercicios: [] }]);
  };

  const handleRemoveDay = (tempId) => {
    setDias(prev => prev.filter(d => d.tempId !== tempId));
  };

  const handleDayChange = (tempId, field, value) => {
    setDias(prev => prev.map(d => d.tempId === tempId ? { ...d, [field]: value } : d));
  };

  const handleAddExercise = (diaTempId) => {
    setDias(prev => prev.map(d => {
      if (d.tempId === diaTempId) {
        return {
          ...d,
          ejercicios: [...d.ejercicios, { tempId: generateId(), ejercicioId: '', series: 3, repeticiones: 10 }]
        };
      }
      return d;
    }));
  };

  const handleRemoveExercise = (diaTempId, exTempId) => {
    setDias(prev => prev.map(d => {
      if (d.tempId === diaTempId) {
        return { ...d, ejercicios: d.ejercicios.filter(e => e.tempId !== exTempId) };
      }
      return d;
    }));
  };

  const handleExerciseChange = (diaTempId, exTempId, field, value) => {
    setDias(prev => prev.map(d => {
      if (d.tempId === diaTempId) {
        return {
          ...d,
          ejercicios: d.ejercicios.map(e => e.tempId === exTempId ? { ...e, [field]: value } : e)
        };
      }
      return d;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: '', type: '' });
    if (!nombre) {
      setMsg({ text: 'El nombre es obligatorio', type: 'error' });
      return;
    }
    
    // Agrupar ejercicios por día para evitar duplicados en backend
    const diasAgrupados = {};
    dias.forEach(d => {
      if (!diasAgrupados[d.diaDeLaSemana]) {
        diasAgrupados[d.diaDeLaSemana] = [];
      }
      
      const ejerciciosValidos = d.ejercicios
        .filter(ex => ex.ejercicioId)
        .map(ex => ({
          ejercicioId: parseInt(ex.ejercicioId),
          series: parseInt(ex.series),
          repeticiones: parseInt(ex.repeticiones)
        }));
        
      diasAgrupados[d.diaDeLaSemana].push(...ejerciciosValidos);
    });

    const diasPayload = Object.keys(diasAgrupados).map(dia => ({
      diaDeLaSemana: dia,
      ejercicios: diasAgrupados[dia]
    })).filter(d => d.ejercicios.length > 0);

    const payload = {
      nombre,
      precio: user?.rol === 'ENTRENADOR' ? parseFloat(precio) || 0 : 0,
      dias: diasPayload
    };

    setLoading(true);
    try {
      if (editingRoutine) {
        await updateRutina(editingRoutine.id, payload);
        setMsg({ text: 'Rutina actualizada correctamente', type: 'success' });
      } else {
        const created = await createRutina(payload);
        await activarRutina(created.id);
        localStorage.setItem('activeRoutineId', created.id.toString());
        await refreshUser();
        setMsg({ text: 'Rutina creada y activada correctamente', type: 'success' });
      }
      if (setEditingRoutine) setEditingRoutine(null);
      setTimeout(() => onNavigate('misRutinas'), 1500);
    } catch (err) {
      const backendMsg = err.response?.data?.message || err.response?.data || (editingRoutine ? 'Error al actualizar rutina' : 'Error al crear rutina');
      setMsg({ text: typeof backendMsg === 'string' ? backendMsg : 'Error inesperado', type: 'error' });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in flex-col gap-lg pb-xl">
      <div className="flex-between flex-wrap gap-md">
        <h2 className="section-title">{editingRoutine ? 'Editar Rutina' : 'Diseñador de Rutina'}</h2>
        <button className="btn btn-secondary" onClick={() => onNavigate('misRutinas')}>
          Volver
        </button>
      </div>

      {msg.text && (
        <div className={`alert alert-${msg.type} animate-scale-in`} style={{ marginBottom: '1rem' }}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex-col gap-lg">
        <div className="card p-lg flex-col gap-md">
          <div className="form-group">
            <label>Nombre de la Rutina</label>
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej. Hipertrofia 4 días"
              required
            />
          </div>

          {user?.rol === 'ENTRENADOR' && (
            <div className="form-group">
              <label>Precio (Opcional)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
                placeholder="0.00"
              />
            </div>
          )}
        </div>

        <div className="flex-col gap-md">
          <div className="flex-between">
            <h3 className="text-lg font-bold">Días de Entrenamiento</h3>
            <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddDay}>
              + Agregar Día
            </button>
          </div>

          {dias.map((dia, idx) => (
            <div key={dia.tempId} className="card p-md border border-hover">
              <div className="flex-between mb-md">
                <div className="form-group" style={{ maxWidth: '200px' }}>
                  <select
                    value={dia.diaDeLaSemana}
                    onChange={e => handleDayChange(dia.tempId, 'diaDeLaSemana', e.target.value)}
                  >
                    {DAYS_OF_WEEK.map(d => (
                      <option key={d.value} value={d.value}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => handleRemoveDay(dia.tempId)}>
                  Eliminar Día
                </button>
              </div>

              <div className="flex-col gap-sm pl-md border-l border-border mt-sm">
                {dia.ejercicios.map((ex, exIdx) => (
                  <div key={ex.tempId} className="flex flex-col md:flex-row gap-sm items-start md:items-center bg-tertiary p-sm rounded-sm">
                    <div className="form-group flex-1 w-full">
                      <select
                        value={ex.ejercicioId}
                        onChange={e => handleExerciseChange(dia.tempId, ex.tempId, 'ejercicioId', e.target.value)}
                        required
                      >
                        <option value="">Seleccionar Ejercicio</option>
                        {allEjercicios.map(e => (
                          <option key={e.id} value={e.id}>{e.nombre}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="flex gap-sm w-full md:w-auto">
                      <div className="form-group" style={{ width: '80px' }}>
                        <input
                          type="number"
                          min="1"
                          title="Series"
                          placeholder="Series"
                          value={ex.series}
                          onChange={e => handleExerciseChange(dia.tempId, ex.tempId, 'series', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group" style={{ width: '100px' }}>
                        <input
                          type="number"
                          min="1"
                          title="Reps"
                          placeholder="Reps"
                          value={ex.repeticiones}
                          onChange={e => handleExerciseChange(dia.tempId, ex.tempId, 'repeticiones', e.target.value)}
                          required
                        />
                      </div>
                      <button type="button" className="btn btn-ghost text-danger" onClick={() => handleRemoveExercise(dia.tempId, ex.tempId)}>
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                <button type="button" className="btn btn-ghost text-accent self-start mt-sm" onClick={() => handleAddExercise(dia.tempId)}>
                  + Agregar Ejercicio
                </button>
              </div>
            </div>
          ))}

          {dias.length === 0 && (
            <div className="text-center p-xl bg-tertiary rounded-lg text-muted border border-dashed border-border">
              Agrega días a tu rutina para empezar a estructurarla.
            </div>
          )}
        </div>

        <div className="card p-md mt-md flex justify-end">
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading || dias.length === 0}>
            {loading ? 'Guardando...' : (editingRoutine ? 'Guardar Cambios' : 'Guardar y Activar')}
          </button>
        </div>
      </form>
    </div>
  );
}
