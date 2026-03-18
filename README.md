# Web3 Boilerplate

Boilerplate de DApp listo para usar, construido con las herramientas más utilizadas en el ecosistema Web3.

## Stack

| Herramienta                                    | Rol                                                          |
| ---------------------------------------------- | ------------------------------------------------------------ |
| [Next.js 16](https://nextjs.org/) (App Router) | Framework frontend                                           |
| [Wagmi v2](https://wagmi.sh/)                  | Hooks para interactuar con la blockchain                     |
| [viem v2](https://viem.sh/)                    | Librería de bajo nivel para Ethereum (reemplaza a ethers.js) |
| [RainbowKit](https://www.rainbowkit.com/)      | UI de conexión de wallets                                    |
| [TanStack Query](https://tanstack.com/query)   | Cache y estado asíncrono (requerido por Wagmi)               |

## Estructura del proyecto

```
├── contracts/                   # Smart contracts en Solidity (ver contracts/README.md)
├── src/
│   ├── abi/
│   │   └── erc20.ts             # ABI de ejemplo (ERC-20)
│   ├── app/
│   │   ├── layout.tsx           # Root layout (proveedores, fuentes, metadata)
│   │   ├── page.tsx             # Home page de ejemplo
│   │   ├── page.module.css
│   │   ├── error.tsx            # Error boundary global
│   │   ├── error.module.css
│   │   ├── not-found.tsx        # Página 404
│   │   ├── loading.tsx          # Loading state global
│   │   ├── loading.module.css
│   │   └── globals.css          # Reset, variables CSS y estilos globales
│   ├── components/
│   │   ├── WalletInfo.tsx       # Info de wallet (useAccount, useBalance)
│   │   ├── WalletInfo.module.css
│   │   ├── TokenInfo.tsx        # Lectura de contrato (useReadContract)
│   │   └── TokenInfo.module.css
│   ├── config/
│   │   ├── env.ts               # Validación de variables de entorno
│   │   ├── theme.ts             # Tema custom de RainbowKit
│   │   └── wagmi.ts             # Config de Wagmi, chains y transports (RPC)
│   └── providers/
│       ├── ClientWeb3Provider.tsx  # Wrapper dinámico (ssr: false)
│       └── Web3Provider.tsx        # Composición de proveedores Web3
├── .github/workflows/ci.yml    # Pipeline de CI (GitHub Actions)
├── .env.local.example           # Template de variables de entorno
└── LICENSE                      # MIT
```

## Setup

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

```bash
cp .env.local.example .env.local
```

Completá el archivo `.env.local` con tu **WalletConnect Project ID**.
Podés obtener uno gratis en [cloud.walletconnect.com](https://cloud.walletconnect.com).

### 3. Correr el servidor de desarrollo

```bash
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts disponibles

| Comando                 | Descripción                     |
| ----------------------- | ------------------------------- |
| `npm run dev`           | Servidor de desarrollo          |
| `npm run build`         | Build de producción             |
| `npm run start`         | Servidor de producción          |
| `npm run lint`          | Linter (ESLint)                 |
| `npm run typecheck`     | Verificación de tipos (tsc)     |
| `npm run format`        | Formatear código (Prettier)     |
| `npm run format:check`  | Verificar formato sin modificar |
| `npm test`              | Ejecutar tests (Vitest)         |
| `npm run test:watch`    | Tests en modo watch             |
| `npm run test:coverage` | Tests con reporte de cobertura  |

## CI

El proyecto incluye un workflow de GitHub Actions (`.github/workflows/ci.yml`) que se ejecuta en cada push a `main` y en pull requests. El pipeline verifica:

1. **Formato** — `prettier --check`
2. **Lint** — `eslint`
3. **Tipos** — `tsc --noEmit`
4. **Tests** — `vitest run`
5. **Build** — `next build`

## RPC Provider privado (opcional)

Por defecto, la app usa RPCs públicos. Para producción, agregá tu API key de Infura:

1. Creá una cuenta en [infura.io](https://app.infura.io).
2. Agregá tu key en `.env.local`:

```
NEXT_PUBLIC_INFURA_API_KEY=tu_key_aqui
```

3. Reiniciá el dev server.

El código en `src/config/wagmi.ts` detecta la key automáticamente y cambia a tu RPC privado. Los comentarios en ese archivo explican cómo adaptarlo a otros providers (Alchemy, QuickNode, etc.).

## Agregar redes

Editá `src/config/wagmi.ts`:

1. Importá la red desde `wagmi/chains`.
2. Agregala al array `chains`.
3. Agregá su transporte en el objeto `transports`.

```ts
import { mainnet, sepolia, polygon } from 'wagmi/chains';

chains: [mainnet, sepolia, polygon],
transports: {
  [mainnet.id]: http(),
  [sepolia.id]: http(),
  [polygon.id]: http(),
},
```

## Leer datos de la blockchain

Usá los hooks de Wagmi dentro de componentes `'use client'`. El componente `TokenInfo.tsx` es un ejemplo completo de cómo leer un smart contract con `useReadContract`:

```tsx
'use client';
import { useReadContract } from 'wagmi';
import { erc20Abi } from '@/abi/erc20';

const { data: name } = useReadContract({
  address: '0x...', // dirección del contrato
  abi: erc20Abi, // ABI del contrato (ver src/abi/)
  functionName: 'name', // función a llamar
});
```

## Smart Contracts

La carpeta `contracts/` está preparada para tus contratos en Solidity. El boilerplate no preinstala Hardhat ni Foundry — vos elegís tu toolchain.

Leé **[contracts/README.md](./contracts/README.md)** para instrucciones paso a paso de cómo:

- Configurar Hardhat o Foundry.
- Compilar contratos y obtener ABIs.
- Conectar los ABIs con el frontend via `src/abi/`.
- Deployar y usar las direcciones en tus componentes.

## Licencia

[MIT](./LICENSE)

## Recursos

- [Documentación de Wagmi](https://wagmi.sh/react/getting-started)
- [Documentación de RainbowKit](https://www.rainbowkit.com/docs/introduction)
- [viem docs](https://viem.sh/docs/getting-started)
- [Hardhat docs](https://hardhat.org/docs)
- [Foundry Book](https://book.getfoundry.sh/)
