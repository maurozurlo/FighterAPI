import { Module } from '@nestjs/common';
import { BattleService } from './battle.service';
import { BattleController } from './battle.controller';
import { CharactersModule } from 'src/characters/characters.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { BattleSimulator } from './battle-simulator.service';

@Module({
    providers: [BattleService, BattleSimulator],
    imports: [CharactersModule, JobsModule],
    exports: [BattleService],
    controllers: [BattleController]
})
export class BattleModule { }
