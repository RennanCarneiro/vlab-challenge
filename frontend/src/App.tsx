import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
// CORREÇÃO 1: Adicionado 'type' aqui para satisfazer o TypeScript estrito
import type { DashboardData, Coleta } from './types';
import './App.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

function App() {
  // Inicializa com null
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [coletas, setColetas] = useState<Coleta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(" Iniciando busca de dados...");
        
        // Faz as duas chamadas ao mesmo tempo
        const [dashRes, listaRes] = await Promise.all([
          axios.get('http://localhost:8000/dashboard'),
          axios.get('http://localhost:8000/coletas/?limit=10')
        ]);

        console.log(" Dados recebidos:", dashRes.data);
        
        setDashboard(dashRes.data);
        setColetas(listaRes.data);
      } catch (err: any) {
        console.error(" Erro no frontend:", err);
        setError("Não foi possível conectar ao Backend. Verifique se o Docker está rodando.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Exibe tela de carregamento ou erro
  if (loading) return <div className="loading">⏳ Carregando Dashboard...</div>;
  if (error) return <div className="loading" style={{ color: 'red' }}>⚠️ {error}</div>;

  return (
    <div className="container">
      <header className="header">
        <h1> V-Lab Monitor: Mercado de Combustíveis</h1>
      </header>

      {/* CORREÇÃO 2: Só renderiza os gráficos se 'dashboard' existir (não for null) */}
      {dashboard ? (
        <div className="kpi-grid">
          {/* Gráfico 1 */}
          <div className="card">
            <h2>Média de Preço (R$/L)</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={dashboard.media_preco_combustivel}>
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" name="Preço Médio" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2 */}
          <div className="card">
            <h2>Volume Consumido (Litros)</h2>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={dashboard.total_consumo_veiculo}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#82ca9d"
                    dataKey="value"
                    label
                  >
                    {dashboard.total_consumo_veiculo.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="card">Nenhum dado de dashboard disponível.</div>
      )}

      {/* Tabela */}
      <div className="card">
        <h2>Últimas Coletas (Tempo Real)</h2>
        {coletas.length > 0 ? (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Motorista</th>
                <th>Combustível</th>
                <th>Preço</th>
                <th>Volume</th>
              </tr>
            </thead>
            <tbody>
              {coletas.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>{c.nome_motorista}</td>
                  <td>{c.tipo_combustivel}</td>
                  <td>R$ {c.preco_venda.toFixed(2)}</td>
                  <td>{c.volume_vendido.toFixed(1)} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Nenhuma coleta registrada ainda. Rode o script de ingestão!</p>
        )}
      </div>
    </div>
  );
}

export default App;