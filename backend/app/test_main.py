from fastapi.testclient import TestClient
from app.main import app  

client = TestClient(app)

def test_read_main():
    response = client.get("/docs")
    assert response.status_code == 200

def test_dashboard_kpis():
    response = client.get("/dashboard")
    assert response.status_code == 200
    data = response.json()
    assert "media_preco_combustivel" in data
    assert "total_consumo_veiculo" in data

def test_filtro_coletas():
    response = client.get("/coletas/?combustivel=Gasolina")
    assert response.status_code == 200
    if len(response.json()) > 0:
        assert response.json()[0]["tipo_combustivel"] == "Gasolina"