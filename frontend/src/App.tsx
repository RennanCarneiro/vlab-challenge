import { useEffect, useState } from 'react';
import axios from 'axios';
import type { DashboardData, Coleta } from './types';
import { DashboardCharts } from './components/DashboardCharts';
import { ColetasTable } from './components/ColetasTable';
import './App.css';

function App() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, listaRes] = await Promise.all([
          axios.get('http://localhost:8000/dashboard'),
          axios.get('http://localhost:8000/coletas/?limit=10')
        ]);
        setDashboard(dashRes.data);
        setColetas(listaRes.data);
      } catch (err) {
        console.error(err);
        setError("Erro de conexão com a API.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading">⏳ Carregando...</div>;
  if (error) return <div className="loading" style={{ color: 'red' }}>⚠️ {error}</div>;

  return (
    <div className="container">
      <header className="header">
        <h1>⛽ V-Lab Monitor: Mercado de Combustíveis</h1>
      </header>

      {dashboard && (
        <DashboardCharts 
          mediaPreco={dashboard.media_preco_combustivel} 
          consumoVeiculo={dashboard.total_consumo_veiculo} 
        />
      )}

      <ColetasTable data={coletas} />
    </div>
  );
}

export default App;