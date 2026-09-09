# InfraMonitor

Sistema de Monitoramento de Infraestrutura de TI, com backend em **Spring Boot** e frontend em **React + Material UI**.

## Stack

| Camada     | Tecnologia                                      |
|------------|--------------------------------------------------|
| Frontend   | React 18, React Router 6, MUI 5, Axios, Chart.js  |
| Backend    | Spring Boot 3.1.5 (Java 17), Spring Data JPA, Spring Security |
| Banco      | PostgreSQL 15 (produção/Docker) / H2 (dev local)  |
| Infra      | Docker + Docker Compose                           |

## Estrutura do projeto

```
inframonitor/
├── backend/          # API Spring Boot
├── frontend/         # SPA React
├── docker/           # docker-compose.yml
├── scripts/          # scripts PowerShell de setup/start (Windows)
└── README.md
```

## Como rodar com Docker (recomendado)

Pré-requisitos: Docker Desktop instalado e em execução.

```bash
cd docker
docker compose up --build
```

Serviços expostos:
- Frontend: http://localhost:3000
- Backend (API): http://localhost:8080
- PostgreSQL: localhost:5432 (usuário/senha/banco: `inframonitor`)

Para derrubar o ambiente:

```bash
docker compose down
```

## Como rodar localmente (sem Docker)

Pré-requisitos: JDK 17+, Maven, Node.js 18+ e npm.

### Backend

```bash
cd backend
mvn clean spring-boot:run
```

A API sobe em `http://localhost:8080`, usando o perfil padrão (H2 em memória — console em `http://localhost:8080/h2-console`).

### Frontend

```bash
cd frontend
npm install
npm start
```

A aplicação abre em `http://localhost:3000`.

### Scripts PowerShell (Windows)

Como atalho para o fluxo local, há dois scripts em `scripts/`:

```powershell
scripts\setup.ps1   # instala dependências de backend e frontend
scripts\start.ps1   # sobe backend e frontend em janelas separadas
```

## Correção aplicada (build do frontend falhando no Docker)

O build do serviço `frontend` estava falhando dentro do Docker com o erro:

```
Error: Cannot find module 'ajv/dist/compile/codegen'
```

**Causa:** o `Dockerfile` do frontend rodava `npm install --legacy-peer-deps` sem nenhum `package-lock.json` versionado. Sem o lockfile, o `npm` resolvia uma árvore de dependências onde a lib `ajv` (usada internamente pelo Webpack/`react-scripts`) ficava em uma versão incompatível com o `ajv-keywords` exigido no build, quebrando o `npm run build`.

**Correção:**
1. Foi gerado e versionado o arquivo `frontend/package-lock.json`, fixando uma árvore de dependências válida e testada (build local reproduzido com sucesso).
2. O `frontend/Dockerfile` passou a usar `npm ci` (instalação determinística a partir do lockfile) no lugar de `npm install --legacy-peer-deps`:

   ```dockerfile
   COPY package.json package-lock.json ./
   RUN npm ci
   ```

3. Pequenos avisos de lint em `src/App.js` e `src/index.js` também foram corrigidos (BOM no início dos arquivos e imports não utilizados de `react-router-dom`/`@mui/icons-material`).
4. BOM (Byte Order Mark) também removido de `pom.xml`, das classes Java do backend e do `docker-compose.yml`, por boa prática — não causava o erro, mas evita problemas de parsing em outras ferramentas.

Com isso, `docker compose up --build` volta a concluir o build das duas imagens (`backend` e `frontend`) sem erros.

> Dica para evitar regressão: sempre que adicionar ou atualizar uma dependência do frontend, rode `npm install` localmente e comite o `package-lock.json` atualizado junto com o `package.json`.

## Variáveis de ambiente (perfil Docker)

Definidas em `docker/docker-compose.yml` para o serviço `backend`:

| Variável                     | Valor no Docker                                  |
|------------------------------|---------------------------------------------------|
| `SPRING_PROFILES_ACTIVE`     | `docker`                                           |
| `SPRING_DATASOURCE_URL`      | `jdbc:postgresql://postgres:5432/inframonitor`     |
| `SPRING_DATASOURCE_USERNAME` | `inframonitor`                                     |
| `SPRING_DATASOURCE_PASSWORD` | `inframonitor123`                                  |

## Licença

Uso interno / educacional.
