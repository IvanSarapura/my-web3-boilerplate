# Smart Contracts

Esta carpeta es donde van tus smart contracts en Solidity.

El boilerplate no incluye Hardhat ni Foundry preinstalados para que vos elijas tu toolchain. Abajo están las instrucciones para configurar cada uno.

## Opción A: Hardhat

### 1. Instalar Hardhat

Desde la raíz del proyecto:

```bash
npm install -D hardhat @nomicfoundation/hardhat-toolbox
```

### 2. Inicializar Hardhat

```bash
npx hardhat init
```

Elegí "Create a JavaScript project" (o TypeScript) y aceptá los defaults. Hardhat va a crear:

```
contracts/          ← Tus archivos .sol (ya existe esta carpeta)
ignition/           ← Scripts de deploy (Hardhat Ignition)
test/               ← Tests de contratos (Mocha + Chai)
hardhat.config.js   ← Configuración de Hardhat
```

### 3. Compilar contratos

```bash
npx hardhat compile
```

Esto genera los ABIs en `artifacts/contracts/TuContrato.sol/TuContrato.json`.

### 4. Usar el ABI en el frontend

Copiá la propiedad `abi` del JSON generado y creá un archivo en `src/abi/`:

```ts
// src/abi/tuContrato.ts
export const tuContratoAbi = [
  // ... pegá el ABI aquí
] as const;
```

El `as const` es necesario para que Wagmi infiera los tipos automáticamente.

### 5. Deployar y conectar

Después de deployar (con `npx hardhat ignition deploy` o scripts custom), copiá la dirección del contrato y usala en tu componente:

```tsx
const { data } = useReadContract({
  address: '0x...direccion_del_contrato',
  abi: tuContratoAbi,
  functionName: 'miFuncion',
});
```

## Opción B: Foundry

### 1. Instalar Foundry

```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Inicializar en la carpeta contracts

```bash
cd contracts
forge init --no-git
```

Esto crea `src/`, `test/`, `script/` y `foundry.toml` dentro de `contracts/`.

### 3. Compilar y obtener ABIs

```bash
forge build
```

Los ABIs se generan en `contracts/out/TuContrato.sol/TuContrato.json`.

### 4. Usar el ABI en el frontend

Mismo proceso que con Hardhat: copiá la propiedad `abi` del JSON y creá un archivo TypeScript en `src/abi/`.

## Opción C: Remix (prototyping rápido)

Si estás prototipando en [remix.ethereum.org](https://remix.ethereum.org):

1. Escribí y compilá tu contrato en Remix.
2. En la pestaña "Compilation Details", copiá el ABI.
3. Creá el archivo en `src/abi/` con el ABI copiado.
4. Deployá desde Remix y usá la dirección en tu frontend.

## Estructura recomendada del monorepo

```
my-web3-boilerplate/
├── contracts/           ← Smart contracts (Solidity)
│   ├── MyContract.sol
│   └── ...
├── ignition/            ← Scripts de deploy (Hardhat Ignition)
├── test/                ← Tests de contratos
├── hardhat.config.js    ← Config de Hardhat (o foundry.toml)
├── src/                 ← Frontend (Next.js)
│   ├── abi/             ← ABIs para el frontend
│   └── ...
└── package.json
```
