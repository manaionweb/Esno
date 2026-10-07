import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Pressable, Dimensions } from 'react-native';
import { HABIT_ICONS, getIconComponent } from '../utils/icons';
import { X } from 'lucide-react-native';
import { useTheme } from '../utils/theme';

interface IconPickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSelect: (iconName: string) => void;
  selectedIcon: string;
}

const { width } = Dimensions.get('window');

export const IconPickerModal: React.FC<IconPickerModalProps> = ({ isVisible, onClose, onSelect, selectedIcon }) => {
  const theme = useTheme();
  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>Select Icon</Text>
            <TouchableOpacity onPress={onClose}>
              <X size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.grid}>
            {HABIT_ICONS.map((item) => {
              const isSelected = selectedIcon === item.name;
              return (
                <TouchableOpacity
                  key={item.name}
                  style={[
                    styles.iconItem, { backgroundColor: theme.background, borderColor: theme.border },
                    isSelected && { backgroundColor: theme.textPrimary, borderColor: theme.textPrimary }
                  ]}
                  onPress={() => {
                    onSelect(item.name);
                    onClose();
                  }}
                >
                  {React.createElement(item.component, {
                    size: 32,
                    color: isSelected ? theme.surface : theme.textPrimary,
                    strokeWidth: 2,
                  })}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: width * 0.85,
    maxHeight: '70%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#322A5C',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Center the grid items
    gap: 12,
    paddingBottom: 20,
  },
  iconItem: {
    width: 80, // Fixed width for better control
    height: 80, // Fixed height for better control
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#F9F9F9',
    marginBottom: 4,
  },
  iconItemActive: {
    backgroundColor: '#322A5C',
    borderColor: '#322A5C',
  },
});
