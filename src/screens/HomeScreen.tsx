import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabitStore, CategoryType } from '../store/useHabitStore';
import { CategoryTabs } from '../components/CategoryTabs';
import { HabitCard } from '../components/HabitCard';
import { FloatingActionButton } from '../components/FloatingActionButton';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useTheme } from '../utils/theme';
import { getLocalTodayString, getCompletionsThisWeek } from '../utils/dateUtils';

import { Svg, Circle, G, Path } from 'react-native-svg';
import { Confetti } from '../components/Confetti';
export const HomeScreen = () => {
  const habits = useHabitStore((state) => state.habits);
  const incrementHabitProgress = useHabitStore((state) => state.incrementHabitProgress);
  const deleteHabit = useHabitStore((state) => state.deleteHabit);
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const selectedCategory = useHabitStore((state) => state.selectedCategory);
  const setSelectedCategory = useHabitStore((state) => state.setSelectedCategory);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const setAddHabitModalOpen = useHabitStore((state) => state.setAddHabitModalOpen);

  const DAY_MAP = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const todayDayStr = DAY_MAP[new Date().getDay()];

  const filteredHabits = habits.filter((h) => {
    if (selectedCategory === 'All') {
      let isScheduledToday = true;
      if (h.frequency === 'Exact Days') {
        isScheduledToday = h.targetDays?.includes(todayDayStr) ?? true;
      } else if (h.frequency === 'Weekly Goal') {
        const completionsThisWeek = getCompletionsThisWeek(h.completedAt, 'Monday');
        const isWeeklyGoalMet = h.daysPerWeek ? completionsThisWeek >= h.daysPerWeek : false;
        isScheduledToday = !isWeeklyGoalMet;
      }
      return isScheduledToday;
    }
    return h.category === selectedCategory;
  });

  const handleOpenBottomSheet = () => {
    setAddHabitModalOpen(true);
  };

  // Dynamic Date and Greeting
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const hour = now.getHours();
  let greeting = 'Good Evening';
  if (hour >= 5 && hour < 12) greeting = 'Good Morning';
  else if (hour >= 12 && hour < 18) greeting = 'Good Afternoon';

  // Calculate today's completion percentage
  const todayStr = getLocalTodayString();
  const habitsToday = filteredHabits;
  const completedToday = habitsToday.filter(h => h.completedAt?.includes(todayStr)).length;
  const totalHabits = habitsToday.length;
  const completionRate = totalHabits > 0 ? completedToday / totalHabits : 0;

  // Detect completion for confetti
  const prevCompletedRef = useRef(completedToday);
  const prevCategoryRef = useRef(selectedCategory);
  
  useEffect(() => {
    // Treat a task as newly completed if the count goes up while staying in the same category view
    if (completedToday > prevCompletedRef.current && selectedCategory === prevCategoryRef.current) {
      setShowConfetti(true);
      // Reset after animation
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    } else if (completedToday < prevCompletedRef.current) {
      // Immediate cancel if task is unchecked
      setShowConfetti(false);
    }
    prevCompletedRef.current = completedToday;
    prevCategoryRef.current = selectedCategory;
  }, [completedToday, selectedCategory]);

  // Clock-style parameters
  const size = 31;
  const radius = size / 2;
  const strokeWidth = 2.5;
  const innerRadius = radius - strokeWidth/1; // Ensure stroke doesn't clip internally too much
  
  // Calculate the end point of the progress 'hand'
  const angle = completionRate * 360;
  const endX = radius + innerRadius * Math.cos((angle - 90) * Math.PI / 180);
  const endY = radius + innerRadius * Math.sin((angle - 90) * Math.PI / 180);
  const largeArcFlag = completionRate > 0.5 ? 1 : 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {showConfetti && <Confetti />}
      <View style={[styles.mainContent, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={[styles.dateText, { color: theme.textSecondary }]}>{dateString}</Text>
          <View style={styles.titleRow}>
            <Text style={[styles.greetingText, { color: theme.textPrimary }]}>{greeting}</Text>
            <View style={styles.progressIconContainer}>
              <Svg width={size} height={size}>
                {/* 1. Base Track Circle (Light Grey) */}
                <Circle
                  cx={radius}
                  cy={radius}
                  r={radius - strokeWidth/2}
                  stroke={theme.border}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                
                {/* 2. Progress Arc (Dark Blue - Hollow) */}
                {completionRate > 0 && completionRate < 1 && (
                   <Path 
                     d={`M ${radius} ${strokeWidth} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 1 ${endX} ${endY}`}
                     stroke={theme.textPrimary}
                     strokeWidth={strokeWidth}
                     fill="transparent"
                   />
                )}
                {/* Full circle if 100% */}
                {completionRate >= 1 && (
                   <Circle 
                     cx={radius} 
                     cy={radius} 
                     r={radius - strokeWidth/2} 
                     stroke={theme.textPrimary} 
                     strokeWidth={strokeWidth} 
                     fill="transparent" 
                   />
                )}

                {/* 3. Clock Hands (Start and End lines) */}
                {completionRate > 0 && (
                  <>
                    {/* Start Line (Fixed at 12 o'clock) */}
                    <Path 
                      d={`M ${radius} ${radius} L ${radius} ${strokeWidth}`}
                      stroke={theme.textPrimary}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                    />
                    {/* End Line (Moves with progress) */}
                    <Path 
                      d={`M ${radius} ${radius} L ${endX} ${endY}`}
                      stroke={theme.textPrimary}
                      strokeWidth={strokeWidth}
                      strokeLinecap="round"
                    />
                  </>
                )}
              </Svg>
            </View>
            
          </View>
        </View>

        <CategoryTabs
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        <ScrollView contentContainerStyle={[styles.listContent, { paddingBottom: (Platform.OS === 'ios' ? 120 : 100) + insets.bottom }]}>
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleCompletion={() => incrementHabitProgress(habit.id)}
              onDelete={() => deleteHabit(habit.id)}
              onEdit={() => setAddHabitModalOpen(true, habit)}
            />
          ))}
          {filteredHabits.length === 0 && (
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>No habits for this category yet.</Text>
          )}
        </ScrollView>

        <FloatingActionButton 
          onPress={handleOpenBottomSheet} 
          style={{ bottom: (Platform.OS === 'ios' ? 100 : 80) + insets.bottom, right: 24 }} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: '#8A8A8E',
    marginBottom: 4,
    fontWeight: '500',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#322A5C',
  },
  progressIconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50, // Move it up relative to the Good Morning text
  },
  listContent: {
    paddingBottom: 120, // padding for FAB and TabBar
  },
  emptyText: {
    textAlign: 'center',
    color: '#8A8A8E',
    marginTop: 40,
    fontSize: 16,
  },
});
