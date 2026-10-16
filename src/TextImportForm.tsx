import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { Product } from './domain';
import english from './en.json';
import { t, productLabel } from './i18n';
import { parseShoppingText, TextProduct } from './textImport';
import { Button, Icon, s, theme } from './ui';
import { ProductVisual } from './ProductsScreen';

export function TextImportForm({
  catalog,
  onAdd,
  beforeSubmit,
}: {
  catalog: Product[];
  onAdd: (items: TextProduct[]) => void;
  beforeSubmit?: React.ReactNode;
}) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<TextProduct[] | null>(null);
  const [excluded, setExcluded] = useState<number[]>([]);
  const [error, setError] = useState('');
  const selected = preview?.filter((_, index) => !excluded.includes(index)) || [];
  const prepare = () => {
    try {
      setPreview(
        parseShoppingText(
          text,
          catalog.map((product) => ({
            product,
            names: [
              product.name,
              product.catalogId
                ? (english as Record<string, string>)[product.catalogId] || product.name
                : product.name,
            ],
          })),
        ),
      );
      setExcluded([]);
      setError('');
    } catch (err) {
      setError((err as Error).message);
    }
  };
  return (
    <View style={{ gap: 14 }}>
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: theme.accent }}>
          {t(error)}
        </Text>
      )}
      <Text style={s.label}>{t('Texto de la compra')}</Text>
      <TextInput
        style={[s.input, { minHeight: preview ? 76 : 140, maxHeight: preview ? 96 : 220 }]}
        accessibilityLabel={t('Texto de la compra')}
        placeholderTextColor={theme.muted}
        placeholder={t(
          '2 litros de leche, espaguetis y 6 huevos\n500 g de tomates\nMi pan favorito (sin cortar)',
        )}
        value={text}
        onChangeText={(value) => {
          setText(value);
          setPreview(null);
          setError('');
        }}
        editable={!preview}
        multiline
        textAlignVertical="top"
      />
      {!preview ? (
        <Text style={{ color: theme.muted, fontSize: 12 }}>
          {t('Separa los productos con comas o saltos de línea.')}
        </Text>
      ) : (
        <>
          <View style={[s.row, { justifyContent: 'space-between', gap: 12 }]}>
            <Text style={s.label}>{t('{0} productos detectados', preview.length)}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Editar texto')}
              onPress={() => {
                setPreview(null);
                setError('');
              }}
              style={{ minHeight: 44, justifyContent: 'center' }}
            >
              <Text style={{ color: theme.green, fontWeight: '600', fontSize: 13 }}>
                {t('Editar texto')}
              </Text>
            </Pressable>
          </View>
          {preview.map((entry, index) => (
            <Pressable
              key={index}
              accessibilityRole="checkbox"
              accessibilityLabel={t('Incluir {0}', productLabel(entry.product))}
              accessibilityState={{ checked: !excluded.includes(index) }}
              aria-checked={!excluded.includes(index)}
              onPress={() =>
                setExcluded((ids) =>
                  ids.includes(index) ? ids.filter((id) => id !== index) : [...ids, index],
                )
              }
              style={[
                s.row,
                {
                  minHeight: 56,
                  paddingVertical: 6,
                  gap: 12,
                  opacity: excluded.includes(index) ? 0.45 : 1,
                },
              ]}
            >
              <ProductVisual product={entry.product} size={40} />
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={s.label}>{productLabel(entry.product)}</Text>
                <Text style={{ color: theme.muted, fontSize: 13 }}>
                  {entry.quantity} {t(entry.product.unit)}
                  {entry.note ? ' · ' + entry.note : ''}
                </Text>
                {!entry.product.catalogId && !entry.product.productId && (
                  <Text style={{ color: theme.muted, fontSize: 11 }}>{t('Producto nuevo')}</Text>
                )}
              </View>
              <Icon name={excluded.includes(index) ? 'plus' : 'check'} color={theme.green} />
            </Pressable>
          ))}
        </>
      )}
      {beforeSubmit}
      {preview && (
        <Text style={{ color: theme.muted, fontSize: 12 }}>{t('Revisa antes de añadir.')}</Text>
      )}
      <Button
        title={
          !preview
            ? t('Preparar lista')
            : selected.length === 1
              ? t('Añadir 1 producto')
              : t('Añadir {0} productos', selected.length)
        }
        icon={preview ? 'plus' : 'lists'}
        disabled={preview ? !selected.length : !text.trim()}
        onPress={() => {
          if (!preview) {
            prepare();
            return;
          }
          try {
            onAdd(selected);
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      />
    </View>
  );
}
