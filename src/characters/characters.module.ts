import { Module } from '@nestjs/common';
import { CharactersController } from './characters.controller';
import { CharactersService } from './characters.service';
import { JobsModule } from '../jobs/jobs.module';
import { InMemoryCharacterRepository } from './repositories/in-memory-character.repository';

@Module({
    imports: [JobsModule],
    controllers: [CharactersController],
    providers: [
        CharactersService,
        {
            provide: 'CharacterRepository',
            useClass: InMemoryCharacterRepository,
        },
    ],
})
export class CharactersModule { }
