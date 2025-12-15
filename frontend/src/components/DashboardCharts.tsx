import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import type { MetricItem } from '../types'; // <--- Mudança 1: import type

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface Props {
  mediaPreco: MetricItem[];
  consumoVeiculo: MetricItem[];
}

export function DashboardCharts({ mediaPreco, consumoVeiculo }: Props) {
  return (
    <div className="kpi-grid">
      <div className="card">
        <h2>Média de Preço (R$/L)</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            {/* Mudança 2: 'as any[]' para calar o erro chato do Recharts */}
            <BarChart data={mediaPreco as any[]}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#8884d8" name="Preço Médio" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h2>Volume Consumido (Litros)</h2>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
              data={consumoVeiculo as any[]}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#82ca9d"
              dataKey="value"
              nameKey="label"  // <--- ADICIONE ESSA LINHA AQUI!
              label
            >
              {consumoVeiculo.map((_, index) => (
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
  );
}