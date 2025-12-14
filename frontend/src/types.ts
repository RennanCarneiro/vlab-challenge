//reconhecer a formatação dos dados

export interface MetricItem {
    label: string;
    value: number;
}

export interface DashboardData {
    media_preco_combustivel: MetricItem[];
    total_consumo_veiculo: MetricItem[];
}

export interface Coleta {
    id: number;
    data_coleta: string;
    nome_motorista: string;
    tipo_combustivel: string;
    preco_venda: number;
    volume_vendido: number;
}