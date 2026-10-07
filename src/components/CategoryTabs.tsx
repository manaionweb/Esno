import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

export type Category = 'All' | 'Health' | 'Mind' | 'Work' | 'Joy';

interface CategoryTabsProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
}

const CATEGORIES: { label: Category; color: string }[] = [
  { label: 'All', color: '#1B153D' },
  { label: 'Health', color: '#6DBE8B' },
  { label: 'Mind', color: '#7A75C7' },
  { label: 'Work', color: '#F4C773' },
  { label: 'Joy', color: '#F28D81' },
];

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.label;
          return (
            <TouchableOpacity
              key={cat.label}
              onPress={() => onSelectCategory(cat.label)}
              style={[
                styles.tab,
                { borderColor: cat.color },
                isSelected && { backgroundColor: cat.color },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isSelected ? '#FFFFFF' : cat.color },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
