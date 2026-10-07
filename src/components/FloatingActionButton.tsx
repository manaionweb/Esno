import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../utils/theme';

interface FloatingActionButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({ onPress, style }) => {
  const theme = useTheme();
  return (
    <TouchableOpacity style={[styles.button, style, { backgroundColor: theme.textPrimary, shadowColor: theme.shadowColor }]} onPress={onPress} activeOpacity={0.8}>
      <Plus size={32} color={theme.surface} strokeWidth={2} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#322A5C', // Deep Navy/Purple from screenshot
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#322A5C',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    position: 'absolute',
    bottom: 24,
    right: 24,
  },
});
