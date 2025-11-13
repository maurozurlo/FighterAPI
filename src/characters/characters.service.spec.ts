import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { InMemoryCharacterRepository } from './repositories/in-memory-character.repository';
import { JobsService } from '../jobs/jobs.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import { Job } from '../jobs/models/job.model';
import { Character } from './models/character.model';

describe('CharactersService', () => {
    let service: CharactersService;
    let mockJobsService: jest.Mocked<JobsService>;
    let mockRepository: jest.Mocked<InMemoryCharacterRepository>;

    const mockWarriorJob: Job = {
        name: 'Warrior',
        healthPoints: 20,
        strength: 10,
        dexterity: 5,
        intelligence: 5,
        attackFormula: '0.8 * strength + 0.2 * dexterity',
        speedFormula: '0.6 * dexterity + 0.2 * intelligence',
    };

    beforeEach(() => {
        mockJobsService = {
            findByName: jest.fn(),
        } as any;

        mockRepository = {
            save: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
        } as any;

        service = new CharactersService(mockJobsService, mockRepository);
    });

    describe('create', () => {
        it('should create a new character successfully', () => {
            mockJobsService.findByName.mockReturnValue(mockWarriorJob);

            const createDto: CreateCharacterDto = { name: 'Pepe', job: 'Warrior' };
            const result = service.create(createDto);

            expect(mockJobsService.findByName).toHaveBeenCalledWith('Warrior');
            expect(mockRepository.save).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'Pepe',
                    job: 'Warrior',
                    health: { current: 20, max: 20 },
                    level: 1,
                    status: 'alive',
                })
            );

            expect(result).toEqual(
                expect.objectContaining({
                    name: 'Pepe',
                    job: 'Warrior',
                    stats: expect.objectContaining({
                        strength: 10,
                        dexterity: 5,
                        intelligence: 5,
                    }),
                })
            );
        });

        it('should throw BadRequestException if job is invalid', () => {
            mockJobsService.findByName.mockReturnValue(undefined);

            const createDto: CreateCharacterDto = { name: 'Alice', job: 'Clown' };

            expect(() => service.create(createDto)).toThrow(BadRequestException);
            expect(mockRepository.save).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return all characters', () => {
            const mockCharacters = [
                { id: '1', name: 'Bob', job: 'Warrior' },
                { id: '2', name: 'Alice', job: 'Mage' },
            ];
            mockRepository.findAll.mockReturnValue(mockCharacters as any);

            const result = service.findAll();

            expect(result).toEqual(mockCharacters);
            expect(mockRepository.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        const mockCharacter: Character = {
            id: '1',
            name: 'Bob',
            job: 'Warrior',
            level: 1,
            status: 'alive',
            health: { current: 100, max: 100 },
            stats: {
                strength: 10,
                dexterity: 5,
                intelligence: 2,
            },
            createdAt: new Date().toISOString(),
        };

        it('should return expanded character data with formulas', () => {
            mockRepository.findById.mockReturnValue(mockCharacter);
            mockJobsService.findByName.mockReturnValue(mockWarriorJob);

            const result = service.findOne('1');

            expect(result!.attackFormula).toBe('0.8 * strength + 0.2 * dexterity');
            expect(result!.speedFormula).toBe('0.6 * dexterity + 0.2 * intelligence');
        });

        it('should throw NotFoundException if character not found', () => {
            mockRepository.findById.mockReturnValue(undefined);

            expect(() => service.findOne('123')).toThrow(NotFoundException);
        });

        it('should throw BadRequestException if job is invalid', () => {
            mockRepository.findById.mockReturnValue(mockCharacter);
            mockJobsService.findByName.mockReturnValue(undefined);

            expect(() => service.findOne('1')).toThrow(BadRequestException);
        });
    });
});