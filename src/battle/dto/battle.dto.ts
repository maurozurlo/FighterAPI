import { ApiProperty } from '@nestjs/swagger';

export class BattleRequestDto {
    @ApiProperty({
        type: String,
        description: 'First character ID',
        example: '123e4567-e89b-12d3-a456-426614174000'
    })
    characterId1: string;

    @ApiProperty({
        type: String,
        description: 'Second character ID',
        example: '123e4567-e89b-12d3-a456-426614174001'
    })
    characterId2: string;
}