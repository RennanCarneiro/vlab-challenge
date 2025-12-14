#define como os dados sao salvos no BD. mapea os campos obrigatorios pedidos.
from sqlalchemy import Column, Integer, String, Float, DateTime
from .database import Base

class Coleta(Base):
    __tablename__ = "coletas"

    id = Column(Integer, primary_key=True, index=True)
    
    # Identificação do Posto
    identificador_posto = Column(String, index=True)
    nome_posto = Column(String)
    cidade = Column(String)
    estado = Column(String)
    
    # Dados da Coleta
    data_coleta = Column(DateTime)
    tipo_combustivel = Column(String)
    preco_venda = Column(Float)
    volume_vendido = Column(Float)
    
    # Motorista
    nome_motorista = Column(String)
    cpf_motorista = Column(String)
    placa_veiculo = Column(String)
    tipo_veiculo = Column(String)