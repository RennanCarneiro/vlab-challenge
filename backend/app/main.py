import time
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from sqlalchemy.exc import OperationalError
from typing import List
from . import models, schemas, database

# Retry logic para garantir conexão na inicialização
#utilizado para evitar que o python conecte antes do DB estar pronto
# retry patter 
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