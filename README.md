# V-Lab challenge

Desafio técnico para a vaga de Desenvolvedor Fullstack Pleno. O sistema monitora dados de postos de combustíveis, armazena em banco relacional e exibe KPIs gerenciais em um dashboard de alta performance.

## Tecnologias Utilizadas

* **Backend:** Python (FastAPI), SQLAlchemy, Pydantic.
* **Frontend:** React (Vite), TypeScript, Recharts.
* **Banco de Dados:** PostgreSQL 15.
* **Cache/Performance:** Redis (Alpine).
* **Infraestrutura:** Docker & Docker Compose.
* **Ingestão:** Script Python com dados sintéticos (Faker).

## Como Rodar o Projeto

Pré-requisito: Ter o **Docker** instalado.

1.  **Subir a aplicação:**
    Execute na raiz do projeto:
    ```bash
    docker-compose up --build
    ```
    *Aguarde os logs indicarem que o Backend (8000), Frontend (5173), Postgres e Redis estão rodando.*

2.  **Acessar o Dashboard:**
    Abra no navegador: [http://localhost:5173](http://localhost:5173)

3.  **Gerar Dados (Popular o Banco):**
    Em outro terminal, execute o script de ingestão (instale as deps locais se necessário):
    ```bash
    # Se rodar localmente:
    pip install requests faker
    python scripts/seed.py
    ```
    *Obs: Ao rodar o script, o cache do Redis é invalidado automaticamente para refletir os novos dados.*

## Decisões de Arquitetura

* **Performance & Cache:** Implementei **Redis** como camada de cache para a rota de Dashboard. O sistema verifica primeiro na memória (Redis) antes de fazer agregações pesadas no PostgreSQL. Resultado: Respostas em milissegundos para leituras frequentes.
* **Agregação no Banco:** Cálculos de média e soma são feitos via `GROUP BY` no SQL, delegando o processamento pesado ao banco.
* **Frontend Otimizado:** Uso de `Promise.all` para carregar gráficos e tabelas em paralelo.
* **Resiliência:** Implementação de `Retry Pattern` na conexão do Backend com o Banco de Dados.

## Documentação da API (Swagger)

Acesse a documentação interativa das rotas em:
[http://localhost:8000/docs](http://localhost:8000/docs)

**Principais Rotas:**
* `GET /dashboard`: Retorna KPIs (com cache).
* `GET /coletas`: Listagem com paginação e filtros.
* `POST /coletas`: Ingestão de dados.