import { IsString, Matches, Length, IsIn } from 'class-validator';


export class CreateCharacterDto {
    @IsString()
    @Matches(/^[A-Za-z_]+$/, {
        message: 'Name can only contain letters and underscores.',
    })
    @Length(4, 15, { message: 'Name must be between 4 and 15 characters.' })
    name: string;

    @IsString()
    job: string;
}
