import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppText } from '@/src/components/ui/AppText';
import { useAppTheme } from '@/src/theme/theme';

interface MichiDialogueProps {
  text: string;
  onComplete?: () => void;
  skipAnimation?: boolean;
  showNameLabel?: boolean;
}

export function MichiDialogue({ text, onComplete, skipAnimation = false, showNameLabel = true }: MichiDialogueProps) {
  const theme = useAppTheme();
  const [visibleChars, setVisibleChars] = useState(skipAnimation ? text.length : 0);

  useEffect(() => {
    if (skipAnimation) {
      setVisibleChars(text.length);
      onComplete?.();
      return;
    }

    setVisibleChars(0);
    const id = setInterval(() => {
      setVisibleChars((prev) => {
        const next = Math.min(prev + 1, text.length);
        if (next >= text.length) {
          clearInterval(id);
          onComplete?.();
        }
        return next;
      });
    }, 30);

    return () => clearInterval(id);
  }, [text, skipAnimation, onComplete]);

  const displayText = useMemo(() => text.slice(0, visibleChars), [text, visibleChars]);

  const handlePress = () => {
    if (visibleChars < text.length) {
      setVisibleChars(text.length);
      onComplete?.();
    }
  };

  return (
    <View style={styles.wrap}>
      {showNameLabel ? (
        <AppText style={[styles.name, { color: theme.colors.brand }]}>Michi</AppText>
      ) : null}
      <Pressable
        onPress={handlePress}
        style={[styles.box, { borderColor: theme.colors.border, shadowColor: theme.colors.shadow }]}
      >
        <View style={[styles.pointer, { borderBottomColor: theme.colors.border }]} />
        <View style={[styles.pointerInner, { borderBottomColor: '#FFFFFF' }]} />
        <AppText style={[styles.text, { color: theme.colors.text }]}>{displayText}</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: '100%',
  },
  name: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
    marginLeft: 12,
  },
  box: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  pointer: {
    position: 'absolute',
    top: -14,
    left: 26,
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderRightWidth: 10,
    borderBottomWidth: 14,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  pointerInner: {
    position: 'absolute',
    top: -11,
    left: 28,
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    minHeight: 48,
  },
});
