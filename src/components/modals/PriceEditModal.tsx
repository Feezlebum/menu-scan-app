import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import type { CurrencyCode } from '@/src/types/spending';

const SUPPORTED_CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'GBP', 'THB', 'INR', 'JPY', 'CNY', 'AUD', 'CAD', 'SGD', 'MXN'];

interface PriceEditModalProps {
  visible: boolean;
  initialPrice: number;
  initialCurrency: CurrencyCode;
  onClose: () => void;
  onSave: (price: number, currency: CurrencyCode) => void;
}

export function PriceEditModal({ visible, initialPrice, initialCurrency, onClose, onSave }: PriceEditModalProps) {
  const theme = useAppTheme();
  const [priceInput, setPriceInput] = useState('');
  const [currency, setCurrency] = useState<CurrencyCode>(initialCurrency);
  const [error, setError] = useState('');

  useEffect(() => {
    if (visible) {
      setPriceInput(initialPrice.toFixed(2));
      setCurrency(initialCurrency);
      setError('');
    }
  }, [visible, initialPrice, initialCurrency]);

  const handleSave = () => {
    const parsed = Number.parseFloat(priceInput.replace(/[^0-9.]/g, ''));
    if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100000) {
      setError('Please enter a valid price between 0.00 and 100000.00');
      return;
    }

    onSave(Number(parsed.toFixed(2)), currency);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.colors.bg }]}> 
          <AppText style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Edit Price</AppText>

          <View style={[styles.inputWrap, { borderColor: theme.colors.border }]}> 
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

          <View style={styles.currencyWrap}>
            {SUPPORTED_CURRENCIES.map((code) => (
              <TouchableOpacity
                key={code}
                style={[
                  styles.currencyPill,
                  { borderColor: theme.colors.border },
                  currency === code && { borderColor: theme.colors.brand, backgroundColor: `${theme.colors.brand}18` },
                ]}
                onPress={() => setCurrency(code)}
              >
                <AppText style={[styles.currencyText, { color: theme.colors.text }]}>{code}</AppText>
              </TouchableOpacity>
            ))}
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
    paddingHorizontal: 12,
  },
  input: {
    height: 46,
    fontSize: 17,
  },
  currencyWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  currencyPill: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  currencyText: {
    fontSize: 12,
    fontWeight: '600',
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
