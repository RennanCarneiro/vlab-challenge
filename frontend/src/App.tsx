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
  
  // Estado único para todos os filtros
  const [filtros, setFiltros] = useState({
    combustivel: '',
    cidade: '',
    veiculo: ''
  });

  // Função central que busca dados baseada nos filtros atuais
  const fetchData = async () => {
    try {
      // Monta a URL dinâmica
      const params = new URLSearchParams();
      params.append('limit', '10');
      if (filtros.combustivel) params.append('combustivel', filtros.combustivel);
      if (filtros.cidade) params.append('cidade', filtros.cidade);
      if (filtros.veiculo) params.append('tipo_veiculo', filtros.veiculo);

      const [dashRes, listaRes] = await Promise.all([
        axios.get('http://localhost:8000/dashboard'),
        axios.get(`http://localhost:8000/coletas/?${params.toString()}`)
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

  // Recarrega sempre que mudar um filtro (Efeito colateral)
  useEffect(() => {
    fetchData();
  }, [filtros]); // <--- O segredo: roda sempre que 'filtros' mudar

  // Função genérica para atualizar qualquer filtro
  const handleFilterChange = (campo: string, valor: string) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (error) return <div className="loading" style={{ color: 'red' }}>{error}</div>;

  return (
    <div className="container">
      <header className="header">
        <h1>V-Lab Monitor: Mercado de Combustíveis</h1>
      </header>

      {dashboard && (
        <DashboardCharts 
          mediaPreco={dashboard.media_preco_combustivel} 
          consumoVeiculo={dashboard.total_consumo_veiculo} 
        />
      )}

      <div className="card">
        <div className="filters-bar">
          <h2>Filtros</h2>
          <div className="filters-row">
            {/* Filtro 1: Combustível */}
            <select 
              value={filtros.combustivel} 
              onChange={(e) => handleFilterChange('combustivel', e.target.value)}
              className="filter-input"
            >
              <option value="">Todos Combustíveis</option>
              <option value="Gasolina">Gasolina</option>
              <option value="Etanol">Etanol</option>
              <option value="Diesel S10">Diesel S10</option>
            </select>

            {/* Filtro 2: Tipo de Veículo */}
            <select 
              value={filtros.veiculo} 
              onChange={(e) => handleFilterChange('veiculo', e.target.value)}
              className="filter-input"
            >
              <option value="">Todos Veículos</option>
              <option value="Carro">Carro</option>
              <option value="Moto">Moto</option>
              <option value="Caminhão Leve">Caminhão Leve</option>
              <option value="Carreta">Carreta</option>
              <option value="Ônibus">Ônibus</option>
            </select>

            {/* Filtro 3: Cidade (Texto Livre) */}
            <input 
              type="text"
              placeholder="Filtrar por Cidade..."
              value={filtros.cidade}
              onChange={(e) => handleFilterChange('cidade', e.target.value)}
              className="filter-input"
            />
          </div>
        </div>

        <ColetasTable data={coletas} />
      </div>
    </div>
  );
}

export default App;