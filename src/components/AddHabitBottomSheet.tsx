import React, { useState, forwardRef, useImperativeHandle, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { ChevronDown } from 'lucide-react-native';
import { useHabitStore, CategoryType, FrequencyType, Habit } from '../store/useHabitStore';
import { getIconComponent } from '../utils/icons';
import { useTheme } from '../utils/theme';

export interface AddHabitBottomSheetRef {
  present: (habit?: Habit) => void;
  dismiss: () => void;
  setIcon: (iconName: string) => void;
}

interface AddHabitBottomSheetProps {
  onOpenIconPicker: (currentIcon: string) => void;
}

const CATEGORIES = [
  { id: 'Health', title: 'Health', desc: 'Physical wellness, fitness, and vitality.', color: '#6DBE8B' },
  { id: 'Mind', title: 'Mind', desc: 'Learning, mental clarity, and focus.', color: '#7A75C7' },
  { id: 'Work', title: 'Work', desc: 'Career goals, finances, and deep work.', color: '#F4C773' },
  { id: 'Joy', title: 'Joy', desc: 'Hobbies, relationships, and downtime.', color: '#F28D81' },
];

const FREQUENCIES: FrequencyType[] = ['Daily', 'Exact Days', 'Weekly Goal'];
const UNIT_OPTIONS = ['Times', 'Mins', 'Hours', 'Pages', 'Cups', 'Km', 'Miles'];
const VALUE_OPTIONS = ['1', '2', '3', '4', '5', '10', '15', '20', '30', '45', '60', '100'];

export const AddHabitBottomSheet = forwardRef<AddHabitBottomSheetRef, AddHabitBottomSheetProps>(({ onOpenIconPicker }, ref) => {
  const bottomSheetRef = useRef<BottomSheet>(null);
  const insets = useSafeAreaInsets();
  const setAddHabitModalOpen = useHabitStore((state) => state.setAddHabitModalOpen);
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<CategoryType>('Health');
  const [frequency, setFrequency] = useState<FrequencyType>('Daily');
  const [targetUnit, setTargetUnit] = useState('Times');
  const [targetValue, setTargetValue] = useState('1');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [daysPerWeek, setDaysPerWeek] = useState(1);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [icon, setIcon] = useState('smile');
  const [pickerState, setPickerState] = useState<{ visible: boolean; type: 'unit' | 'value' }>({ visible: false, type: 'unit' });

  const currentCategory = useHabitStore((state) => state.selectedCategory);
  const addHabit = useHabitStore((state) => state.addHabit);
  const updateHabit = useHabitStore((state) => state.updateHabit);
  const theme = useTheme();

  useImperativeHandle(ref, () => ({
    present: (habit?: Habit) => {
      if (habit) {
        setEditingId(habit.id);
        setStep(1);
        setTitle(habit.title);
        setCategory(habit.category);
        setFrequency(habit.frequency);
        setTargetUnit(habit.targetUnit);
        setTargetValue(habit.targetValue.toString());
        setSelectedDays(habit.targetDays || []);
        setIcon(habit.icon || 'smile');
        setDaysPerWeek(habit.daysPerWeek || 1);
      } else {
        setEditingId(null);
        setStep(1);
        setTitle('');
        setCategory(currentCategory === 'All' ? 'Health' : (currentCategory || 'Health'));
        setFrequency('Daily');
        setTargetUnit('Times');
        setTargetValue('1');
        setSelectedDays([]);
        setIcon('smile');
        setDaysPerWeek(1);
      }
      bottomSheetRef.current?.expand();
    },
    dismiss: () => {
      bottomSheetRef.current?.close();
    },
    setIcon: (iconName: string) => {
      setIcon(iconName);
    },
  }));
  
  const isTitleEmpty = !title.trim();
  const handleNext = () => {
    if (isTitleEmpty) return;
    setStep(2);
  };

  const handleSave = () => {
    const data = {
      title: title || 'New Habit',
      category,
      frequency,
      targetUnit,
      targetValue: parseFloat(targetValue) || 1,
      targetDays: frequency === 'Exact Days' ? selectedDays : undefined,
      daysPerWeek: frequency === 'Weekly Goal' ? daysPerWeek : undefined,
      icon,
    };

    if (editingId) {
      updateHabit(editingId, data);
    } else {
      addHabit(data);
    }
    setAddHabitModalOpen(false);
  };

  const handleClose = () => {
    setAddHabitModalOpen(false);
  };

  const renderBackdrop = (props: any) => (
    <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} opacity={0.4} />
  );

  return (
    <>
      <Modal visible={pickerState.visible} transparent animationType="fade" onRequestClose={() => setPickerState({ visible: false, type: 'unit' })}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerState({ visible: false, type: 'unit' })}>
          <View style={[styles.pickerContainer, { backgroundColor: theme.surface }]}>
            <Text style={[styles.pickerTitle, { color: theme.textPrimary }]}>
              {pickerState.type === 'unit' ? 'Select Unit' : 'Select Target'}
            </Text>
            <ScrollView style={{ maxHeight: 300 }}>
              {(pickerState.type === 'unit' ? UNIT_OPTIONS : VALUE_OPTIONS).map(opt => (
                <TouchableOpacity 
                  key={opt} 
                  style={[styles.pickerOption, { borderBottomColor: theme.border }]} 
                  onPress={() => {
                    pickerState.type === 'unit' ? setTargetUnit(opt) : setTargetValue(opt);
                    setPickerState({ visible: false, type: 'unit' });
                  }}
                >
                  <Text style={[styles.pickerOptionText, { color: theme.textPrimary }]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

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
      <BottomSheetScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 8 }]}>
        <View style={{ display: step === 1 ? 'flex' : 'none' }}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{editingId ? 'Edit Habit' : 'New Habit'}</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Habit Title</Text>
            <View style={styles.row}>
              <TextInput
                style={[styles.textInput, { backgroundColor: theme.background, borderColor: theme.border, color: theme.textPrimary }]}
                placeholder="e.g., Read 10 pages..."
                placeholderTextColor={theme.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
              <TouchableOpacity 
                style={[styles.iconCircle, { backgroundColor: theme.surface, borderColor: theme.borderStrong }]}
                onPress={() => onOpenIconPicker(icon)}
              >
                {React.createElement(getIconComponent(icon), {
                  size: 24,
                  color: theme.textPrimary,
                  strokeWidth: 1.5
                })}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Select Category</Text>
            <View style={styles.grid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryCard, { backgroundColor: theme.background },
                      isSelected && { borderColor: cat.color, borderWidth: 1, backgroundColor: theme.surface }
                    ]}
                    onPress={() => setCategory(cat.id as CategoryType)}
                  >
                    <View style={styles.catHeader}>
                      <Text style={[styles.catTitle, { color: theme.textPrimary }, isSelected && { color: cat.color }]}>{cat.title}</Text>
                      <View style={[styles.radio, { borderColor: theme.borderStrong }, isSelected && { borderColor: cat.color }]}>
                        {isSelected && <View style={[styles.radioInner, { backgroundColor: cat.color }]} />}
                      </View>
                    </View>
                    <Text style={[styles.catDesc, { color: theme.textSecondary }]}>{cat.desc}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity 
            style={[
              styles.primaryBtn, 
              { backgroundColor: theme.textPrimary }, 
              isTitleEmpty && { backgroundColor: 'transparent', borderColor: theme.border, borderWidth: 1 }
            ]} 
            onPress={handleNext}
            activeOpacity={isTitleEmpty ? 1 : 0.7}
          >
            <Text style={[styles.primaryBtnText, { color: theme.surface }, isTitleEmpty && { color: theme.borderStrong }]}>
              Next: Set Target
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ display: step === 2 ? 'flex' : 'none' }}>
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{title || 'New Habit'}</Text>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>How Often</Text>
            <View style={styles.freqRow}>
              {FREQUENCIES.map((freq) => {
                const isSelected = frequency === freq;
                return (
                    <TouchableOpacity
                    key={freq}
                    style={[
                      styles.freqBtn, { backgroundColor: theme.background },
                      isSelected && { backgroundColor: theme.textPrimary }
                    ]}
                    onPress={() => setFrequency(freq)}
                  >
                    <Text style={[
                      styles.freqText, { color: theme.textSecondary },
                      isSelected && { color: theme.surface }
                    ]}>
                      {freq}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {frequency === 'Exact Days' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>Select days</Text>
              <View style={styles.daysRow}>
                {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => {
                  const isActive = selectedDays.includes(day);
                  return (
                    <TouchableOpacity 
                      key={day}
                      style={[styles.dayCircle, { backgroundColor: theme.surface, borderColor: theme.borderStrong }, isActive && { backgroundColor: theme.textPrimary, borderColor: theme.textPrimary }]}
                      onPress={() => {
                        if (isActive) {
                          setSelectedDays(selectedDays.filter(d => d !== day));
                        } else {
                          setSelectedDays([...selectedDays, day]);
                        }
                      }}
                    >
                      <Text style={[styles.dayText, { color: theme.textSecondary }, isActive && { color: theme.surface }]}>{day}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {frequency === 'Weekly Goal' && (
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>How many days a week ?</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
                <TouchableOpacity 
                   style={[styles.circleBtn, { borderColor: theme.borderStrong }]} 
                   onPress={() => setDaysPerWeek(Math.max(1, daysPerWeek - 1))}
                >
                   <Text style={{fontSize: 24, color: theme.textPrimary, fontWeight: '400', marginTop: -2}}>-</Text>
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: '700', color: theme.textPrimary }}>{daysPerWeek}</Text>
                <TouchableOpacity 
                   style={[styles.circleBtn, { borderColor: theme.borderStrong }]} 
                   onPress={() => setDaysPerWeek(Math.min(7, daysPerWeek + 1))}
                >
                   <Text style={{fontSize: 24, color: theme.textPrimary, fontWeight: '400', marginTop: -2}}>+</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Target</Text>
            <View style={[styles.targetRowPill, { borderColor: theme.borderStrong }]}>
              <TouchableOpacity 
                style={[styles.dropdownControlLeft, { borderColor: theme.borderStrong }]}
                onPress={() => setPickerState({ visible: true, type: 'unit' })}
                activeOpacity={0.7}
              >
                 <Text style={[styles.dropdownText, { flex: 1, color: theme.textPrimary }]}>{targetUnit}</Text>
                 <ChevronDown size={20} color={theme.textPrimary} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.dropdownControlRight}
                onPress={() => setPickerState({ visible: true, type: 'value' })}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownText, { flex: 1, color: theme.textPrimary }]}>{targetValue}</Text>
                <ChevronDown size={20} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.textPrimary }]} onPress={handleSave}>
            <Text style={[styles.primaryBtnText, { color: theme.surface }]}>Save Habit</Text>
          </TouchableOpacity>
        </View>
      </BottomSheetScrollView>
    </BottomSheet>
    </>
  );
});

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
  },
  indicator: {
    backgroundColor: '#E5E5E5',
    width: 48,
  },
  content: {
    padding: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#322A5C',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#322A5C',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  textInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 28,
    paddingHorizontal: 20,
    fontSize: 16,
    color: '#322A5C',
    backgroundColor: '#FFFFFF',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: '#322A5C',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    flexBasis: '48%',
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  catHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  catTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#322A5C',
  },
  radio: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  catDesc: {
    fontSize: 12,
    color: '#8A8A8E',
    lineHeight: 16,
  },
  primaryBtn: {
    backgroundColor: '#322A5C',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  freqRow: {
    flexDirection: 'row',
    gap: 8,
  },
  freqBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  freqText: {
    fontSize: 14,
    fontWeight: '600',
  },
  targetRowPill: {
    flexDirection: 'row',
    height: 56,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    borderRadius: 28,
    alignItems: 'center',
    overflow: 'hidden',
  },
  dropdownControlLeft: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: '100%',
    borderRightWidth: 1,
    borderColor: '#C4C4C4',
  },
  dropdownControlRight: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: '100%',
  },
  dropdownText: {
    fontSize: 16,
    color: '#322A5C',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  dayCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleInactive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C4C4C4',
  },
  dayCircleActive: {
    backgroundColor: '#322A5C',
    borderWidth: 1,
    borderColor: '#322A5C',
  },
  dayText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8A8A8E',
  },
  dayTextActive: {
    color: '#FFFFFF',
  },
  circleBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#C4C4C4',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  pickerContainer: {
    width: '80%',
    borderRadius: 24,
    paddingVertical: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  pickerOption: {
    paddingVertical: 16,
    marginHorizontal: 24,
    borderBottomWidth: 1,
  },
  pickerOptionText: {
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});
