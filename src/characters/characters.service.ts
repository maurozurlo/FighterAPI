import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateCharacterDto } from './dto/create-character.dto';
import { randomUUID } from 'crypto';
import { JobsService } from '../jobs/jobs.service';
import { Job } from '../jobs/models/job.model';

@Injectable()
export class CharactersService {
    constructor(private readonly jobsService: JobsService) { }

    create(createCharacterDto: CreateCharacterDto) {
        const { name, job } = createCharacterDto;

        const jobData: Job | undefined = this.jobsService.findByName(job);
        if (!jobData) {
            throw new BadRequestException(`Invalid job: ${job}`);
        }

        const id = randomUUID();

        return {
            id,
            name,
            job: jobData.name,
            stats: {
                healthPoints: jobData.healthPoints,
                strength: jobData.strength,
                dexterity: jobData.dexterity,
                intelligence: jobData.intelligence,
            },
            createdAt: new Date().toISOString(),
        };
    }
}
