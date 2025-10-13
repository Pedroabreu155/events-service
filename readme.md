# Audit Service

Este é o **Audit Service**, um serviço para registro de eventos e auditorias, desenvolvido com NestJS, Prisma e instrumentado com OpenTelemetry.

## Pré-requisitos

Antes de começar, certifique-se de ter as seguintes ferramentas instaladas:

- Node.js (versão 18 ou superior)
- Docker e Docker Compose
- npm ou yarn

## Instalação

1. Clone o repositório:

   ```git clone https://github.com/Trouw-Tecnologia/trouw-ms-audit-service```

   ```cd audit-service```

2. Instale as dependências:

   ```npm install```

3. Configure as variáveis de ambiente:

   Crie um arquivo `.env` na raiz do projeto com base no .env.example abaixo

## Executando o projeto em ambiente de desenvolvimento

1. Suba os serviços necessários (PostgreSQL, RabbitMQ, Redis, Jaeger, Prometheus e OpenTelemetry Collector) usando o Docker Compose:

   ``docker-compose up -d``

2. Gere o cliente Prisma:

   ``npx prisma generate``

3. Execute as migrações do banco de dados:

   ``npx prisma migrate dev``

4. Inicie o servidor em modo de desenvolvimento:

   ``npm run start:dev``

5. Acesse a documentação da API no Swagger em: http://localhost:3333/docs

6. Acesse os traces da execução na UI do Jagger em: http://localhost:16686

5. Acesse as métricas na UI do Prometheus em: http://localhost:9090

## Scripts disponíveis

- `npm run build`: Compila o projeto para produção.
- `npm run start`: Inicia o servidor em modo de produção.
- `npm run start:dev`: Inicia o servidor em modo de desenvolvimento.
- `npm run start:debug`: Inicia o servidor em modo de depuração.
- `npm run lint`: Executa o ESLint para verificar problemas no código.
- `npm run format`: Formata o código usando Prettier.
- `npm run test`: Executa os testes unitários.
- `npm run test:watch`: Executa os testes em modo de observação.
- `npm run test:cov`: Executa os testes e gera um relatório de cobertura.
- `npm run test:e2e`: Executa os testes de integração (E2E).

## Testes

### Testes Unitários

Para rodar os testes unitários:

   ``npm run test``

### Testes de Integração (E2E)

Para rodar os testes de integração:

   ``npm run test:e2e``

## Estrutura do Projeto

- **src/**: Código-fonte principal do projeto.
  - **env/**: Configuração de variáveis de ambiente.
  - **filters/**: Filtros de exceções globais.
  - **infra/**: Camadas externas ao contexto do app.
    - **opentelemetry/**: Módulo global que instrumenta a aplicação para ter observabilidade
  - **logger/**: Módulo global do logger da aplicação.  
  - **middlewares/**: Middlewares globais.
  - **pipes/**: Pipes de validação.  
  - **v1/**: Implementação da versão 1 da API.
    - **auth/**: Guardas de autenticação.
    - **events/**: Controladores e módulos relacionados a eventos.
    - **interfaces/**: Schemas e DTOs.
    - **prisma/**: Serviço do Prisma.
- **prisma/**: Arquivos relacionados ao Prisma, como o schema e migrações.
- **http/**: Exemplos de requisições HTTP para testes.
- **observability/**: Arquivos de configurações da stack de observabilidade.

## Observabilidade

O projeto utiliza OpenTelemetry para rastreamento distribuído. Certifique-se de que o OpenTelemetry Collector, Prometheus e o Jaeger estejam rodando para visualizar os traces e métricas.