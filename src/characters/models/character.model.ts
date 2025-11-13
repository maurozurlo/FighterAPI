export interface Character {
    id: string;
    name: string;
    job: string;
    stats: {
        healthPoints: number;
        strength: number;
        dexterity: number;
        intelligence: number;
    };
    createdAt: string;
}
