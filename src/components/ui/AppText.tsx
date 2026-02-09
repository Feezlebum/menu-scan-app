import { Text, TextProps, TextStyle } from 'react-native';
import { useAppTheme } from '@/src/theme/theme';

type Variant = 'body' | 'heading' | 'caption' | 'button' | 'tag' | 'michi';

interface AppTextProps extends TextProps {
  variant?: Variant;
}

export function AppText({ variant = 'body', style, ...props }: AppTextProps) {
  const theme = useAppTheme();
  
  const variantStyles: Record<Variant, TextStyle> = {
    body: {
      fontFamily: theme.fonts.body.regular,
      fontSize: 15,
      color: theme.colors.subtext,
    },
    heading: {
      fontFamily: theme.fonts.heading.bold,
      fontSize: 20,
      color: theme.colors.text,
    },
    caption: {
      fontFamily: theme.fonts.body.regular,
      fontSize: 13,
      color: theme.colors.caption,
    },
    button: {
      fontFamily: theme.fonts.heading.semiBold,
      fontSize: 18,
      color: '#FFFFFF',
    },
    tag: {
      fontFamily: theme.fonts.body.semiBold,
      fontSize: 13,
      color: theme.colors.secondary,
    },
    michi: {
      fontFamily: theme.fonts.body.semiBold,
      fontSize: 14,
      color: theme.colors.text,
    },
  };

  return (
    <Text 
      {...props} 
      style={[variantStyles[variant], style]} 
    />
  );
}
