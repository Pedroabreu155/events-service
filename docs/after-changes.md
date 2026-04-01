# Entendendo a Arquitetura Hexagonal no Seu Projeto

Olá! Baseado nas alterações realizadas na sua base de código (visíveis através das pastas recém-criadas `domain`, `application` e `infra`), o projeto `events-service` passou por uma reestruturação para seguir a **Arquitetura Hexagonal** (também conhecida como *Ports and Adapters*). 

O principal objetivo dessa arquitetura é **isolar as regras de negócio** de tecnologias e frameworks externos (como banco de dados, filas e APIs web).

Abaixo, detalho como o seu projeto foi reorganizado para incorporar esse padrão.

---

## 1. O que é a Arquitetura Hexagonal?

A ideia central é que a **sua regra de negócio deve ser o centro (o "núcleo") da sua aplicação**. Ela não deve saber se os dados vêm de uma API REST, de uma fila RabbitMQ ou de um banco PostgreSQL via Prisma.

Para alcançar isso, separamos o código em camadas principais:
- **Domain (Domínio):** O coração. Onde ficam as entidades e as regras puras.
- **Application (Aplicação):** Onde ficam os Casos de Uso (Use Cases). É a orquestração do negócio.
- **Infrastructure (Infraestrutura):** Onde o código se comunica com o mundo externo (banco de dados, filas do RabbitMQ, APIs externas).
- **Primary/Driving Adapters (Entradas da aplicação):** Módulos que recebem os dados e repassam para a aplicação (ex: Controllers e Consumers).

> [!TIP]
> Pense no "Hexágono" como uma forma geométrica com vários lados, permitindo conectar diferentes adaptadores (bancos, filas, telas) nas suas "portas", sem alterar o que está dentro.

---

## 2. Como isso ficou no seu projeto? (Camada por Camada)

### 🥑 O Coração: Camada de Domínio (`src/domain/`)
Aqui você tem a pasta `audit-event`, contendo:
- **`audit-event.entity.ts`**: Define a entidade principal do sistema. Aqui ficam as regras relacionadas apenas a um evento de auditoria, sem depender de banco de dados ou controllers.
- **`ports/`**: Define os **contratos (interfaces)**. São as "Portas" da arquitetura. Por exemplo, podem ditar: *"Eu preciso de alguém que salve esse evento em um banco"*, mas **não detalha como** isso será salvo.

### ⚙️ Os Casos de Uso: Camada de Aplicação (`src/application/use-cases/`)
É aqui que o fluxo da aplicação acontece:
- O Caso de Uso (ex: `process-event.use-case.ts`) recebe um comando, interage com a Entidade do Domínio para validações de negócio, e usa as "Portas" (interfaces de repositório de banco ou serviço mensageria) para interagir com o ambiente externo.
- Essa camada **também não sabe** que você usa o Prisma ou o RabbitMQ, ela só conhece os contratos (Portas).

### 🔌 O Mundo Externo: Camada de Infraestrutura (`src/infra/`)
É onde implementamos as Portas definidas pelo Domínio. Isso é chamado de **Adaptadores**.
- **`database/`**: Implementações reais de salvamento de dados usando o Prisma (ex: `PrismaEventRepository`). 
- **`rabbitmq/`**: Adaptadores como `rabbitmq-event-publisher.adapter.ts`. Se no futuro você quiser trocar de RabbitMQ para AWS SQS ou Kafka, muda apenas os arquivos da pasta de infraestrutura e a regra de negócio continuará intacta!

### 🚪 A Entrada: Primary Adapters (`src/v1/events/`)
Essa é a parte que recebe as informações injetando no sistema:
- **`post-event.controller.ts`**: Recebe requisições HTTP REST (vindas de um client) e repassa os dados para o Caso de Uso correspondente.
- **`events.consumer.ts`**: Fica escutando as filas do RabbitMQ e, quando chega uma mensagem, chama um Caso de Uso.

---

## 3. O Fluxo de Dados na Arquitetura Hexagonal

O caminho que um dado faz hoje segue um fluxo mais protegido de dependências:

1. **Entrada:** Um sistema envia uma requisição `POST /v1/events/post` (ou uma mensagem na fila). O **Controller / Consumer** (`src/v1/events/`) a intercepta.
2. **Processamento:** O Controller limpa/valida o input básico e envia para o **Use Case** da Aplicação (`src/application/`).
3. **Regra de Negócio:** O Use Case instancia a **Entity** (`src/domain/`), aplicando a lógica pura de domínio.
4. **Persistência / Saída:** O Use Case usa uma **Porta** (interface) para salvar no banco. Na prática, o framework de Injeção de Dependências (NestJS) entrega o **Repositório Prisma** instanciado (`src/infra/database/`) para cumprir esse contrato, que executa a Query real no banco sem que a aplicação se acople ao Prisma.

> [!IMPORTANT]
> **O principal mecanismo de segurança é a Injeção de Dependência.** Você não importa e instancia a classe `PrismaService` ou o repositório concreto direito nos seus Casos de Uso. Você importa o contrato da Porta! Nas configurações (ex: `events.module.ts`), você ensina sua aplicação a injetar o adaptador certo para aquele ambiente.

## Dúvidas?
Se quiser que eu inspecione a fundo a lógíca de alguma classe específica dessas novas pastas ou te mostre exemplos práticos baseados no seu próprio código atual, me avise!
