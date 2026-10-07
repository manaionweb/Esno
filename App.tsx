import React from 'react';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, Platform, AppState } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Sun, LineChart, Settings } from 'lucide-react-native';
import { HomeScreen } from './src/screens/HomeScreen';
import { JourneyScreen } from './src/screens/JourneyScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { AddHabitBottomSheet, AddHabitBottomSheetRef } from './src/components/AddHabitBottomSheet';
import { IconPickerModal } from './src/components/IconPickerModal';
import { HabitCalendarModal } from './src/components/HabitCalendarModal';
import { useHabitStore } from './src/store/useHabitStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from './src/utils/theme';

const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  
  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            if (route.name === 'Today') {
              return <Sun color={color} size={28} />;
            } else if (route.name === 'Journey') {
              return <LineChart color={color} size={28} />;
            } else if (route.name === 'Settings') {
              return <Settings color={color} size={28} />;
            }
          },
          tabBarActiveTintColor: theme.textPrimary,
          tabBarInactiveTintColor: theme.tabBarInactive,
          tabBarStyle: {
            height: (Platform.OS === 'ios' ? 88 : 70) + insets.bottom,
            paddingTop: 12,
            paddingBottom: insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 30 : 12),
            borderTopLeftRadius: 32,
            borderTopRightRadius: 32,
            borderTopWidth: 0,
            backgroundColor: theme.tabBarBg,
            shadowColor: theme.shadowColor,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            elevation: 5,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 0, // Ensure it's behind modals
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
        })}
      >
        <Tab.Screen name="Today" component={HomeScreen} />
        <Tab.Screen name="Journey" component={JourneyScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </View>
  );
};

export default function App() {
  const isAddHabitModalOpen = useHabitStore((state) => state.isAddHabitModalOpen);
  const editingHabit = useHabitStore((state) => state.editingHabit);
  const setAddHabitModalOpen = useHabitStore((state) => state.setAddHabitModalOpen);
  const resetProgressIfNewDay = useHabitStore((state) => state.resetProgressIfNewDay);

  const sheetRef = React.useRef<AddHabitBottomSheetRef>(null);
  const [isIconPickerVisible, setIsIconPickerVisible] = React.useState(false);

  React.useEffect(() => {
    // Hide splash screen after 2 seconds to allow the user to see it
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 2500);

    resetProgressIfNewDay();
    
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        resetProgressIfNewDay();
      }
    });
    
    return () => {
      subscription.remove();
    };
  }, [resetProgressIfNewDay]);

  React.useEffect(() => {
    if (isAddHabitModalOpen) {
      sheetRef.current?.present(editingHabit || undefined);
    } else {
      sheetRef.current?.dismiss();
    }
  }, [isAddHabitModalOpen, editingHabit]);

  const handleOpenIconPicker = (currentIcon: string) => {
    setIsIconPickerVisible(true);
  };

  const handleSelectIcon = (iconName: string) => {
    sheetRef.current?.setIcon(iconName);
    setIsIconPickerVisible(false);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <MainTabs />
        </NavigationContainer>
        
        <AddHabitBottomSheet 
          ref={sheetRef}
          onOpenIconPicker={handleOpenIconPicker}
        />

        <IconPickerModal
          isVisible={isIconPickerVisible}
          onClose={() => setIsIconPickerVisible(false)}
          onSelect={handleSelectIcon}
          selectedIcon="smile"
        />
        <HabitCalendarModal />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
