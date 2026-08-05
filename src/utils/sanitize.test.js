import { maskCardNumber, validateCardReference } from './sanitize';

describe('card masking and validation helpers', () => {
    it('masks card numbers while preserving the last 4 digits', () => {
        expect(maskCardNumber('4111111111111111')).toBe('**** **** **** 1111');
        expect(maskCardNumber('1234')).toBe('1234');
    });

    it('validates a card reference using RRN, transaction date, and amount', () => {
        const reference = 'rrn-123456789012|2026-07-14|1500.50';
        expect(validateCardReference(reference, '123456789012', '2026-07-14', 1500.5)).toBe(true);
        expect(validateCardReference(reference, '123456789012', '2026-07-14', 1500.6)).toBe(false);
    });
});
