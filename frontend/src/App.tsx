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
  
  // NOVO: Estado do Filtro
  const [filtroCombustivel, setFiltroCombustivel] = useState<string>('');

  // Função para buscar dados (agora aceita parametro opcional)
  const fetchData = async (combustivel: string = '') => {
    try {
      // Monta a URL com filtro se existir
      let urlColetas = 'http://localhost:8000/coletas/?limit=10';
      if (combustivel) {
        urlColetas += `&combustivel=${combustivel}`;
      }

      const [dashRes, listaRes] = await Promise.all([
        axios.get('http://localhost:8000/dashboard'),
        axios.get(urlColetas)
      ]);
      
      setDashboard(dashRes.data);
      setColetas(listaRes.data);
    } catch (err: any) {
      console.error(err);
      setError("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  // Carrega ao iniciar
  useEffect(() => {
    fetchData();
  }, []);

  // NOVO: Quando o usuário muda o select, recarrega a tabela
  const handleFiltroChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const valor = e.target.value;
    setFiltroCombustivel(valor);
    fetchData(valor); // Recarrega os dados com o novo filtro
  };

  if (loading) return <div className="loading"> Carregando...</div>;
  if (error) return <div className="loading" style={{ color: 'red' }}>⚠️ {error}</div>;

  return (
    <div className="container">
      <header className="header">
        <h1> V-Lab Monitor: Mercado de Combustíveis</h1>
      </header>

      {dashboard && (
        <DashboardCharts 
          mediaPreco={dashboard.media_preco_combustivel} 
          consumoVeiculo={dashboard.total_consumo_veiculo} 
        />
      )}

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2>Últimas Coletas</h2>
          
          {/* NOVO: O Dropdown de Filtro */}
          <select 
            value={filtroCombustivel} 
            onChange={handleFiltroChange}
            style={{ padding: '8px', borderRadius: '5px', border: '1px solid #ccc' }}
          >
            <option value="">Todos os Combustíveis</option>
            <option value="Gasolina">Gasolina</option>
            <option value="Etanol">Etanol</option>
            <option value="Diesel S10">Diesel S10</option>
          </select>
        </div>

        <ColetasTable data={coletas} />
      </div>
    </div>
  );
}

export default App;