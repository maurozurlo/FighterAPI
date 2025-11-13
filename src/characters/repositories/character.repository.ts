import { Character, CharacterOverview } from '../models/character.model';

export interface CharacterRepository {
    save(character: Character): Character;
    findAll(): CharacterOverview[];
    findById(id: string): Character | undefined;
    delete(id: string): boolean;
}
