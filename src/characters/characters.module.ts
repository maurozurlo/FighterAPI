import { Module } from '@nestjs/common';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { JobsModule } from '../jobs/jobs.module';

@Module({
    imports: [JobsModule],
    controllers: [CharactersController],
    providers: [CharactersService],
})
export class CharactersModule { }
