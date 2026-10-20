import { PurchaseScope } from './PurchaseScope';
import React, { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Category, Product, ShoppingList } from './domain';
import { productSizes } from './appearance';
import { dismissOutsideInput } from './KeyboardScreen';
import { categories, products, matchesProductSearch } from './catalog';
import {
  addProduct,
  currentLists,
  visibleLists,
  deleteCustomProduct,
  favorite,
  saveCustomProduct,
  useCesta,
} from './store';
import { t, productLabel } from './i18n';
import { chooseProductPhoto } from './photos';
import { ChoiceField } from './ChoiceField';
import { ProductFields } from './ProductFields';
import { ProductVisual } from './ProductVisual';
export { ProductVisual } from './ProductVisual';
import { Button, Field, Icon, IconButton, s, theme } from './ui';

export function ProductsScreen({
  onNewList,
  activeList,
  purchaseOnly,
  oneTime,
  onScopeChange,
  onReturnToList,
}: {
  onNewList: () => void;
  activeList?: ShoppingList;
  purchaseOnly: boolean;
  oneTime: boolean;
  onScopeChange: (value: boolean) => void;
  onReturnToList: () => void;
}) {
  const state = useCesta(),
    insets = useSafeAreaInsets();
  const lists = visibleLists();
  const productSize = productSizes[state.productSize];
  const [query, setQuery] = useState(''),
    [filter, setFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [lastAdded, setLastAdded] = useState<{ key: string; at: number } | null>(null);
  useEffect(() => {
    if (!lastAdded) return;
    const timer = setTimeout(() => setLastAdded(null), 2200);
    return () => clearTimeout(timer);
  }, [lastAdded]);
  const [editing, setEditing] = useState<Product | null>(null),
    [creating, setCreating] = useState(false);
  const [name, setName] = useState(''),
    [unit, setUnit] = useState('ud'),
    [emoji, setEmoji] = useState('🛍️'),
    [category, setCategory] = useState<Category>('other'),
    [photo, setPhoto] = useState<string | undefined>();
  const [target, setTarget] = useState<Product | null>(null),
    [selection, setSelection] = useState<string[]>([]),
    [quantity, setQuantity] = useState('1');
  const [error, setError] = useState(''),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false),
    [deleting, setDeleting] = useState(false);
  const modal = creating || !!editing || !!target;
  const catalog = useMemo(() => [...state.customProducts, ...products], [state.customProducts]);
  const favoriteKey = (p: Product) => p.productId || p.catalogId || p.name;
  const starred = (p: Product) => state.favorites.some((f) => favoriteKey(f) === favoriteKey(p));
  const filtered = catalog.filter(
    (p) =>
      (filter === 'all' ||
        (filter === 'custom' && !!p.productId) ||
        (filter === 'favorites' && starred(p)) ||
        p.category === filter) &&
      (categoryFilter === 'all' || p.category === categoryFilter) &&
      matchesProductSearch(p, query),
  );
  const close = () => {
    setCreating(false);
    setEditing(null);
    setTarget(null);
    setError('');
    setDeleting(false);
  };
  const edit = (p?: Product) => {
    setName(p?.name || query.trim());
    setUnit(p?.unit || t('ud'));
    setEmoji(p?.emoji || '🛍️');
    setCategory(p?.category || 'other');
    setPhoto(p?.image);
    setEditing(p || null);
    setCreating(!p);
    setError('');
    setMessage('');
  };
  const openTarget = (p: Product) => {
    setTarget(p);
    setSelection(
      lists.some((l) => l.id === state.selectedId)
        ? [state.selectedId!]
        : lists.length === 1
          ? [lists[0].id]
          : [],
    );
    setQuantity('1');
    setError('');
    setMessage('');
  };
  const save = () => {
    try {
      saveCustomProduct({
        name: name.trim(),
        unit: unit.trim() || 'ud',
        emoji,
        category,
        image: photo,
        productId: editing?.productId,
      });
      close();
      setQuery('');
      setFilter('custom');
      setCategoryFilter('all');
      setMessage(t('Producto guardado en tu catálogo'));
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const add = () => {
    const amount = Number(quantity.replace(',', '.'));
    if (!Number.isFinite(amount) || amount < 0.1 || amount > 9999) {
      setError(t('Escribe una cantidad entre 0,1 y 9999.'));
      return;
    }
    if (!target || !selection.length) return;
    selection
      .filter((id) => lists.some((l) => l.id === id))
      .forEach((id) =>
        addProduct(id, target, amount, '', purchaseOnly && oneTime && activeList?.id === id),
      );
    setMessage(t('Añadido a {0} listas', selection.length));
    close();
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={p.header} aria-hidden={modal}>
        <View style={[s.row, { justifyContent: 'space-between', gap: 12, marginBottom: 16 }]}>
          <Text style={[s.title, { fontSize: 31, flex: 1 }]}>{t('Productos')}</Text>
          <Button
            small
            title={t('Crear')}
            label={t('Crear producto')}
            icon="plus"
            onPress={() => edit()}
          />
        </View>

        {activeList && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Volver a {0}', activeList.name)}
            onPress={onReturnToList}
            style={[
              s.row,
              {
                gap: 8,
                minHeight: 44,
                marginBottom: 8,
                paddingHorizontal: 10,
                backgroundColor: '#E5EDDE',
                borderRadius: 12,
              },
            ]}
          >
            <Icon name="back" size={17} />
            <Text style={[s.label, { flex: 1 }]}>{t('Añadiendo a {0}', activeList.name)}</Text>
          </Pressable>
        )}
        <Field
          accessibilityLabel={t('Buscar productos')}
          placeholder={t('Buscar productos')}
          value={query}
          onChangeText={setQuery}
        />
        <View style={{ paddingTop: 10, gap: 10 }}>
          <View style={[s.row, { gap: 6 }]}>
            {[
              { id: 'all', name: 'Todo', emoji: '🧺' },
              { id: 'custom', name: 'Mis productos', emoji: '🛍️' },
              { id: 'favorites', name: 'Favoritos', emoji: '❤️' },
            ].map((option) => (
              <Pressable
                key={option.id}
                accessibilityRole="button"
                accessibilityLabel={t('Filtrar {0}', t(option.name))}
                aria-pressed={filter === option.id}
                accessibilityState={{ selected: filter === option.id }}
                onPress={() => setFilter(option.id)}
                style={[
                  s.row,
                  {
                    flex: 1,
                    minHeight: 44,
                    justifyContent: 'center',
                    gap: 5,
                    borderRadius: 14,
                    padding: 6,
                    backgroundColor: filter === option.id ? theme.ink : '#E9EEE2',
                  },
                ]}
              >
                <Text aria-hidden>{option.emoji}</Text>
                <Text
                  style={{
                    flexShrink: 1,
                    fontSize: 12,
                    color: filter === option.id ? '#fff' : theme.ink,
                  }}
                >
                  {t(option.name)}
                </Text>
              </Pressable>
            ))}
          </View>
          <ChoiceField
            compact
            label={t('Categoría')}
            value={categoryFilter}
            options={[{ id: 'all', name: 'Todas' }, ...categories]}
            optionLabel="Filtrar {0}"
            onChange={setCategoryFilter}
          />
        </View>
      </View>
      {message && !modal && (
        <Text accessibilityLiveRegion="polite" style={p.success}>
          {message}
        </Text>
      )}
      <FlatList
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        aria-hidden={modal}
        data={filtered}
        keyExtractor={favoriteKey}
        contentContainerStyle={{ padding: 20, paddingTop: 10, paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ padding: 20, gap: 15 }}>
            <Text style={s.body}>{t('No hay productos con este filtro.')}</Text>
            <Button title={t('Crear producto')} onPress={() => edit()} />
          </View>
        }
        renderItem={({ item: product }) => (
          <View style={p.row}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Añadir {0}', productLabel(product))}
              onPress={() => openTarget(product)}
              style={[s.row, { flex: 1, gap: 12, paddingVertical: 12 }]}
            >
              <ProductVisual product={product} size={productSize.image} />
              <View style={{ flex: 1, gap: 5 }}>
                <Text style={[p.name, { fontSize: productSize.font }]}>
                  {productLabel(product)}
                </Text>
                <Text style={p.caption}>
                  {t(categories.find((c) => c.id === product.category)?.name || 'Otros')} ·{' '}
                  {t(product.unit)}
                </Text>
              </View>
            </Pressable>
            <IconButton
              name="heart"
              label={
                starred(product)
                  ? t('Quitar {0} de favoritos', productLabel(product))
                  : t('Guardar {0} en favoritos', productLabel(product))
              }
              onPress={() => favorite(product)}
              color={starred(product) ? theme.accent : '#A6AF9F'}
            />
            {product.productId && (
              <IconButton
                name="edit"
                label={t('Editar {0}', productLabel(product))}
                onPress={() => edit(product)}
              />
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                activeList
                  ? t('Añadir {0} a {1}', productLabel(product), activeList.name)
                  : t('Elegir listas para {0}', productLabel(product))
              }
              style={{
                minWidth: 44,
                minHeight: 44,
                paddingHorizontal: 8,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: activeList
                  ? lastAdded?.key === favoriteKey(product)
                    ? '#E5EDDE'
                    : theme.ink
                  : 'transparent',
              }}
              onPress={() => {
                if (!activeList) {
                  openTarget(product);
                  return;
                }
                addProduct(activeList.id, product, 1, '', purchaseOnly && oneTime);
                setLastAdded({ key: favoriteKey(product), at: Date.now() });
                setMessage('');
              }}
            >
              {lastAdded?.key === favoriteKey(product) ? (
                <Text accessibilityLiveRegion="polite" style={{ color: theme.green, fontSize: 12 }}>
                  {t('✓ Añadido')}
                </Text>
              ) : (
                <Icon name="plus" color={activeList ? '#fff' : theme.green} size={22} />
              )}
            </Pressable>
          </View>
        )}
      />
      <Modal visible={modal} transparent animationType="slide" onRequestClose={close}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={p.overlay}
          onTouchEnd={dismissOutsideInput}
        >
          <View style={[p.sheet, { paddingBottom: Math.max(20, insets.bottom) }]}>
            <View
              style={[s.row, { justifyContent: 'space-between', padding: 20, paddingBottom: 6 }]}
            >
              <Text style={[s.title, { fontSize: 25, flex: 1 }]}>
                {target
                  ? t('Añadir a listas')
                  : editing
                    ? t('Editar producto')
                    : t('Crear producto')}
              </Text>
              <IconButton name="close" label={t('Cerrar ventana')} onPress={close} />
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 20, paddingTop: 10, gap: 16 }}
            >
              {!!error && (
                <Text accessibilityLiveRegion="polite" style={p.error}>
                  {error}
                </Text>
              )}
              {target ? (
                <>
                  <View style={[s.row, { gap: 15 }]}>
                    <ProductVisual product={target} size={64} />
                    <Text style={[p.name, { flex: 1 }]}>{productLabel(target)}</Text>
                  </View>
                  <Text style={s.body}>{t('Elige una o varias listas.')}</Text>
                  <Field
                    accessibilityLabel={t('Cantidad')}
                    label={t('Cantidad')}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="decimal-pad"
                    maxLength={7}
                  />
                  {lists.map((list) => (
                    <Pressable
                      key={list.id}
                      accessibilityRole="checkbox"
                      accessibilityLabel={
                        t('Lista {0}', list.name) +
                        ' · ' +
                        t(state.activeListIds.includes(list.id) ? 'En compra' : 'Guardada')
                      }
                      aria-checked={selection.includes(list.id)}
                      accessibilityState={{ checked: selection.includes(list.id) }}
                      onPress={() =>
                        setSelection((ids) =>
                          ids.includes(list.id)
                            ? ids.filter((id) => id !== list.id)
                            : [...ids, list.id],
                        )
                      }
                      style={[p.row, { padding: 13, gap: 12 }]}
                    >
                      <Text style={{ fontSize: 26 }}>{list.emoji}</Text>
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text style={p.name}>{list.name}</Text>
                        <Text style={p.caption}>
                          {t(state.activeListIds.includes(list.id) ? 'En compra' : 'Guardada')}
                        </Text>
                      </View>
                      <Icon
                        name={selection.includes(list.id) ? 'check' : 'plus'}
                        color={theme.green}
                      />
                    </Pressable>
                  ))}
                  {!lists.length ? (
                    <Button
                      title={t('Crear una lista')}
                      onPress={() => {
                        close();
                        onNewList();
                      }}
                    />
                  ) : (
                    <Button
                      title={t('Añadir a las listas elegidas')}
                      icon="plus"
                      onPress={add}
                      disabled={!selection.length}
                    />
                  )}
                </>
              ) : (
                <>
                  <ProductFields
                    name={name}
                    setName={setName}
                    unit={unit}
                    setUnit={setUnit}
                    emoji={emoji}
                    setEmoji={setEmoji}
                    category={category}
                    setCategory={setCategory}
                    photo={photo}
                    setPhoto={setPhoto}
                    busy={busy}
                    onPhoto={() => {
                      setBusy(true);
                      void chooseProductPhoto()
                        .then((image) => {
                          if (image) setPhoto(image);
                        })
                        .catch((e) => setError(e.message))
                        .finally(() => setBusy(false));
                    }}
                  />
                  <Button
                    title={t('Guardar producto')}
                    icon="check"
                    disabled={busy || !name.trim()}
                    onPress={save}
                  />
                  {editing && !deleting && (
                    <Button
                      danger
                      secondary
                      title={t('Eliminar del catálogo')}
                      onPress={() => setDeleting(true)}
                    />
                  )}{' '}
                  {deleting && (
                    <>
                      <Text style={s.body}>
                        {t(
                          'Se quitará del catálogo y favoritos. Los productos ya añadidos a listas se conservarán.',
                        )}
                      </Text>
                      <Button
                        danger
                        title={t('Confirmar eliminación')}
                        onPress={() => {
                          deleteCustomProduct(editing!.productId!);
                          close();
                          setMessage(t('Producto eliminado del catálogo'));
                        }}
                      />
                      <Button secondary title={t('Cancelar')} onPress={() => setDeleting(false)} />
                    </>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
const p = StyleSheet.create({
  header: { padding: 24, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: theme.line },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 11,
    borderRadius: 14,
    backgroundColor: '#E9EEE2',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.line,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  name: { fontSize: 16, fontWeight: '600', color: theme.ink },
  caption: { fontSize: 12, color: theme.muted, lineHeight: 18 },
  success: {
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#E5EDDE',
    color: theme.green,
  },
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: '#1D302A66',
  },
  sheet: {
    width: '100%',
    maxWidth: 560,
    maxHeight: '92%',
    backgroundColor: theme.bg,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  error: { color: '#A14734', backgroundColor: '#F9E7DE', padding: 12, borderRadius: 12 },
});
