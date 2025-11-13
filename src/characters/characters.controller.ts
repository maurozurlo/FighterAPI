import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { CharactersService } from './characters.service';
import { CreateCharacterDto } from './dto/create-character.dto';
import type { Character } from './models/character.model';

@ApiTags('Characters')
@Controller('api/v1/character')
export class CharactersController {
    constructor(private readonly charactersService: CharactersService) { }

    @Post()
    @ApiOperation({
        summary: 'Create a new character',
        description: 'Creates a new character with the provided details'
    })
    @ApiBody({ type: CreateCharacterDto })
    @ApiResponse({
        status: 201,
        description: 'Character successfully created',
        type: CreateCharacterDto
    })
    @ApiResponse({
        status: 400,
        description: 'Invalid input data'
    })
    create(@Body() createCharacterDto: CreateCharacterDto) {
        return this.charactersService.create(createCharacterDto);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all characters',
        description: 'Retrieves a list of all characters'
    })
    @ApiResponse({
        status: 200,
        description: 'List of characters retrieved successfully',
        type: [CreateCharacterDto]
    })
    findAll() {
        return this.charactersService.findAll();
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get a character by ID',
        description: 'Retrieves a single character by their unique identifier'
    })
    @ApiParam({
        name: 'id',
        type: String,
        description: 'Character unique identifier',
    })
    @ApiResponse({
        status: 200,
        description: 'Character found',
        type: CreateCharacterDto
    })
    @ApiResponse({
        status: 404,
        description: 'Character not found'
    })
    findOne(@Param('id') id: string): Character | undefined {
        return this.charactersService.findOne(id);
    }
}