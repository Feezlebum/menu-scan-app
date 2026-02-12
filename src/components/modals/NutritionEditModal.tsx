import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';

interface NutritionValues {
  estimatedCalories: number;
  estimatedProtein: number;
  estimatedCarbs: number;
  estimatedFat: number;
}

interface NutritionEditModalProps {
  visible: boolean;
  initialValues: NutritionValues;
  onClose: () => void;
  onSave: (values: NutritionValues) => void;
}

export function NutritionEditModal({ visible, initialValues, onClose, onSave }: NutritionEditModalProps) {
  const theme = useAppTheme();
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!visible) return;
    setCalories(`${initialValues.estimatedCalories}`);
    setProtein(`${initialValues.estimatedProtein}`);
    setCarbs(`${initialValues.estimatedCarbs}`);
    setFat(`${initialValues.estimatedFat}`);
    setError('');
  }, [visible, initialValues]);

  const sanitize = (value: string) => value.replace(/[^0-9.]/g, '');

  const handleSave = () => {
    const cals = Number.parseFloat(calories);
    const p = Number.parseFloat(protein);
    const c = Number.parseFloat(carbs);
    const f = Number.parseFloat(fat);

    if (![cals, p, c, f].every((n) => Number.isFinite(n))) {
      setError('Please enter valid numeric values.');
      return;
    }

    if (cals < 0 || cals > 4000 || p < 0 || p > 400 || c < 0 || c > 500 || f < 0 || f > 250) {
      setError('Values look out of range. Please review and try again.');
      return;
    }

    onSave({
      estimatedCalories: Math.round(cals),
      estimatedProtein: Math.round(p),
      estimatedCarbs: Math.round(c),
      estimatedFat: Math.round(f),
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.colors.bg }]}> 
          <AppText style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Edit Nutrition</AppText>

          <View style={styles.grid}>
            <Field label="Calories" value={calories} setValue={(v) => setCalories(sanitize(v))} />
            <Field label="Protein (g)" value={protein} setValue={(v) => setProtein(sanitize(v))} />
            <Field label="Carbs (g)" value={carbs} setValue={(v) => setCarbs(sanitize(v))} />
            <Field label="Fat (g)" value={fat} setValue={(v) => setFat(sanitize(v))} />
          </View>

          {error ? <AppText style={[styles.error, { color: theme.colors.trafficRed }]}>{error}</AppText> : null}

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.secondary, { borderColor: theme.colors.border }]} onPress={onClose}>
              <AppText style={[styles.buttonText, { color: theme.colors.text }]}>Cancel</AppText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.primary, { backgroundColor: theme.colors.brand }]} onPress={handleSave}>
              <AppText style={styles.primaryText}>Save</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, value, setValue }: { label: string; value: string; setValue: (v: string) => void }) {
  const theme = useAppTheme();
  return (
    <View style={styles.field}>
      <AppText style={[styles.label, { color: theme.colors.subtext }]}>{label}</AppText>
      <TextInput
        value={value}
        onChangeText={setValue}
        keyboardType="decimal-pad"
        placeholder="0"
        placeholderTextColor={theme.colors.subtext}
        style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.text }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: 18,
    padding: 18,
  },
  title: {
    fontSize: 20,
    marginBottom: 12,
  },
  grid: {
    gap: 10,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 13,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    height: 42,
    paddingHorizontal: 10,
    fontSize: 15,
  },
  error: {
    marginTop: 8,
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  button: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondary: {
    borderWidth: 1,
  },
  primary: {},
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});