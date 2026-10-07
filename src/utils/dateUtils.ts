export const getLocalTodayString = (dateObj?: Date): string => {
  const d = dateObj || new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const calculateStreak = (completedDates: string[]): number => {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const sortedDates = [...new Set(completedDates)].sort((a, b) => b.localeCompare(a));
  
  const todayStr = getLocalTodayString();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayStr = getLocalTodayString(yesterdayDate);

  if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
    return 0; // Streak broken
  }
  
  let streak = 0;
  let checkDate = parseLocalDate(sortedDates[0]);
  
  for (let i = 0; i < sortedDates.length; i++) {
    const dStr = sortedDates[i];
    const expectedStr = getLocalTodayString(checkDate);
    
    if (dStr === expectedStr) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1); // shift back safely
    } else {
      break; 
    }
  }

  return streak;
};

export const calculateWeeklyProgress = (habitsInCategory: any[], startOfWeek: string): number => {
  if (!habitsInCategory || habitsInCategory.length === 0) return 0;
  
  let completionsThisWeek = 0;
  const maxPossibleThisWeek = habitsInCategory.length * 7; 

  const today = new Date();
  const last7Days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    last7Days.push(getLocalTodayString(d));
  }

  habitsInCategory.forEach(h => {
    if (h.completedAt) {
      h.completedAt.forEach((date: string) => {
        if (last7Days.includes(date)) completionsThisWeek++;
      });
    }
  });

  return Math.max(0.05, completionsThisWeek / maxPossibleThisWeek);
};

export const getCompletionsThisWeek = (completedDates: string[] | undefined, startOfWeek: string = 'Monday'): number => {
  if (!completedDates || completedDates.length === 0) return 0;
  
  const today = new Date();
  const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
  
  let daysSinceStart = 0;
  if (startOfWeek === 'Monday') {
    daysSinceStart = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
  } else {
    daysSinceStart = currentDayOfWeek;
  }

  const startOfWeekDate = new Date(today);
  startOfWeekDate.setDate(today.getDate() - daysSinceStart);
  startOfWeekDate.setHours(0,0,0,0);
  
  let count = 0;
  completedDates.forEach(dateStr => {
    const d = parseLocalDate(dateStr);
    if (d >= startOfWeekDate && d <= today) {
      count++;
    }
  });

  return count;
};
