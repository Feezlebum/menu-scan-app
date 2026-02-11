import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';

type OverrideValue = 'ai' | 'healthy' | 'unhealthy';

interface HealthEditModalProps {
  visible: boolean;
  initialValue: OverrideValue;
  onClose: () => void;
  onSave: (value: OverrideValue) => void;
}

const OPTIONS: Array<{ key: OverrideValue; label: string }> = [
  { key: 'healthy', label: 'This was a healthy choice for me' },
  { key: 'ai', label: 'Let MenuScan decide' },
  { key: 'unhealthy', label: "This was a treat - don't count it" },
];

export function HealthEditModal({ visible, initialValue, onClose, onSave }: HealthEditModalProps) {
  const theme = useAppTheme();
  const [selected, setSelected] = useState<OverrideValue>('ai');

  useEffect(() => {
    if (visible) setSelected(initialValue);
  }, [visible, initialValue]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.colors.bg }]}> 
          <AppText style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>How do you feel about this choice?</AppText>

          {OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.key} style={styles.row} onPress={() => setSelected(opt.key)} activeOpacity={0.8}>
              <View style={[styles.dot, { borderColor: theme.colors.brand }, selected === opt.key && { backgroundColor: theme.colors.brand }]} />
              <AppText style={[styles.label, { color: theme.colors.text }]}>{opt.label}</AppText>
            </TouchableOpacity>
          ))}

          <View style={styles.actions}>
            <TouchableOpacity style={[styles.button, styles.secondary, { borderColor: theme.colors.border }]} onPress={onClose}>
              <AppText style={[styles.buttonText, { color: theme.colors.text }]}>Cancel</AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primary, { backgroundColor: theme.colors.brand }]}
              onPress={() => {
                onSave(selected);
                onClose();
              }}
            >
              <AppText style={styles.primaryText}>Save</AppText>
            </TouchableOpacity>
          </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
  },
  label: {
    flex: 1,
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
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
