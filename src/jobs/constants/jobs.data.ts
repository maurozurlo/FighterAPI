import { Job } from '../models/job.model';

export const JOBS: Job[] = [
    {
        name: 'Warrior',
        healthPoints: 20,
        strength: 10,
        dexterity: 5,
        intelligence: 5,
        attackModifierFormula: '0.8 * strength + 0.2 * dexterity',
        speedModifierFormula: '0.6 * dexterity + 0.2 * intelligence',
    },
    {
        name: 'Thief',
        healthPoints: 15,
        strength: 4,
        dexterity: 10,
        intelligence: 4,
        attackModifierFormula:
            '0.25 * strength + 1.0 * dexterity + 0.25 * intelligence',
        speedModifierFormula: '0.8 * dexterity',
    },
    {
        name: 'Mage',
        healthPoints: 12,
        strength: 5,
        dexterity: 6,
        intelligence: 10,
        attackModifierFormula:
            '0.2 * strength + 0.2 * dexterity + 1.2 * intelligence',
        speedModifierFormula: '0.4 * dexterity + 0.1 * strength',
    },
];

export const JOB_NAMES = JOBS.map(j => j.name.toLocaleLowerCase()) as Job['name'][];
