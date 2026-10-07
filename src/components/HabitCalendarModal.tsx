import React, { useRef, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHabitStore, Habit, CategoryType } from '../store/useHabitStore';
import { useTheme } from '../utils/theme';
import { getIconComponent } from '../utils/icons';
import { getLocalTodayString, parseLocalDate, getCompletionsThisWeek } from '../utils/dateUtils';

const CATEGORY_COLORS: Record<CategoryType, string> = {
  Health: '#6DBE8B',
  Mind: '#7A75C7',
  Work: '#F4C773',
  Joy: '#F28D81',
};

export const HabitCalendarModal = () => {
  const viewingHabit = useHabitStore((state) => state.viewingHabit);
  const setViewingHabit = useHabitStore((state) => state.setViewingHabit);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const [currentDate, setCurrentDate] = useState(new Date());

  const [localHabit, setLocalHabit] = useState<Habit | null>(null);

  useEffect(() => {
    if (viewingHabit) {
      setLocalHabit(viewingHabit);
      setCurrentDate(new Date()); // Reset to current month when opened
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [viewingHabit]);

  const handleClose = () => {
    setViewingHabit(null);
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
  );

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Calendar logic
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  // To handle Monday as start of week (1) or Sunday (0). Let's use Sunday for simplicity, as it aligns with getDay()
  const paddingDays = firstDayOfMonth; 

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const pads = Array.from({ length: paddingDays }, (_, i) => i);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const IconComponent = localHabit ? getIconComponent(localHabit.icon) : null;
  const color = localHabit ? CATEGORY_COLORS[localHabit.category] : theme.textPrimary;

  const completedSet = new Set(localHabit?.completedAt || []);

  const completionsThisWeek = localHabit?.frequency === 'Weekly Goal' ? getCompletionsThisWeek(localHabit.completedAt, 'Monday') : 0;
  const isWeeklyGoalMet = localHabit?.frequency === 'Weekly Goal' && localHabit.daysPerWeek ? completionsThisWeek >= localHabit.daysPerWeek : false;

  const DAY_MAP = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const todayDayStr = DAY_MAP[new Date().getDay()];
  
  let isScheduledToday = true;
  if (localHabit?.frequency === 'Exact Days') {
    isScheduledToday = localHabit.targetDays?.includes(todayDayStr) ?? true;
  } else if (localHabit?.frequency === 'Weekly Goal') {
    isScheduledToday = !isWeeklyGoalMet;
  }

  const renderWeeklyProgress = () => {
    if (!localHabit) return null;
    let startDateObj: Date;
    if (localHabit.createdAt) {
      startDateObj = parseLocalDate(localHabit.createdAt);
    } else {
      if (localHabit.completedAt && localHabit.completedAt.length > 0) {
        startDateObj = parseLocalDate([...localHabit.completedAt].sort()[0]);
      } else {
        startDateObj = new Date();
        startDateObj.setDate(startDateObj.getDate() - 6);
      }
    }
    
    if (isNaN(startDateObj.getTime())) {
      startDateObj = new Date();
    }

    const todayDateObj = new Date();
    todayDateObj.setHours(0, 0, 0, 0);
    startDateObj.setHours(0, 0, 0, 0);
    
    if (startDateObj.getTime() > todayDateObj.getTime()) {
      startDateObj = new Date(todayDateObj);
    }
    
    const diffTime = Math.abs(todayDateObj.getTime() - startDateObj.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const pastDaysToRender = Math.min(6, diffDays);

    const bars = [];
    for (let i = pastDaysToRender; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = getLocalTodayString(d);
      bars.push({
         isCompleted: localHabit.completedAt?.includes(dateStr) || false,
         key: `bar-${i}`
      });
    }

    return (
      <View style={styles.barsContainer}>
        {bars.map((bar) => (
          <View
            key={bar.key}
            style={[
              styles.bar,
              { backgroundColor: bar.isCompleted ? '#6DBE8B' : theme.borderStrong },
            ]}
          />
        ))}
      </View>
    );
  };

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      enableDynamicSizing={true}
      enablePanDownToClose
      onClose={handleClose}
      backdropComponent={renderBackdrop}
      backgroundStyle={[styles.sheetBackground, { backgroundColor: theme.surface }]}
      handleIndicatorStyle={[styles.indicator, { backgroundColor: theme.bottomSheetIndicator }]}
    >
      <BottomSheetScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.header}>
          <View style={[styles.iconWrapper, { backgroundColor: color + '20' }]}>
             {IconComponent && <IconComponent size={32} color={color} strokeWidth={2} />}
          </View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{localHabit?.title}</Text>
          <Text style={[styles.subtext, { color: theme.textSecondary, marginBottom: 16 }]}>
            {localHabit?.frequency === 'Weekly Goal' 
              ? (isWeeklyGoalMet ? `Weekly Goal Met 🎉` : `${completionsThisWeek}/${localHabit.daysPerWeek} days this week`)
              : (isScheduledToday ? `${localHabit?.targetValue} ${localHabit?.targetUnit}` : `Scheduled for ${localHabit?.targetDays?.join(', ') || 'specific days'}`)
            }
          </Text>
          <View style={styles.footer}>
            {renderWeeklyProgress()}
            <View style={styles.streakContainer}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={[styles.streakNumber, { color: theme.textSecondary }]}>{localHabit?.streak}</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Monthly Record</Text>
        <View style={[styles.calendarContainer, { backgroundColor: theme.background, borderColor: theme.border }]}>
          <View style={styles.monthSelector}>
            <TouchableOpacity onPress={prevMonth} style={styles.arrowBtn}>
              <ChevronLeft size={24} color={theme.textPrimary} />
            </TouchableOpacity>
            <Text style={[styles.monthText, { color: theme.textPrimary }]}>
              {monthNames[month]} {year}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.arrowBtn}>
              <ChevronRight size={24} color={theme.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.daysHeader}>
            {dayNames.map((d, i) => (
              <Text key={`dh-${i}`} style={[styles.dayHeaderText, { color: theme.textSecondary }]}>{d}</Text>
            ))}
          </View>

          <View style={styles.grid}>
            {pads.map((_, i) => (
              <View key={`pad-${i}`} style={styles.dayCell} />
            ))}
            
            {days.map(day => {
              // Local date string YYYY-MM-DD
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isCompleted = completedSet.has(dateStr);
              
              const dateObj = new Date(year, month, day);
              dateObj.setHours(0,0,0,0);
              const todayObj = new Date();
              todayObj.setHours(0,0,0,0);
              
              const isToday = dateObj.getTime() === todayObj.getTime();
              const isPast = dateObj.getTime() < todayObj.getTime();
              const isMissed = isPast && !isCompleted;

              return (
                <View key={`day-${day}`} style={styles.dayCell}>
                  {isCompleted ? (
                    <View style={[styles.completedCircle, { backgroundColor: color }]}>
                      <Text style={[styles.dayNumberText, { color: '#FFFFFF', fontWeight: '700', opacity: 1 }]}>{day}</Text>
                    </View>
                  ) : (
                    <View style={[
                      styles.emptyCircle, 
                      { borderColor: isToday ? color : theme.border },
                      isToday && { borderWidth: 2 },
                      isMissed && { backgroundColor: theme.textSecondary + '20' }
                    ]}>
                      <Text style={[
                        styles.dayNumberText, 
                        { color: isToday ? color : theme.textSecondary },
                        isToday && { fontWeight: '700', opacity: 1 },
                        isMissed && { opacity: 0.6 }
                      ]}>{day}</Text>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
  },
  indicator: {
    backgroundColor: '#E5E5E5',
    width: 48,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  barsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginRight: 12,
  },
  bar: {
    width: 8,
    height: 16,
    borderRadius: 4,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  streakFire: {
    fontSize: 12,
  },
  streakNumber: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  calendarContainer: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
  },
  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  arrowBtn: {
    padding: 4,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
  },
  daysHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  dayHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%', // 100 / 7
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  completedCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
