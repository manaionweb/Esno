import React from 'react';
import { 
  Smile, 
  Flame, 
  Droplet, 
  Book, 
  Coffee, 
  Dumbbell, 
  Moon, 
  Sun, 
  Heart, 
  Music, 
  Zap, 
  Timer,
  LucideProps
} from 'lucide-react-native';

export const HABIT_ICONS = [
  { name: 'smile', component: Smile },
  { name: 'flame', component: Flame },
  { name: 'droplet', component: Droplet },
  { name: 'book', component: Book },
  { name: 'coffee', component: Coffee },
  { name: 'dumbbell', component: Dumbbell },
  { name: 'moon', component: Moon },
  { name: 'sun', component: Sun },
  { name: 'heart', component: Heart },
  { name: 'music', component: Music },
  { name: 'zap', component: Zap },
  { name: 'timer', component: Timer },
];

export const getIconComponent = (name: string) => {
  const icon = HABIT_ICONS.find(i => i.name === name);
  return icon ? icon.component : Smile;
};

export const getNextIcon = (currentName: string) => {
  const index = HABIT_ICONS.findIndex(i => i.name === currentName);
  const nextIndex = (index + 1) % HABIT_ICONS.length;
  return HABIT_ICONS[nextIndex].name;
};
