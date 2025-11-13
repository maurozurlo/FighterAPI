import { Controller, Post, Body } from '@nestjs/common';
import { BattleService } from './battle.service';
import { BattleResult } from './battle.service';

@Controller('api/v1/battle')
export class BattleController {
    constructor(private readonly battleService: BattleService) { }
    @Post()
    async createBattle(
        @Body() body: { characterId1: string; characterId2: string }
    ): Promise<BattleResult> {
        {
            const { characterId1, characterId2 } = body;
            return this.battleService.battle(characterId1, characterId2);
        }
    }
}