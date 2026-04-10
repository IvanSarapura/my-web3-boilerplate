import { describe, it, expect } from 'vitest';
import { transferSchema, isValidAddress, parseTokenAmount } from './transfer';

const VALID_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045';
const VALID_AMOUNT = '10';

// ─── transferSchema ───────────────────────────────────────────────────────────

describe('transferSchema', () => {
  describe('campo to (dirección)', () => {
    it('rechaza string vacío', () => {
      const result = transferSchema.safeParse({ to: '', amount: VALID_AMOUNT });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.to).toBeDefined();
      }
    });

    it('rechaza una dirección con formato inválido', () => {
      const result = transferSchema.safeParse({
        to: 'not-an-address',
        amount: VALID_AMOUNT,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors.to;
        expect(errors?.[0]).toMatch(/inválida/i);
      }
    });

    it('rechaza una dirección con longitud incorrecta', () => {
      const result = transferSchema.safeParse({
        to: '0x1234',
        amount: VALID_AMOUNT,
      });
      expect(result.success).toBe(false);
    });

    it('rechaza un string de solo espacios', () => {
      const result = transferSchema.safeParse({
        to: '   ',
        amount: VALID_AMOUNT,
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors.to;
        expect(errors).toBeDefined();
      }
    });

    it('acepta una dirección Ethereum válida', () => {
      const result = transferSchema.safeParse({
        to: VALID_ADDRESS,
        amount: VALID_AMOUNT,
      });
      expect(result.success).toBe(true);
    });

    it('acepta una dirección en minúsculas', () => {
      const result = transferSchema.safeParse({
        to: VALID_ADDRESS.toLowerCase(),
        amount: VALID_AMOUNT,
      });
      expect(result.success).toBe(true);
    });

    it('aplica trim antes de validar (tolera espacios al pegar)', () => {
      const result = transferSchema.safeParse({
        to: `  ${VALID_ADDRESS}  `,
        amount: VALID_AMOUNT,
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.to).toBe(VALID_ADDRESS);
      }
    });
  });

  describe('campo amount (monto)', () => {
    it('rechaza string vacío', () => {
      const result = transferSchema.safeParse({
        to: VALID_ADDRESS,
        amount: '',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.flatten().fieldErrors.amount).toBeDefined();
      }
    });

    it('rechaza cero', () => {
      const result = transferSchema.safeParse({
        to: VALID_ADDRESS,
        amount: '0',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors.amount;
        expect(errors?.[0]).toMatch(/positivo/i);
      }
    });

    it('rechaza números negativos', () => {
      const result = transferSchema.safeParse({
        to: VALID_ADDRESS,
        amount: '-5',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors.amount;
        expect(errors?.[0]).toMatch(/positivo/i);
      }
    });

    it('rechaza strings no numéricos', () => {
      const result = transferSchema.safeParse({
        to: VALID_ADDRESS,
        amount: 'abc',
      });
      expect(result.success).toBe(false);
    });

    it('rechaza string de solo espacios', () => {
      const result = transferSchema.safeParse({
        to: VALID_ADDRESS,
        amount: '   ',
      });
      expect(result.success).toBe(false);
    });

    it('acepta enteros positivos', () => {
      const result = transferSchema.safeParse({
        to: VALID_ADDRESS,
        amount: '10',
      });
      expect(result.success).toBe(true);
    });

    it('acepta decimales positivos', () => {
      const result = transferSchema.safeParse({
        to: VALID_ADDRESS,
        amount: '0.5',
      });
      expect(result.success).toBe(true);
    });

    it('acepta montos grandes', () => {
      const result = transferSchema.safeParse({
        to: VALID_ADDRESS,
        amount: '999999.99',
      });
      expect(result.success).toBe(true);
    });

    it('aplica trim antes de validar', () => {
      const result = transferSchema.safeParse({
        to: VALID_ADDRESS,
        amount: '  10.5  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.amount).toBe('10.5');
      }
    });
  });

  describe('validación completa del objeto', () => {
    it('rechaza cuando ambos campos son inválidos y reporta ambos errores', () => {
      const result = transferSchema.safeParse({ to: 'bad', amount: 'bad' });
      expect(result.success).toBe(false);
      if (!result.success) {
        const fieldErrors = result.error.flatten().fieldErrors;
        expect(fieldErrors.to).toBeDefined();
        expect(fieldErrors.amount).toBeDefined();
      }
    });

    it('retorna los valores tipados y sanitizados cuando es válido', () => {
      const result = transferSchema.safeParse({
        to: `  ${VALID_ADDRESS}  `,
        amount: '  10.5  ',
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.to).toBe(VALID_ADDRESS);
        expect(result.data.amount).toBe('10.5');
      }
    });
  });
});

// ─── isValidAddress ───────────────────────────────────────────────────────────

describe('isValidAddress', () => {
  it('retorna true para una dirección válida', () => {
    expect(isValidAddress(VALID_ADDRESS)).toBe(true);
  });

  it('retorna true para una dirección en minúsculas', () => {
    expect(isValidAddress(VALID_ADDRESS.toLowerCase())).toBe(true);
  });

  it('retorna true con espacios (aplica trim)', () => {
    expect(isValidAddress(`  ${VALID_ADDRESS}  `)).toBe(true);
  });

  it('retorna false para string vacío', () => {
    expect(isValidAddress('')).toBe(false);
  });

  it('retorna false para dirección con longitud incorrecta', () => {
    expect(isValidAddress('0x1234')).toBe(false);
  });

  it('retorna false para string arbitrario', () => {
    expect(isValidAddress('not-an-address')).toBe(false);
  });
});

// ─── parseTokenAmount ─────────────────────────────────────────────────────────

describe('parseTokenAmount', () => {
  it('parsea un entero positivo', () => {
    expect(parseTokenAmount('10')).toBe(10);
  });

  it('parsea un decimal positivo', () => {
    expect(parseTokenAmount('10.5')).toBe(10.5);
  });

  it('aplica trim y parsea correctamente', () => {
    expect(parseTokenAmount('  10.5  ')).toBe(10.5);
  });

  it('retorna null para string vacío', () => {
    expect(parseTokenAmount('')).toBeNull();
  });

  it('retorna null para cero', () => {
    expect(parseTokenAmount('0')).toBeNull();
  });

  it('retorna null para número negativo', () => {
    expect(parseTokenAmount('-5')).toBeNull();
  });

  it('retorna null para string no numérico', () => {
    expect(parseTokenAmount('abc')).toBeNull();
  });

  it('retorna null para Infinity', () => {
    expect(parseTokenAmount('Infinity')).toBeNull();
  });
});
