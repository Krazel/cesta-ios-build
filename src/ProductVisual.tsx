import React from 'react';
import { Image, Text, View } from 'react-native';
import { Product } from './domain';
import { categories } from './catalog';
import { t, productLabel } from './i18n';

export function ProductVisual({ product, size = 49 }: { product: Product; size?: number }) {
  return product.image ? (
    <Image
      accessibilityLabel={t('Foto de {0}', productLabel(product))}
      source={{ uri: product.image }}
      resizeMode="cover"
      style={{ width: size, height: size, borderRadius: size * 0.28 }}
    />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: categories.find((c) => c.id === product.category)?.color || '#EEEFE7',
      }}
    >
      <Text style={{ fontSize: size * 0.57 }}>{product.emoji}</Text>
    </View>
  );
}
