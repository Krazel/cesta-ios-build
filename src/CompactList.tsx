import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { Item, Product, ShoppingList } from './domain';
import { normalize, productIdentity } from './domain';
import { categories, matchesProductSearch } from './catalog';
import { ProductVisual } from './ProductsScreen';
import { productLabel, t } from './i18n';
import { Icon, IconButton, s, theme } from './ui';

export function CompactList({
  list,
  grouped,
  onGroup,
  onBack,
  backLabel,
  onMenu,
  onAdd,
  onQuickAdd,
  catalog,
  onSelectProduct,
  renderItem,
  pinned,
  onActivate,
  onStore,
}: {
  list: ShoppingList;
  grouped: boolean;
  onGroup: () => void;
  onBack: () => void;
  backLabel: string;
  onMenu: () => void;
  onAdd: () => void;
  onQuickAdd: (name: string) => void;
  catalog: Product[];
  onSelectProduct: (product: Product) => void;
  renderItem: (item: Item) => React.ReactNode;
  pinned: boolean;
  onActivate: () => void;
  onStore: () => void;
}) {
  const [draft, setDraft] = useState('');
  const [search, setSearch] = useState('');
  const [searching, setSearching] = useState(false);
  const suggestions = draft.trim()
    ? catalog.filter((product) => matchesProductSearch(product, draft))
    : [];
  const bought = list.items.filter((item) => item.checked).length;
  const complete = list.items.length > 0 && bought === list.items.length;
  const visible = list.items.filter((item) =>
    normalize(productLabel(item) + ' ' + item.note).includes(normalize(search)),
  );
  const ordered = [
    ...visible.filter((item) => !item.checked),
    ...visible.filter((item) => item.checked),
  ];
  const submit = () => {
    if (!draft.trim()) {
      onAdd();
      return;
    }
    onQuickAdd(draft.trim());
    setDraft('');
  };
  return (
    <View style={{ flex: 1 }}>
      <View style={c.header}>
        <IconButton name="back" label={backLabel} onPress={onBack} />
        <Text style={c.title} numberOfLines={1} accessibilityRole="header">
          {list.emoji} {list.name}
        </Text>
        <IconButton name="more" label={t('Opciones de la lista')} onPress={onMenu} />
      </View>
      <View style={c.meta}>
        <Text style={c.caption} accessibilityLiveRegion="polite">
          {t('{0} de {1} comprados', bought, list.items.length)}
          {` · ${list.items.length ? Math.round((bought / list.items.length) * 100) : 0}%`}
        </Text>
        <View style={s.row}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={grouped ? t('Mostrar sin categorías') : t('Agrupar por pasillos')}
            onPress={onGroup}
            style={c.group}
          >
            <Icon name="lists" size={14} color={theme.muted} />
            <Text style={c.caption}>{grouped ? t('Por pasillos') : t('Todos juntos')}</Text>
          </Pressable>
          {list.items.length > 5 && (
            <IconButton
              name="search"
              label={t('Buscar en esta lista')}
              onPress={() => {
                setSearching(!searching);
                setSearch('');
              }}
            />
          )}
        </View>
      </View>
      <View
        style={c.track}
        accessibilityRole="progressbar"
        accessibilityLabel={t('Progreso de la compra')}
        accessibilityValue={{ min: 0, max: list.items.length || 1, now: bought }}
      >
        <View
          style={[
            c.fill,
            { width: `${list.items.length ? (bought / list.items.length) * 100 : 0}%` },
          ]}
        />
      </View>
      {searching && (
        <TextInput
          accessibilityLabel={t('Buscar en esta lista')}
          placeholder={t('Encontrar en esta lista')}
          placeholderTextColor={theme.muted}
          value={search}
          onChangeText={setSearch}
          autoFocus
          style={c.search}
        />
      )}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={c.products}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        {!pinned && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={complete ? t('Volver a usar') : t('Añadir al inicio')}
            onPress={onActivate}
            style={c.listAction}
          >
            <Icon name="plus" size={17} />
            <Text style={c.caption}>{complete ? t('Volver a usar') : t('Añadir al inicio')}</Text>
          </Pressable>
        )}
        {complete && pinned && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={t('Guardar y quitar del inicio')}
            onPress={onStore}
            style={c.listAction}
          >
            <Icon name="check" size={17} />
            <Text style={c.caption}>{t('Guardar y quitar del inicio')}</Text>
          </Pressable>
        )}
        {!list.items.length ? (
          <View style={c.empty}>
            <Text style={c.emptyTitle}>{t('¿Qué hace falta?')}</Text>
            <Text style={s.body}>{t('Escribe un producto abajo o abre el catálogo con +.')}</Text>
          </View>
        ) : !visible.length ? (
          <View style={c.empty}>
            <Text style={s.body}>{t('No está por aquí')}</Text>
          </View>
        ) : grouped ? (
          categories.map((category) => {
            const entries = ordered.filter((item) => item.category === category.id);
            return entries.length ? (
              <View key={category.id}>
                <Text style={c.category}>
                  {category.emoji} {t(category.name)}
                </Text>
                {entries.map(renderItem)}
              </View>
            ) : null;
          })
        ) : (
          ordered.map(renderItem)
        )}
      </ScrollView>
      {!!draft.trim() && (
        <View style={c.suggestions}>
          <Text style={c.suggestionHeading} accessibilityLiveRegion="polite">
            {suggestions.length
              ? t('Productos coincidentes · {0}', suggestions.length)
              : t('No hay coincidencias. Pulsa + para añadirlo.')}
          </Text>
          <ScrollView
            style={{ flexShrink: 1 }}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
          >
            {suggestions.map((product) => (
              <Pressable
                key={productIdentity(product)}
                accessibilityRole="button"
                accessibilityLabel={t('Añadir {0}', productLabel(product))}
                onPress={() => {
                  onSelectProduct(product);
                  setDraft('');
                }}
                style={c.suggestion}
              >
                <ProductVisual product={product} size={32} />
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={c.suggestionName} numberOfLines={1}>
                    {productLabel(product)}
                  </Text>
                  <Text style={c.caption} numberOfLines={1}>
                    {t(
                      categories.find((category) => category.id === product.category)?.name ||
                        'Otros',
                    )}
                    {' · '}
                    {t(product.unit)}
                  </Text>
                </View>
                <Icon name="plus" size={18} color={theme.green} />
              </Pressable>
            ))}
          </ScrollView>
        </View>
      )}
      <View style={c.composer}>
        <TextInput
          accessibilityLabel={t('Añadir producto')}
          placeholder={t('Añadir producto…')}
          placeholderTextColor={theme.muted}
          value={draft}
          onChangeText={setDraft}
          onSubmitEditing={submit}
          returnKeyType="done"
          blurOnSubmit={false}
          maxLength={80}
          style={c.input}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={draft.trim() ? t('Añadir producto escrito') : t('Añadir productos')}
          onPress={submit}
          style={c.plus}
        >
          <Icon name="plus" size={21} color="#fff" />
        </Pressable>
      </View>
    </View>
  );
}
const c = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    minHeight: 52,
    gap: 4,
  },
  title: { flex: 1, fontFamily: theme.serif, fontSize: 21, color: theme.ink },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 20,
    paddingRight: 8,
  },
  caption: { fontSize: 12, color: '#65746A', flexShrink: 1 },
  group: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 5,
  },
  track: {
    height: 3,
    borderRadius: 2,
    backgroundColor: theme.line,
    marginHorizontal: 20,
    marginBottom: 6,
    overflow: 'hidden',
  },
  fill: { height: '100%', backgroundColor: theme.green },
  products: { paddingHorizontal: 18, paddingBottom: 12 },
  category: {
    paddingTop: 14,
    paddingBottom: 6,
    fontSize: 12,
    fontWeight: '600',
    color: theme.muted,
  },
  search: {
    marginHorizontal: 18,
    marginBottom: 8,
    padding: 12,
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: '#EEF0E8',
    fontSize: 16,
    color: theme.ink,
  },
  listAction: {
    flexDirection: 'row',
    gap: 8,
    minHeight: 44,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.line,
  },
  empty: { paddingVertical: 28, gap: 10 },
  emptyTitle: { fontFamily: theme.serif, fontSize: 25, color: theme.ink },
  suggestions: {
    maxHeight: 204,
    flexShrink: 1,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 15,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  suggestionHeading: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: theme.muted,
  },
  suggestion: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.line,
  },
  suggestionName: { fontSize: 16, color: theme.ink, fontWeight: '500' },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 8,
    padding: 2,
    paddingLeft: 12,
    backgroundColor: '#fff',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.line,
  },
  input: { flex: 1, minWidth: 0, minHeight: 44, fontSize: 16, color: theme.ink },
  plus: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: theme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
