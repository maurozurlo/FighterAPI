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
    let mockRepo: jest.Mocked<InMemoryCharacterRepository>;

    const mockJob: Job = {
        name: 'Warrior',
        healthPoints: 20,
        strength: 10,
        dexterity: 5,
        intelligence: 5,
        attackFormula: '0.8 * strength + 0.2 * dexterity',
        speedFormula: '0.6 * dexterity + 0.2 * intelligence',
    }

    beforeEach(() => {
        mockJobsService = {
            findByName: jest.fn(),
        } as any;

        mockRepo = {
            save: jest.fn(),
            findAll: jest.fn(),
            findById: jest.fn(),
            update: jest.fn(),
        } as any;

        service = new CharactersService(mockJobsService, mockRepo);
    });

    describe('create', () => {
        it('should create a new character successfully', () => {
            mockJobsService.findByName.mockReturnValue(mockJob);

            const dto: CreateCharacterDto = { name: 'Pepe', job: 'Warrior' };
            const result = service.create(dto);

            expect(mockJobsService.findByName).toHaveBeenCalledWith('Warrior');
            expect(mockRepo.save).toHaveBeenCalledWith(expect.objectContaining({
                name: 'Pepe',
                job: 'Warrior',
                health: { current: 20, max: 20 },
                level: 1,
                status: 'alive',
            }));

            expect(result).toEqual(expect.objectContaining({
                name: 'Pepe',
                job: 'Warrior',
                stats: expect.objectContaining({
                    strength: 10,
                    dexterity: 5,
                    intelligence: 5,
                }),
            }));
        });

        it('should throw if job is invalid', () => {
            mockJobsService.findByName.mockReturnValue(undefined);

            const dto: CreateCharacterDto = { name: 'Alice', job: 'Clown' };

            expect(() => service.create(dto)).toThrow(BadRequestException);
            expect(mockRepo.save).not.toHaveBeenCalled();
        });
    });

    describe('findAll', () => {
        it('should return all characters', () => {
            const chars = [
                { id: '1', name: 'Bob', job: 'Warrior' },
                { id: '2', name: 'Alice', job: 'Mage' },
            ];
            mockRepo.findAll.mockReturnValue(chars as any);

            const result = service.findAll();
            expect(result).toEqual(chars);
            expect(mockRepo.findAll).toHaveBeenCalled();
        });
    });

    describe('findOne', () => {
        const baseChar = {
            id: '1',
            name: 'Bob',
            job: 'Warrior',
            health: { current: 100, max: 100 },
            stats: { strength: 10, dexterity: 5, intelligence: 2, healthPoints: 100 },
        } as Character;

        it('should return expanded character data', () => {
            mockRepo.findById.mockReturnValue(baseChar);
            mockJobsService.findByName.mockReturnValue(mockJob);

            const result = service.findOne('1');
            expect(result.attackFormula).toBe('0.8 * strength + 0.2 * dexterity');
            expect(result.speedFormula).toBe('0.6 * dexterity + 0.2 * intelligence');
        });

        it('should throw if character not found', () => {
            mockRepo.findById.mockReturnValue(undefined);

            expect(() => service.findOne('123')).toThrow(NotFoundException);
        });

        it('should throw if job is invalid', () => {
            mockRepo.findById.mockReturnValue(baseChar);
            mockJobsService.findByName.mockReturnValue(undefined);

            expect(() => service.findOne('1')).toThrow(BadRequestException);
        });
    });
});
