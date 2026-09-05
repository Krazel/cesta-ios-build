import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { t } from './i18n';
import { theme } from './ui';

export function PurchaseScope({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: 20, paddingVertical: 4 }}>
      {[true, false].map((oneTime) => (
        <Pressable
          key={String(oneTime)}
          accessibilityRole="radio"
          accessibilityLabel={t(oneTime ? 'Solo esta compra' : 'Guardar como habitual')}
          accessibilityState={{ checked: value === oneTime }}
          aria-checked={value === oneTime}
          onPress={() => onChange(oneTime)}
          style={{
            flex: 1,
            minHeight: 36,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 18,
            backgroundColor: value === oneTime ? '#E5EDDE' : 'transparent',
          }}
        >
          <Text
            style={{
              fontSize: 12,
              color: theme.green,
              fontWeight: value === oneTime ? '600' : '400',
            }}
          >
            {t(oneTime ? 'Solo esta compra' : 'Guardar como habitual')}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
