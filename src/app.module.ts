import { Module } from '@nestjs/common';
import { CharactersModule } from './characters/characters.module';
import { BattleModule } from './battle/battle.module';

@Module({
  imports: [CharactersModule, BattleModule],
})
export class AppModule { }
