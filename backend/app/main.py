import time
import json # Importar JSON para salvar texto no Redis
import redis # Importar a lib do Redis
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import OperationalError
from typing import List, Optional
from . import models, schemas, database

# Configuração do Redis
# Tenta conectar no container 'redis', se falhar (local sem docker), tenta localhost
try:
    redis_client = redis.Redis(host='redis', port=6379, db=0, decode_responses=True)
except Exception:
    redis_client = None

# Seu Retry Logic do DB .
max_retries = 10
for i in range(max_retries):
    try:
        models.Base.metadata.create_all(bind=database.engine)
        print("DB Conectado.")
        break
    except OperationalError:
        print(f"Aguardando DB... ({i+1}/{max_retries})")
        time.sleep(2)

app = FastAPI(title="V-Lab Challenge API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... (Rota create_coleta continua igual) 
@app.post("/coletas/", response_model=schemas.ColetaResponse)
def create_coleta(coleta: schemas.ColetaCreate, db: Session = Depends(database.get_db)):
    db_coleta = models.Coleta(**coleta.dict())
    db.add(db_coleta)
    db.commit()
    db.refresh(db_coleta)
    
    # INVALIDA O CACHE! Se entrou dado novo, o dashboard antigo está velho.
    if redis_client:
        redis_client.delete("dashboard_data")
        print("Cache limpo após nova coleta.")
        
    return db_coleta

# ... (Rota read_coletas continua igual)
@app.get("/coletas/", response_model=List[schemas.ColetaResponse])
def read_coletas(
    skip: int = 0, 
    limit: int = 100, 
    combustivel: Optional[str] = None,
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Coleta)
    if combustivel:
        query = query.filter(models.Coleta.tipo_combustivel.ilike(f"%{combustivel}%"))
    return query.offset(skip).limit(limit).all()

# --- ROTA DASHBOARD COM CACHE 
@app.get("/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard_metrics(db: Session = Depends(database.get_db)):
    
    # 1. Tenta pegar do Redis (Memória Rápida)
    if redis_client:
        cached_data = redis_client.get("dashboard_data")
        if cached_data:
            print("Retornando dados do Cache (Redis)")
            return json.loads(cached_data)

    print("Calculando no Banco de Dados...")
    
    # 2. Se não tiver no cache, calcula no Banco (Lento)
    preco_query = db.query(
        models.Coleta.tipo_combustivel,
        func.avg(models.Coleta.preco_venda)
    ).group_by(models.Coleta.tipo_combustivel).all()

    volume_query = db.query(
        models.Coleta.tipo_veiculo,
        func.sum(models.Coleta.volume_vendido)
    ).group_by(models.Coleta.tipo_veiculo).all()

    # Monta o objeto
    dashboard_data = {
        "media_preco_combustivel": [{"label": row[0], "value": round(row[1], 2)} for row in preco_query],
        "total_consumo_veiculo": [{"label": row[0], "value": round(row[1], 2)} for row in volume_query]
    }

    # 3. Salva no Redis para a próxima vez (Expira em 60 segundos)
    if redis_client:
        redis_client.setex("dashboard_data", 60, json.dumps(dashboard_data))

    return dashboard_data

# ... (Rota motoristas continua igual)
@app.get("/motoristas/historico", response_model=List[schemas.ColetaResponse])
def get_historico_motorista(
    cpf: Optional[str] = None, 
    nome: Optional[str] = None, 
    db: Session = Depends(database.get_db)
):
    query = db.query(models.Coleta)
    if cpf:
        query = query.filter(models.Coleta.cpf_motorista == cpf)
    elif nome:
        query = query.filter(models.Coleta.nome_motorista.ilike(f"%{nome}%"))
    else:
        raise HTTPException(status_code=400, detail="Forneça CPF ou Nome para busca.")
    return query.all()