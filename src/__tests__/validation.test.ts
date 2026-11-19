import { goalsFormSchema, recordFormSchema } from '@/validation';

const valid = { date: '2026-10-15', steps: '7850', calories: '420', water: '2000' };

function firstError(values: Partial<typeof valid>): string | undefined {
  const result = recordFormSchema.safeParse({ ...valid, ...values });
  return result.success ? undefined : result.error.issues[0]?.message;
}

describe('recordFormSchema', () => {
  it('converts valid text input into numbers', () => {
    expect(recordFormSchema.parse({ ...valid, steps: ' 7850 ' })).toEqual({
      date: '2026-10-15',
      steps: 7850,
      calories: 420,
      water: 2000,
    });
  });

  it('accepts zero (a rest day is valid data)', () => {
    expect(firstError({ steps: '0', calories: '0', water: '0' })).toBeUndefined();
  });

  it.each([
    [{ steps: '' }, 'Steps is required'],
    [{ steps: '-20' }, 'Steps cannot be negative'],
    [{ calories: '12.5' }, 'Calories must be a whole number'],
    [{ water: 'abc' }, 'Water must be a whole number'],
    [{ steps: '250000' }, 'Steps cannot exceed 100,000'],
    [{ water: '25000' }, 'Water cannot exceed 20,000'],
    [{ date: '' }, 'Date is required'],
    [{ date: '15/10/2026' }, 'Enter a valid date (YYYY-MM-DD)'],
    [{ date: '2026-13-01' }, 'Enter a valid date (YYYY-MM-DD)'],
    [{ date: '2099-01-01' }, 'Date cannot be in the future'],
  ])('rejects %j with "%s"', (values, message) => {
    expect(firstError(values)).toBe(message);
  });
});

describe('goalsFormSchema', () => {
  it('converts valid goals into numbers', () => {
    expect(goalsFormSchema.parse({ steps: '8000', calories: '400', water: '1500' })).toEqual({
      steps: 8000,
      calories: 400,
      water: 1500,
    });
  });

  it('rejects a zero goal', () => {
    const result = goalsFormSchema.safeParse({ steps: '0', calories: '400', water: '1500' });
    expect(result.success ? undefined : result.error.issues[0]?.message).toBe('Steps goal must be at least 1');
  });
});
