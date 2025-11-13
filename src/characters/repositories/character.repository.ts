import { Character } from '../models/character.model';

export interface CharacterRepository {
    save(character: Character): Character;
    findAll(): Character[];
    findById(id: string): Character | undefined;
    delete(id: string): boolean;
}
