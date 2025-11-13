import { Injectable } from '@nestjs/common';
import { Job } from '../jobs/models/job.model';
import { Character } from '../characters/models/character.model';
import { computeFormula } from './utils/formula-evaluator';

@Injectable()
export class BattleService {
    computeBattleModifiers(character: Character, job: Job) {
        const { strength, dexterity, intelligence } = character.stats;

        const attack = computeFormula(job.attackFormula, {
            strength,
            dexterity,
            intelligence,
        });

        const speed = computeFormula(job.speedFormula, {
            strength,
            dexterity,
            intelligence,
        });

        return {
            attack: Number(attack.toFixed(2)),
            speed: Number(speed.toFixed(2)),
        };
    }
}
