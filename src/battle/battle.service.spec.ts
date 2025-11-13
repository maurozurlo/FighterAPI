import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BattleService, BattleResult } from './battle.service';
import { CharactersService } from '../characters/characters.service';
import { JobsService } from '../jobs/jobs.service';
import { BattleSimulator } from './battle-simulator.service';
import { Character, CharacterExpanded } from '../characters/models/character.model';
import { Job } from '../jobs/models/job.model';

describe('BattleService', () => {
    let service: BattleService;
    let mockCharactersService: jest.Mocked<CharactersService>;
    let mockJobsService: jest.Mocked<JobsService>;
    let mockSimulator: jest.Mocked<BattleSimulator>;

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

    const createMockCharacter = (overrides: Partial<Character> = {}): CharacterExpanded => ({
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
        attackFormula: '0.25 * strength + 1.0 * dexterity + 0.25 * intelligence',
        speedFormula: '0.8 * dexterity',
        ...overrides,
    });

    beforeEach(async () => {
        mockCharactersService = {
            findOne: jest.fn(),
            update: jest.fn(),
        } as any;

        mockJobsService = {
            findByName: jest.fn(),
        } as any;

        mockSimulator = {
            simulate: jest.fn(),
        } as any;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                BattleService,
                { provide: CharactersService, useValue: mockCharactersService },
                { provide: JobsService, useValue: mockJobsService },
                { provide: BattleSimulator, useValue: mockSimulator },
            ],
        }).compile();

        service = module.get<BattleService>(BattleService);
    });

    describe('battle', () => {
        const character1 = createMockCharacter({
            id: 'char-1',
            name: 'Warrior1',
            job: 'Warrior',
        });

        const character2 = createMockCharacter({
            id: 'char-2',
            name: 'Thief1',
            job: 'Thief',
            health: { current: 15, max: 15 },
        });

        it('should successfully execute a battle between two valid characters', async () => {
            const mockBattleResult: BattleResult = {
                log: ['Battle begins!', 'Warrior1 wins!'],
                winner: { ...character1, health: { current: 10, max: 20 } },
                loser: { ...character2, health: { current: 0, max: 15 }, status: 'dead' },
            };

            mockCharactersService.findOne
                .mockReturnValueOnce(character1)
                .mockReturnValueOnce(character2);
            mockJobsService.findByName
                .mockReturnValueOnce(mockWarriorJob)
                .mockReturnValueOnce(mockThiefJob);
            mockSimulator.simulate.mockReturnValue(mockBattleResult);

            const result = await service.battle('char-1', 'char-2');

            expect(result).toEqual(mockBattleResult);
            expect(mockCharactersService.findOne).toHaveBeenCalledWith('char-1');
            expect(mockCharactersService.findOne).toHaveBeenCalledWith('char-2');
            expect(mockJobsService.findByName).toHaveBeenCalledWith('Warrior');
            expect(mockJobsService.findByName).toHaveBeenCalledWith('Thief');
            expect(mockSimulator.simulate).toHaveBeenCalledWith(
                character1,
                character2,
                mockWarriorJob,
                mockThiefJob
            );
        });

        it('should throw NotFoundException if first character not found', async () => {
            mockCharactersService.findOne
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce(character2);

            await expect(service.battle('invalid-id', 'char-2')).rejects.toThrow(
                NotFoundException
            );
            await expect(service.battle('invalid-id', 'char-2')).rejects.toThrow(
                'One or both characters not found'
            );
        });

        it('should throw NotFoundException if second character not found', async () => {
            mockCharactersService.findOne
                .mockReturnValueOnce(character1)
                .mockReturnValueOnce(undefined);

            await expect(service.battle('char-1', 'invalid-id')).rejects.toThrow(
                NotFoundException
            );
        });

        it('should throw NotFoundException if both characters not found', async () => {
            mockCharactersService.findOne
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce(undefined);

            await expect(service.battle('invalid-1', 'invalid-2')).rejects.toThrow(
                NotFoundException
            );
        });

        it('should throw BadRequestException if first character is dead', async () => {
            const deadCharacter = createMockCharacter({
                id: 'char-1',
                status: 'dead',
                health: { current: 0, max: 20 },
            });

            mockCharactersService.findOne
                .mockReturnValueOnce(deadCharacter)
                .mockReturnValueOnce(character2);

            await expect(service.battle('char-1', 'char-2'))
                .rejects.toThrow(/cannot battle \(already dead\)/);
        });

        it('should throw BadRequestException if second character is dead', async () => {
            const deadCharacter = createMockCharacter({
                id: 'char-2',
                status: 'dead',
                health: { current: 0, max: 15 },
            });

            mockCharactersService.findOne
                .mockReturnValueOnce(character1)
                .mockReturnValueOnce(deadCharacter);

            await expect(service.battle('char-1', 'char-2')).rejects.toThrow(
                BadRequestException
            );
        });

        it('should throw BadRequestException if character has 0 HP but status is alive', async () => {
            const zeroHpCharacter = createMockCharacter({
                id: 'char-1',
                status: 'alive',
                health: { current: 0, max: 20 },
            });

            mockCharactersService.findOne
                .mockReturnValueOnce(zeroHpCharacter)
                .mockReturnValueOnce(character2);

            await expect(service.battle('char-1', 'char-2')).rejects.toThrow(
                BadRequestException
            );
        });

        it('should throw BadRequestException if first character job is invalid', async () => {
            mockCharactersService.findOne
                .mockReturnValueOnce(character1)
                .mockReturnValueOnce(character2);
            mockJobsService.findByName
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce(mockThiefJob);

            await expect(service.battle('char-1', 'char-2'))
                .rejects.toThrow(/Invalid job for one or both characters/);
        });

        it('should throw BadRequestException if second character job is invalid', async () => {
            mockCharactersService.findOne
                .mockReturnValueOnce(character1)
                .mockReturnValueOnce(character2);
            mockJobsService.findByName
                .mockReturnValueOnce(mockWarriorJob)
                .mockReturnValueOnce(undefined);

            await expect(service.battle('char-1', 'char-2')).rejects.toThrow(
                BadRequestException
            );
        });

        it('should update winner health after battle', async () => {
            const mockBattleResult: BattleResult = {
                log: ['Battle log'],
                winner: { ...character1, health: { current: 5, max: 20 } },
                loser: { ...character2, health: { current: 0, max: 15 }, status: 'dead' },
            };

            mockCharactersService.findOne
                .mockReturnValueOnce(character1)
                .mockReturnValueOnce(character2);
            mockJobsService.findByName
                .mockReturnValueOnce(mockWarriorJob)
                .mockReturnValueOnce(mockThiefJob);
            mockSimulator.simulate.mockReturnValue(mockBattleResult);

            await service.battle('char-1', 'char-2');

            expect(mockCharactersService.update).toHaveBeenCalledWith('char-1', {
                health: { current: 5, max: 20 },
            });
        });

        it('should update loser to dead status with 0 HP after battle', async () => {
            const mockBattleResult: BattleResult = {
                log: ['Battle log'],
                winner: { ...character1, health: { current: 5, max: 20 } },
                loser: { ...character2, health: { current: 0, max: 15 }, status: 'dead' },
            };

            mockCharactersService.findOne
                .mockReturnValueOnce(character1)
                .mockReturnValueOnce(character2);
            mockJobsService.findByName
                .mockReturnValueOnce(mockWarriorJob)
                .mockReturnValueOnce(mockThiefJob);
            mockSimulator.simulate.mockReturnValue(mockBattleResult);

            await service.battle('char-1', 'char-2');

            expect(mockCharactersService.update).toHaveBeenCalledWith('char-2', {
                status: 'dead',
                health: { current: 0, max: 15 },
            });
        });

        it('should call update exactly twice (once for winner, once for loser)', async () => {
            const mockBattleResult: BattleResult = {
                log: ['Battle log'],
                winner: { ...character1, health: { current: 5, max: 20 } },
                loser: { ...character2, health: { current: 0, max: 15 }, status: 'dead' },
            };

            mockCharactersService.findOne
                .mockReturnValueOnce(character1)
                .mockReturnValueOnce(character2);
            mockJobsService.findByName
                .mockReturnValueOnce(mockWarriorJob)
                .mockReturnValueOnce(mockThiefJob);
            mockSimulator.simulate.mockReturnValue(mockBattleResult);

            await service.battle('char-1', 'char-2');

            expect(mockCharactersService.update).toHaveBeenCalledTimes(2);
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });
});