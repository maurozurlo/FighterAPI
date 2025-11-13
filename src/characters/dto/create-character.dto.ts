import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, Length } from 'class-validator';


export class CreateCharacterDto {
    @ApiProperty({ example: 'Link' })
    @IsString()
    @Matches(/^[A-Za-z_]+$/, {
        message: 'name can only contain letters and underscores.',
    })
    @Length(4, 15, { message: 'name must be between 4 and 15 characters.' })
    name: string;

    @ApiProperty({ example: 'Warrior' })
    @IsString()
    job: string;
}
