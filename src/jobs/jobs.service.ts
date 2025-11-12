import { Injectable } from '@nestjs/common';
import { JOBS } from './constants/jobs.data';
import { Job } from './models/job.model';

@Injectable()
export class JobsService {
    private readonly jobs = JOBS;

    findAll(): Job[] {
        return this.jobs;
    }

    findByName(name: string): Job | undefined {
        return this.jobs.find(
            (job) => job.name.toLowerCase() === name.toLowerCase(),
        );
    }
}
