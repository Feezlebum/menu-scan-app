import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';

interface BudgetPickerModalProps {
  visible: boolean;
  currentBudget: number | null;
  onClose: () => void;
  onSave: (amount: number) => void;
  onClear: () => void;
}

const PRESETS = [50, 100, 150, 200, 250];

export function BudgetPickerModal({ visible, currentBudget, onClose, onSave, onClear }: BudgetPickerModalProps) {
  const theme = useAppTheme();
  const [customBudgetInput, setCustomBudgetInput] = useState('');

  useEffect(() => {
    if (visible) {
      setCustomBudgetInput(currentBudget ? String(currentBudget) : '');
    }
  }, [visible, currentBudget]);

  const saveCustom = () => {
    const parsed = Number.parseFloat(customBudgetInput.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1000) {
      Alert.alert('Invalid amount', 'Please enter a value between 0 and 1000.');
      return;
    }
    onSave(parsed);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.colors.bg }]}> 
          <AppText style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Weekly Dining Budget</AppText>

          <View style={styles.presetsGrid}>
            {PRESETS.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.presetChip,
                  { borderColor: theme.colors.border },
                  currentBudget === amount && { borderColor: theme.colors.brand, backgroundColor: theme.colors.brand + '16' },
                ]}
                onPress={() => {
                  onSave(amount);
                  onClose();
                }}
              >
                <AppText style={[styles.presetText, { color: theme.colors.text }]}>${amount}</AppText>
              </TouchableOpacity>
            ))}
          </View>

          <AppText style={[styles.subtitle, { color: theme.colors.subtext }]}>Custom amount</AppText>
          <View style={[styles.inputWrap, { borderColor: theme.colors.border }]}> 
            <AppText style={[styles.dollar, { color: theme.colors.subtext }]}>$</AppText>
            <TextInput
              value={customBudgetInput}
              onChangeText={(value) => setCustomBudgetInput(value.replace(/[^0-9.]/g, ''))}
              keyboardType="decimal-pad"
              placeholder="Enter budget"
              placeholderTextColor={theme.colors.subtext}
              style={[styles.input, { color: theme.colors.text }]}
            />
          </View>

          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.colors.brand }]} onPress={saveCustom}>
            <AppText style={styles.primaryButtonText}>Save Custom Amount</AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={onClear}>
            <AppText style={[styles.linkText, { color: theme.colors.trafficRed }]}>Clear budget</AppText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton} onPress={onClose}>
            <AppText style={[styles.linkText, { color: theme.colors.subtext }]}>Cancel</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
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
    marginBottom: 14,
  },
  presetsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  presetChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  presetText: {
    fontSize: 15,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 8,
  },
  inputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  dollar: {
    fontSize: 18,
    marginRight: 6,
  },
  input: {
    flex: 1,
    height: 46,
    fontSize: 17,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  linkButton: {
    marginTop: 10,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
  },
});
