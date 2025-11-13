import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CharactersModule } from './characters/characters.module';
import { BattleModule } from './battle/battle.module';

@Module({
  imports: [CharactersModule, BattleModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
