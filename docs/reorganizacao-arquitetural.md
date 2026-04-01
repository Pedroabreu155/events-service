# Reorganização Arquitetural: Remoção da pasta `v1/`

Este documento detalha as mudanças realizadas na estrutura de pastas do projeto `events-service` para melhor alinhamento com os princípios da Arquitetura Hexagonal.

## Motivação
Anteriormente, a pasta `src/v1/` misturava responsabilidades de várias camadas (Domínio, Infraestrutura HTTP e Infraestrutura de Mensageria) sob um único guarda-chuva de versionamento. Na Arquitetura Hexagonal, a estrutura de pastas deve refletir a natureza do componente, sendo o versionamento da API uma preocupação específica apenas da camada de entrada HTTP.

## Mudanças Realizadas

### 1. Camada de Domínio (`src/domain/audit-event/`)
- **Schemas**: `v1/interfaces/schemas.ts` → `domain/audit-event/audit-event.schema.ts`.
- **Tipos e Enums**: O conteúdo de `v1/interfaces/types.ts` e `v1/interfaces/enums.ts` foi unificado em `domain/audit-event/audit-event.types.ts`. Isso centraliza a definição da entidade e seus payloads em um único lugar próximo à lógica de negócio.

### 2. Camada de Infraestrutura HTTP (`src/infra/http/`)
- **Controllers**: O `PostEventController` foi movido para `src/infra/http/post-event.controller.ts`.
- **Guards**: O `ApiKeyGuard` foi movido para `src/infra/http/guards/api-key.guard.ts`.
- **DTOs**: O `EventPayloadDto` foi movido para `src/infra/http/dtos/post-event.dto.ts`.

### 3. Camada de Infraestrutura RabbitMQ (`src/infra/rabbitmq/`)
- **Consumers**: O `EventsConsumer` foi movido para esta pasta, consolidando todos os adapters de mensageria em um único local.

### 4. Módulo Central (`src/events.module.ts`)
- O `EventsModule` foi movido para a raiz de `src/events.module.ts` para orquestrar a injeção entre infra e aplicação.

> [!IMPORTANT]
> **Compatibilidade de API:** O prefixo `/v1` foi mantido nos decorators `@Controller('/v1/audit/events')`, garantindo que não haja impacto para os clientes que consomem a API.

## Novo Fluxo de Dependências
Abaixo, a nova hierarquia simplificada (seguindo Ports and Adapters):

```text
src/
├── domain/ (Coração: regras, entidades, schemas)
├── application/ (Orquestração: use cases)
├── infra/ (Tecnologia: http, database, rabbitmq)
│   ├── http/ (Adapter de Entrada HTTP)
│   ├── database/ (Adapter de Saída DB)
│   └── rabbitmq/ (Adapters de Entrada/Saída Mensageria)
└── events.module.ts (Wiring / Injeção)
```

## Benefícios
- **Separação de Preocupações**: Se amanhã decidirmos lançar um `/v2`, a mudança ocorre no Controller em `infra/http/`, sem precisar reorganizar todo o domínio.
- **Clareza**: Mais fácil de localizar arquivos por sua função técnica no sistema.
- **Escalabilidade**: Estrutura pronta para receber novos módulos de infraestrutura sem poluir a camada de domínio.
