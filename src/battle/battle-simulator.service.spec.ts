import { Test, TestingModule } from '@nestjs/testing';
import { BattleSimulator } from './battle-simulator.service';
import { Character } from '../characters/models/character.model';
import { Job } from '../jobs/models/job.model';
import * as formulaUtil from './utils/formula.util';

describe('BattleSimulator', () => {
    let simulator: BattleSimulator;

    const mockWarriorJob: Job = {
        name: 'Warrior',
        healthPoints: 20,
        strength: 10,
        dexterity: 5,
        intelligence: 5,
        attackFormula: '0.8 * strength + 0.2 * dexterity',
        speedFormula: '0.6 * dexterity + 0.2 * intelligence',
    };

    const mockThiefJob: Job = {
        name: 'Thief',
        healthPoints: 15,
        strength: 4,
        dexterity: 10,
        intelligence: 4,
        attackFormula: '0.25 * strength + 1.0 * dexterity + 0.25 * intelligence',
        speedFormula: '0.8 * dexterity',
    };

    const createMockCharacter = (overrides: Partial<Character> = {}): Character => ({
        id: 'char-1',
        name: 'TestWarrior',
        job: 'Warrior',
        level: 1,
        status: 'alive',
        health: { current: 20, max: 20 },
        stats: {
            healthPoints: 20,
            strength: 10,
            dexterity: 5,
            intelligence: 5,
        },
        createdAt: new Date().toISOString(),
        ...overrides,
    });

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [BattleSimulator],
        }).compile();

        simulator = module.get<BattleSimulator>(BattleSimulator);
    });

    describe('simulate', () => {
        it('should return a battle result with winner and loser', () => {
            const char1 = createMockCharacter();
            const char2 = createMockCharacter({
                id: 'char-2',
                name: 'TestThief',
                job: 'Thief',
                health: { current: 15, max: 15 },
                stats: {
                    healthPoints: 15,
                    strength: 4,
                    dexterity: 10,
                    intelligence: 4,
                },
            });

            const result = simulator.simulate(char1, char2, mockWarriorJob, mockThiefJob);

            expect(result).toHaveProperty('winner');
            expect(result).toHaveProperty('loser');
            expect(result).toHaveProperty('log');
            expect(result.log).toBeInstanceOf(Array);
            expect(result.log.length).toBeGreaterThan(0);
        });

        it('should start battle with correct intro message', () => {
            const char1 = createMockCharacter({ name: 'Warrior1', health: { current: 20, max: 20 } });
            const char2 = createMockCharacter({
                id: 'char-2',
                name: 'Thief1',
                job: 'Thief',
                health: { current: 15, max: 15 }
            });

            const result = simulator.simulate(char1, char2, mockWarriorJob, mockThiefJob);

            expect(result.log[0]).toBe(
                'Battle between Warrior1 (Warrior) - 20 HP and Thief1 (Thief) - 15 HP begins!'
            );
        });

        it('should end battle with winner announcement', () => {
            const char1 = createMockCharacter();
            const char2 = createMockCharacter({ id: 'char-2', name: 'TestThief' });

            const result = simulator.simulate(char1, char2, mockWarriorJob, mockThiefJob);
            const lastLog = result.log[result.log.length - 1];

            expect(lastLog).toMatch(/wins the battle with \d+ HP left!/);
        });

        it('should set loser HP to 0 and status to dead', () => {
            const char1 = createMockCharacter();
            const char2 = createMockCharacter({ id: 'char-2' });

            const result = simulator.simulate(char1, char2, mockWarriorJob, mockThiefJob);

            expect(result.loser.health.current).toBe(0);
            expect(result.loser.status).toBe('dead');
        });

        it('should keep winner HP above 0', () => {
            const char1 = createMockCharacter();
            const char2 = createMockCharacter({ id: 'char-2' });

            const result = simulator.simulate(char1, char2, mockWarriorJob, mockThiefJob);

            expect(result.winner.health.current).toBeGreaterThan(0);
        });

        it('should never allow HP to go below 0', () => {
            const char1 = createMockCharacter({ health: { current: 5, max: 20 } });
            const char2 = createMockCharacter({
                id: 'char-2',
                health: { current: 100, max: 100 },
                stats: {
                    healthPoints: 100,
                    strength: 50,
                    dexterity: 50,
                    intelligence: 50,
                }
            });

            jest.spyOn(formulaUtil, 'computeFormula').mockReturnValue(100);

            const result = simulator.simulate(char1, char2, mockWarriorJob, mockThiefJob);

            expect(result.loser.health.current).toBe(0);
            expect(result.loser.health.current).toBeGreaterThanOrEqual(0);
        });

        it('should log speed comparisons for each round', () => {
            const char1 = createMockCharacter();
            const char2 = createMockCharacter({ id: 'char-2' });

            const result = simulator.simulate(char1, char2, mockWarriorJob, mockThiefJob);

            const speedLogs = result.log.filter(log => log.includes('was faster than'));
            expect(speedLogs.length).toBeGreaterThan(0);
        });

        it('should log damage dealt in each turn', () => {
            const char1 = createMockCharacter();
            const char2 = createMockCharacter({ id: 'char-2' });

            const result = simulator.simulate(char1, char2, mockWarriorJob, mockThiefJob);

            const damageLogs = result.log.filter(log => log.includes('hits') && log.includes('for'));
            expect(damageLogs.length).toBeGreaterThan(0);
        });

        it('should handle one-shot kills (defender dies on first attack)', () => {
            const char1 = createMockCharacter({
                stats: {
                    healthPoints: 100,
                    strength: 100,
                    dexterity: 100,
                    intelligence: 100,
                }
            });
            const char2 = createMockCharacter({
                id: 'char-2',
                health: { current: 1, max: 15 }
            });

            // Mock high attack for char1
            jest.spyOn(formulaUtil, 'computeFormula')
                .mockReturnValueOnce(100) // char1 attack
                .mockReturnValueOnce(50)  // char1 speed
                .mockReturnValueOnce(5)   // char2 attack
                .mockReturnValueOnce(5);  // char2 speed

            const result = simulator.simulate(char1, char2, mockWarriorJob, mockThiefJob);

            expect(result.loser.id).toBe('char-2');
            expect(result.loser.health.current).toBe(0);
        });

        it('should handle very long battles', () => {
            // Create two evenly matched characters with high HP
            const char1 = createMockCharacter({
                health: { current: 200, max: 200 },
                stats: { healthPoints: 200, strength: 5, dexterity: 5, intelligence: 5 }
            });
            const char2 = createMockCharacter({
                id: 'char-2',
                health: { current: 200, max: 200 },
                stats: { healthPoints: 200, strength: 5, dexterity: 5, intelligence: 5 }
            });

            // Mock low attack values to prolong battle
            jest.spyOn(formulaUtil, 'computeFormula').mockReturnValue(2);

            const result = simulator.simulate(char1, char2, mockWarriorJob, mockThiefJob);

            expect(result.log.length).toBeGreaterThan(10);
            expect(result.winner).toBeDefined();
            expect(result.loser).toBeDefined();
        });

        it('should use formulas correctly to calculate attack and speed', () => {
            const computeFormulaSpy = jest.spyOn(formulaUtil, 'computeFormula');

            const char1 = createMockCharacter();
            const char2 = createMockCharacter({ id: 'char-2' });

            simulator.simulate(char1, char2, mockWarriorJob, mockThiefJob);

            // Should call computeFormula for attack and speed for both fighters
            expect(computeFormulaSpy).toHaveBeenCalledWith(mockWarriorJob.attackFormula, char1.stats);
            expect(computeFormulaSpy).toHaveBeenCalledWith(mockWarriorJob.speedFormula, char1.stats);
            expect(computeFormulaSpy).toHaveBeenCalledWith(mockThiefJob.attackFormula, expect.any(Object));
            expect(computeFormulaSpy).toHaveBeenCalledWith(mockThiefJob.speedFormula, expect.any(Object));
        });

        it('should ensure exactly one winner and one loser', () => {
            const char1 = createMockCharacter();
            const char2 = createMockCharacter({ id: 'char-2' });

            const result = simulator.simulate(char1, char2, mockWarriorJob, mockThiefJob);

            const winnerIsChar1 = result.winner.id === char1.id;
            const loserIsChar2 = result.loser.id === char2.id;
            const winnerIsChar2 = result.winner.id === char2.id;
            const loserIsChar1 = result.loser.id === char1.id;

            expect(
                (winnerIsChar1 && loserIsChar2) || (winnerIsChar2 && loserIsChar1)
            ).toBe(true);
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });
});