export type CharacterStatus = 'alive' | 'dead'

export interface Character {
    id: string;
    name: string;
    job: string;
    level: number;
    status: CharacterStatus;
    health: { current: number; max: number };
    stats: {
        strength: number;
        dexterity: number;
        intelligence: number;
    };
    createdAt: string;
}

export type CharacterOverview = Pick<Character, 'name' | 'status' | 'job' | 'id'>;

export type CharacterExpanded = Character & {
    attackFormula: string;
    speedFormula: string;
}
