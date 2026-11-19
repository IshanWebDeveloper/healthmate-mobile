import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import { METRIC_META, type Metric } from '@/components/metric-card';
import type { DailyGoals } from '@/types';
import { goalsFormSchema, RECORD_LIMITS, type GoalsFormValues } from '@/validation';

export function toGoalsFormValues(goals: DailyGoals): GoalsFormValues {
  return { steps: String(goals.steps), calories: String(goals.calories), water: String(goals.water) };
}

interface GoalsFormProps {
  defaultValues: GoalsFormValues;
  onSubmit(goals: DailyGoals): Promise<void>;
}

/** Edits the three daily goals. Validation mirrors the record form: whole numbers within the record limits. */
export function GoalsForm({ defaultValues, onSubmit }: GoalsFormProps) {
  const {
    control,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<GoalsFormValues, unknown, DailyGoals>({
    resolver: zodResolver(goalsFormSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const submit = handleSubmit(async (goals) => {
    try {
      await onSubmit(goals);
      reset(toGoalsFormValues(goals));
    } catch {
      setError('root', { message: 'Could not save your goals. Please try again.' });
    }
  });

  return (
    <View style={styles.container}>
      {(Object.keys(METRIC_META) as Metric[]).map((name) => (
        <Controller
          key={name}
          control={control}
          name={name}
          render={({ field, fieldState }) => (
            <View>
              <TextInput
                mode="outlined"
                label={`${METRIC_META[name].label} goal`}
                value={field.value}
                onChangeText={field.onChange}
                onBlur={field.onBlur}
                keyboardType="number-pad"
                error={!!fieldState.error}
                right={<TextInput.Affix text={METRIC_META[name].unit} />}
                testID={`goal-${name}`}
              />
              <HelperText type={fieldState.error ? 'error' : 'info'} visible>
                {fieldState.error?.message ?? `Whole number, 1 to ${RECORD_LIMITS[name].toLocaleString('en-US')}`}
              </HelperText>
            </View>
          )}
        />
      ))}

      {errors.root?.message ? (
        <HelperText type="error" visible>
          {errors.root.message}
        </HelperText>
      ) : null}

      <Button
        mode="contained"
        onPress={() => void submit()}
        loading={isSubmitting}
        disabled={isSubmitting || !isDirty}
        testID="save-goals"
      >
        Save goals
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 4 },
});
