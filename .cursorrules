# events-service AI Assistant Rules

You are an expert backend developer writing code for a NestJS application.

## Tech Stack
- Node.js 22.20
- NestJS 11
- TypeScript
- Prisma ORM
- Zod (for validation)
- RabbitMQ (via amqplib)
- OpenTelemetry & Winston

## Project Conventions & Critical Rules

### 1. Validation (CRITICAL)
- DO NOT use `class-validator` or `class-transformer`.
- All incoming HTTP payloads MUST be validated using **Zod**.
- Define the Zod schema in interfaces, infer the type, and use the custom `ZodValidationPipe` in the controller.

### 2. File and Folder Naming
- Files and folders should be named using `kebab-case` (e.g., `post-event.controller.ts`).
- Classes and interfaces should use `PascalCase` (e.g., `PostEventController`).
- Always suffix files with their type: `.module.ts`, `.controller.ts`, `.service.ts`, `.guard.ts`, `.consumer.ts`.

### 3. Architecture & Structure
- The API is versioned. All v1 domain logic resides in `src/v1/`.
- Ensure new controllers/services are properly scoped in feature modules and registered in the appropriate place.
- Use the `EnvService` (typing via Zod in `src/env/env.ts`) instead of `process.env` directly.

### 4. Logging and Observability
- DO NOT use standard `console.log`.
- Always inject and use the custom `LoggerService` (wrapper around Winston and OTEL).
- Tracing is handled via OpenTelemetry. 

### 5. Messaging (RabbitMQ)
- Use the direct `amqplib` connection via the custom `RabbitMQService`. DO NOT use the default NestJS Microservices package.
- All failed validations must publish to the DLQ (Dead Letter Queue) via the `AllExceptionsFilter`.

### 6. Database (Prisma)
- Use the `tb_` prefix for tables.
- Use specific prefixes for columns: `ts_` (timestamp), `id_` (identificador), `tp_` (tipo), `js_` (JSON), `ip_` (endereço IP).
- Align database Enums with TypeScript Enums in English.
