import { fireEvent, render, screen } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { lightTheme } from '@/theme/theme';

async function renderDialog(visible = true) {
  const onConfirm = jest.fn();
  const onDismiss = jest.fn();
  await render(
    <PaperProvider theme={lightTheme}>
      <ConfirmDialog
        visible={visible}
        title="Delete this record?"
        message="This permanently removes the record."
        confirmLabel="Delete"
        onConfirm={onConfirm}
        onDismiss={onDismiss}
      />
    </PaperProvider>,
  );
  return { onConfirm, onDismiss };
}

describe('ConfirmDialog', () => {
  it('confirms only when the destructive button is pressed', async () => {
    const { onConfirm, onDismiss } = await renderDialog();

    expect(screen.getByText('Delete this record?')).toBeOnTheScreen();
    await fireEvent.press(screen.getByText('Delete'));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('cancels without confirming', async () => {
    const { onConfirm, onDismiss } = await renderDialog();

    await fireEvent.press(screen.getByText('Cancel'));

    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it('renders nothing while hidden', async () => {
    await renderDialog(false);
    expect(screen.queryByText('Delete this record?')).toBeNull();
  });
});
