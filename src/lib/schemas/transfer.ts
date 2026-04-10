import { isAddress } from 'viem';
import { z } from 'zod';

// ─── Primitivos reutilizables ────────────────────────────────────────────────
//
// Exportados como bloques de construcción para componer otros schemas en la app.

/**
 * Valida y normaliza una dirección Ethereum.
 * Aplica trim antes de la validación para tolerar espacios accidentales al pegar.
 */
export const ethereumAddress = z
  .string()
  .trim()
  .min(1, 'La dirección es requerida')
  // Anotación `: boolean` explícita para evitar que TypeScript 5.5+ infiera esta
  // función como type predicate (val is Address), lo que haría que z.infer<>
  // retorne `Address` en lugar de `string` y rompa los generics de React Hook Form.
  .refine((val): boolean => isAddress(val), 'Dirección Ethereum inválida');

/**
 * Valida un monto ERC-20 como string legible por humanos (p. ej. "10.5").
 * Trim incluido. Rechaza cero, negativos y no-numéricos.
 */
export const positiveAmount = z
  .string()
  .trim()
  .min(1, 'El monto es requerido')
  .refine((val) => {
    const n = parseFloat(val);
    return !isNaN(n) && isFinite(n) && n > 0;
  }, 'Ingresá un monto positivo válido');

// ─── Schema del formulario de transferencia ──────────────────────────────────

export const transferSchema = z.object({
  to: ethereumAddress,
  amount: positiveAmount,
});

export type TransferFormValues = z.infer<typeof transferSchema>;

// ─── Utilidades de validación standalone ─────────────────────────────────────
//
// Funciones puras que pueden usarse fuera de React Hook Form,
// por ejemplo en hooks o funciones de utilidad.

/**
 * Verifica si una string es una dirección Ethereum válida.
 * Aplica trim automáticamente.
 *
 * @example
 * isValidAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045') // true
 * isValidAddress('not-an-address')                             // false
 */
export function isValidAddress(value: string): boolean {
  return isAddress(value.trim());
}

/**
 * Parsea un monto en unidades humanas (string) a número.
 * Retorna `null` si el valor es inválido, cero, negativo o no numérico.
 *
 * @example
 * parseTokenAmount('10.5')  // 10.5
 * parseTokenAmount('0')     // null
 * parseTokenAmount('abc')   // null
 */
export function parseTokenAmount(value: string): number | null {
  const trimmed = value.trim();
  const n = parseFloat(trimmed);
  if (isNaN(n) || !isFinite(n) || n <= 0) return null;
  return n;
}
