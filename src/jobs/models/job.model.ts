export interface Job {
    name: 'Warrior' | 'Thief' | 'Mage';
    healthPoints: number;
    strength: number;
    dexterity: number;
    intelligence: number;
    attackModifierFormula: string;
    speedModifierFormula: string;
}
