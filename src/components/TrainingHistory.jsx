import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEntrenamientos } from '../services/entrenamientoService';

export default function TrainingHistory() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadLogs(0);
    }
  }, [user?.id]);

  const loadLogs = async (pageNum) => {
    try {
      setLoading(true);
      const data = await getEntrenamientos(user.id, pageNum);
      
      if (pageNum === 0) {
        setLogs(data.content);
      } else {
        setLogs(prev => [...prev, ...data.content]);
      }
      
      setHasMore(!data.last);
      setPage(pageNum);
    } catch (err) {
      console.error('Error fetching logs', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadLogs(page + 1);
    }
  };

  if (loading && page === 0) {
    return <div className="loader fade-in"></div>;
  }

  return (
    <div className="fade-in animate-fade-in-up">
      {logs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <h3 className="text-secondary">Sin entrenamientos</h3>
          <p>Aún no has registrado ningún entrenamiento.</p>
        </div>
      ) : (
        <div className="routine-grid">
          {logs.map((log) => (
            <div key={log.id} className="card history-card fade-in animate-fade-in-up">
              <div className="card-header flex-col items-center" style={{ paddingTop: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)', gap: '8px' }}>
                <h3 className="text-accent text-center">{log.nombreRutina}</h3>
                <span className="badge badge-accent" style={{ background: 'var(--accent)', color: '#fff' }}>{log.fecha}</span>
              </div>
              <div className="card-body">
                <table className="data-table" style={{ marginTop: '0.5rem' }}>
                  <thead>
                    <tr>
                      <th>Ejercicio</th>
                      <th>Peso (kg)</th>
                      <th>Reps</th>
                    </tr>
                  </thead>
                  <tbody>
                    {log.marcasEjercicio.map(marca => (
                      <tr key={marca.id}>
                        <td>{marca.nombreEjercicio}</td>
                        <td>{marca.pesoLevantado}</td>
                        <td>{marca.repeticionesLogradas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button className="btn btn-secondary" onClick={loadMore} disabled={loading}>
            {loading ? 'Cargando...' : 'Cargar Más'}
          </button>
        </div>
      )}
    </div>
  );
}
