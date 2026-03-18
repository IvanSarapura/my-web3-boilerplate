import { darkTheme, lightTheme, type Theme } from '@rainbow-me/rainbowkit';

/**
 * Tema custom de RainbowKit que usa el color accent del proyecto (#6c47ff).
 *
 * Para personalizar más opciones, revisá la documentación:
 * https://www.rainbowkit.com/docs/custom-theme
 *
 * Podés cambiar los colores, border radius, font stack, y más.
 * Cada función (lightTheme/darkTheme) acepta un objeto de configuración
 * y devuelve un tema completo que podés sobreescribir parcialmente.
 */

const accentColor = '#6c47ff';
const accentColorForeground = '#ffffff';

export const customLightTheme: Theme = {
  ...lightTheme({
    accentColor,
    accentColorForeground,
    borderRadius: 'medium',
  }),
};

export const customDarkTheme: Theme = {
  ...darkTheme({
    accentColor,
    accentColorForeground,
    borderRadius: 'medium',
  }),
};
