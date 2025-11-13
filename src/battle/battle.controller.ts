import { Controller, Post, Body } from '@nestjs/common';
import { BattleService, BattleResult } from './battle.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Battle')
@Controller('api/v1/battle')
export class BattleController {
    constructor(private readonly battleService: BattleService) { }

    @Post()
    @ApiOperation({ summary: 'Simulate a battle between two characters' })
    @ApiResponse({
        status: 201,
        description: 'Battle completed successfully',
        content: {
            'application/json': {
                example: {
                    log: [
                        "Battle between HeroA (Warrior) - 20 HP and HeroB (Mage) - 15 HP begins!",
                        "HeroA (3) was faster than HeroB (2) and attacks first.",
                        "HeroA hits HeroB for 5. HeroB now has 10 HP.",
                        "HeroB hits HeroA for 4. HeroA now has 16 HP.",
                        "HeroA (4) was faster than HeroB (1) and attacks first.",
                        "HeroA hits HeroB for 11. HeroB now has 0 HP.",
                        "HeroA wins the battle with 16 HP left!"
                    ],
                    winner: {
                        id: "uuid-hero-a",
                        name: "HeroA",
                        level: 1,
                        health: { current: 16, max: 20 },
                        status: "alive",
                        job: "Warrior",
                        stats: {
                            healthPoints: 20,
                            strength: 8,
                            dexterity: 5,
                            intelligence: 3
                        },
                        createdAt: "2025-11-13T03:51:25.342Z",
                        attackFormula: "0.8 * strength + 0.2 * dexterity",
                        speedFormula: "0.5 * dexterity + 0.1 * strength"
                    },
                    loser: {
                        id: "uuid-hero-b",
                        name: "HeroB",
                        level: 1,
                        health: { current: 0, max: 15 },
                        status: "dead",
                        job: "Mage",
                        stats: {
                            healthPoints: 15,
                            strength: 4,
                            dexterity: 6,
                            intelligence: 10
                        },
                        createdAt: "2025-11-13T03:51:11.354Z",
                        attackFormula: "0.2 * strength + 0.2 * dexterity + 1.2 * intelligence",
                        speedFormula: "0.4 * dexterity + 0.1 * strength"
                    }
                }
            }
        }
    })
    @ApiResponse({ status: 400, description: 'Invalid characters or jobs' })
    @ApiResponse({ status: 404, description: 'Character not found' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                characterId1: { type: 'string', example: '' },
                characterId2: { type: 'string', example: '' },
            },
            required: ['characterId1', 'characterId2'],
        },
    })
    async createBattle(
        @Body() body: { characterId1: string; characterId2: string },
    ): Promise<BattleResult> {
        const { characterId1, characterId2 } = body;
        return this.battleService.battle(characterId1, characterId2);
    }
}
