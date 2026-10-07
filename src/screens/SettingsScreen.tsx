import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, Switch, TouchableOpacity, Alert, Linking, ActionSheetIOS, Modal, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Bell, Moon, Calendar, Download, Trash2, Shield, ChevronRight, X } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useHabitStore } from '../store/useHabitStore';
import { useTheme } from '../utils/theme';

export const SettingsScreen = () => {
  const insets = useSafeAreaInsets();
  const [privacyVisible, setPrivacyVisible] = useState(false);
  
  const preferences = useHabitStore((state) => state.preferences) || {
    notifications: true,
    darkMode: false,
    startOfWeek: 'Monday',
  };
  const updatePreferences = useHabitStore((state) => state.updatePreferences);
  const clearAllData = useHabitStore((state) => state.clearAllData);
  const setShareJourneyRequested = useHabitStore((state) => state.setShareJourneyRequested);
  const theme = useTheme();
  const navigation = useNavigation<BottomTabNavigationProp<any>>();

  const handleStartOfWeek = () => {
    const options = ['Cancel', 'Monday', 'Sunday', 'Saturday'];
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options, cancelButtonIndex: 0 },
        (buttonIndex) => {
          if (buttonIndex !== undefined && buttonIndex > 0) updatePreferences({ startOfWeek: options[buttonIndex] });
        }
      );
    } else {
      Alert.alert('Start of Week', 'Select start of week', [
        { text: 'Sunday', onPress: () => updatePreferences({ startOfWeek: 'Sunday' })},
        { text: 'Monday', onPress: () => updatePreferences({ startOfWeek: 'Monday' })},
        { text: 'Saturday', onPress: () => updatePreferences({ startOfWeek: 'Saturday' })},
        { text: 'Cancel', style: 'cancel' }
      ]);
    }
  };

  const handleExportData = () => {
    setShareJourneyRequested(true);
    navigation.navigate('Journey');
  };

  const handlePrivacyPolicy = () => {
    setPrivacyVisible(true);
  };

  const handleDeleteData = () => {
    Alert.alert(
      "Delete All Data",
      "Are you sure you want to delete all habit data? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            clearAllData();
            Alert.alert("Success", "All habit data deleted.");
          }
        }
      ]
    );
  };

  const renderSettingRow = (
    icon: React.ReactNode, 
    title: string, 
    control?: React.ReactNode, 
    onPress?: () => void,
    isDestructive?: boolean
  ) => {
    const Component = onPress ? TouchableOpacity : View;
    return (
      <Component 
        style={styles.settingRow} 
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={styles.settingRowLeft}>
          <View style={[styles.iconContainer, { backgroundColor: theme.background }, isDestructive && { backgroundColor: theme.destructiveBg }]}>
            {icon}
          </View>
          <Text style={[styles.settingTitle, { color: theme.textPrimary }, isDestructive && { color: theme.destructive }]}>{title}</Text>
        </View>
        {control ? control : (onPress ? <ChevronRight color={theme.borderStrong} size={20} /> : null)}
      </Component>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Modal
        visible={privacyVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPrivacyVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setPrivacyVisible(false)}>
          <View style={[styles.modalContainer, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Privacy Policy</Text>
              <TouchableOpacity onPress={() => setPrivacyVisible(false)}>
                <X size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalScroll}>
              <Text style={[styles.modalText, { color: theme.textSecondary }]}>
                Your data is stored locally on your device. We do not collect or transmit your personal habit data to any external servers. This app uses AsyncStorage to persist your habits securely on your phone.
                {"\n\n"}
                If you choose to export your data, you are responsible for where you share it. By using this application, you agree to this local-storage policy.
              </Text>
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      <View style={[styles.header, { backgroundColor: theme.background, paddingTop: insets.top + (Platform.OS === 'ios' ? 10 : 20) }]}>
        <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: 130 + insets.bottom }]}>
        
        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.shadowColor }]}>
            {renderSettingRow(
              <Bell color={theme.textPrimary} size={20} />, 
              "Push Notifications", 
              <Switch 
                value={preferences.notifications} 
                onValueChange={(val) => updatePreferences({ notifications: val })}
                trackColor={{ false: theme.border, true: theme.accent }}
              />
            )}
            <View style={[styles.divider, { backgroundColor: theme.background }]} />
            {renderSettingRow(
              <Moon color={theme.textPrimary} size={20} />, 
              "Dark Mode", 
              <Switch 
                value={preferences.darkMode} 
                onValueChange={(val) => updatePreferences({ darkMode: val })}
                trackColor={{ false: theme.border, true: theme.accent }}
              />
            )}
            <View style={[styles.divider, { backgroundColor: theme.background }]} />
            {renderSettingRow(
              <Calendar color={theme.textPrimary} size={20} />, 
              "Start of Week",
              <View style={styles.valueRow}>
                <Text style={[styles.valueText, { color: theme.textSecondary }]}>{preferences.startOfWeek}</Text>
                <ChevronRight color={theme.borderStrong} size={20} />
              </View>,
              handleStartOfWeek
            )}
          </View>
        </View>

        {/* Data & Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Data & Storage</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.shadowColor }]}>
            {renderSettingRow(
              <Download color={theme.textPrimary} size={20} />, 
              "Share Journey", 
              undefined,
              handleExportData 
            )}
            <View style={[styles.divider, { backgroundColor: theme.background }]} />
            {renderSettingRow(
              <Trash2 color={theme.destructive} size={20} />, 
              "Delete All Data", 
              undefined,
              handleDeleteData,
              true
            )}
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={[styles.card, { backgroundColor: theme.surface, shadowColor: theme.shadowColor }]}>
            {renderSettingRow(
              <Shield color={theme.textPrimary} size={20} />, 
              "Privacy Policy", 
              undefined,
              handlePrivacyPolicy 
            )}
          </View>
        </View>
        
        <Text style={[styles.versionText, { color: theme.borderStrong }]}>Version 1.0.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#322A5C',
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8A8A8E',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#322A5C',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
    marginLeft: 72, // Aligns with the text
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  valueText: {
    fontSize: 16,
    color: '#8A8A8E',
    marginRight: 4,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 13,
    color: '#C4C4C4',
    marginTop: 16,
    marginBottom: 20,
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContainer: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  modalScroll: {
    marginTop: 8,
  },
  modalText: {
    fontSize: 15,
    lineHeight: 22,
  },
});
