import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, radii } from '../constants/theme';
import type { FeedCategory } from '../types/post';
import { AppText } from './AppText';

const categories: { id: FeedCategory; label: string; alert?: boolean }[] = [
  { id: 'all', label: 'All Updates' },
  { id: 'events', label: 'Events' },
  { id: 'alerts', label: 'Alerts', alert: true },
  { id: 'lost', label: 'Lost & Found' },
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'sale', label: 'Free & For Sale' },
];

type CategoryChipsProps = {
  selected: FeedCategory;
  onSelect: (category: FeedCategory) => void;
};

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <ScrollView
      contentContainerStyle={styles.row}
      horizontal
      showsHorizontalScrollIndicator={false}
    >
      {categories.map((category) => {
        const active = category.id === selected;
        return (
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            key={category.id}
            onPress={() => {
              onSelect(category.id);
            }}
            style={({ pressed }) => {
              return [
                styles.chip,
                active ? styles.chipActive : styles.chipIdle,
                pressed && styles.pressed,
              ];
            }}
          >
            {category.alert === true && !active ? (
              <AppText color={colors.error} variant="labelMd">
                ●
              </AppText>
            ) : null}
            <AppText
              color={active ? colors.onPrimary : colors.onSurface}
              variant="labelMd"
            >
              {category.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radii.pill,
  },
  chipActive: {
    backgroundColor: colors.primaryContainer,
  },
  chipIdle: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: 'rgba(192, 201, 194, 0.7)',
  },
  pressed: {
    opacity: 0.85,
  },
});
