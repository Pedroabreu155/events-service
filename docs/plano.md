# Migração para Arquitetura Hexagonal — Events Service

A migração reorganiza o projeto em **três camadas bem definidas**: Domain, Application e Infrastructure. O objetivo é inverter as dependências, removendo acoplamentos diretos entre lógica de negócio e detalhes de infraestrutura (Prisma, RabbitMQ, OTEL).

---

## User Review Required

> [!IMPORTANT]
> Esta migração é significativa: requer mover arquivos, criar novas abstrações e ajustar os módulos do NestJS. O fluxo funcional **não muda** — apenas a organizações das responsabilidades. Os testes E2E existentes continuarão válidos.

> [!WARNING]
> O `AllExceptionsFilter` tem dependência direta do `RabbitMQService` (envia payload inválido à DLQ). Na nova arquitetura, essa dependência será invertida via port `InvalidEventNotifier`. Isso é uma mudança comportamental sutil que precisa de atenção.

---

## Nova Estrutura de Pastas

```
src/
├── domain/                         # Núcleo da aplicação (sem dependências externas)
│   └── audit-event/
│       ├── audit-event.entity.ts   # [NEW] Entidade com regras e invariantes
│       ├── audit-event.types.ts    # [NEW] Value objects: Severity, Result
│       └── ports/
│           ├── audit-event-repository.port.ts  # [NEW] Port de saída → DB
│           └── event-publisher.port.ts         # [NEW] Port de saída → Queue
│
├── application/                    # Casos de uso (orquestra domain + ports)
│   └── use-cases/
│       └── create-audit-event/
│           ├── create-audit-event.use-case.ts  # [NEW] Use case principal
│           └── create-audit-event.dto.ts       # [NEW] Input DTO do use case
│
├── infra/                          # Adapters de saída (implementações concretas)
│   ├── opentelemetry/              # [KEEP] sem mudanças
│   ├── rabbitmq/
│   │   ├── rabbitmq.service.ts     # [KEEP] sem mudanças
│   │   ├── setup.ts                # [KEEP] sem mudanças
│   │   └── rabbitmq-event-publisher.adapter.ts  # [NEW] implements EventPublisherPort
│   └── database/
│       ├── prisma/
│       │   └── prisma.service.ts   # [MOVE] de src/v1/prisma/ para cá
│       └── prisma-audit-event-repository.adapter.ts  # [NEW] implements AuditEventRepositoryPort
│
├── v1/                             # Adapters de entrada (HTTP + queue consumer)
│   ├── auth/                       # [KEEP] sem mudanças
│   ├── events/
│   │   ├── events.module.ts        # [MODIFY] injeta use case + adapters via tokens
│   │   ├── post-event.controller.ts  # [MODIFY] delega ao use case, remove OTEL manual
│   │   └── events.consumer.ts      # [MODIFY] delega ao use case, remove Prisma direto
│   └── interfaces/                 # [KEEP] Zod schemas, types, DTOs
│
├── filters/
│   └── exceptions.ts               # [MODIFY] recebe port InvalidEventNotifier (opcional)
├── env/                            # [KEEP] sem mudanças
├── logger/                         # [KEEP] sem mudanças
├── middlewares/                    # [KEEP] sem mudanças
└── pipes/                          # [KEEP] sem mudanças
```

---

## Proposed Changes

### Domain Layer

#### [NEW] `audit-event.entity.ts`
Entidade `AuditEvent` com propriedades tipadas e um método de fábrica estático `create()` que centraliza as regras de construção (ex: validar que `timestamp` é uma data válida, normalizar campos). Elimina o mapeamento espalhado pelo consumer.

#### [NEW] `audit-event.types.ts`
Value objects como enums TypeScript puros:
```typescript
export enum Severity { HIGH = 'HIGH', MEDIUM = 'MEDIUM', LOW = 'LOW' }
export enum Result { SUCCESS = 'SUCCESS', FAILURE = 'FAILURE' }
```
> Estes substituem `src/v1/interfaces/enums.ts` (o arquivo original pode ser mantido redirecionando ou eliminado).

#### [NEW] `audit-event-repository.port.ts`
```typescript
export abstract class AuditEventRepositoryPort {
  abstract save(event: AuditEvent): Promise<void>
}
```

#### [NEW] `event-publisher.port.ts`
```typescript
export abstract class EventPublisherPort {
  abstract publish(event: AuditEvent): Promise<void>
  abstract publishToDlq(payload: FailedEventPayload): Promise<void>
}
```

---

### Application Layer

#### [NEW] `create-audit-event.use-case.ts`
Recebe `EventPublisherPort` injetado. Responsabilidade: publicar o evento na fila (ação rápida, sync com o HTTP).

```typescript
@Injectable()
export class CreateAuditEventUseCase {
  constructor(
    @Inject(EVENT_PUBLISHER_PORT)
    private readonly publisher: EventPublisherPort,
  ) {}

  async execute(dto: CreateAuditEventDto): Promise<void> {
    const event = AuditEvent.create(dto)
    await this.publisher.publish(event)
  }
}
```

**Segundo use case implícito**: `PersistAuditEventUseCase` — chamado pelo consumer para salvar no banco.

---

### Infrastructure Adapters

#### [NEW] `rabbitmq-event-publisher.adapter.ts`
Implementa `EventPublisherPort` usando `RabbitMQService` internamente. O controller não vai mais conhecer o RabbitMQ diretamente.

#### [NEW] `prisma-audit-event-repository.adapter.ts`
Implementa `AuditEventRepositoryPort`. Contém o mapeamento `AuditEvent → Prisma data`. O consumer não vai mais conhecer o Prisma diretamente.

#### [MOVE] `prisma.service.ts`
De `src/v1/prisma/` → `src/infra/database/prisma/` (organização mais correta dentro da camada de infra).

---

### Input Adapters (v1/)

#### [MODIFY] `post-event.controller.ts`
- Remove imports de OTEL (tracer, meter, histogram)
- Injeta `CreateAuditEventUseCase` no lugar de `RabbitMQService`
- O span OTEL pode ser mantido via interceptor separado (sugestão futura) ou removido

#### [MODIFY] `events.consumer.ts`
- Remove import de `PrismaService`
- Injeta `PersistAuditEventUseCase` (ou reutiliza `AuditEventRepositoryPort` diretamente)
- Delega o mapeamento para a entidade/use case

#### [MODIFY] `events.module.ts`
Configura os bindings via tokens de injeção:
```typescript
{
  provide: AUDIT_EVENT_REPOSITORY_PORT,
  useClass: PrismaAuditEventRepositoryAdapter,
},
{
  provide: EVENT_PUBLISHER_PORT,
  useClass: RabbitMQEventPublisherAdapter,
}
```

---

### Fixes incluídos na migração

| # | Fix | Onde |
|---|---|---|
| 6 | Remover registro duplicado de `PrismaService` e `RabbitMQService` | `AppModule` e `EventsModule` |
| 8 | Corrigir typo `opentelemtry.service.ts` → `opentelemetry.service.ts` | `src/infra/opentelemetry/` |

---

## Open Questions

> [!IMPORTANT]
> **Q1: OTEL no Controller** — O tracing manual (span + histogram) dentro do controller é um cross-cutting concern. Pretendemos:
> - (A) Manter como está no controller (mais simples)
> - (B) Mover para um `@Interceptor` NestJS (mais limpo, mas adiciona complexidade)
> - (C) Remover e deixar somente o middleware HTTP + auto-instrumentation do SDK OTEL

> [!IMPORTANT]
> **Q2: `AllExceptionsFilter` + DLQ** — O filter global que envia payload inválido para a DLQ tem dependência de infra. Pretendemos:
> - (A) Manter como está (pragmático, não viola domain, é infra → infra)
> - (B) Criar um port `InvalidEventNotifier` e injetar o adapter no filter

> [!IMPORTANT]
> **Q3: Testes unitários** — Deseja incluir na migração a criação de testes unitários para os use cases (com mocks dos ports)? Isso seria o maior benefício visível da nova arquitetura.

---

## Verification Plan

### Automated Tests
```bash
# Testes E2E existentes devem continuar passando sem nenhuma mudança
npx vitest run --config vitest.config.e2e.mts
```

### Manual Verification
- Servidor inicia sem erros (`npm run start:dev`)
- `POST /v1/audit/events` com payload válido → retorna 201 e persiste no banco
- `POST /v1/audit/events` com payload inválido → retorna 400 e envia para DLQ
- `GET /v1/health` → retorna 200
- Verificar no Jaeger que os spans continuam funcionando
