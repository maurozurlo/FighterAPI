import { Injectable } from '@nestjs/common';
import { CharacterRepository } from './character.repository';
import { Character, CharacterOverview } from '../models/character.model';

@Injectable()
export class InMemoryCharacterRepository implements CharacterRepository {
    private characters: Character[] = [];

    save(character: Character): Character {
        this.characters.push(character);
        return character;
    }

    findAll(): CharacterOverview[] {
        return this.characters.map(
            (c): CharacterOverview => ({
                id: c.id,
                name: c.name,
                status: c.status,
                job: c.job,
            }),
        );
    }

    findById(id: string): Character | undefined {
        return this.characters.find(c => c.id === id);
    }

    delete(id: string): boolean {
        const index = this.characters.findIndex(c => c.id === id);
        if (index === -1) return false;
        this.characters.splice(index, 1);
        return true;
    }

    update(id: string, updatedData: Partial<Character>): Character | null {
        const index = this.characters.findIndex(c => c.id === id);
        if (index === -1) return null;
        this.characters[index] = { ...this.characters[index], ...updatedData };
        return this.characters[index];
    }
}

