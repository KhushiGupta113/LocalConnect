import { StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';
import {
  metPasswordCount,
  passwordStrengthLabel,
} from '../services/validation';
import { AppText } from './AppText';
import { Icon } from './Icon';

type PasswordMeterProps = {
  password: string;
};

export function PasswordMeter({ password }: PasswordMeterProps) {
  const met = metPasswordCount(password);
  const strong = met === 4;
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <View style={styles.strength}>
          <Icon
            color={strong ? colors.primary : colors.onSurfaceVariant}
            name={strong ? 'check-circle' : 'circle-outline'}
            size={16}
          />
          <AppText
            color={strong ? colors.primary : colors.onSurfaceVariant}
            variant="labelSm"
          >
            {passwordStrengthLabel(password)}
          </AppText>
        </View>
        <AppText color={colors.onSurfaceVariant} variant="labelSm">
          {met} / 4 requirements
        </AppText>
      </View>
      <View style={styles.bars}>
        {[0, 1, 2, 3].map((index) => {
          return (
            <View
              key={index}
              style={[styles.bar, index < met ? styles.barOn : styles.barOff]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
    paddingTop: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  strength: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bars: {
    flexDirection: 'row',
    gap: 6,
    height: 4,
  },
  bar: {
    flex: 1,
    borderRadius: 999,
  },
  barOn: {
    backgroundColor: colors.primaryContainer,
  },
  barOff: {
    backgroundColor: colors.surfaceContainerHigh,
  },
});
