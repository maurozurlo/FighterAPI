import { IsString, Matches, Length, IsIn } from 'class-validator';


export class CreateCharacterDto {
    @IsString()
    @Matches(/^[A-Za-z_]+$/, {
        message: 'name can only contain letters and underscores.',
    })
    @Length(4, 15, { message: 'name must be between 4 and 15 characters.' })
    name: string;

    @IsString()
    job: string;
}
