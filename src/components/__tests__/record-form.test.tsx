import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { PaperProvider } from 'react-native-paper';

import { lightTheme } from '@/theme/theme';
import { RecordForm } from '@/components/record-form';
import type { RecordFormValues } from '@/validation';

const DEFAULTS: RecordFormValues = { date: '2026-10-15', steps: '', calories: '', water: '' };

async function renderForm(onSubmit = jest.fn().mockResolvedValue(undefined)) {
  await render(
    <PaperProvider theme={lightTheme}>
      <RecordForm defaultValues={DEFAULTS} submitLabel="Save record" onSubmit={onSubmit} onCancel={jest.fn()} />
    </PaperProvider>,
  );
  return onSubmit;
}

describe('RecordForm', () => {
  it('shows inline errors and does not submit invalid input', async () => {
    const onSubmit = await renderForm();

    await fireEvent.changeText(screen.getByTestId('field-steps'), '-20');
    await fireEvent.changeText(screen.getByTestId('field-calories'), '12.5');
    await fireEvent.press(screen.getByTestId('submit'));

    expect(await screen.findByText('Steps cannot be negative')).toBeOnTheScreen();
    expect(screen.getByText('Calories must be a whole number')).toBeOnTheScreen();
    expect(screen.getByText('Water is required')).toBeOnTheScreen();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits converted numbers when every field is valid', async () => {
    const onSubmit = await renderForm();

    await fireEvent.changeText(screen.getByTestId('field-steps'), '7850');
    await fireEvent.changeText(screen.getByTestId('field-calories'), '420');
    await fireEvent.changeText(screen.getByTestId('field-water'), '2000');
    await fireEvent.press(screen.getByTestId('submit'));

    await waitFor(() =>
      expect(onSubmit).toHaveBeenCalledWith({ date: '2026-10-15', steps: 7850, calories: 420, water: 2000 }),
    );
  });

  it('shows a save failure as a form-level error', async () => {
    await renderForm(jest.fn().mockRejectedValue(new Error('database is locked')));

    await fireEvent.changeText(screen.getByTestId('field-steps'), '1');
    await fireEvent.changeText(screen.getByTestId('field-calories'), '1');
    await fireEvent.changeText(screen.getByTestId('field-water'), '1');
    await fireEvent.press(screen.getByTestId('submit'));

    expect(await screen.findByText('Could not save the record. Please try again.')).toBeOnTheScreen();
  });
});
