import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { productSizes, type ProductSize } from './appearance';
import { setProductSize, useCesta } from './store';
import { t } from './i18n';
import { Icon, s, theme } from './ui';

export function ProductSizeSettings() {
  const state = useCesta();
  return (
    <View style={{ gap: 10 }}>
      <Text style={s.label}>{t('Tamaño de los productos')}</Text>
      <View style={[s.row, { gap: 6 }]}>
        {(Object.keys(productSizes) as ProductSize[]).map((size) => (
          <Pressable
            key={size}
            accessibilityRole="radio"
            accessibilityLabel={t(productSizes[size].label)}
            accessibilityState={{ checked: state.productSize === size }}
            aria-checked={state.productSize === size}
            onPress={() => setProductSize(size)}
            style={{
              flex: 1,
              minHeight: 48,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 13,
              backgroundColor: state.productSize === size ? theme.ink : '#EEF0E8',
            }}
          >
            <Text style={{ color: state.productSize === size ? '#fff' : theme.ink, fontSize: 13 }}>
              {t(productSizes[size].label)}
            </Text>
          </Pressable>
        ))}
      </View>
      <View style={[s.row, { gap: 12, minHeight: productSizes[state.productSize].row }]}>
        <Icon name="check" size={23} color={theme.green} />
        <Text style={{ fontSize: productSizes[state.productSize].image * 0.65 }}>🍎</Text>
        <Text style={{ flex: 1, fontSize: productSizes[state.productSize].font, color: theme.ink }}>
          {t('Manzanas')}
        </Text>
        <Text style={s.body}>1 kg</Text>
      </View>
    </View>
  );
}
