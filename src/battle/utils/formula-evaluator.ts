import { evaluate } from 'mathjs';

export function computeFormula(
    formula: string,
    stats: { strength: number; dexterity: number; intelligence: number }
): number {
    try {
        const result = evaluate(formula, stats);
        if (typeof result !== 'number' || Number.isNaN(result)) {
            throw new Error('Invalid formula result');
        }
        return result;
    } catch {
        throw new Error(`Error evaluating formula: ${formula}`);
    }
}
