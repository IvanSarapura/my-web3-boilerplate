'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAccount, useReadContract } from 'wagmi';
import { formatUnits, isAddress, type Address } from 'viem';
import { erc20Abi } from '@/abi/erc20';
import { getUsdcAddress } from '@/config/contracts';
import { getSupportedChainNames } from '@/config/chains';
import { useErc20Transfer } from '@/hooks/useErc20Transfer';
import {
  transferSchema,
  type TransferFormValues,
} from '@/lib/schemas/transfer';
import { TxStatus } from './TxStatus';
import styles from './TransferForm.module.css';

/**
 * Ejemplo de escritura en contrato ERC-20 con validación de formulario.
 *
 * Integra tres capas:
 *   1. React Hook Form + Zod — valida formato de inputs (address, monto positivo)
 *      y sanitiza los valores (trim) antes de pasarlos a la blockchain.
 *   2. useErc20Transfer — simula la tx en segundo plano para detectar reverts
 *      antes de pedir la firma, luego ejecuta el ciclo completo de escritura.
 *   3. TxStatus — muestra el estado de la tx (pending / confirming / success / error).
 *
 * Para adaptar a tu propio contrato:
 * 1. Reemplazá el `transferSchema` en src/lib/schemas/ según tus campos.
 * 2. Actualizá `useErc20Transfer` (o creá un hook equivalente) para tu función.
 * 3. Ajustá los labels y el nombre del token en el JSX.
 */
export function TransferForm() {
  const { isConnected, chain, address: walletAddress } = useAccount();
  const contractAddress =
    chain?.id !== undefined ? getUsdcAddress(chain.id) : undefined;
  const isSupported = !!contractAddress;

  // ─── React Hook Form + Zod ────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    reset: resetForm,
    formState: { errors },
  } = useForm<TransferFormValues>({
    resolver: zodResolver(transferSchema),
    // onChange: muestra errores de formato en tiempo real mientras el usuario escribe.
    // Para formularios con muchos campos, 'onBlur' reduce el ruido visual.
    mode: 'onChange',
    defaultValues: { to: '', amount: '' },
  });

  // watch() provee valores reactivos para que useErc20Transfer actualice la
  // simulación en segundo plano mientras el usuario escribe.
  // Se trimea manualmente para que la simulación use valores limpios,
  // igual que el output sanitizado del schema.
  const toValue = watch('to')?.trim();
  const amountValue = watch('amount')?.trim();

  // ─── Lectura del contrato ─────────────────────────────────────────────────

  const { data: decimals } = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'decimals',
    query: { enabled: isConnected && isSupported },
  });

  // Balance del usuario en el token para mostrarlo como contexto en el formulario.
  const { data: tokenBalance } = useReadContract({
    address: contractAddress,
    abi: erc20Abi,
    functionName: 'balanceOf',
    args: [walletAddress!],
    query: { enabled: isConnected && isSupported && !!walletAddress },
  });

  // ─── Escritura en contrato ────────────────────────────────────────────────

  const toAddress = isAddress(toValue ?? '') ? (toValue as Address) : undefined;

  const { execute, status, txHash, error, simulateError, reset, canExecute } =
    useErc20Transfer({
      contractAddress,
      decimals,
      to: toAddress,
      amount: amountValue ?? '',
    });

  // ─── Handlers ─────────────────────────────────────────────────────────────

  // handleSubmit ejecuta primero la validación Zod; solo llama a onSubmit
  // si todos los campos pasan. Los valores recibidos están sanitizados (trim).
  const onSubmit = (_data: TransferFormValues) => {
    execute();
  };

  const handleReset = () => {
    resetForm();
    reset();
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (!isConnected) return null;

  if (!isSupported) {
    return (
      <div className={styles.card}>
        <h2 className={styles.cardTitle}>Transferir Token (ejemplo)</h2>
        <p className={styles.hint}>
          Cambiá a una de estas redes para ver este ejemplo de escritura en
          contrato: {getSupportedChainNames()}.
        </p>
      </div>
    );
  }

  const isSubmitting = status === 'pending' || status === 'confirming';
  const isDone = status === 'success';

  const formattedBalance =
    tokenBalance !== undefined && decimals !== undefined
      ? parseFloat(formatUnits(tokenBalance, decimals)).toFixed(2)
      : undefined;

  return (
    <div className={styles.card}>
      <h2 className={styles.cardTitle}>Transferir Token (ejemplo)</h2>
      <p className={styles.hint}>
        Escritura en contrato con <code>useWriteContract</code>, validación con{' '}
        <code>Zod</code> y formulario con <code>React Hook Form</code>.
      </p>

      {isDone ? (
        <>
          <TxStatus status={status} txHash={txHash} chain={chain} />
          <button
            className={styles.resetButton}
            onClick={handleReset}
            type="button"
          >
            Nueva transferencia
          </button>
        </>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles.form}
          noValidate
        >
          {/* Campo: dirección destino */}
          <div className={styles.field}>
            <label htmlFor="tf-to" className={styles.label}>
              Dirección destino
            </label>
            <input
              id="tf-to"
              type="text"
              className={`${styles.input} ${errors.to ? styles.inputError : ''}`}
              placeholder="0x..."
              disabled={isSubmitting}
              spellCheck={false}
              autoComplete="off"
              {...register('to')}
            />
            {errors.to && (
              <span className={styles.fieldError} role="alert">
                {errors.to.message}
              </span>
            )}
          </div>

          {/* Campo: monto */}
          <div className={styles.field}>
            <label htmlFor="tf-amount" className={styles.label}>
              Monto (USDC)
            </label>
            <input
              id="tf-amount"
              type="text"
              inputMode="decimal"
              className={`${styles.input} ${errors.amount ? styles.inputError : ''}`}
              placeholder="0.00"
              disabled={isSubmitting}
              {...register('amount')}
            />
            {errors.amount && (
              <span className={styles.fieldError} role="alert">
                {errors.amount.message}
              </span>
            )}
            {/* Balance disponible: contexto informativo, no bloquea el submit */}
            {formattedBalance !== undefined && (
              <span className={styles.balanceHint}>
                Balance disponible: {formattedBalance} USDC
              </span>
            )}
          </div>

          {/* Error de simulación: el contrato revertirá con los valores actuales */}
          {simulateError && (
            <p className={styles.simulateError}>
              {parseErrorMessage(simulateError)}
            </p>
          )}

          {/* Estado de la transacción: pending / confirming / error */}
          <TxStatus
            status={status}
            txHash={txHash}
            chain={chain}
            error={error}
          />

          <button
            type="submit"
            className={styles.submitButton}
            disabled={!canExecute || isSubmitting}
          >
            {isSubmitting ? 'Procesando...' : 'Enviar'}
          </button>
        </form>
      )}
    </div>
  );
}

function parseErrorMessage(error: Error): string {
  if ('shortMessage' in error && typeof error.shortMessage === 'string') {
    return error.shortMessage;
  }
  return error.message;
}
