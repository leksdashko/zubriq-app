import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../theme';

interface Props {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'success' | 'danger';
  style?: ViewStyle;
  disabled?: boolean;
}

export function Button({ title, onPress, variant = 'primary', style, disabled }: Props) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const variantStyles = {
    primary: { bg: colors.primary, text: colors.bgWhite },
    secondary: { bg: colors.primaryLight, text: colors.primary },
    success: { bg: colors.success, text: colors.bgWhite },
    danger: { bg: colors.danger, text: colors.bgWhite },
  };

  const v = variantStyles[variant];

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: v.bg, opacity: pressed || disabled ? 0.7 : 1 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: v.text }]}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing['2xl'],
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    ...typography.bodyMedium,
    fontFamily: 'Inter_600SemiBold',
  },
});
