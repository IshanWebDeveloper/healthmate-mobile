import { useTheme } from 'react-native-paper';

import type { AppTheme } from './theme';

/** Typed access to the Paper theme, including the metric palette. */
export const useAppTheme = () => useTheme<AppTheme>();
