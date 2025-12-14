import requests
import random
from faker import Faker
from datetime import datetime

#simulação de disp IoT enviando dados
#atua como cliente, gerando dados randomicos mas realistas, e faz requisições HTTP POST para a API

# Configurações
API_URL = "http://localhost:8000/coletas/"
QTD_REGISTROS = 50  # Quantos registros vamos gerar agora

# Inicializa o gerador de dados brasileiros
fake = Faker('pt_BR')

# Dados de referência para realismo
COMBUSTIVEIS = [
    {"tipo": "Gasolina", "preco_min": 5.20, "preco_max": 6.10},
    {"tipo": "Etanol", "preco_min": 3.40, "preco_max": 4.30},
    {"tipo": "Diesel S10", "preco_min": 5.80, "preco_max": 6.50},
]

TIPOS_VEICULO = ["Carro", "Moto", "Caminhão Leve", "Carreta", "Ônibus"]

def gerar_dado():
    """Gera um JSON de coleta fictícia"""
    combustivel = random.choice(COMBUSTIVEIS)
    
    # Gera preços e volumes variados
    preco_venda = round(random.uniform(combustivel["preco_min"], combustivel["preco_max"]), 2)
    volume = round(random.uniform(10, 100), 2)

    payload = {
        "identificador_posto": str(random.randint(1000, 9999)),
        "nome_posto": f"Posto {fake.company()}",
        "cidade": fake.city(),
        "estado": fake.state_abbr(),
        "data_coleta": datetime.now().isoformat(),
        "tipo_combustivel": combustivel["tipo"],
        "preco_venda": preco_venda,
        "volume_vendido": volume,
        "nome_motorista": fake.name(),
        "cpf_motorista": fake.cpf(),
        "placa_veiculo": fake.license_plate(),
        "tipo_veiculo": random.choice(TIPOS_VEICULO)
    }
    return payload

def enviar_dados():
    print(f"Iniciando envio de {QTD_REGISTROS} registros para {API_URL}...")
    sucessos = 0
    erros = 0

    for _ in range(QTD_REGISTROS):
        dado = gerar_dado()
        try:
            response = requests.post(API_URL, json=dado)
            if response.status_code == 200:
                print(f"[200] {dado['nome_motorista']} abasteceu {dado['tipo_combustivel']}")
                sucessos += 1
            else:
                print(f"[Erro {response.status_code}] {response.text}")
                erros += 1
        except Exception as e:
            print(f"Erro de conexão: {e}")
            erros += 1

    print(f"\nFinalizado! Sucessos: {sucessos} | Erros: {erros}")

if __name__ == "__main__":
    enviar_dados()