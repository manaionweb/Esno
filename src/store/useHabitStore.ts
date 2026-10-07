import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocalTodayString, calculateStreak } from '../utils/dateUtils';

export type CategoryType = 'Health' | 'Mind' | 'Work' | 'Joy';
export type FrequencyType = 'Daily' | 'Exact Days' | 'Weekly Goal';

export interface Habit {
  id: string;
  title: string;
  category: CategoryType;
  frequency: FrequencyType;
  targetValue: number;
  targetUnit: string;
  targetDays?: string[]; // E.g., ['Mon', 'Tue'] for Exact Days
  daysPerWeek?: number; // E.g., 3 for Weekly Goal
  progress: number;
  streak: number;
  completedAt?: string[]; // array of ISO dates it was completed on
  icon: string; // Icon name from Lucide
  createdAt?: string;
}

export interface Preferences {
  notifications: boolean;
  darkMode: boolean;
  startOfWeek: string;
}

interface HabitStore {
  habits: Habit[];
  preferences: Preferences;
  addHabit: (habit: Omit<Habit, 'id' | 'progress' | 'streak' | 'completedAt'>) => void;
  updateHabit: (id: string, updates: Partial<Omit<Habit, 'id'>>) => void;
  updateHabitProgress: (id: string, progress: number) => void;
  deleteHabit: (id: string) => void;
  toggleHabitCompletion: (id: string, isCompleted: boolean) => void;
  incrementHabitProgress: (id: string) => void;
  clearAllData: () => void;
  updatePreferences: (updates: Partial<Preferences>) => void;
  // Modal State (not persisted)
  isAddHabitModalOpen: boolean;
  editingHabit: Habit | null;
  setAddHabitModalOpen: (open: boolean, habit?: Habit | null) => void;
  
  viewingHabit: Habit | null;
  setViewingHabit: (habit: Habit | null) => void;
  
  shareJourneyRequested: boolean;
  setShareJourneyRequested: (requested: boolean) => void;
  
  selectedCategory: CategoryType | 'All';
  setSelectedCategory: (category: CategoryType | 'All') => void;
  
  lastOpenedDateStr: string;
  setLastOpenedDateStr: (dateStr: string) => void;
  resetProgressIfNewDay: () => void;
}

export const useHabitStore = create<HabitStore>()(
  persist(
    (set) => ({
      habits: [
        {
          id: '1',
          title: 'Drinking Water',
          category: 'Health',
          frequency: 'Daily',
          targetValue: 3,
          targetUnit: 'Litres',
          progress: 2,
          streak: 12,
          icon: 'droplet',
        },
        {
          id: '2',
          title: 'Running',
          category: 'Health',
          frequency: 'Daily',
          targetValue: 2.5,
          targetUnit: 'Km',
          progress: 0,
          streak: 12,
          icon: 'flame',
        },
      ], // initial dummy data from screenshots
      preferences: {
        notifications: true,
        darkMode: false,
        startOfWeek: 'Monday',
      },
      addHabit: (habit) =>
        set((state) => ({
          habits: [
            ...state.habits,
            {
              ...habit,
              id: Math.random().toString(36).substring(2, 9),
              progress: 0,
              streak: 0,
              createdAt: getLocalTodayString(),
            },
          ],
        })),
      updateHabit: (id, updates) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, ...updates } : h
          ),
        })),
      updateHabitProgress: (id, progress) =>
        set((state) => ({
          habits: state.habits.map((h) =>
            h.id === id ? { ...h, progress } : h
          ),
        })),
      deleteHabit: (id) =>
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
        })),
      toggleHabitCompletion: (id, isCompleted) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id === id) {
              const today = getLocalTodayString();
              const completedDates = h.completedAt || [];
              let newCompletedAt = [...completedDates];
              
              if (isCompleted && !newCompletedAt.includes(today)) {
                newCompletedAt.push(today);
              } else if (!isCompleted) {
                newCompletedAt = newCompletedAt.filter((date) => date !== today);
              }

              const newStreak = calculateStreak(newCompletedAt);

              return { ...h, completedAt: newCompletedAt, streak: newStreak, progress: isCompleted ? h.targetValue : 0 };
            }
            return h;
          }),
        })),
      incrementHabitProgress: (id) =>
        set((state) => ({
          habits: state.habits.map((h) => {
            if (h.id === id) {
              if (h.progress >= h.targetValue) {
                // Uncheck
                const today = getLocalTodayString();
                const newCompletedAt = (h.completedAt || []).filter(date => date !== today);
                return { ...h, completedAt: newCompletedAt, streak: calculateStreak(newCompletedAt), progress: 0 };
              } else {
                // Increment
                const nextProgress = h.progress + 1;
                if (nextProgress >= h.targetValue) {
                  const today = getLocalTodayString();
                  const newCompletedAt = [...(h.completedAt || [])];
                  if (!newCompletedAt.includes(today)) newCompletedAt.push(today);
                  return { ...h, completedAt: newCompletedAt, streak: calculateStreak(newCompletedAt), progress: h.targetValue };
                } else {
                  return { ...h, progress: nextProgress };
                }
              }
            }
            return h;
          }),
        })),
      clearAllData: () => set({ habits: [] }),
      updatePreferences: (updates) =>
        set((state) => ({ 
          preferences: { 
            ...(state.preferences || { notifications: true, darkMode: false, startOfWeek: 'Monday' }), 
            ...updates 
          } 
        })),
      isAddHabitModalOpen: false,
      editingHabit: null,
      setAddHabitModalOpen: (open, habit = null) => 
        set({ isAddHabitModalOpen: open, editingHabit: habit }),
        
      viewingHabit: null,
      setViewingHabit: (habit) => set({ viewingHabit: habit }),
        
      shareJourneyRequested: false,
      setShareJourneyRequested: (requested) => set({ shareJourneyRequested: requested }),
      
      selectedCategory: 'All',
      setSelectedCategory: (category) => set({ selectedCategory: category }),
      
      lastOpenedDateStr: getLocalTodayString(),
      setLastOpenedDateStr: (dateStr) => set({ lastOpenedDateStr: dateStr }),
      resetProgressIfNewDay: () => set((state) => {
        const todayStr = getLocalTodayString();
        // Compare with explicitly string checked local dates
        if (state.lastOpenedDateStr && state.lastOpenedDateStr !== todayStr) {
          const resetHabits = state.habits.map(h => ({
            ...h,
            progress: 0,
            streak: calculateStreak(h.completedAt || [])
          }));
          return {
            habits: resetHabits,
            lastOpenedDateStr: todayStr
          };
        }
        return { lastOpenedDateStr: todayStr };
      }),
    }),
    {
      name: 'habit-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        habits: state.habits, 
        preferences: state.preferences,
        lastOpenedDateStr: state.lastOpenedDateStr
      }), 
    }
  )
);
