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
}: {
  catalog: Product[];
  onAdd: (items: TextProduct[]) => void;
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
    <View style={{ gap: 16 }}>
      <Text style={s.body}>
        {t(
          'Pega un mensaje o escribe productos separados por comas o saltos de línea. Funciona sin conexión.',
        )}
      </Text>
      {!!error && (
        <Text accessibilityRole="alert" style={{ color: theme.accent }}>
          {t(error)}
        </Text>
      )}
      {!preview ? (
        <>
          <Text style={s.label}>{t('Texto de la compra')}</Text>
          <TextInput
            style={[s.input, { minHeight: 165 }]}
            placeholderTextColor={theme.muted}
            accessibilityLabel={t('Texto de la compra')}
            placeholder={t(
              '2 litros de leche, espaguetis y 6 huevos\n500 g de tomates\nMi pan favorito (sin cortar)',
            )}
            value={text}
            onChangeText={setText}
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
          <Button
            title={t('Preparar lista')}
            icon="lists"
            onPress={prepare}
            disabled={!text.trim()}
          />
        </>
      ) : (
        <>
          <Text style={s.label}>{t('Revisa los productos antes de añadirlos.')}</Text>
          <Text style={s.body}>
            {t(
              'Desmarca lo que no quieras. Puedes volver al texto para corregir nombres y cantidades.',
            )}
          </Text>
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
                { paddingVertical: 10, gap: 12, opacity: excluded.includes(index) ? 0.45 : 1 },
              ]}
            >
              <ProductVisual product={entry.product} size={42} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={s.label}>{productLabel(entry.product)}</Text>
                <Text style={s.body}>
                  {entry.quantity} {t(entry.product.unit)}
                  {entry.note ? ` · ${entry.note}` : ''}
                </Text>
                {!entry.product.catalogId && !entry.product.productId && (
                  <Text style={s.body}>{t('Producto nuevo')}</Text>
                )}
              </View>
              <Icon name={excluded.includes(index) ? 'plus' : 'check'} color={theme.green} />
            </Pressable>
          ))}
          <Button
            title={
              selected.length === 1
                ? t('Añadir 1 producto')
                : t('Añadir {0} productos', selected.length)
            }
            icon="plus"
            disabled={!selected.length}
            onPress={() => {
              try {
                onAdd(selected);
              } catch (err) {
                setError((err as Error).message);
              }
            }}
          />
          <Button
            title={t('Editar texto')}
            secondary
            onPress={() => {
              setPreview(null);
              setError('');
            }}
          />
        </>
      )}
    </View>
  );
}
