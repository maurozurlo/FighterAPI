# Take Home Assignment NEO

A small NestJS-based turn-based battle simulator and character/job modeler.

This project models characters with jobs (Warrior, Thief, Mage) and simulates battles using job-specific formulas for attack and speed. It uses an in-memory repository for characters and evaluates job formulas at runtime using mathjs.

## Quick start

1. Install dependencies

```powershell
npm install
```

2. Start the dev server (hot reload)

```powershell
npm run start:dev
```

3. Run tests

```powershell
npm run test
npm run test:e2e
npm run test:cov
```

## Architecture & important files

- `src/app.module.ts` — root module; imports `CharactersModule` and `BattleModule` (main boundaries).
- `src/main.ts` — application entry; sets a global `ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })`.
- `src/characters` — character DTOs, models, controller and the `CharacterRepository` abstraction.
- `src/characters/repositories/in-memory-character.repository.ts` — current persistence implementation (in-memory).
- `src/jobs/constants/jobs.data.ts` — canonical job data (stats, attackFormula, speedFormula).
- `src/battle` — battle service and `BattleSimulator` which executes turns and logs results.
- `src/battle/utils/formula.util.ts` — evaluates formula strings with `mathjs`.

## API (examples)

Base path: `/api/v1`

- Create a character

  POST /api/v1/character

  Body (JSON):
  ```json
  {
    "name": "Link",
    "job": "Warrior"
  }
  ```

- List characters

  GET /api/v1/character

- Get character details (includes job formulas)

  GET /api/v1/character/:id

- Run a battle between two characters

  POST /api/v1/battle

  Body (JSON):
  ```json
  {
    "characterId1": "<id-1>",
    "characterId2": "<id-2>"
  }
  ```

  Response: `BattleResult` containing `log`, `winner`, and `loser` objects.

## Formulas and randomness

- Job attack/speed formulas are plain arithmetic strings (e.g. `0.8 * strength + 0.2 * dexterity`) stored in `src/jobs/constants/jobs.data.ts`.
- `computeFormula` in `src/battle/utils/formula.util.ts` uses `mathjs.evaluate(formula, stats)` and must return a number. If you change formula syntax, update this utility and related tests.
- `BattleSimulator` uses `Math.random()` to determine speed and damage. For deterministic tests, mock `Math.random()` or refactor the simulator to accept an injectable RNG function.

## Project conventions & tips for contributors

- Dependency Injection: the characters repository is injected using the token `'CharacterRepository'`. Keep this token when adding other implementations (e.g. a DB-backed repository) to avoid breaking DI consumers.
- Validation: Because the app uses `ValidationPipe` with `whitelist` and `forbidNonWhitelisted`, DTOs must be accurate — extra fields are rejected.
- Testing: Jest + ts-jest are configured. Unit tests live next to services (e.g. `*.spec.ts`). To write deterministic battle tests, stub `Math.random()`.

## Adding a new Job

1. Update `src/jobs/constants/jobs.data.ts` with a new `Job` object (include `attackFormula` and `speedFormula`).
2. Ensure the formulas reference `strength`, `dexterity`, and/or `intelligence` and evaluate to numeric values.
3. If needed, update any DTOs or consumers that assume a fixed set of job names.

## Scripts

- `npm run start:dev` — start in watch mode
- `npm run build` — compile
- `npm run start:prod` — run compiled output
- `npm run test` — run unit tests
- `npm run test:e2e` — run e2e tests
- `npm run test:cov` — coverage
- `npm run lint` — lint and auto-fix where possible

## Where to start reading the code

- Begin with `src/main.ts` to see global configuration.
- Inspect `src/characters/characters.service.ts` to see how characters are created and validated.
- Read `src/battle/battle-simulator.service.ts` to understand combat flow and where randomness is applied.

## Questions or next steps

If you'd like, I can:

1. Add a short example test that mocks `Math.random()` to make `BattleSimulator` deterministic.
2. Add a Postman/HTTPie examples section with full requests and expected responses.

Pull requests and improvements are welcome — open an issue or a PR describing the change.
