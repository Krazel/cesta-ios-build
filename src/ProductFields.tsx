import React, { useState } from 'react';
import { Keyboard, Pressable, Text, View } from 'react-native';
import { Category } from './domain';
import { categories } from './catalog';
import { t } from './i18n';
import { Button, Field, Icon, s, theme } from './ui';
import { ChoiceField } from './ChoiceField';
import { ProductVisual } from './ProductVisual';

export function ProductFields({
  name,
  setName,
  unit,
  setUnit,
  emoji,
  setEmoji,
  category,
  setCategory,
  photo,
  setPhoto,
  busy,
  onPhoto,
  quantity,
  setQuantity,
  note,
  setNote,
}: {
  name: string;
  setName: (s: string) => void;
  unit: string;
  setUnit: (s: string) => void;
  emoji: string;
  setEmoji: (s: string) => void;
  category: Category;
  setCategory: (c: Category) => void;
  photo?: string;
  setPhoto: (p: string | undefined) => void;
  busy: boolean;
  onPhoto: () => void;
  quantity?: string;
  setQuantity?: (s: string) => void;
  note?: string;
  setNote?: (s: string) => void;
}) {
  const [unitOptions, setUnitOptions] = useState(false);
  const product = {
    name: name.trim() || t('Nombre del producto'),
    unit,
    emoji,
    category,
    image: photo,
  };
  const icons = [...new Set([emoji, ...categories.map((c) => c.emoji), '🥖', '🍎', '🛒'])];
  return (
    <View style={{ gap: 16 }}>
      <Field
        accessibilityLabel={t('Nombre del producto')}
        label={t('Nombre del producto')}
        placeholder={t('Por ejemplo, mi pan favorito')}
        value={name}
        onChangeText={setName}
        maxLength={80}
      />
      <View style={[s.row, { gap: 14 }]}>
        <ProductVisual product={product} size={58} />
        <View style={{ flex: 1, gap: 5 }}>
          <View style={[s.row, { gap: 8, flexWrap: 'wrap' }]}>
            <Button
              small
              secondary
              title={busy ? t('Preparando foto…') : photo ? t('Cambiar foto') : t('Añadir foto')}
              icon="image"
              disabled={busy}
              onPress={onPhoto}
            />
            {photo && (
              <Button
                small
                secondary
                title={t('Quitar foto')}
                onPress={() => setPhoto(undefined)}
              />
            )}
          </View>
          <Text style={{ color: theme.muted, fontSize: 12 }}>{t('La foto es opcional.')}</Text>
        </View>
      </View>
      <View style={[s.row, { gap: 12 }]}>
        {setQuantity && (
          <View style={{ flex: 1 }}>
            <Field
              accessibilityLabel={t('Cantidad')}
              label={t('Cantidad')}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="decimal-pad"
              maxLength={7}
            />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <Field
            accessibilityLabel={t('Unidad')}
            label={t('Unidad')}
            value={unit}
            onChangeText={setUnit}
            maxLength={24}
            style={{ paddingRight: 48 }}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Elegir unidad')}
            accessibilityState={{ expanded: unitOptions }}
            onPress={() => {
              Keyboard.dismiss();
              setUnitOptions(!unitOptions);
            }}
            style={{
              position: 'absolute',
              right: 4,
              top: 24,
              width: 44,
              height: 44,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Icon name="down" size={17} />
          </Pressable>
        </View>
      </View>
      {unitOptions && (
        <View style={[s.row, { gap: 6, flexWrap: 'wrap' }]}>
          {[t('ud'), 'kg', 'g', 'L', 'pack', t('bote')].map((value) => (
            <Button
              key={value}
              small
              secondary
              title={value}
              label={t('Unidad {0}', value)}
              onPress={() => {
                setUnit(value);
                setUnitOptions(false);
              }}
            />
          ))}
        </View>
      )}
      <ChoiceField
        label={t('Categoría')}
        value={category}
        options={categories}
        optionLabel="Categoría {0}"
        onChange={(value) => {
          const cat = categories.find((c) => c.id === value)!;
          setCategory(cat.id);
          if (!photo) setEmoji(cat.emoji);
        }}
      />
      <ChoiceField
        label={t('Icono (opcional)')}
        value={emoji}
        options={icons.map((icon) => ({ id: icon, name: icon }))}
        onChange={setEmoji}
      />
      {setNote && (
        <Field
          accessibilityLabel={t('Nota del producto')}
          label={t('Nota (opcional)')}
          value={note}
          onChangeText={setNote}
          maxLength={300}
          multiline
          placeholder={t('Marca, tamaño, lo que quieras…')}
        />
      )}
      <View style={{ borderRadius: 16, backgroundColor: '#EDF1E6', padding: 12, gap: 10 }}>
        <Text style={s.label}>{t('Así aparecerá en tu lista')}</Text>
        <View style={[s.row, { gap: 12 }]}>
          <View accessibilityElementsHidden aria-hidden>
            <ProductVisual product={product} size={40} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{ color: theme.ink, fontWeight: '600', fontSize: 15 }}>
              {product.name}
            </Text>
            <Text style={{ color: theme.muted, fontSize: 12 }}>
              {t(categories.find((c) => c.id === category)?.name || 'Otros')} ·{' '}
              {quantity ? quantity + ' ' : ''}
              {t(unit)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
