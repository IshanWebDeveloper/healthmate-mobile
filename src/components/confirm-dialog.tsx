import { Button, Dialog, Portal, Text } from 'react-native-paper';

import { useAppTheme } from '@/theme/use-app-theme';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm(): void;
  onDismiss(): void;
}

/** Asks before a destructive action. The confirm button uses the error colour; tapping outside cancels. */
export function ConfirmDialog({ visible, title, message, confirmLabel, onConfirm, onDismiss }: ConfirmDialogProps) {
  const theme = useAppTheme();
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>{title}</Dialog.Title>
        <Dialog.Content>
          <Text variant="bodyMedium">{message}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>Cancel</Button>
          <Button textColor={theme.colors.error} onPress={onConfirm}>
            {confirmLabel}
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
