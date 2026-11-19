import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';

import { useAppTheme } from '@/theme/use-app-theme';

interface EmptyStateProps {
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  message: string;
  actionLabel?: string;
  onAction?(): void;
}

/** Explains why a list is empty and offers one way forward. */
export function EmptyState({ icon, title, message, actionLabel, onAction }: EmptyStateProps) {
  const theme = useAppTheme();
  return (
    <View style={styles.container} accessibilityRole="summary">
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.surfaceVariant }]}>
        <MaterialCommunityIcons name={icon} size={40} color={theme.colors.onSurfaceVariant} />
      </View>
      <Text variant="titleMedium">{title}</Text>
      <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button mode="outlined" onPress={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 12, paddingHorizontal: 32, paddingTop: 64 },
  iconWrap: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  message: { textAlign: 'center' },
});
