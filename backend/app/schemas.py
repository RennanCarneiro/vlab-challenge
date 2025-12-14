#schemas -> define a porta de entrada da API, verifica se ta tudo no formato certo
#utilizar pydantic para garantir que a API rejeite dados invalidos antes mesmo de salvar
from pydantic import BaseModel
from datetime import datetime

# Base comum para entrada e leitura
class ColetaBase(BaseModel):
    identificador_posto: str
    nome_posto: str
    cidade: str
    estado: str
    data_coleta: datetime
    tipo_combustivel: str
    preco_venda: float
    volume_vendido: float
    nome_motorista: str
    cpf_motorista: str
    placa_veiculo: str
    tipo_veiculo: str

# Usado na criação (POST)
class ColetaCreate(ColetaBase):
    pass

# Usado na resposta (GET) - inclui o ID gerado pelo banco
class ColetaResponse(ColetaBase):
    id: int

    class Config:
        from_attributes = True