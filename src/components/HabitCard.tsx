import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Check, Trash2, Edit3 } from 'lucide-react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { Svg, Circle } from 'react-native-svg';
import { Habit, CategoryType, useHabitStore } from '../store/useHabitStore';
import { getIconComponent } from '../utils/icons';
import { useTheme } from '../utils/theme';
import { getLocalTodayString, parseLocalDate, getCompletionsThisWeek } from '../utils/dateUtils';

const CATEGORY_COLORS: Record<CategoryType, string> = {
  Health: '#6DBE8B',
  Mind: '#7A75C7',
  Work: '#F4C773',
  Joy: '#F28D81',
};

interface HabitCardProps {
  habit: Habit;
  onToggleCompletion: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({ habit, onToggleCompletion, onDelete, onEdit }) => {
  const isCompleted = habit.progress >= habit.targetValue;
  const theme = useTheme();

  const completionsThisWeek = habit.frequency === 'Weekly Goal' ? getCompletionsThisWeek(habit.completedAt, 'Monday') : 0;
  const isWeeklyGoalMet = habit.frequency === 'Weekly Goal' && habit.daysPerWeek ? completionsThisWeek >= habit.daysPerWeek : false;

  const DAY_MAP = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const todayDayStr = DAY_MAP[new Date().getDay()];
  
  let isScheduledToday = true;
  if (habit.frequency === 'Exact Days') {
    isScheduledToday = habit.targetDays?.includes(todayDayStr) ?? true;
  } else if (habit.frequency === 'Weekly Goal') {
    isScheduledToday = !isWeeklyGoalMet;
  }

  // Render up to 7-day progress bar based on actual completion history.
  const renderWeeklyProgress = () => {
    let startDateObj: Date;
    if (habit.createdAt) {
      startDateObj = parseLocalDate(habit.createdAt);
    } else {
      if (habit.completedAt && habit.completedAt.length > 0) {
        startDateObj = parseLocalDate([...habit.completedAt].sort()[0]);
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
         isCompleted: habit.completedAt?.includes(dateStr) || false,
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

  const renderRightActions = () => {
    const handleDelete = () => {
      Alert.alert(
        "Delete Habit",
        "Are you sure you want to delete this habit?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: onDelete }
        ]
      );
    };

    return (
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.editAction} 
          onPress={onEdit}
          activeOpacity={0.8}
        >
          <Edit3 size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteAction} 
          onPress={handleDelete}
          activeOpacity={0.8}
        >
          <Trash2 size={24} color="#FFFFFF" strokeWidth={2} />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable 
      renderRightActions={renderRightActions}
      containerStyle={[styles.swipeContainer, { shadowColor: theme.shadowColor }]}
      friction={2}
      overshootRight={false}
    >
      <TouchableOpacity 
        activeOpacity={0.9}
        onPress={() => useHabitStore.getState().setViewingHabit(habit)}
        style={[styles.card, { backgroundColor: theme.surface, opacity: isScheduledToday ? 1 : 0.5 }]}
      >
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            {React.createElement(getIconComponent(habit.icon), {
              size: 24,
              color: CATEGORY_COLORS[habit.category],
              strokeWidth: 2,
            })}
          </View>
          <View style={styles.content}>
            <Text style={[styles.title, { color: theme.textPrimary }]}>{habit.title}</Text>
            <Text style={[styles.subtext, { color: theme.textSecondary }]}>
              {habit.frequency === 'Weekly Goal' 
                ? (isWeeklyGoalMet ? `Weekly Goal Met 🎉` : `${completionsThisWeek}/${habit.daysPerWeek} days this week`)
                : (isScheduledToday ? `${habit.targetValue} ${habit.targetUnit}` : `Scheduled for ${habit.targetDays?.join(', ') || 'specific days'}`)
              }
            </Text>
          </View>
          <TouchableOpacity
            style={styles.progressCircleContainer}
            onPress={() => (isScheduledToday || isCompleted) && onToggleCompletion()}
            activeOpacity={(isScheduledToday || isCompleted) ? 0.7 : 1}
          >
            {isCompleted && (
              <View style={[styles.checkCircle, styles.checkCircleActive, { borderColor: CATEGORY_COLORS[habit.category], backgroundColor: CATEGORY_COLORS[habit.category] }]}>
                <Check size={16} color="#FFFFFF" strokeWidth={3} />
              </View>
            )}
            {!isCompleted && habit.progress > 0 && (
              <View style={[styles.checkCircle, { borderColor: theme.border }]}>
                <Svg width="36" height="36" style={{ position: 'absolute' }}>
                  <Circle 
                    cx="18" cy="18" r="16" 
                    stroke={CATEGORY_COLORS[habit.category]} 
                    strokeWidth="2" 
                    strokeDasharray={`${(habit.progress / habit.targetValue) * (2 * Math.PI * 16)} ${2 * Math.PI * 16}`}
                    origin="18, 18"
                    rotation="-90"
                    fill="transparent"
                  />
                </Svg>
                <Text 
                   style={{ fontSize: 10, fontWeight: '700', color: theme.textSecondary, textAlign: 'center', paddingHorizontal: 2 }}
                   numberOfLines={1}
                   adjustsFontSizeToFit={true}
                   minimumFontScale={0.6}
                >
                  {habit.progress}/{habit.targetValue}
                </Text>
              </View>
            )}
            {!isCompleted && habit.progress === 0 && (
              <View style={[styles.checkCircle, { borderColor: theme.border }]}>
                 <Check size={16} color={theme.borderStrong} strokeWidth={2} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          {renderWeeklyProgress()}
          <View style={styles.streakContainer}>
            <Text style={styles.streakFire}>🔥</Text>
            <Text style={[styles.streakNumber, { color: theme.textSecondary }]}>{habit.streak}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  swipeContainer: {
    marginHorizontal: 24,
    marginBottom: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    height: '100%',
  },
  editAction: {
    width: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4C773',
  },
  deleteAction: {
    width: 64,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#322A5C',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 14,
    color: '#8A8A8E',
  },
  progressCircleContainer: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#EFEFEF',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  checkCircleActive: {
    backgroundColor: '#6DBE8B',
    borderColor: '#6DBE8B',
  },
  footer: {
    marginTop: 12,
    marginLeft: 40, // align with text instead of icon
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#8A8A8E',
    marginLeft: 4,
  },
});
