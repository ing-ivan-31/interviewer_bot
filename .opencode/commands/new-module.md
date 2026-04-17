---
description: Scaffold a new NestJS module following the Repository Pattern. Usage: /new-module <module-name>
agent: general
---

# Scaffold NestJS Module: $ARGUMENTS

Create a new NestJS module named `$ARGUMENTS` following the Repository Pattern.

## Step 1 — Determine paths
The actual project paths are:
- Backend: `src/interviewer-evaluator-api/`
- Modules: `src/interviewer-evaluator-api/src/`

## Step 2 — Generate base files with NestJS CLI
```bash
cd src/interviewer-evaluator-api
nest g module $ARGUMENTS --no-spec
nest g controller $ARGUMENTS --no-spec
nest g service $ARGUMENTS --no-spec
```

## Step 3 — Create the repository file
Create `src/interviewer-evaluator-api/src/$ARGUMENTS/$ARGUMENTS.repository.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ${PascalCase}Repository {
  constructor(private readonly prisma: PrismaService) {}

  // Add query methods here — all Prisma calls for this module
}
```

## Step 4 — Create DTO files
Create `src/interviewer-evaluator-api/src/$ARGUMENTS/dto/create-$ARGUMENTS.dto.ts`:
```typescript
import { IsString } from 'class-validator';

export class Create${PascalCase}Dto {
  @IsString()
  name: string;
}
```

Create `src/interviewer-evaluator-api/src/$ARGUMENTS/dto/update-$ARGUMENTS.dto.ts`:
```typescript
import { PartialType } from '@nestjs/mapped-types';
import { Create${PascalCase}Dto } from './create-$ARGUMENTS.dto';

export class Update${PascalCase}Dto extends PartialType(Create${PascalCase}Dto) {}
```

## Step 5 — Wire up the module
Update `src/interviewer-evaluator-api/src/$ARGUMENTS/$ARGUMENTS.module.ts`:
```typescript
import { Module } from '@nestjs/common';
import { ${PascalCase}Controller } from './$ARGUMENTS.controller';
import { ${PascalCase}Service } from './$ARGUMENTS.service';
import { ${PascalCase}Repository } from './$ARGUMENTS.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [${PascalCase}Controller],
  providers: [${PascalCase}Service, ${PascalCase}Repository],
  exports: [${PascalCase}Service, ${PascalCase}Repository],
})
export class ${PascalCase}Module {}
```

## Step 6 — Inject repository into service
Update `src/interviewer-evaluator-api/src/$ARGUMENTS/$ARGUMENTS.service.ts`:
```typescript
import { Injectable } from '@nestjs/common';
import { ${PascalCase}Repository } from './$ARGUMENTS.repository';

@Injectable()
export class ${PascalCase}Service {
  constructor(private readonly ${camelCase}Repository: ${PascalCase}Repository) {}
}
```

## Step 7 — Register in AppModule
Read `src/interviewer-evaluator-api/src/app.module.ts` and add `${PascalCase}Module` to the `imports` array.

## Step 8 — Confirm
List all created files and show the final module registered in AppModule.