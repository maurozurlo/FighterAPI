import { Injectable } from '@nestjs/common';
import { Character } from '../characters/models/character.model';
import { Job } from '../jobs/models/job.model';
import { computeFormula } from './utils/formula.util';
import { BattleResult } from './battle.service';

interface FighterState {
    fighter: Character;
    job: Job;
    currentHp: number;
    attack: number;
    speedBase: number;
}

interface BattleState {
    fighters: [FighterState, FighterState];
    log: string[];
}

@Injectable()
export class BattleSimulator {
    simulate(char1: Character, char2: Character, job1: Job, job2: Job): BattleResult {
        const initialLog = [
            `Battle between ${char1.name} (${char1.job}) - ${char1.health.current} HP and ${char2.name} (${char2.job}) - ${char2.health.current} HP begins!`,
        ];

        const fighter1: FighterState = {
            fighter: char1,
            job: job1,
            currentHp: char1.health.current,
            attack: computeFormula(job1.attackFormula, char1.stats),
            speedBase: computeFormula(job1.speedFormula, char1.stats),
        };

        const fighter2: FighterState = {
            fighter: char2,
            job: job2,
            currentHp: char2.health.current,
            attack: computeFormula(job2.attackFormula, char2.stats),
            speedBase: computeFormula(job2.speedFormula, char2.stats),
        };

        const executeRound = (state: BattleState): BattleState => {
            const [fighterA, fighterB] = state.fighters;
            const [speedA, speedB] = [fighterA, fighterB].map(f =>
                Math.floor(Math.random() * (f.speedBase + 1))
            );

            if (speedA === speedB) return executeRound(state);

            const [attacker, defender] = speedA > speedB
                ? [fighterA, fighterB]
                : [fighterB, fighterA];
            const [attackerSpeed, defenderSpeed] = speedA > speedB
                ? [speedA, speedB]
                : [speedB, speedA];

            const firstDamage = Math.floor(Math.random() * (attacker.attack + 1));
            const damagedDefender = {
                ...defender,
                currentHp: Math.max(0, defender.currentHp - firstDamage)
            };

            const roundLog = [
                ...state.log,
                `${attacker.fighter.name} (${attackerSpeed}) was faster than ${defender.fighter.name} (${defenderSpeed}) and attacks first.`,
                `${attacker.fighter.name} hits ${defender.fighter.name} for ${firstDamage}. ${defender.fighter.name} now has ${damagedDefender.currentHp} HP.`,
            ];

            if (damagedDefender.currentHp === 0) {
                return {
                    fighters: [attacker, damagedDefender],
                    log: roundLog
                };
            }

            const counterDamage = Math.floor(Math.random() * (damagedDefender.attack + 1));
            const damagedAttacker = {
                ...attacker,
                currentHp: Math.max(0, attacker.currentHp - counterDamage)
            };

            return {
                fighters: [damagedAttacker, damagedDefender],
                log: [
                    ...roundLog,
                    `${damagedDefender.fighter.name} hits ${damagedAttacker.fighter.name} for ${counterDamage}. ${damagedAttacker.fighter.name} now has ${damagedAttacker.currentHp} HP.`,
                ],
            };
        };

        const runBattle = (state: BattleState): BattleState => {
            const [fighterA, fighterB] = state.fighters;
            if (fighterA.currentHp <= 0 || fighterB.currentHp <= 0) {
                return state;
            }
            return runBattle(executeRound(state));
        };

        const finalState = runBattle({
            fighters: [fighter1, fighter2],
            log: initialLog
        });

        const [finalFighterA, finalFighterB] = finalState.fighters;

        const winner = finalFighterA.currentHp > 0 ? finalFighterA : finalFighterB;
        const loser = finalFighterA.currentHp > 0 ? finalFighterB : finalFighterA;

        return {
            log: [
                ...finalState.log,
                `${winner.fighter.name} wins the battle with ${winner.currentHp} HP left!`
            ],
            winner: {
                ...winner.fighter,
                health: { ...winner.fighter.health, current: winner.currentHp }
            },
            loser: {
                ...loser.fighter,
                health: { ...loser.fighter.health, current: 0 },
                status: 'dead'
            },
        };
    }
}