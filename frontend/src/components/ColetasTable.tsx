import type { Coleta } from '../types';

interface Props {
  data: Coleta[];
}

export function ColetasTable({ data }: Props) {
  if (data.length === 0) {
    return <div className="card"><p>Nenhuma coleta registrada ainda.</p></div>;
  }

  return (
    <div className="card">
      <h2>Últimas Coletas (Tempo Real)</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Motorista</th>
            <th>Combustível</th>
            <th>Preço</th>
            <th>Volume</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c) => (
            <tr key={c.id}>
              {/* Formata a data para DD/MM/AAAA */}
              <td>{new Date(c.data_coleta).toLocaleDateString('pt-BR')}</td>
              <td>{c.nome_motorista}</td>
              <td>{c.tipo_combustivel}</td>
              {/* Formata dinheiro para R$ */}
              <td>{c.preco_venda.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td>
              <td>{c.volume_vendido.toFixed(1)} L</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}