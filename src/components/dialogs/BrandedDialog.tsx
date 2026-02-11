import React from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';

const MichiAvatar = require('@/assets/michi-avatar.png');
const MichiHero = require('@/assets/michi-hero.png');
const MichiThinking = require('@/assets/michi-magnifying-glass.png');

type MichiState = 'worried' | 'excited' | 'thinking' | 'sad' | 'default';

interface DialogAction {
  text: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onPress: () => void;
}

interface BrandedDialogProps {
  visible: boolean;
  title: string;
  message: string;
  michiState?: MichiState;
  actions: DialogAction[];
  onClose?: () => void;
}

function getMichiSource(state: MichiState) {
  if (state === 'excited') return MichiHero;
  if (state === 'thinking') return MichiThinking;
  return MichiAvatar;
}

export function BrandedDialog({
  visible,
  title,
  message,
  michiState = 'default',
  actions,
  onClose,
}: BrandedDialogProps) {
  const theme = useAppTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: theme.colors.bg }]}> 
          <Image source={getMichiSource(michiState)} style={styles.michi} resizeMode="contain" />
          <AppText style={[styles.title, { color: theme.colors.text, fontFamily: theme.fonts.heading.semiBold }]}>{title}</AppText>
          <View style={[styles.messageWrap, { backgroundColor: theme.colors.cardCream }]}> 
            <AppText style={[styles.message, { color: theme.colors.text }]}>{message}</AppText>
          </View>

          <View style={styles.actions}>
            {actions.map((action, i) => (
              <TouchableOpacity
                key={`${action.text}-${i}`}
                style={[
                  styles.action,
                  action.variant === 'primary' && { backgroundColor: theme.colors.brand },
                  action.variant === 'danger' && { backgroundColor: '#E86B50' },
                  (!action.variant || action.variant === 'secondary') && {
                    backgroundColor: '#fff',
                    borderWidth: 1,
                    borderColor: theme.colors.border,
                  },
                ]}
                onPress={action.onPress}
              >
                <AppText
                  style={[
                    styles.actionText,
                    { color: action.variant && action.variant !== 'secondary' ? '#fff' : theme.colors.text },
                  ]}
                >
                  {action.text}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    borderRadius: 18,
    padding: 18,
  },
  michi: {
    width: 84,
    height: 84,
    alignSelf: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  messageWrap: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  message: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  actions: {
    gap: 8,
  },
  action: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
