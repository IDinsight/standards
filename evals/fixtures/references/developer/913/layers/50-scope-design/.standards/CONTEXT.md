# Project Context

## Project Baseline

- `members-api`: NestJS 11 API in TypeScript behind the volunteer portal. It
  serves a health check and email/password login backed by an in-memory member
  store. Runs as a single process; no database or shared cache.

## Stack and Tooling

- Node.js, TypeScript (CommonJS output, decorators with
  `emitDecoratorMetadata`), NestJS 11 on `@nestjs/platform-express`, pnpm.
- `package.json` lists `@nestjs/throttler` ^6.4.0; no module imports or
  configures it yet.

## Structure and Boundaries

- `src/main.ts`: bootstrap; listens on `PORT` (default 3000).
- `src/app.module.ts`: root module; imports `UsersModule` and `AuthModule` and
  declares `HealthController`.
- `src/auth/auth.module.ts`, `src/auth/auth.controller.ts`,
  `src/auth/auth.service.ts`: `POST /auth/login` (HTTP 200) delegates to
  `AuthService.login`, which throws `UnauthorizedException` (401) for an
  unknown email or a wrong password.
- `src/users/`: `UsersService`, an in-memory member store with scrypt password
  hashes.

## Commands

- `pnpm install`: install dependencies (needs package registry access).
- `pnpm run build`: `tsc -p tsconfig.build.json` into `dist/`.
- `pnpm test`: Jest with ts-jest over `src/**/*.spec.ts`.

## Conventions and Constraints

- No global guards, interceptors, or pipes are registered in `src/main.ts` or
  `AppModule`.
- Request DTOs are plain classes; no validation pipe is configured.

## Testing and Verification Baseline

- `src/auth/auth.service.spec.ts` unit-tests `AuthService.login` (valid
  credentials, wrong password, unknown email). There are no HTTP-level tests
  and no `@nestjs/testing` dependency.
- This checkout has no `node_modules`, and the package registry is not
  reachable from it, so `pnpm run build` and `pnpm test` cannot run here.

## Relevant Existing Behavior

- Login responds 200 with `accessToken` and `memberId`, or 401
  `Invalid email or password`. Downstream work must preserve both.

## Evidence

- `package.json`, `tsconfig.json`, `src/app.module.ts`, `src/auth/`,
  `src/users/`, `README.md`.
