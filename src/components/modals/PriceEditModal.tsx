import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';
import type { CurrencyCode } from '@/src/types/spending';

const SUPPORTED_CURRENCIES: CurrencyCode[] = [
  'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'HKD', 'SGD',
  'INR', 'THB', 'KRW', 'NZD', 'SEK', 'NOK', 'DKK', 'PLN', 'BRL', 'MXN',
];

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
  const [currencyPickerVisible, setCurrencyPickerVisible] = useState(false);

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

          <TouchableOpacity
            style={[styles.currencySelector, { borderColor: theme.colors.border }]}
            onPress={() => setCurrencyPickerVisible(true)}
          >
            <AppText style={[styles.currencySelectorLabel, { color: theme.colors.subtext }]}>Currency</AppText>
            <View style={styles.currencySelectorValueWrap}>
              <AppText style={[styles.currencySelectorValue, { color: theme.colors.text }]}>{currency}</AppText>
              <AppText style={[styles.currencySelectorChevron, { color: theme.colors.subtext }]}>▾</AppText>
            </View>
          </TouchableOpacity>

          <Modal visible={currencyPickerVisible} transparent animationType="fade" onRequestClose={() => setCurrencyPickerVisible(false)}>
            <View style={styles.pickerBackdrop}>
              <View style={[styles.pickerCard, { backgroundColor: theme.colors.bg, borderColor: theme.colors.border }]}> 
                <AppText style={[styles.pickerTitle, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>Select currency</AppText>
                <ScrollView style={styles.pickerList} contentContainerStyle={styles.pickerListContent}>
                  {SUPPORTED_CURRENCIES.map((code) => (
                    <TouchableOpacity
                      key={code}
                      style={[
                        styles.pickerOption,
                        { borderColor: theme.colors.border },
                        currency === code && { borderColor: theme.colors.brand, backgroundColor: `${theme.colors.brand}16` },
                      ]}
                      onPress={() => {
                        setCurrency(code);
                        setCurrencyPickerVisible(false);
                      }}
                    >
                      <AppText style={[styles.pickerOptionText, { color: theme.colors.text }]}>{code}</AppText>
                      {currency === code ? <AppText style={{ color: theme.colors.brand }}>✓</AppText> : null}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity style={styles.pickerClose} onPress={() => setCurrencyPickerVisible(false)}>
                  <AppText style={[styles.pickerCloseText, { color: theme.colors.subtext }]}>Close</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

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
  currencySelector: {
    marginTop: 10,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currencySelectorLabel: {
    fontSize: 13,
  },
  currencySelectorValueWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  currencySelectorValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  currencySelectorChevron: {
    fontSize: 14,
  },
  pickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.28)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  pickerCard: {
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: '70%',
    padding: 14,
  },
  pickerTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  pickerList: {
    maxHeight: 340,
  },
  pickerListContent: {
    gap: 8,
  },
  pickerOption: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pickerClose: {
    alignItems: 'center',
    marginTop: 10,
  },
  pickerCloseText: {
    fontSize: 14,
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
