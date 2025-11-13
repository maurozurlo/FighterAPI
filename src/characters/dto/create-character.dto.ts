import { Job } from "src/jobs/models/job.model";

export class CreateCharacterDto {
    name: string;
    job: Job['name'];
}
