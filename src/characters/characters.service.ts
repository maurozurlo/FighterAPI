import { Injectable } from '@nestjs/common';
import { CreateCharacterDto } from './dto/create-character.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class CharactersService {
    create(createCharacterDto: CreateCharacterDto) {
        const id = randomUUID();
        return {
            id,
            name: createCharacterDto.name ?? "",
            createdAt: new Date().toISOString(),
        };
    }
}
