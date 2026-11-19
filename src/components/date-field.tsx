import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Platform, Pressable, View } from 'react-native';
import { HelperText, TextInput } from 'react-native-paper';

import { formatShortDate, parseISODate, toISODate } from '@/utils/date';

interface DateFieldProps {
  label: string;
  /** `yyyy-MM-dd` */
  value: string;
  onChange(value: string): void;
  onBlur?(): void;
  error?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  testID?: string;
}

/**
 * Read-only text field that opens the native date picker. Stores and emits
 * ISO dates so it plugs straight into the zod schema and the database.
 */
export function DateField({ label, value, onChange, onBlur, error, minimumDate, maximumDate, testID }: DateFieldProps) {
  const [open, setOpen] = useState(false);
  const close = () => {
    setOpen(false);
    onBlur?.();
  };

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${formatShortDate(value)}. Tap to change`}
        testID={testID}
      >
        {/* pointerEvents="none" so the Pressable, not the input, receives the tap */}
        <View pointerEvents="none">
          <TextInput
            mode="outlined"
            label={label}
            value={formatShortDate(value)}
            editable={false}
            error={!!error}
            right={<TextInput.Icon icon="calendar" />}
          />
        </View>
      </Pressable>
      {error ? (
        <HelperText type="error" visible>
          {error}
        </HelperText>
      ) : null}
      {open ? (
        <DateTimePicker
          value={parseISODate(value) ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          minimumDate={minimumDate}
          maximumDate={maximumDate}
          onValueChange={(_, date) => {
            close();
            onChange(toISODate(date));
          }}
          onDismiss={close}
        />
      ) : null}
    </View>
  );
}
