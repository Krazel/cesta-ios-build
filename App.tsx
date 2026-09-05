import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Haptics from 'expo-haptics';
import * as Clipboard from 'expo-clipboard';
import * as Linking from 'expo-linking';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { Category, Item, Product, ShoppingList, normalize, productIdentity } from './src/domain';
import { categories, products, matchesProductSearch } from './src/catalog';
import { KeyboardScreen, dismissOutsideInput } from './src/KeyboardScreen';
import { ProductSizeSettings } from './src/ProductSizeSettings';
import { productSizes } from './src/appearance';
import { PurchaseScope } from './src/PurchaseScope';
import { CompactList } from './src/CompactList';
import { HomeScreen } from './src/HomeScreen';
import { CategoryStrip } from './src/CategoryStrip';
import { TextImportForm } from './src/TextImportForm';
import { ProductsScreen, ProductVisual } from './src/ProductsScreen';
import { t as tr, productLabel, getCurrentLanguage } from './src/i18n';
import { chooseProductPhoto } from './src/photos';
import {
  WEB_URL,
  setLanguage,
  setListActive,
  reuseList,
  addProduct,
  addTextProducts,
  clearError,
  createList,
  currentLists,
  enqueue,
  eraseDevice,
  exportData,
  favorite,
  importData,
  initialize,
  invite,
  makeLocal,
  join,
  onboard,
  removeMember,
  revoke,
  selectList,
  startSync,
  synchronize,
  uid,
  updateName,
  useCesta,
} from './src/store';
import { BasketArt, Button, Field, Icon, IconButton, palette, s, theme } from './src/ui';

type Sheet =
  | 'new'
  | 'add'
  | 'text-import'
  | 'edit'
  | 'share'
  | 'join'
  | 'list-menu'
  | 'display'
  | 'profile'
  | 'privacy'
  | null;
type Confirm = {
  title: string;
  body: string;
  action: () => void | Promise<void>;
  label: string;
} | null;
const emojis = ['🛒', '🥑', '🏡', '🥐', '🍝', '🧼', '🍋', '🍓', '🧺', '☕', '🐾', '🎒'];
const quantityLabel = (i: Item) =>
  `${Number.isInteger(i.quantity) ? i.quantity : getCurrentLanguage() === 'es' ? String(i.quantity).replace('.', ',') : String(i.quantity)} ${tr(i.unit)}`;
const feedback = () => {
  if (Platform.OS !== 'web') void Haptics.selectionAsync().catch(() => {});
};

function AppContent() {
  const state = useCesta();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width > 700;
  const [tab, setTab] = useState<'home' | 'lists' | 'products' | 'settings'>('home');
  const [detail, setDetail] = useState(false);
  const [openedId, setOpenedId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'home' | 'lists'>('home');
  const [sheet, setSheet] = useState<Sheet>(null);
  const [confirm, setConfirm] = useState<Confirm>(null);
  const [toast, setToast] = useState('');
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [grouped, setGrouped] = useState(false);
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🛒');
  const [color, setColor] = useState('sage');
  const [productName, setProductName] = useState('');
  const [productQuantity, setProductQuantity] = useState('1');
  const [unit, setUnit] = useState(tr('ud'));
  const [note, setNote] = useState('');
  const [onlyThisPurchase, setOnlyThisPurchase] = useState(true);
  const [editOneTime, setEditOneTime] = useState(false);
  const [productEmoji, setProductEmoji] = useState('🛍️');
  const [productImage, setProductImage] = useState<string | undefined>();
  const [productCategory, setProductCategory] = useState<Category>('other');
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingSource, setEditingSource] = useState<Product | null>(null);
  const [editingList, setEditingList] = useState(false);
  const [newListPinned, setNewListPinned] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [inviteUrl, setInviteUrl] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [sheetError, setSheetError] = useState('');
  const [introName, setIntroName] = useState('');
  const [importTarget, setImportTarget] = useState('new');
  const [importName, setImportName] = useState('');
  const [chooseImportTarget, setChooseImportTarget] = useState(false);
  const [targetPickerOpen, setTargetPickerOpen] = useState(false);
  const lists = currentLists();
  const active = lists.find((l) => l.id === state.selectedId);
  const openedList = detail ? lists.find((l) => l.id === openedId) : undefined;
  const purchaseContext =
    detailTab === 'home' && !!active && state.activeListIds.includes(active.id);
  const addingOneTime = purchaseContext && onlyThisPurchase;
  const showingList = detail && !!openedList && tab === detailTab;
  const productSize = productSizes[state.productSize];
  const bought = active?.items.filter((i) => i.checked) || [];
  const catalog = useMemo(() => {
    const merged = [...state.customProducts, ...state.favorites, ...products];
    const seen = new Set<string>();
    return merged.filter((p) => {
      const n = productIdentity(p);
      if (seen.has(n)) return false;
      seen.add(n);
      return true;
    });
  }, [state.favorites, state.customProducts]);
  const catalogShown = catalog.filter(
    (p) => matchesProductSearch(p, productName) && (category === 'all' || p.category === category),
  );
  const notify = (message: string) => setToast(message);
  useEffect(() => {
    void initialize();
    return startSync();
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);
  useEffect(() => {
    if (state.error) {
      notify(state.error);
      clearError();
    }
  }, [state.error]);
  useEffect(() => {
    const accept = (url: string) => {
      const parsed = Linking.parse(url);
      const code =
        parsed.queryParams?.code || (url.includes('#join=') ? url.split('#join=')[1] : '');
      if (typeof code === 'string' && code) {
        setJoinCode(code);
        setSheet('join');
      }
    };
    void Linking.getInitialURL().then((url) => {
      if (url) accept(url);
    });
    const sub = Linking.addEventListener('url', (e) => accept(e.url));
    const hashChanged = () => accept(window.location.href);
    if (Platform.OS === 'web') window.addEventListener('hashchange', hashChanged);
    return () => {
      sub.remove();
      if (Platform.OS === 'web') window.removeEventListener('hashchange', hashChanged);
    };
  }, []);
  const open = (next: Sheet) => {
    Keyboard.dismiss();
    setSheetError('');
    setSheet(next);
  };
  const openList = (l: ShoppingList, destination: 'home' | 'lists' = 'home') => {
    selectList(l.id);
    setOnlyThisPurchase(true);
    setOpenedId(l.id);
    setDetailTab(destination);
    setSearch('');
    setGrouped(false);
    setDetail(true);
    setTab(destination);
  };
  const openNew = () => {
    setNewListPinned(tab !== 'lists');
    setName('');
    setEmoji('🛒');
    setColor(palette.sage ? 'sage' : 'peach');
    setEditingList(false);
    open('new');
  };
  const openTextImport = (fromHome = false) => {
    setChooseImportTarget(fromHome);
    setTargetPickerOpen(false);
    setImportTarget(fromHome ? 'new' : active?.id || 'new');
    setImportName(tr('Mi nueva compra'));
    open('text-import');
  };
  const openAdd = () => {
    setProductName('');
    setCategory('all');
    setProductQuantity('1');
    open('add');
  };
  const openEdit = (item?: Item) => {
    setEditingItem(item || null);
    setEditOneTime(item ? !!item.oneTime : addingOneTime);
    setEditingSource(item || null);
    setProductName(item ? productLabel(item) : productName.trim());
    setProductQuantity(String(item?.quantity || 1));
    setUnit(item?.unit || tr('ud'));
    setNote(item?.note || '');
    setProductEmoji(item?.emoji || '🛍️');
    setProductImage(item?.image);
    setProductCategory(item?.category || 'other');
    open('edit');
  };
  async function run(action: () => Promise<void>) {
    setBusy(true);
    setSheetError('');
    try {
      await action();
    } catch (e) {
      setSheetError(e instanceof Error ? e.message : tr('No se ha podido completar.'));
    } finally {
      setBusy(false);
    }
  }
  function quickAdd(p: Product) {
    if (!active) return;
    addProduct(active.id, p, 1, '', addingOneTime);
    feedback();
    notify(tr('{0} añadido', productLabel(p)));
  }
  function saveItem() {
    if (!active) return;
    const qty = Number(productQuantity.replace(',', '.'));
    if (!productName.trim() || !Number.isFinite(qty) || qty < 0.1 || qty > 9999) {
      setSheetError(tr('Escribe un nombre y una cantidad entre 0,1 y 9999.'));
      return;
    }
    const preserveName = editingSource && productLabel(editingSource) === productName.trim();
    const data = {
      id: editingItem?.id || uid(),
      oneTime: editOneTime,
      name: preserveName ? editingSource.name : productName.trim(),
      quantity: qty,
      unit: unit.trim() || tr('ud'),
      emoji: productEmoji,
      category: productCategory,
      note: note.trim(),
      image: productImage,
      productId: editingSource?.productId,
      catalogId: preserveName ? editingSource.catalogId : undefined,
    };
    enqueue(editingItem ? 'item.edit' : 'item.add', active.id, data);
    feedback();
    setSheet(null);
    notify(editingItem ? tr('Producto actualizado') : tr('Producto añadido'));
  }
  function saveList() {
    if (!name.trim()) {
      setSheetError(tr('Ponle un nombre a tu lista.'));
      return;
    }
    if (editingList && active) {
      enqueue('list.update', active.id, { name: name.trim(), emoji, color });
      setOpenedId(active.id);
      setDetailTab(tab === 'lists' ? 'lists' : 'home');
    } else {
      const id = createList(name.trim(), emoji, color, newListPinned);
      setOnlyThisPurchase(true);
      setOpenedId(id);
      setDetailTab(newListPinned ? 'home' : 'lists');
    }
    setSheet(null);
    if (!editingList) {
      setTab(newListPinned ? 'home' : 'lists');
      setGrouped(false);
    }
    setDetail(true);
    setSearch('');
    feedback();
  }
  function removeFromHome(list: ShoppingList) {
    setListActive(list.id, false);
    setSheet(null);
    notify(tr('Lista guardada. Puedes volver a usarla desde Listas.'));
  }
  function activateList(list: ShoppingList) {
    if (list.items.length && list.items.every((item) => item.checked)) {
      requestReuse(list);
      return;
    }
    setListActive(list.id, true);
    setSheet(null);
    openList(list);
  }
  function requestReuse(list: ShoppingList) {
    const begin = () => {
      reuseList(list);
      setSheet(null);
      openList(list);
      notify(tr('Lista preparada para otra compra'));
    };
    if (!list.items.some((item) => item.checked || item.oneTime)) {
      begin();
      return;
    }
    setConfirm({
      title: tr('¿Empezar otra compra?'),
      body:
        list.members.length > 1
          ? tr(
              'Se retirarán los productos de solo esta compra y se desmarcarán los habituales para todos los participantes.',
            )
          : tr(
              'Se retirarán los productos de solo esta compra. Tus productos habituales quedarán listos para volver a comprar.',
            ),
      label: tr('Empezar de nuevo'),
      action: begin,
    });
  }
  function requestDelete(list: ShoppingList) {
    const owner = list.ownerId === state.snapshot.device.id;
    setConfirm({
      title: owner ? tr('¿Eliminar esta lista?') : tr('¿Salir de la lista?'),
      body: owner
        ? tr(
            'Se eliminará de Listas y del inicio, también para las personas con las que la compartes. Esta acción no se puede deshacer.',
          )
        : tr('Dejarás de ver esta lista. Los demás podrán seguir utilizándola.'),
      label: owner ? tr('Eliminar lista') : tr('Salir de la lista'),
      action: () => {
        enqueue(owner ? 'list.delete' : 'list.leave', list.id, {});
        setListActive(list.id, false);
        setSheet(null);
        if (list.id === openedId) setDetail(false);
        selectList(null);
      },
    });
  }
  async function shareInvitation() {
    if (!active) return;
    await run(async () => {
      const data = await invite(active.id);
      setInviteCode(data.code);
      setInviteUrl(data.url || `${WEB_URL}/#join=${data.code}`);
    });
  }
  async function exportBackup() {
    const raw = exportData();
    const filename = `cesta-${new Date().toISOString().slice(0, 10)}.json`;
    if (Platform.OS === 'web') {
      const blob = new Blob([raw], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } else {
      const uri = FileSystem.cacheDirectory + filename;
      await FileSystem.writeAsStringAsync(uri, raw);
      await Sharing.shareAsync(uri, {
        mimeType: 'application/json',
        dialogTitle: tr('Guardar copia de Cesta'),
        UTI: 'public.json',
      });
    }
    notify(tr('Copia preparada. Guárdala en un lugar seguro.'));
  }
  async function importBackup() {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/json', 'text/plain'],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    if (asset.size && asset.size > 10_000_000)
      throw new Error(tr('El archivo es demasiado grande. Máximo 10 MB.'));
    const raw =
      Platform.OS === 'web'
        ? await (await fetch(asset.uri)).text()
        : await FileSystem.readAsStringAsync(asset.uri);
    const count = importData(raw);
    notify(tr('{0} listas importadas como copias privadas', count));
  }
  const empty = (heading: string, body: string, icon = 'basket') => (
    <View style={a.empty}>
      <View style={a.emptyIcon}>
        <Icon name={icon} size={30} color={theme.green} />
      </View>
      <Text style={a.emptyTitle}>{heading}</Text>
      <Text style={[s.body, { textAlign: 'center', maxWidth: 330 }]}>{body}</Text>
    </View>
  );
  function row(item: Item, listId = active?.id, shopping = true) {
    const stackedQuantity =
      state.productSize === 'large' || (width < 360 && state.productSize === 'comfortable');
    return (
      <View key={item.id} style={[a.item, shopping && item.checked && { opacity: 0.62 }]}>
        <Pressable
          accessibilityRole={shopping ? 'checkbox' : 'button'}
          accessibilityState={shopping ? { checked: item.checked } : {}}
          aria-checked={shopping ? item.checked : undefined}
          accessibilityLabel={
            shopping
              ? `${item.checked ? tr('Desmarcar') : tr('Comprar')} ${productLabel(item)}`
              : tr('Producto {0}', productLabel(item))
          }
          onPress={() => {
            if (!shopping) {
              openEdit(item);
              return;
            }
            if (listId) {
              enqueue('item.check', listId, { id: item.id, checked: !item.checked });
              feedback();
            }
          }}
          style={({ pressed }) => [
            a.itemMain,
            { minHeight: productSize.row, opacity: pressed ? 0.65 : 1 },
          ]}
        >
          {shopping && (
            <View
              style={[
                a.checkbox,
                item.checked && { backgroundColor: theme.green, borderColor: theme.green },
              ]}
            >
              {item.checked && <Icon name="check" size={15} color="#fff" />}
            </View>
          )}
          <ProductVisual product={item} size={productSize.image} />
          <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
            <Text
              style={[
                a.itemName,
                { fontSize: productSize.font },
                shopping &&
                  item.checked && { textDecorationLine: 'line-through', color: theme.muted },
              ]}
            >
              {productLabel(item)}
            </Text>
            {stackedQuantity && (
              <Text style={[a.itemMeta, { fontSize: productSize.meta }]}>
                {quantityLabel(item)}
              </Text>
            )}
            {shopping && item.oneTime && <Text style={a.itemMeta}>{tr('Solo esta compra')}</Text>}
            {!!item.note && <Text style={a.itemMeta}>{item.note}</Text>}
          </View>
          {!stackedQuantity && (
            <Text
              style={[a.itemMeta, { fontSize: productSize.meta, maxWidth: 85, textAlign: 'right' }]}
            >
              {quantityLabel(item)}
            </Text>
          )}
        </Pressable>
        <IconButton
          name="more"
          label={tr('Editar {0}', productLabel(item))}
          onPress={() => openEdit(item)}
        />
      </View>
    );
  }
  const nav = () => (
    <View
      aria-hidden={!!sheet || !!confirm}
      accessibilityElementsHidden={!!sheet || !!confirm}
      style={[a.nav, { paddingBottom: Math.max(10, insets.bottom) }]}
    >
      {(
        [
          { id: 'home', icon: 'basket', title: tr('Inicio') },
          { id: 'lists', icon: 'lists', title: tr('Listas') },
          { id: 'products', icon: 'grid', title: tr('Productos') },
          { id: 'settings', icon: 'settings', title: tr('Ajustes') },
        ] as const
      ).map((n) => (
        <Pressable
          key={n.id}
          accessibilityRole="tab"
          accessibilityState={{ selected: tab === n.id }}
          aria-selected={tab === n.id}
          accessibilityLabel={n.title}
          onPress={() => {
            Keyboard.dismiss();
            if (n.id === detailTab && tab === n.id) setDetail(false);
            else if (n.id === detailTab && openedList) selectList(openedList.id);
            setTab(n.id);
            feedback();
          }}
          style={a.navItem}
        >
          <View style={[a.navIcon, tab === n.id && { backgroundColor: '#E4EBDE' }]}>
            <Icon name={n.icon} color={tab === n.id ? theme.ink : theme.muted} />
          </View>
          <Text
            style={{
              fontSize: 11,
              fontWeight: tab === n.id ? '700' : '500',
              color: tab === n.id ? theme.ink : theme.muted,
            }}
          >
            {n.title}
          </Text>
        </Pressable>
      ))}
    </View>
  );

  if (!state.ready)
    return (
      <View style={a.loading}>
        <BasketArt size={130} />
        <ActivityIndicator color={theme.green} />
        <Text style={s.body}>{tr('Preparando tu cesta…')}</Text>
      </View>
    );
  if (!state.onboarded)
    return (
      <KeyboardScreen style={[a.root, { paddingTop: insets.top }]}>
        <ScrollView
          contentContainerStyle={[a.intro, { minHeight: '100%' }]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={a.wordmark}>
            <Icon name="basket" size={31} />
            <Text style={a.brand}>cesta</Text>
            <View style={a.brandDot} />
          </View>
          <View
            style={{
              backgroundColor: '#E9EFDF',
              borderRadius: 140,
              padding: 20,
              marginVertical: 26,
            }}
          >
            <BasketArt size={220} />
          </View>
          <Text style={[s.title, { fontSize: 43, textAlign: 'center' }]}>
            {tr('Menos olvidos.')}
            {`\n`}
            {tr('Más vida.')}{' '}
          </Text>
          <Text style={[s.body, { textAlign: 'center', marginVertical: 16, maxWidth: 320 }]}>
            {tr('Tu compra, ordenada y a mano.')}
            {`\n`}
            {tr('Para ti o para hacerla juntos.')}{' '}
          </Text>
          <View style={{ width: '100%', maxWidth: 350, gap: 15, marginTop: 14 }}>
            <Field
              accessibilityLabel={tr('Tu nombre')}
              label={tr('Tu nombre, para reconocerte en las listas')}
              placeholder={tr('Por ejemplo, Dani')}
              value={introName}
              onChangeText={setIntroName}
              maxLength={30}
            />

            <Button
              title={busy ? tr('Preparando…') : tr('Empezar mi cesta')}
              icon="arrow"
              disabled={busy}
              onPress={() =>
                void run(async () => {
                  setTab('lists');
                  setDetail(false);
                  await onboard(introName);
                })
              }
            />
            {sheetError && <Text style={a.error}>{sheetError}</Text>}
          </View>
        </ScrollView>
      </KeyboardScreen>
    );

  return (
    <KeyboardScreen style={[a.root, { paddingTop: insets.top }]}>
      <StatusBar style="dark" />
      <View
        style={a.appWidth}
        aria-hidden={!!sheet || !!confirm}
        accessibilityElementsHidden={!!sheet || !!confirm}
      >
        {(tab === 'home' || tab === 'lists') && !showingList && (
          <HomeScreen
            key={tab}
            mode={tab === 'lists' ? 'library' : 'home'}
            onNew={openNew}
            onPaste={() => openTextImport(true)}
            onJoin={() => {
              setJoinCode('');
              open('join');
            }}
            onProfile={() => {
              setName(state.snapshot.device.name);
              open('profile');
            }}
            onOpen={(list) => openList(list, tab === 'lists' ? 'lists' : 'home')}
            onLibrary={() => {
              setTab('lists');
              if (detailTab === 'lists') setDetail(false);
            }}
            onActivate={activateList}
            onRemove={removeFromHome}
            onReuse={requestReuse}
            onDelete={requestDelete}
            onMenu={(list) => {
              selectList(list.id);
              open('list-menu');
            }}
          />
        )}
        {tab === 'products' && (
          <ProductsScreen
            onNewList={openNew}
            activeList={openedList}
            purchaseOnly={purchaseContext}
            oneTime={onlyThisPurchase}
            onScopeChange={setOnlyThisPurchase}
            onReturnToList={() => {
              if (openedList) {
                selectList(openedList.id);
                setTab(detailTab);
              }
            }}
          />
        )}

        {openedList ? (
          <View
            style={{ flex: 1, display: showingList ? 'flex' : 'none' }}
            aria-hidden={!showingList}
            accessibilityElementsHidden={!showingList}
          >
            <CompactList
              key={openedList.id}
              list={openedList}
              oneTime={onlyThisPurchase}
              onScopeChange={setOnlyThisPurchase}
              shopping={detailTab === 'home' && state.activeListIds.includes(openedList.id)}
              grouped={grouped}
              onGroup={() => setGrouped(!grouped)}
              backLabel={detailTab === 'lists' ? tr('Volver a listas') : tr('Volver al inicio')}
              onBack={() => {
                setDetail(false);
                setSearch('');
              }}
              onMenu={() => open('list-menu')}
              onAdd={openAdd}
              catalog={catalog}
              onSelectProduct={(product) => {
                addProduct(openedList.id, product, 1, '', addingOneTime);
                feedback();
                notify(tr('{0} añadido', productLabel(product)));
              }}
              onQuickAdd={(name) => {
                const product = catalog.find(
                  (p) =>
                    normalize(productLabel(p)) === normalize(name) ||
                    normalize(p.name) === normalize(name),
                );
                quickAdd(product || { name, emoji: '🛍️', category: 'other', unit: tr('ud') });
              }}
              renderItem={(item) =>
                row(
                  item,
                  openedList.id,
                  detailTab === 'home' && state.activeListIds.includes(openedList.id),
                )
              }
              pinned={state.activeListIds.includes(openedList.id)}
              onActivate={() => activateList(openedList)}
              onStore={() => removeFromHome(openedList)}
            />
          </View>
        ) : null}

        {tab === 'settings' && (
          <ScrollView contentContainerStyle={a.page}>
            <View style={[s.row, { gap: 10, marginVertical: 14 }]}>
              <Text style={[s.label, { flex: 1 }]}>{tr('Idioma')}</Text>
              {(['es', 'en'] as const).map((language) => (
                <Pressable
                  key={language}
                  accessibilityRole="button"
                  accessibilityLabel={language === 'es' ? tr('Español') : tr('English')}
                  aria-pressed={state.language === language}
                  onPress={() => setLanguage(language)}
                  style={[a.chip, state.language === language && a.chipSelected]}
                >
                  <Text style={{ color: state.language === language ? '#fff' : theme.ink }}>
                    {language === 'es' ? tr('Español') : tr('English')}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={{ marginVertical: 16 }}>
              <ProductSizeSettings />
            </View>
            <Text style={a.eyebrow}>{tr('TODO A TU GUSTO')}</Text>
            <Text style={[s.title, { marginTop: 10, marginBottom: 24 }]}>
              {tr('Tu pequeño espacio.')}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tr('Cambiar nombre')}
              onPress={() => {
                setName(state.snapshot.device.name);
                open('profile');
              }}
              style={[a.listCard, s.row, { gap: 15 }]}
            >
              <View style={a.avatar}>
                <Text style={a.avatarText}>
                  {state.snapshot.device.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={a.cardTitle}>{state.snapshot.device.name}</Text>
                <Text style={[a.caption, { marginTop: 5 }]}>
                  {tr('Así te ven en tus listas compartidas')}{' '}
                </Text>
              </View>
              <Icon name="edit" size={20} />
            </Pressable>
            <Text style={[a.categoryTitle, { marginTop: 30, marginBottom: 12 }]}>
              {tr('TUS DATOS, CONTIGO')}{' '}
            </Text>
            <View style={a.itemsGroup}>
              {[
                {
                  icon: 'download',
                  title: tr('Guardar una copia'),
                  subtitle: tr('Todas tus listas en un archivo'),
                  action: () => void exportBackup().catch((e) => notify(e.message)),
                },
                {
                  icon: 'upload',
                  title: tr('Importar una copia'),
                  subtitle: tr('Recupera listas como copias privadas'),
                  action: () => void importBackup().catch((e) => notify(e.message)),
                },
                {
                  icon: 'link',
                  title: tr('Usar otro dispositivo'),
                  subtitle: tr('Abre una invitación a la misma lista'),
                  action: () => {
                    setJoinCode('');
                    open('join');
                  },
                },
                {
                  icon: 'refresh',
                  title: tr('Sincronizar ahora'),
                  subtitle: state.pending.length
                    ? tr('{0} cambios por enviar', state.pending.length)
                    : state.online
                      ? tr('Tus cambios están al día')
                      : tr('Trabajando sin conexión'),
                  action: () =>
                    void run(async () => {
                      await synchronize();
                      notify(tr('Sincronización comprobada.'));
                    }),
                },
                {
                  icon: 'heart',
                  title: tr('Privacidad'),
                  subtitle: tr('Lo que guardamos y por qué'),
                  action: () => open('privacy'),
                },
              ].map((x) => (
                <Pressable
                  key={x.title}
                  accessibilityRole="button"
                  accessibilityLabel={x.title}
                  onPress={x.action}
                  style={a.settingRow}
                >
                  <Icon name={x.icon} color={theme.green} />
                  <View style={{ flex: 1, gap: 5 }}>
                    <Text style={a.smallHeading}>{x.title}</Text>
                    <Text style={a.caption}>{x.subtitle}</Text>
                  </View>
                  <Icon name="chevron" size={17} color={theme.muted} />
                </Pressable>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={tr('Borrar mis datos')}
              onPress={() =>
                setConfirm({
                  title: tr('¿Borrar tus datos?'),
                  body: tr(
                    'Se eliminarán tus listas, incluso las que compartes, y tu acceso a listas de otras personas. Guarda una copia antes. Esta acción no se puede deshacer.',
                  ),
                  label: tr('Borrar mis datos'),
                  action: async () => {
                    await eraseDevice();
                    setTab('home');
                    setDetail(false);
                  },
                })
              }
              style={{ paddingVertical: 24 }}
            >
              <Text style={{ fontSize: 14, color: '#AC5141' }}>{tr('Borrar mis datos')}</Text>
            </Pressable>
            <View style={{ alignItems: 'center', marginTop: 28, gap: 8 }}>
              <View style={a.wordmark}>
                <Icon name="basket" color={theme.muted} />
                <Text style={[a.brand, { fontSize: 28, color: theme.muted }]}>cesta</Text>
              </View>
              <Text style={a.caption}>{tr('Hecha para las pequeñas cosas · v1.0')}</Text>
            </View>
          </ScrollView>
        )}
      </View>
      {nav()}

      <Modal
        visible={!!sheet && !confirm}
        transparent
        animationType="slide"
        onRequestClose={() => setSheet(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={a.modalOverlay}
          onStartShouldSetResponderCapture={dismissOutsideInput}
        >
          <Pressable
            accessibilityLabel={tr('Cerrar ventana')}
            onPress={() => setSheet(null)}
            style={StyleSheet.absoluteFill}
          />
          <View style={[a.sheet, { maxHeight: '92%', paddingBottom: Math.max(insets.bottom, 20) }]}>
            <View style={a.sheetHandle} />
            <View
              style={[
                s.row,
                { justifyContent: 'space-between', paddingHorizontal: 24, marginBottom: 10 },
              ]}
            >
              <Text style={[a.sectionTitle, { flex: 1 }]}>
                {sheet === 'display'
                  ? tr('Tamaño de los productos')
                  : sheet === 'new'
                    ? editingList
                      ? tr('Un nuevo aire')
                      : tr('Una nueva lista')
                    : sheet === 'text-import'
                      ? tr('Del texto a tu compra')
                      : sheet === 'add'
                        ? tr('¿Qué añadimos?')
                        : sheet === 'edit'
                          ? editingItem
                            ? tr('A tu gusto')
                            : tr('Tu propio producto')
                          : sheet === 'share'
                            ? tr('Una cesta compartida')
                            : sheet === 'join'
                              ? tr('La compra, juntos')
                              : sheet === 'profile'
                                ? tr('Así te llamamos')
                                : sheet === 'privacy'
                                  ? tr('Tu privacidad')
                                  : tr('Tu lista, a tu manera')}
              </Text>
              <IconButton
                name="close"
                label={tr('Cerrar ventana')}
                onPress={() => setSheet(null)}
              />
            </View>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 10, gap: 18 }}
            >
              {sheetError && (
                <Text accessibilityRole="alert" style={a.error}>
                  {sheetError}
                </Text>
              )}
              {sheet === 'display' && <ProductSizeSettings />}
              {sheet === 'text-import' && (
                <>
                  {chooseImportTarget && (
                    <View style={{ gap: 8 }}>
                      <Text style={s.label}>{tr('Añadir a')}</Text>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={tr('Elegir destino')}
                        accessibilityState={{ expanded: targetPickerOpen }}
                        onPress={() => setTargetPickerOpen(!targetPickerOpen)}
                        style={[s.row, { minHeight: 44, gap: 8 }]}
                      >
                        <Icon name="down" size={17} />
                        <Text style={s.label}>
                          {importTarget === 'new'
                            ? tr('Crear nueva lista')
                            : lists.find((list) => list.id === importTarget)?.name}
                        </Text>
                      </Pressable>
                      {targetPickerOpen &&
                        [{ id: 'new', name: tr('Crear nueva lista') }, ...lists].map((list) => (
                          <Pressable
                            key={list.id}
                            accessibilityRole="radio"
                            accessibilityState={{ checked: importTarget === list.id }}
                            aria-checked={importTarget === list.id}
                            accessibilityLabel={list.name}
                            onPress={() => {
                              setImportTarget(list.id);
                              setTargetPickerOpen(false);
                            }}
                            style={[s.row, { minHeight: 44, gap: 9 }]}
                          >
                            <Icon name={importTarget === list.id ? 'check' : 'plus'} size={18} />
                            <Text style={s.label}>{list.name}</Text>
                          </Pressable>
                        ))}
                      {importTarget === 'new' && (
                        <Field
                          label={tr('Nombre de la lista')}
                          accessibilityLabel={tr('Nombre de la lista')}
                          value={importName}
                          onChangeText={setImportName}
                          maxLength={80}
                        />
                      )}
                    </View>
                  )}
                  <TextImportForm
                    catalog={catalog}
                    onAdd={(items) => {
                      if (importTarget === 'new' && !importName.trim())
                        throw new Error(tr('Ponle un nombre a tu lista.'));
                      const id =
                        importTarget === 'new'
                          ? createList(importName.trim(), '🧺', 'sage', true)
                          : importTarget;
                      addTextProducts(
                        id,
                        items,
                        importTarget !== 'new' &&
                          state.activeListIds.includes(id) &&
                          (chooseImportTarget || detailTab === 'home'),
                      );
                      selectList(id);
                      setOpenedId(id);
                      setDetailTab('home');
                      if (chooseImportTarget) setListActive(id, true);
                      setSearch('');
                      setGrouped(false);
                      setDetail(true);
                      setTab('home');
                      setSheet(null);
                      notify(tr('{0} productos añadidos a la lista', items.length));
                    }}
                  />
                </>
              )}
              {sheet === 'new' && (
                <>
                  <View style={{ alignItems: 'center' }}>
                    <View
                      style={[
                        a.listEmoji,
                        {
                          width: 84,
                          height: 84,
                          borderRadius: 28,
                          backgroundColor: palette[color].bg,
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 43 }}>{emoji}</Text>
                    </View>
                  </View>
                  <Field
                    accessibilityLabel={tr('Nombre de la lista')}
                    label={tr('Nombre de la lista')}
                    placeholder={tr('La compra del finde')}
                    autoFocus
                    value={name}
                    onChangeText={setName}
                    maxLength={60}
                    onSubmitEditing={saveList}
                  />
                  {!editingList && (
                    <Pressable
                      accessibilityRole="checkbox"
                      accessibilityLabel={tr('Mostrar en el inicio')}
                      accessibilityState={{ checked: newListPinned }}
                      aria-checked={newListPinned}
                      onPress={() => setNewListPinned(!newListPinned)}
                      style={[s.row, { gap: 10, paddingVertical: 10 }]}
                    >
                      <View
                        style={[
                          a.checkbox,
                          newListPinned && {
                            backgroundColor: theme.green,
                            borderColor: theme.green,
                          },
                        ]}
                      >
                        {newListPinned && <Icon name="check" color="#fff" size={17} />}
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.label}>{tr('Mostrar en el inicio')}</Text>
                        <Text style={a.caption}>
                          {tr('Siempre se guardará en Listas para volver a usarla.')}
                        </Text>
                      </View>
                    </Pressable>
                  )}
                  <Text style={s.label}>{tr('Dale personalidad')}</Text>
                  <View style={a.emojiGrid}>
                    {emojis.map((e) => (
                      <Pressable
                        key={e}
                        accessibilityRole="button"
                        accessibilityLabel={tr('Icono {0}', e)}
                        onPress={() => setEmoji(e)}
                        style={[
                          a.emojiChoice,
                          emoji === e && {
                            backgroundColor: palette[color].bg,
                            borderColor: palette[color].dark,
                          },
                        ]}
                      >
                        <Text style={{ fontSize: 28 }}>{e}</Text>
                      </Pressable>
                    ))}
                  </View>
                  <View style={[s.row, { gap: 14, justifyContent: 'center' }]}>
                    {Object.entries(palette).map(([id, p]) => (
                      <Pressable
                        key={id}
                        accessibilityRole="button"
                        accessibilityLabel={tr('Color {0}', id)}
                        onPress={() => setColor(id)}
                        style={[
                          a.colorCircle,
                          {
                            backgroundColor: p.bg,
                            borderColor: color === id ? p.dark : 'transparent',
                          },
                        ]}
                      >
                        {color === id && <Icon name="check" color={p.dark} />}
                      </Pressable>
                    ))}
                  </View>
                  <Button
                    title={editingList ? tr('Guardar cambios') : tr('Crear lista')}
                    icon="check"
                    onPress={saveList}
                  />
                </>
              )}
              {sheet === 'add' && (
                <>
                  {purchaseContext && (
                    <PurchaseScope value={onlyThisPurchase} onChange={setOnlyThisPurchase} />
                  )}
                  <Text style={s.body}>
                    {tr('Un toque y a la lista. Los básicos, siempre a mano.')}
                  </Text>
                  <View style={a.searchBox}>
                    <Icon name="search" color={theme.muted} />
                    <TextInput
                      accessibilityLabel={tr('Buscar producto')}
                      autoFocus
                      value={productName}
                      onChangeText={setProductName}
                      placeholder={tr('Leche, tomates, algo rico…')}
                      placeholderTextColor={theme.muted}
                      style={a.searchInput}
                      maxLength={80}
                    />
                    {productName && (
                      <IconButton
                        name="close"
                        label={tr('Limpiar nombre de producto')}
                        onPress={() => setProductName('')}
                      />
                    )}
                  </View>
                  <CategoryStrip
                    options={[{ id: 'all', name: 'Todo', emoji: '🧺' }, ...categories]}
                    selected={category}
                    onSelect={(id) => setCategory(id as Category | 'all')}
                    label="Catálogo {0}"
                  />
                  {productName.trim() &&
                    !catalog.some((p) => normalize(productLabel(p)) === normalize(productName)) && (
                      <Button
                        secondary
                        title={tr('Crear «{0}»', productName.trim())}
                        icon="plus"
                        onPress={() => openEdit()}
                      />
                    )}
                  <View style={a.itemsGroup}>
                    {catalogShown.map((p) => {
                      const count =
                        active?.items.filter(
                          (i) => productIdentity(i) === productIdentity(p) && !i.checked,
                        ).length || 0;
                      return (
                        <View key={productLabel(p)} style={[s.row, a.catalogRow]}>
                          <View
                            style={[
                              a.productVisual,
                              {
                                width: 44,
                                height: 44,
                                borderRadius: 14,
                                backgroundColor: categories.find((c) => c.id === p.category)!.color,
                              },
                            ]}
                          >
                            <ProductVisual product={p} size={44} />
                          </View>
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={tr('Detalles de {0}', productLabel(p))}
                            onPress={() => {
                              setProductName(productLabel(p));
                              setEditingSource(p);
                              setProductEmoji(p.emoji);
                              setProductImage(p.image);
                              setProductCategory(p.category);
                              setProductQuantity('1');
                              setUnit(p.unit);
                              setNote('');
                              setEditingItem(null);
                              open('edit');
                            }}
                            style={{ flex: 1, paddingVertical: 12 }}
                          >
                            <Text style={a.itemName}>{productLabel(p)}</Text>
                            {count > 0 && (
                              <Text
                                style={[
                                  a.caption,
                                  { fontSize: 11, marginTop: 3, color: theme.green },
                                ]}
                              >
                                {tr('Ya en tu lista')}
                                {count > 1 ? ` · ${count}` : ''}
                              </Text>
                            )}
                          </Pressable>
                          <IconButton
                            name="heart"
                            label={
                              state.favorites.some((f) => productIdentity(f) === productIdentity(p))
                                ? tr('Quitar {0} de favoritos', productLabel(p))
                                : tr('Guardar {0} en favoritos', productLabel(p))
                            }
                            onPress={() => favorite(p)}
                            color={
                              state.favorites.some((f) => productIdentity(f) === productIdentity(p))
                                ? theme.accent
                                : '#B2B9AB'
                            }
                          />
                          <Pressable
                            accessibilityRole="button"
                            accessibilityLabel={tr('Añadir {0}', productLabel(p))}
                            onPress={() => quickAdd(p)}
                            style={a.quickPlus}
                          >
                            <Icon name="plus" size={21} color={theme.green} />
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                  {!catalogShown.length &&
                    !productName.trim() &&
                    empty(
                      tr('Sin productos en esta categoría'),
                      tr('Puedes crear uno con el buscador.'),
                    )}
                  <Button
                    title={tr('Crear otro producto')}
                    secondary
                    icon="edit"
                    onPress={() => openEdit()}
                  />
                  <Button
                    title={tr('Listo, volver a mi lista')}
                    icon="check"
                    onPress={() => setSheet(null)}
                  />
                </>
              )}
              {sheet === 'edit' && (
                <>
                  <View style={{ alignItems: 'center' }}>
                    <ProductVisual
                      product={{
                        name: productName,
                        unit,
                        emoji: productEmoji,
                        category: productCategory,
                        image: productImage,
                      }}
                      size={86}
                    />
                    <View style={{ marginTop: 12, gap: 8 }}>
                      <Button
                        secondary
                        small
                        title={productImage ? tr('Cambiar foto') : tr('Añadir foto')}
                        icon="image"
                        disabled={busy}
                        onPress={() =>
                          void run(async () => {
                            const image = await chooseProductPhoto();
                            if (image) setProductImage(image);
                          })
                        }
                      />
                      {productImage && (
                        <Button
                          secondary
                          small
                          title={tr('Quitar foto')}
                          onPress={() => setProductImage(undefined)}
                        />
                      )}
                    </View>
                  </View>
                  <Field
                    accessibilityLabel={tr('Nombre del producto')}
                    label={tr('Producto')}
                    value={productName}
                    onChangeText={setProductName}
                    placeholder={tr('¿Qué necesitas?')}
                    maxLength={80}
                  />
                  <View style={[s.row, { gap: 12 }]}>
                    <View style={{ flex: 1 }}>
                      <Field
                        accessibilityLabel={tr('Cantidad')}
                        label={tr('Cantidad')}
                        value={productQuantity}
                        onChangeText={setProductQuantity}
                        keyboardType="decimal-pad"
                        maxLength={7}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Field
                        accessibilityLabel={tr('Unidad')}
                        label={tr('Unidad')}
                        value={unit}
                        onChangeText={setUnit}
                        maxLength={24}
                      />
                    </View>
                  </View>
                  <View style={[s.row, { gap: 7, flexWrap: 'wrap' }]}>
                    {[tr('ud'), 'kg', 'g', 'L', 'pack', tr('bote')].map((u) => (
                      <Pressable
                        key={u}
                        accessibilityRole="button"
                        accessibilityLabel={tr('Unidad {0}', u)}
                        onPress={() => setUnit(u)}
                        style={[a.chip, unit === u && a.chipSelected]}
                      >
                        <Text style={{ color: unit === u ? '#fff' : theme.ink, fontSize: 13 }}>
                          {u}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Text style={s.label}>{tr('Pasillo')}</Text>
                  <View style={[s.row, { gap: 7, flexWrap: 'wrap' }]}>
                    {categories.map((c) => (
                      <Pressable
                        key={c.id}
                        accessibilityRole="button"
                        accessibilityLabel={tr('Categoría {0}', tr(c.name))}
                        onPress={() => {
                          setProductCategory(c.id);
                          if (!editingItem) setProductEmoji(c.emoji);
                        }}
                        style={[a.chip, productCategory === c.id && a.chipSelected]}
                      >
                        <Text
                          style={{
                            color: productCategory === c.id ? '#fff' : theme.ink,
                            fontSize: 12,
                          }}
                        >
                          {c.emoji} {tr(c.name)}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                  <Field
                    accessibilityLabel={tr('Nota del producto')}
                    label={tr('Una nota, si hace falta')}
                    placeholder={tr('Sin lactosa, bien maduros, marca favorita…')}
                    value={note}
                    onChangeText={setNote}
                    maxLength={300}
                    multiline
                  />
                  {(purchaseContext || editingItem?.oneTime) && (
                    <PurchaseScope value={editOneTime} onChange={setEditOneTime} />
                  )}
                  <Button
                    title={editingItem ? tr('Guardar producto') : tr('Añadir a la lista')}
                    icon="check"
                    onPress={saveItem}
                  />
                  {editingItem && active && (
                    <Button
                      title={tr('Eliminar producto')}
                      secondary
                      icon="trash"
                      onPress={() => {
                        enqueue('item.delete', active.id, { id: editingItem.id });
                        setSheet(null);
                        notify(tr('Producto eliminado'));
                      }}
                    />
                  )}
                </>
              )}
              {sheet === 'share' && active && (
                <>
                  <Text style={a.smallHeading}>
                    {state.cloud[active.id]
                      ? tr('Sincronización activada')
                      : tr('Solo en este dispositivo')}
                  </Text>
                  <Text style={s.body}>
                    {state.cloud[active.id]
                      ? tr(
                          'Solo se envían los cambios. Al volver a abrir la lista se recuperan las novedades.',
                        )
                      : tr(
                          'Esta lista es privada y local. Al crear una invitación, se guardará en la nube para poder compartirla.',
                        )}
                  </Text>
                  <View style={a.shareHero}>
                    <View style={[s.row, { justifyContent: 'center', marginBottom: 12 }]}>
                      {active.members.slice(0, 5).map((m, i) => (
                        <View
                          key={m.id}
                          style={[
                            a.avatar,
                            {
                              backgroundColor:
                                palette[['sage', 'peach', 'lilac', 'butter', 'blue'][i]].bg,
                              marginLeft: i ? -8 : 0,
                              borderColor: '#fff',
                              borderWidth: 3,
                            },
                          ]}
                        >
                          <Text style={a.avatarText}>{m.name.charAt(0).toUpperCase()}</Text>
                        </View>
                      ))}
                    </View>
                    <Text style={[a.cardTitle, { textAlign: 'center' }]}>{active.name}</Text>
                    <Text style={[s.body, { textAlign: 'center', fontSize: 14, marginTop: 8 }]}>
                      {tr('Tú apuntas el pan. Alguien añade el café.')}
                      {`\n`}
                      {tr('Todos veis la misma lista.')}{' '}
                    </Text>
                  </View>
                  <Text style={a.categoryTitle}>
                    {tr('EN ESTA LISTA ·')} {active.members.length}
                  </Text>
                  {active.members.map((m) => (
                    <View key={m.id} style={[s.row, { gap: 12 }]}>
                      <View style={[a.miniAvatar, { width: 36, height: 36, borderRadius: 18 }]}>
                        <Text style={{ fontWeight: '600', color: theme.ink }}>
                          {m.name.charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={a.smallHeading}>
                          {m.name}
                          {m.id === state.snapshot.device.id ? ' ' + tr('(tú)') + '' : ''}
                        </Text>
                        <Text style={a.caption}>
                          {m.role === 'owner'
                            ? tr('Creó la lista')
                            : tr('Puede añadir y marcar productos')}
                        </Text>
                      </View>
                      {active.ownerId === state.snapshot.device.id &&
                        m.id !== state.snapshot.device.id && (
                          <IconButton
                            name="close"
                            label={tr('Quitar a {0}', m.name)}
                            onPress={() =>
                              setConfirm({
                                title: tr('¿Quitar a {0}?', m.name),
                                body: tr(
                                  'Perderá el acceso a esta lista al sincronizar. También se desactivarán las invitaciones anteriores.',
                                ),
                                label: tr('Quitar participante'),
                                action: async () => {
                                  await removeMember(active.id, m.id);
                                  setInviteCode('');
                                },
                              })
                            }
                          />
                        )}
                    </View>
                  ))}
                  {active.ownerId === state.snapshot.device.id ? (
                    <>
                      {!inviteCode ? (
                        <View style={{ gap: 12 }}>
                          <Button
                            title={busy ? tr('Preparando enlace…') : tr('Crear invitación')}
                            icon="link"
                            disabled={busy}
                            onPress={() => void shareInvitation()}
                          />
                          <Button
                            secondary
                            title={tr('Usar en mis dispositivos')}
                            icon="link"
                            disabled={busy}
                            onPress={() => void shareInvitation()}
                          />
                          <Text style={a.caption}>
                            {tr(
                              'Abre el enlace en tu otro móvil u ordenador. Solo se sincroniza esta lista.',
                            )}
                          </Text>
                        </View>
                      ) : (
                        <View style={{ gap: 12 }}>
                          <View style={a.codeBox}>
                            <Text selectable style={[a.codeText, { fontSize: 14 }]}>
                              {inviteCode.match(/.{1,24}/g)?.join('\n')}
                            </Text>
                          </View>
                          <Button
                            title={tr('Copiar enlace')}
                            icon="copy"
                            onPress={() =>
                              void Clipboard.setStringAsync(inviteUrl).then(() =>
                                notify(tr('Enlace copiado')),
                              )
                            }
                          />
                          <Button
                            secondary
                            title={tr('Compartir invitación')}
                            icon="people"
                            onPress={() =>
                              void Share.share({
                                message: tr(
                                  'Vamos a hacer la compra juntos en Cesta. Únete a «{0}»: {1}\nCódigo: {2}',
                                  active.name,
                                  inviteUrl,
                                  inviteCode,
                                ),
                              }).catch(() =>
                                notify(tr('Puedes copiar el enlace para compartirlo.')),
                              )
                            }
                          />
                          <Text style={[a.caption, { textAlign: 'center' }]}>
                            {tr(
                              'El enlace caduca en 7 días. Quien lo tenga podrá editar esta lista.',
                            )}{' '}
                          </Text>
                        </View>
                      )}
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={tr('Desactivar invitaciones')}
                        onPress={() =>
                          setConfirm({
                            title: tr('¿Desactivar invitaciones?'),
                            body: tr(
                              'Los enlaces anteriores dejarán de funcionar. Las personas que ya están en la lista conservarán su acceso.',
                            ),
                            label: tr('Desactivar enlaces'),
                            action: async () => {
                              await revoke(active.id);
                              setInviteCode('');
                              notify(tr('Invitaciones desactivadas'));
                            },
                          })
                        }
                        style={{ alignItems: 'center', padding: 12 }}
                      >
                        <Text style={a.textLink}>{tr('Desactivar enlaces anteriores')}</Text>
                      </Pressable>
                    </>
                  ) : (
                    <Text style={s.body}>
                      {tr('Quien creó la lista puede invitar a más personas.')}
                    </Text>
                  )}
                </>
              )}
              {sheet === 'join' && (
                <>
                  <View style={{ alignItems: 'center' }}>
                    <View style={a.emptyIcon}>
                      <Icon name="people" size={32} color={theme.green} />
                    </View>
                  </View>
                  <Text style={s.body}>
                    {tr(
                      'Pega el enlace o código que te han enviado. También sirve para abrir tu propia lista en otro dispositivo.',
                    )}{' '}
                  </Text>
                  <Field
                    accessibilityLabel={tr('Código de invitación')}
                    label={tr('Invitación')}
                    placeholder={tr('Pega aquí el código o enlace')}
                    value={joinCode}
                    onChangeText={setJoinCode}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Button
                    title={busy ? tr('Abriendo tu lista…') : tr('Unirme a la lista')}
                    icon="arrow"
                    disabled={busy || !joinCode.trim()}
                    onPress={() =>
                      void run(async () => {
                        const joinedId = await join(joinCode);
                        if (Platform.OS === 'web')
                          window.history.replaceState(
                            null,
                            '',
                            window.location.pathname + window.location.search,
                          );
                        setOpenedId(joinedId);
                        setDetailTab('home');
                        setGrouped(false);
                        setSheet(null);
                        setDetail(true);
                        setTab('home');
                        notify(tr('Ya estáis en la misma lista'));
                      })
                    }
                  />
                  <Text style={a.caption}>
                    {tr(
                      'Las personas de la lista verán tu nombre y podrán editar los productos.',
                    )}{' '}
                  </Text>
                </>
              )}
              {sheet === 'profile' && (
                <>
                  <Text style={s.body}>
                    {tr('Un nombre sencillo para saber quién está al otro lado de la cesta.')}{' '}
                  </Text>
                  <Field
                    accessibilityLabel={tr('Nombre del perfil')}
                    label={tr('Tu nombre')}
                    value={name}
                    onChangeText={setName}
                    maxLength={30}
                  />
                  <Button
                    title={busy ? tr('Guardando…') : tr('Guardar nombre')}
                    disabled={busy || !name.trim()}
                    onPress={() =>
                      void run(async () => {
                        await updateName(name.trim());
                        setSheet(null);
                        notify(tr('Nombre actualizado'));
                      })
                    }
                  />
                </>
              )}
              {sheet === 'privacy' && (
                <>
                  <Text style={s.body}>
                    {tr(
                      'Tus listas personales, catálogo y favoritos se guardan en este dispositivo. Solo las listas que eliges compartir o usar en otros dispositivos se guardan en Cloudflare, junto con sus fotos y nombres de participantes. Se envían cambios y se recuperan novedades al conectar.',
                    )}{' '}
                  </Text>
                  <Text style={s.body}>
                    {tr(
                      'Solo los dispositivos con acceso a una lista pueden consultarla. Los enlaces de invitación permiten unirse como participante; compártelos únicamente con quien quieras que pueda editar.',
                    )}{' '}
                  </Text>
                  <Text style={s.body}>
                    {tr(
                      'No hay anuncios, rastreadores ni acceso a tus contactos. Las invitaciones caducan a los siete días y puedes desactivarlas en cualquier momento.',
                    )}{' '}
                  </Text>
                  <Text style={s.body}>
                    {tr(
                      'Puedes exportar copias o borrar tus datos desde Ajustes. Una copia exportada no incluye las credenciales ni mantiene los permisos compartidos al importarla. Si desinstalas sin guardar una copia, podrías perder el acceso de este dispositivo.',
                    )}{' '}
                  </Text>
                  <Text style={a.caption}>
                    {tr(
                      'Las copias guardadas por otras personas no pueden borrarse a distancia.',
                    )}{' '}
                  </Text>
                </>
              )}
              {sheet === 'list-menu' && active && (
                <>
                  <Text style={a.caption}>
                    {state.cloud[active.id]
                      ? tr('Sincronización activada')
                      : tr('Solo en este dispositivo')}
                  </Text>
                  {[
                    {
                      title: tr('Tamaño de los productos'),
                      icon: 'grid',
                      fn: () => open('display'),
                    },
                    { title: tr('Pegar lista'), icon: 'copy', fn: () => openTextImport() },
                    {
                      title: tr('Compartir lista'),
                      icon: 'people',
                      fn: () => {
                        setInviteCode('');
                        open('share');
                      },
                    },
                    ...(state.cloud[active.id]
                      ? [
                          {
                            title: tr('Guardar solo en este dispositivo'),
                            icon: 'download',
                            fn: () =>
                              setConfirm({
                                title: tr('¿Guardar una copia local?'),
                                body:
                                  active.ownerId === state.snapshot.device.id
                                    ? tr(
                                        'Se conservará una copia aquí y se eliminará la lista de la nube para todos los participantes. Las invitaciones dejarán de funcionar.',
                                      )
                                    : tr(
                                        'Se conservará una copia aquí y saldrás de la lista compartida. Los demás podrán seguir utilizándola.',
                                      ),
                                label: tr('Guardar copia local'),
                                action: async () => {
                                  const id = await makeLocal(active.id);
                                  if (id) {
                                    setOpenedId(id);
                                    selectList(id);
                                  }
                                  setSheet(null);
                                },
                              }),
                          },
                        ]
                      : []),
                    ...(bought.length
                      ? [
                          {
                            title: tr('Eliminar productos comprados'),
                            icon: 'check',
                            fn: () =>
                              setConfirm({
                                title: tr('¿Vaciar lo comprado?'),
                                body: tr(
                                  'Se eliminarán los productos que ya has marcado. El resto de la lista sigue igual.',
                                ),
                                label: tr('Vaciar comprados'),
                                action: () => {
                                  enqueue('items.clear', active.id, {
                                    ids: bought.map((item) => item.id),
                                  });
                                  setSheet(null);
                                },
                              }),
                          },
                        ]
                      : []),
                    {
                      title: state.activeListIds.includes(active.id)
                        ? tr('Quitar del inicio')
                        : tr('Añadir al inicio'),
                      icon: state.activeListIds.includes(active.id) ? 'close' : 'plus',
                      fn: () =>
                        state.activeListIds.includes(active.id)
                          ? removeFromHome(active)
                          : activateList(active),
                    },
                    {
                      title: tr('Editar nombre y color'),
                      icon: 'edit',
                      fn: () => {
                        setName(active.name);
                        setEmoji(active.emoji);
                        setColor(active.color);
                        setEditingList(true);
                        open('new');
                      },
                    },
                    {
                      title: tr('Duplicar lista'),
                      icon: 'copy',
                      fn: () => {
                        const id = createList(
                          tr('{0} · copia', active.name.slice(0, 50)),
                          active.emoji,
                          active.color,
                          false,
                        );
                        active.items
                          .filter((i) => !i.oneTime)
                          .forEach((i) => addProduct(id, i, i.quantity, i.note, false));
                        setOpenedId(id);
                        setDetailTab('lists');
                        setDetail(true);
                        setSheet(null);
                        setTab('lists');
                        notify(tr('Copia privada creada'));
                      },
                    },
                    {
                      title: tr('Volver a usar'),
                      icon: 'refresh',
                      fn: () => {
                        requestReuse(active);
                      },
                    },
                    {
                      title:
                        active.ownerId === state.snapshot.device.id
                          ? tr('Eliminar lista')
                          : tr('Salir de esta lista'),
                      icon: 'trash',
                      fn: () => requestDelete(active),
                    },
                  ].map((x) => (
                    <Pressable
                      key={x.title}
                      accessibilityRole="button"
                      accessibilityLabel={x.title}
                      onPress={x.fn}
                      style={a.settingRow}
                    >
                      <Icon name={x.icon} color={x.icon === 'trash' ? theme.accent : theme.ink} />
                      <Text
                        style={[
                          a.smallHeading,
                          { flex: 1, color: x.icon === 'trash' ? theme.accent : theme.ink },
                        ]}
                      >
                        {x.title}
                      </Text>
                      <Icon name="chevron" size={17} />
                    </Pressable>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={!!confirm}
        transparent
        animationType="fade"
        onRequestClose={() => setConfirm(null)}
      >
        <View style={a.confirmOverlay}>
          <View style={a.confirmCard}>
            <Text style={a.sectionTitle}>{confirm?.title}</Text>
            <Text style={[s.body, { marginVertical: 18 }]}>{confirm?.body}</Text>
            {sheetError && <Text style={a.error}>{sheetError}</Text>}
            <View style={{ gap: 10 }}>
              <Button
                title={busy ? tr('Un momento…') : confirm?.label || tr('Confirmar')}
                danger
                disabled={busy}
                onPress={() =>
                  void run(async () => {
                    await confirm?.action();
                    setConfirm(null);
                  })
                }
              />
              <Button
                title={tr('Cancelar')}
                secondary
                disabled={busy}
                onPress={() => {
                  setConfirm(null);
                  setSheetError('');
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
      {toast && (
        <View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[a.toast, { bottom: Math.max(insets.bottom, 10) + 87 }]}
        >
          <Icon name="check" size={17} color="#fff" />
          <Text style={{ color: '#fff', fontSize: 13, flexShrink: 1, lineHeight: 19 }}>
            {toast}
          </Text>
        </View>
      )}
    </KeyboardScreen>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppContent />
    </SafeAreaProvider>
  );
}
const a = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  appWidth: { flex: 1, width: '100%', maxWidth: 960, alignSelf: 'center' },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.bg,
    gap: 16,
  },
  page: { padding: 24, paddingTop: 22, paddingBottom: 30 },
  wordmark: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  brand: {
    fontFamily: theme.serif,
    fontWeight: '700',
    fontSize: 35,
    letterSpacing: -1.5,
    color: theme.ink,
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: theme.accent,
    marginLeft: -3,
    marginTop: 19,
  },
  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#E9EADD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: theme.ink, fontSize: 17, fontWeight: '600' },
  hero: {
    backgroundColor: '#E9EFDF',
    borderRadius: 28,
    padding: 24,
    minHeight: 235,
    overflow: 'hidden',
    position: 'relative',
  },
  heroArt: { position: 'absolute' },
  eyebrow: { fontSize: 9, fontWeight: '700', letterSpacing: 1.5, color: '#708267' },
  sectionTitle: { fontSize: 23, fontFamily: theme.serif, color: theme.ink, letterSpacing: -0.5 },
  smallHeading: { fontSize: 15, fontWeight: '600', color: theme.ink },
  countPill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: '#EEEFE7',
  },
  textLink: { fontSize: 13, fontWeight: '600', color: theme.green },
  cards: { gap: 14 },
  listCard: {
    backgroundColor: theme.white,
    padding: 20,
    borderRadius: 24,
    borderColor: theme.line,
    borderWidth: 1,
  },
  listEmoji: {
    width: 59,
    height: 59,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: { fontSize: 19, fontWeight: '600', color: theme.ink, letterSpacing: -0.3 },
  caption: { fontSize: 12, lineHeight: 18, color: theme.muted },
  progressTrack: {
    height: 5,
    backgroundColor: '#F0F1EB',
    borderRadius: 4,
    flex: 1,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 4 },
  fraction: { fontSize: 11, color: theme.muted, fontWeight: '500' },
  miniAvatar: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: '#fff',
    backgroundColor: '#E3EBDD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinBanner: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    borderRadius: 19,
    padding: 16,
    marginTop: 17,
    borderWidth: 1,
    borderColor: '#E6E7DC',
    borderStyle: 'dashed',
  },
  joinIcon: {
    width: 39,
    height: 39,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDF0E4',
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  nav: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 0,
    paddingHorizontal: 8,
    borderTopColor: theme.line,
    borderTopWidth: 1,
    backgroundColor: theme.bg,
    paddingTop: 4,
  },
  navItem: { alignItems: 'center', gap: 3, flex: 1, maxWidth: 120, minWidth: 0, minHeight: 48 },
  navIcon: { paddingVertical: 3, paddingHorizontal: 19, borderRadius: 18 },
  offline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    backgroundColor: '#F4ECD3',
  },
  detailHeader: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailProgress: { padding: 20, borderRadius: 22 },
  progressTitle: { fontSize: 19, fontWeight: '600', marginTop: 8, letterSpacing: -0.4 },
  progressCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingLeft: 15,
    paddingRight: 8,
    borderRadius: 16,
    backgroundColor: '#F0F2E9',
    minHeight: 50,
  },
  searchInput: { flex: 1, minHeight: 48, fontSize: 15, color: theme.ink, paddingVertical: 12 },
  categoryHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 18,
    paddingBottom: 10,
    paddingHorizontal: 4,
  },
  categoryTitle: { fontSize: 10, fontWeight: '700', letterSpacing: 1.2, color: theme.muted },
  itemsGroup: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomColor: '#F1F2ED',
    borderBottomWidth: 1,
    paddingRight: 4,
  },
  itemMain: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingVertical: 6,
    minHeight: 49,
    flex: 1,
  },
  productVisual: {
    width: 49,
    height: 49,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: { fontSize: 15, fontWeight: '400', color: theme.ink },
  itemMeta: { fontSize: 12, color: theme.muted, lineHeight: 17 },
  checkbox: {
    width: 23,
    height: 23,
    borderRadius: 12,
    flexShrink: 0,
    borderWidth: 1.5,
    borderColor: '#C9D1C1',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 2,
  },
  addDock: {
    position: 'absolute',
    left: 24,
    right: 24,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: theme.bg,
  },
  empty: { alignItems: 'center', paddingVertical: 30, gap: 13 },
  emptyIcon: {
    width: 67,
    height: 67,
    borderRadius: 25,
    backgroundColor: '#EAF0E2',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { fontFamily: theme.serif, fontSize: 25, color: theme.ink, textAlign: 'center' },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#1D302A66',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    backgroundColor: theme.bg,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    width: '100%',
    maxWidth: 560,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 3,
    backgroundColor: '#D7DDCE',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  emojiGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  emojiChoice: {
    width: 48,
    height: 48,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor: '#EBEEE4',
  },
  chipSelected: { backgroundColor: theme.ink },
  catalogRow: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    gap: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F2EC',
    minHeight: 69,
  },
  quickPlus: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#EAF0E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 4,
  },
  shareHero: { backgroundColor: '#EDF0E6', borderRadius: 23, padding: 22 },
  codeBox: { backgroundColor: '#EAF0E3', padding: 15, borderRadius: 14, alignItems: 'center' },
  codeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 17,
    color: theme.green,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13,
    minHeight: 77,
    padding: 17,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F1E9',
  },
  error: {
    color: '#A14734',
    fontSize: 13,
    lineHeight: 20,
    backgroundColor: '#F9E7DE',
    padding: 13,
    borderRadius: 12,
  },
  toast: {
    position: 'absolute',
    left: 24,
    right: 24,
    maxWidth: 500,
    alignSelf: 'center',
    backgroundColor: theme.ink,
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  confirmOverlay: {
    flex: 1,
    backgroundColor: '#1D302A88',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },
  confirmCard: {
    backgroundColor: theme.bg,
    borderRadius: 26,
    padding: 25,
    width: '100%',
    maxWidth: 420,
  },
  intro: { alignItems: 'center', justifyContent: 'center', padding: 28, paddingBottom: 45 },
});
