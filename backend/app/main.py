import time
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func # <--- IMPORTANTE: Importa as funções de agregação (Média, Soma)
from sqlalchemy.exc import OperationalError
from typing import List, Optional
from . import models, schemas, database
from fastapi.middleware.cors import CORSMiddleware

# --- RETRY LOGIC ---
#evitar que o python carregue antes do DB carregar.
max_retries = 10
for i in range(max_retries):
    try:
        models.Base.metadata.create_all(bind=database.engine)
        print("DB Conectado.")
        break
    except OperationalError:
        print(f"Aguardando DB.. ({i+1}/{max_retries})")
        time.sleep(2)

app = FastAPI(title="V-Lab Challenge API")

app.add_middleware(
    CORSMiddleware, 
    allow_origins = ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- ROTAS BÁSICAS ---

@app.post("/coletas/", response_model=schemas.ColetaResponse)
def create_coleta(coleta: schemas.ColetaCreate, db: Session = Depends(database.get_db)):
    db_coleta = models.Coleta(**coleta.dict())
    db.add(db_coleta)
    db.commit()
    db.refresh(db_coleta)
    return db_coleta

@app.get("/coletas/", response_model=List[schemas.ColetaResponse])
def read_coletas(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return db.query(models.Coleta).offset(skip).limit(limit).all()

# --- ROTAS NOVAS ---

@app.get("/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard_metrics(db: Session = Depends(database.get_db)):
    """
    Calcula KPIs diretamente no Banco de Dados para alta performance.
    """
    
    # 1. KPI: Média de preço por combustível
    # O "func.avg" faz o PostgreSQL calcular a média, retornando só o resultado.
    preco_query = db.query(
        models.Coleta.tipo_combustivel,
        func.avg(models.Coleta.preco_venda)
    ).group_by(models.Coleta.tipo_combustivel).all()

    # 2. KPI: Volume total por tipo de veículo
    # O "func.sum" faz o PostgreSQL somar tudo.
    volume_query = db.query(
        models.Coleta.tipo_veiculo,
        func.sum(models.Coleta.volume_vendido)
    ).group_by(models.Coleta.tipo_veiculo).all()

    # Formata a resposta para o Frontend
    return {
        "media_preco_combustivel": [{"label": row[0], "value": round(row[1], 2)} for row in preco_query],
        "total_consumo_veiculo": [{"label": row[0], "value": round(row[1], 2)} for row in volume_query]
    }

@app.get("/motoristas/historico", response_model=List[schemas.ColetaResponse])
def get_historico_motorista(
    cpf: Optional[str] = None, 
    nome: Optional[str] = None, 
    db: Session = Depends(database.get_db)
):
    """
    Busca histórico filtrando por Nome OU CPF (Requisito B.46)
    """
    query = db.query(models.Coleta)
    
    if cpf:
        query = query.filter(models.Coleta.cpf_motorista == cpf)
    elif nome:
        query = query.filter(models.Coleta.nome_motorista.ilike(f"%{nome}%"))
    else:
        raise HTTPException(status_code=400, detail="Forneça CPF ou Nome para busca.")
        
    return query.all()