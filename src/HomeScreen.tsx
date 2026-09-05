import React, { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ShoppingList, normalize } from './domain';
import { currentLists, useCesta } from './store';
import { t } from './i18n';
import { Button, Field, Icon, IconButton, palette, s, theme } from './ui';

type Props = {
  mode?: 'home' | 'library';
  onNew: () => void;
  onPaste: () => void;
  onJoin: () => void;
  onProfile: () => void;
  onOpen: (list: ShoppingList) => void;
  onLibrary: () => void;
  onActivate: (list: ShoppingList) => void;
  onRemove: (list: ShoppingList) => void;
  onReuse: (list: ShoppingList) => void;
  onDelete: (list: ShoppingList) => void;
  onMenu: (list: ShoppingList) => void;
};
export function HomeScreen({
  mode = 'home',
  onNew,
  onPaste,
  onJoin,
  onProfile,
  onOpen,
  onLibrary,
  onActivate,
  onRemove,
  onReuse,
  onDelete,
  onMenu,
}: Props) {
  const state = useCesta(),
    library = mode === 'library',
    wide = useWindowDimensions().width > 700;
  const [search, setSearch] = useState('');
  const all = currentLists();
  const lists = all.filter(
    (list) =>
      (library || state.activeListIds.includes(list.id)) &&
      normalize(list.name).includes(normalize(search)),
  );
  return (
    <View style={{ flex: 1 }}>
      <View style={h.header}>
        <View style={[s.row, { justifyContent: 'space-between', marginBottom: 10 }]}>
          {library ? (
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={h.heading}>{t('Listas')}</Text>
              <Text style={h.caption}>{t('Guárdalas hoy. Úsalas cuando quieras.')}</Text>
            </View>
          ) : (
            <View style={[s.row, { gap: 7 }]}>
              <Icon name="basket" size={28} />
              <Text style={h.brand}>
                cesta<Text style={{ color: theme.accent }}>.</Text>
              </Text>
            </View>
          )}
          <View style={[s.row, { gap: 4 }]}>
            {!library && (
              <IconButton name="people" label={t('Unirme a una lista')} onPress={onJoin} />
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Editar perfil')}
              onPress={onProfile}
              style={h.avatar}
            >
              <Text style={{ color: theme.ink, fontWeight: '600' }}>
                {state.snapshot.device.name.charAt(0).toUpperCase()}
              </Text>
            </Pressable>
          </View>
        </View>
        <View style={[s.row, { gap: 10 }]}>
          <View style={{ flex: 1 }}>
            <Button
              small
              title={library ? t('Nueva lista') : t('Pegar lista')}
              icon={library ? 'plus' : 'copy'}
              onPress={library ? onNew : onPaste}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              small
              secondary
              title={library ? t('Unirme') : t('Nueva lista')}
              label={library ? t('Unirme a una lista') : t('Nueva lista')}
              icon={library ? 'people' : 'plus'}
              onPress={library ? onJoin : onNew}
            />
          </View>
        </View>
        {library && (
          <View style={{ marginTop: 13 }}>
            <Field
              accessibilityLabel={t('Buscar listas')}
              placeholder={t('Buscar listas')}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        )}
      </View>
      <FlatList
        key={wide ? 'wide' : 'narrow'}
        data={lists}
        keyExtractor={(list) => list.id}
        numColumns={wide ? 2 : 1}
        columnWrapperStyle={wide ? { gap: 14 } : undefined}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={h.content}
        ListHeaderComponent={
          <View style={[s.row, { gap: 10, marginBottom: 8 }]}>
            <Text style={library ? h.heading : s.label}>
              {library ? t('Tus listas guardadas') : t('En compra')}
            </Text>
            <Text style={h.count}>{lists.length}</Text>
          </View>
        }
        renderItem={({ item: list }) => {
          const count = list.items.length,
            done = list.items.filter((item) => item.checked).length,
            complete = count > 0 && done === count,
            pinned = state.activeListIds.includes(list.id),
            p = palette[list.color];
          if (!library)
            return (
              <View style={[h.compactCard, wide && { flex: 1, maxWidth: '49%' }]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Abrir {0}', list.name)}
                  onPress={() => onOpen(list)}
                  style={h.compactOpen}
                >
                  <View style={[h.compactEmoji, { backgroundColor: p.bg }]}>
                    <Text style={{ fontSize: 24 }}>{list.emoji}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <Text style={[h.name, { fontSize: 15 }]} numberOfLines={2}>
                      {list.name}
                    </Text>
                    <Text style={h.caption}>
                      {complete ? t('¡Compra completa!') : t('{0} pendientes', count - done)}
                      {list.members.length > 1 ? ` · ${t('Compartida')}` : ''}
                    </Text>
                  </View>
                </Pressable>
                <IconButton
                  name="more"
                  label={t('Opciones de {0}', list.name)}
                  onPress={() => onMenu(list)}
                />
              </View>
            );
          return (
            <View style={[h.card, wide && { flex: 1, maxWidth: '49%' }]}>
              <View style={[s.row, { alignItems: 'flex-start' }]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('Abrir {0}', list.name)}
                  onPress={() => onOpen(list)}
                  style={[s.row, { flex: 1, gap: 12, padding: 18, paddingRight: 0 }]}
                >
                  <View style={[h.emoji, { backgroundColor: p.bg }]}>
                    <Text style={{ fontSize: 30 }}>{list.emoji}</Text>
                  </View>
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text style={h.name}>{list.name}</Text>
                    <Text style={h.caption}>
                      {complete
                        ? t('¡Compra completa!')
                        : count
                          ? t('{0} pendientes · {1} productos', count - done, count)
                          : t('Sin productos todavía')}
                    </Text>
                  </View>
                </Pressable>
                <View style={{ paddingTop: 11, paddingRight: 7 }}>
                  <IconButton
                    name="more"
                    label={t('Opciones de {0}', list.name)}
                    onPress={() => onMenu(list)}
                  />
                </View>
              </View>
              <View style={{ paddingHorizontal: 18, paddingBottom: 15 }}>
                <View style={[s.row, { gap: 12, marginBottom: 12 }]}>
                  <View style={h.track}>
                    <View
                      style={{
                        height: 5,
                        width: `${count ? (done / count) * 100 : 0}%`,
                        backgroundColor: p.dark,
                        borderRadius: 5,
                      }}
                    />
                  </View>
                  <Text style={h.caption}>
                    {done}/{count}
                  </Text>
                </View>
                <View style={[s.row, { gap: 6 }]}>
                  <Icon
                    name={list.members.length > 1 ? 'people' : 'heart'}
                    size={14}
                    color={theme.muted}
                  />
                  <Text style={[h.caption, { flex: 1 }]}>
                    {list.members.length > 1
                      ? t('Compartida · {0} personas', list.members.length)
                      : t('Solo para ti')}
                  </Text>
                  {library && (
                    <Text style={[h.badge, { backgroundColor: pinned ? '#E5EDDE' : '#F0F1EB' }]}>
                      {pinned ? t('En inicio') : t('Guardada')}
                    </Text>
                  )}
                </View>
                {library ? (
                  <View style={[s.row, { gap: 6, marginTop: 14 }]}>
                    <View style={{ flex: 1 }}>
                      <Button
                        small
                        secondary={pinned}
                        title={
                          complete
                            ? t('Volver a usar')
                            : pinned
                              ? t('Abrir compra')
                              : t('Añadir al inicio')
                        }
                        label={
                          complete
                            ? t('Volver a usar {0}', list.name)
                            : pinned
                              ? t('Abrir compra {0}', list.name)
                              : t('Añadir {0} al inicio', list.name)
                        }
                        icon={complete ? 'refresh' : pinned ? 'arrow' : 'plus'}
                        onPress={() =>
                          complete ? onReuse(list) : pinned ? onOpen(list) : onActivate(list)
                        }
                      />
                    </View>
                    <IconButton
                      name="trash"
                      label={
                        list.ownerId === state.snapshot.device.id
                          ? t('Eliminar {0}', list.name)
                          : t('Salir de {0}', list.name)
                      }
                      color={theme.accent}
                      onPress={() => onDelete(list)}
                    />
                  </View>
                ) : (
                  <View style={[s.row, { gap: 8, marginTop: 14 }]}>
                    <View style={{ flex: 1 }}>
                      <Button
                        small
                        secondary
                        title={complete ? t('Guardar lista') : t('Quitar del inicio')}
                        label={
                          complete
                            ? t('Guardar {0}', list.name)
                            : t('Quitar {0} del inicio', list.name)
                        }
                        icon={complete ? 'check' : 'close'}
                        onPress={() => onRemove(list)}
                      />
                    </View>
                    {complete && (
                      <IconButton
                        name="refresh"
                        label={t('Volver a usar {0}', list.name)}
                        onPress={() => onReuse(list)}
                      />
                    )}
                  </View>
                )}
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ paddingVertical: 20, gap: 14 }}>
            <View style={h.emptyIcon}>
              <Icon name={library ? 'lists' : 'basket'} size={32} color={theme.green} />
            </View>
            <Text style={h.heading}>
              {search
                ? t('No hay listas con ese nombre')
                : library
                  ? t('Tu primera lista empieza aquí')
                  : t('¿Qué vas a comprar hoy?')}
            </Text>
            <Text style={s.body}>
              {library
                ? t('Crea una lista habitual y llévala al inicio cuando la necesites.')
                : t(
                    'Elige una de tus listas guardadas. Solo verás aquí las compras que tengas activas.',
                  )}
            </Text>
            {!library && <Button title={t('Ver mis listas')} icon="lists" onPress={onLibrary} />}
          </View>
        }
        ListFooterComponent={
          !library && lists.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={t('Elegir una lista')}
              onPress={onLibrary}
              style={[s.row, { gap: 8, minHeight: 44, marginTop: 12 }]}
            >
              <Icon name="lists" size={17} color={theme.muted} />
              <Text style={h.caption}>{t('Ver todas mis listas')}</Text>
            </Pressable>
          ) : null
        }
      />
    </View>
  );
}
const h = StyleSheet.create({
  header: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 14,
    backgroundColor: theme.bg,
  },
  brand: {
    fontFamily: theme.serif,
    fontWeight: '700',
    fontSize: 29,
    letterSpacing: -1.5,
    color: theme.ink,
  },
  avatar: {
    width: 43,
    height: 43,
    borderRadius: 22,
    backgroundColor: '#E9EADD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 18, paddingTop: 4, paddingBottom: 20 },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.line,
  },
  compactOpen: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  compactEmoji: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { fontFamily: theme.serif, fontSize: 25, color: theme.ink },
  count: {
    borderRadius: 15,
    backgroundColor: '#EEEFE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: theme.muted,
    fontSize: 12,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: '#fff',
    marginBottom: 14,
  },
  emoji: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontSize: 17, fontWeight: '600', color: theme.ink },
  caption: { fontSize: 12, lineHeight: 18, color: theme.muted },
  track: { height: 5, borderRadius: 5, overflow: 'hidden', backgroundColor: '#EEF0E8', flex: 1 },
  badge: {
    fontSize: 10,
    color: theme.green,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 10,
  },
  emptyIcon: {
    width: 66,
    height: 66,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E5EDDE',
  },
});
