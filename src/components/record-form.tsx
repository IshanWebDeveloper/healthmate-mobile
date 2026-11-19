import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, type Control } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, TextInput } from 'react-native-paper';

import { DateField } from '@/components/date-field';
import type { HealthRecordInput } from '@/types';
import { recordFormSchema, RECORD_LIMITS, type RecordFormValues } from '@/validation';

type MetricName = 'steps' | 'calories' | 'water';

const METRIC_FIELDS: { name: MetricName; label: string; unit: string }[] = [
  { name: 'steps', label: 'Steps', unit: 'steps' },
  { name: 'calories', label: 'Calories burned', unit: 'kcal' },
  { name: 'water', label: 'Water intake', unit: 'ml' },
];

function MetricField({ control, name, label, unit }: { control: Control<RecordFormValues, unknown, HealthRecordInput>; name: MetricName; label: string; unit: string }) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <View>
          <TextInput
            mode="outlined"
            label={label}
            value={field.value}
            onChangeText={field.onChange}
            onBlur={field.onBlur}
            keyboardType="number-pad"
            returnKeyType="next"
            error={!!fieldState.error}
            right={<TextInput.Affix text={unit} />}
            testID={`field-${name}`}
          />
          <HelperText type={fieldState.error ? 'error' : 'info'} visible>
            {fieldState.error?.message ?? `Whole number, 0 to ${RECORD_LIMITS[name].toLocaleString('en-US')}`}
          </HelperText>
        </View>
      )}
    />
  );
}

interface RecordFormProps {
  defaultValues: RecordFormValues;
  submitLabel: string;
  onSubmit(values: HealthRecordInput): Promise<void>;
  onCancel(): void;
}

/**
 * Shared Add/Edit form. react-hook-form owns field state; the zod schema both
 * validates the text input and converts it into a HealthRecordInput.
 */
export function RecordForm({ defaultValues, submitLabel, onSubmit, onCancel }: RecordFormProps) {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RecordFormValues, unknown, HealthRecordInput>({
    resolver: zodResolver(recordFormSchema),
    defaultValues,
    mode: 'onTouched',
  });

  const submit = handleSubmit(async (values) => {
    try {
      await onSubmit(values);
    } catch {
      setError('root', { message: 'Could not save the record. Please try again.' });
    }
  });

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Controller
          control={control}
          name="date"
          render={({ field, fieldState }) => (
            <DateField
              label="Date"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              maximumDate={new Date()}
              error={fieldState.error?.message}
              testID="field-date"
            />
          )}
        />
        {METRIC_FIELDS.map((f) => (
          <MetricField key={f.name} control={control} {...f} />
        ))}

        {errors.root?.message ? (
          <HelperText type="error" visible style={styles.rootError}>
            {errors.root.message}
          </HelperText>
        ) : null}

        <View style={styles.actions}>
          <Button mode="contained" onPress={() => void submit()} loading={isSubmitting} disabled={isSubmitting} testID="submit">
            {submitLabel}
          </Button>
          <Button mode="text" onPress={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 4 },
  rootError: { fontSize: 14 },
  actions: { gap: 8, marginTop: 16 },
});
