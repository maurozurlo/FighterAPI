import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { CharactersService } from '../characters/characters.service';
import { JobsService } from '../jobs/jobs.service';
import { BattleSimulator } from './battle-simulator.service';
import { Character } from '../characters/models/character.model';

export interface BattleResult {
    log: string[];
    winner: Character;
    loser: Character;
}

@Injectable()
export class BattleService {
    constructor(
        private readonly charactersService: CharactersService,
        private readonly jobsService: JobsService,
        private readonly simulator: BattleSimulator,
    ) { }

    async battle(characterId1: string, characterId2: string): Promise<BattleResult> {
        const character1 = this.charactersService.findOne(characterId1);
        const character2 = this.charactersService.findOne(characterId2);

        if (!character1 || !character2)
            throw new NotFoundException('One or both characters not found');

        this.ensureAlive(character1);
        this.ensureAlive(character2);

        const job1 = this.jobsService.findByName(character1.job);
        const job2 = this.jobsService.findByName(character2.job);
        if (!job1 || !job2)
            throw new BadRequestException('Invalid job for one or both characters');

        const result = this.simulator.simulate(character1, character2, job1, job2);
        await this.applyOutcome(result);
        return result;
    }

    private ensureAlive(char: Character) {
        if (char.status === 'dead' || char.health.current <= 0)
            throw new BadRequestException(`${char.name} cannot battle (already dead)`);
    }

    private async applyOutcome(result: BattleResult) {
        const { winner, loser } = result;
        this.charactersService.update(winner.id, { health: winner.health });
        this.charactersService.update(loser.id, { status: 'dead', health: loser.health });
    }
}
