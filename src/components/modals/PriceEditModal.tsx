import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';

interface PriceEditModalProps {
  visible: boolean;
  initialPrice: number;
  onClose: () => void;
  onSave: (price: number) => void;
}

export function PriceEditModal({ visible, initialPrice, onClose, onSave }: PriceEditModalProps) {
  const theme = useAppTheme();
  const [priceInput, setPriceInput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setPriceInput(initialPrice.toFixed(2));
      setError('');
    }
  }, [visible, initialPrice]);

  const handleSave = () => {
    const parsed = Number.parseFloat(priceInput.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 1000) {
      setError('Please enter a valid price between 0.00 and 1000.00');
      return;
    }

    onSave(Number(parsed.toFixed(2)));
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.colors.bg }]}> 
          <AppText style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Edit Price</AppText>

          <View style={[styles.inputWrap, { borderColor: theme.colors.border }]}> 
            <AppText style={[styles.dollar, { color: theme.colors.subtext }]}>$</AppText>
            <TextInput
              value={priceInput}
              onChangeText={(value) => {
                setPriceInput(value.replace(/[^0-9.]/g, ''));
                if (error) setError('');
              }}
              keyboardType="decimal-pad"
              placeholder="0.00"
              placeholderTextColor={theme.colors.subtext}
              style={[styles.input, { color: theme.colors.text }]}
            />
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
  inputWrap: {
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
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
