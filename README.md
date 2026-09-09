# 🖥️ InfraMonitor

> Sistema de monitoramento de infraestrutura de TI desenvolvido com **Spring Boot** e **React**, com dashboard, autenticação e persistência em PostgreSQL.

## 🚀 Tecnologias

| Camada             | Tecnologias                                                     |
| ------------------ | --------------------------------------------------------------- |
| **Frontend**       | React 18 · React Router 6 · Material UI 5 · Axios · Chart.js    |
| **Backend**        | Java 17 · Spring Boot 3.1.5 · Spring Data JPA · Spring Security |
| **Banco de Dados** | PostgreSQL 15 · H2                                              |
| **Infraestrutura** | Docker · Docker Compose                                         |
| **Automação**      | PowerShell                                                      |

## 📁 Estrutura

```text
inframonitor/
├── backend/          # API Spring Boot
├── frontend/         # Aplicação React
├── docker/           # Docker Compose
├── scripts/          # Scripts PowerShell
└── README.md
```

## 🐳 Execução com Docker

### Pré-requisitos

* Docker Desktop
* Docker Compose

### Iniciar

```bash
cd docker
docker compose up --build
```

### Serviços

| Serviço    | URL                   |
| ---------- | --------------------- |
| Frontend   | http://localhost:3000 |
| Backend    | http://localhost:8080 |
| PostgreSQL | localhost:5432        |

### Parar

```bash
docker compose down
```

## 💻 Execução local

### Pré-requisitos

* JDK 17+
* Maven
* Node.js 18+
* npm

### Backend

```bash
cd backend
mvn clean spring-boot:run
```

API:

```text
http://localhost:8080
```

Ambiente local utiliza **H2 em memória**.

Console H2:

```text
http://localhost:8080/h2-console
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Aplicação:

```text
http://localhost:3000
```

## ⚙️ Scripts PowerShell

Para facilitar a execução no Windows:

```powershell
scripts\setup.ps1
scripts\start.ps1
```

| Script      | Função                    |
| ----------- | ------------------------- |
| `setup.ps1` | Instala as dependências   |
| `start.ps1` | Inicia backend e frontend |

## 🔧 Build do Frontend no Docker

Foi corrigido um problema de build relacionado às dependências `ajv` / `ajv-keywords`.

### Problema

O Docker utilizava:

```dockerfile
RUN npm install --legacy-peer-deps
```

sem um `package-lock.json` versionado, permitindo que o npm resolvesse diferentes versões das dependências.

Isso resultava no erro:

```text
Error: Cannot find module 'ajv/dist/compile/codegen'
```

### Solução

Foi adicionado e versionado o `package-lock.json`, permitindo uma instalação determinística:

```dockerfile
COPY package.json package-lock.json ./
RUN npm ci
```

Também foram realizados ajustes de lint e removidos **BOMs (Byte Order Mark)** desnecessários dos arquivos do projeto.

Com isso:

```bash
docker compose up --build
```

conclui corretamente o build das imagens de **backend** e **frontend**.

> **Boa prática:** sempre que uma dependência do frontend for adicionada ou atualizada, execute `npm install` e versione o `package-lock.json` junto com o `package.json`.

## 🔐 Configuração Docker

As principais variáveis utilizadas pelo backend são:

```env
SPRING_PROFILES_ACTIVE=docker
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/inframonitor
SPRING_DATASOURCE_USERNAME=inframonitor
SPRING_DATASOURCE_PASSWORD=inframonitor123
```

> Para ambientes reais, recomenda-se utilizar variáveis de ambiente ou secrets em vez de credenciais diretamente no `docker-compose.yml`.

## 📌 Status

**Projeto funcional e preparado para execução via Docker ou ambiente local.**

## 📄 Licença

Uso interno / educacional.
