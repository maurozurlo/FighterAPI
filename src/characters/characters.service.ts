import { Injectable, BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CreateCharacterDto } from './dto/create-character.dto';
import { randomUUID } from 'crypto';
import { JobsService } from '../jobs/jobs.service';
import { Job } from '../jobs/models/job.model';
import { InMemoryCharacterRepository } from './repositories/in-memory-character.repository';
import { Character, CharacterExpanded, CharacterOverview } from './models/character.model';

@Injectable()
export class CharactersService {
    constructor(
        private readonly jobsService: JobsService,
        @Inject('CharacterRepository')
        private readonly characterRepository: InMemoryCharacterRepository,
    ) { }

    create(createCharacterDto: CreateCharacterDto): Character {
        const { name, job } = createCharacterDto;

        const jobData: Job | undefined = this.jobsService.findByName(job);
        if (!jobData) {
            throw new BadRequestException(`Invalid job: ${job}.`);
        }

        const character: Character = {
            id: randomUUID(),
            name,
            level: 1,
            health: {
                current: jobData.healthPoints,
                max: jobData.healthPoints
            },
            status: 'alive',
            job: jobData.name,
            stats: {
                healthPoints: jobData.healthPoints,
                strength: jobData.strength,
                dexterity: jobData.dexterity,
                intelligence: jobData.intelligence,
            },
            createdAt: new Date().toISOString(),
        };

        this.characterRepository.save(character);

        return character;
    }

    findAll(): CharacterOverview[] {
        return this.characterRepository.findAll();
    }

    update(id: string, updatedData: Partial<Character>): Character | null {
        return this.characterRepository.update(id, updatedData);
    }

    findOne(id: string): CharacterExpanded {
        const character = this.characterRepository.findById(id);
        if (!character) {
            throw new NotFoundException(`Character with id ${id} not found.`);
        }
        const job = this.jobsService.findByName(character.job);
        if (!job) {
            throw new BadRequestException(`Character with id ${id} has an invalid job: ${character.job}`);
        }

        return { ...character, attackFormula: job.attackFormula, speedFormula: job.speedFormula };
    }
}
