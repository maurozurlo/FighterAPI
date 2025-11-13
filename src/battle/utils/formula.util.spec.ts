import { computeFormula } from './formula.util';
import { evaluate } from 'mathjs';

jest.mock('mathjs', () => ({
    evaluate: jest.fn(),
}));

describe('computeFormula', () => {
    const mockStats = { strength: 10, dexterity: 5, intelligence: 2 };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should evaluate a valid formula correctly', () => {
        (evaluate as jest.Mock).mockReturnValue(20);

        const result = computeFormula('strength * 2', mockStats);

        expect(evaluate).toHaveBeenCalledWith('strength * 2', mockStats);
        expect(result).toBe(20);
    });

    it('should throw if evaluate throws', () => {
        (evaluate as jest.Mock).mockImplementation(() => {
            throw new Error('invalid expression');
        });

        expect(() => computeFormula('invalid@@', mockStats)).toThrow(
            'Error evaluating formula: invalid@@'
        );
    });

    it('should throw if evaluate returns NaN', () => {
        (evaluate as jest.Mock).mockReturnValue(NaN);

        expect(() => computeFormula('strength / 0', mockStats)).toThrow(
            "Error evaluating formula: strength / 0"
        );
    });

    it('should throw if evaluate returns non-number', () => {
        (evaluate as jest.Mock).mockReturnValue('not-a-number');

        expect(() => computeFormula('strength + dexterity', mockStats)).toThrow(
            "Error evaluating formula: strength + dexterity"
        );
    });
});
