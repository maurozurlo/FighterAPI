import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import type { Character } from './models/character.model';

@Controller('api/v1/character')
export class CharactersController {
    constructor(private readonly charactersService: CharactersService) { }

    @Post()
    create(@Body() createCharacterDto: CreateCharacterDto) {
        return this.charactersService.create(createCharacterDto);
    }

    @Get()
    findAll() {
        return this.charactersService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string): Character {
        return this.charactersService.findOne(id);
    }
}
