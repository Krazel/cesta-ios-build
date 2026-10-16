import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { t } from './i18n';
import { useCesta } from './store';
import { productSizes } from './appearance';
import { Icon, s, theme } from './ui';

export function SettingsScreen({
  onProfile,
  onLanguage,
  onSize,
  onTutorial,
  onExport,
  onImport,
  onJoin,
  onSync,
  onPrivacy,
  onErase,
}: {
  onProfile: () => void;
  onLanguage: () => void;
  onSize: () => void;
  onTutorial: () => void;
  onExport: () => void;
  onImport: () => void;
  onJoin: () => void;
  onSync: () => void;
  onPrivacy: () => void;
  onErase: () => void;
}) {
  const state = useCesta();
  const groups = [
    {
      title: 'PREFERENCIAS',
      rows: [
        {
          name: 'Idioma',
          icon: 'people',
          value: state.language === 'es' ? 'Español' : 'English',
          action: onLanguage,
        },
        {
          name: 'Tamaño de los productos',
          icon: 'grid',
          value: t(productSizes[state.productSize].label),
          action: onSize,
        },
      ],
    },
    {
      title: 'AYUDA',
      rows: [{ name: 'Ver tutorial', icon: 'lists', value: '', action: onTutorial }],
    },
    {
      title: 'TUS DATOS',
      rows: [
        { name: 'Guardar una copia', icon: 'download', value: '', action: onExport },
        { name: 'Importar una copia', icon: 'upload', value: '', action: onImport },
        { name: 'Usar otro dispositivo', icon: 'link', value: '', action: onJoin },
        {
          name: 'Sincronizar ahora',
          icon: 'refresh',
          value:
            state.pending.length === 1
              ? t('1 pendiente')
              : state.pending.length
                ? t('{0} pendientes', state.pending.length)
                : '',
          action: onSync,
        },
        { name: 'Privacidad', icon: 'heart', value: '', action: onPrivacy },
      ],
    },
  ];
  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text accessibilityRole="header" style={styles.heading}>
        {t('Ajustes')}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('Cambiar nombre')}
        onPress={onProfile}
        style={[styles.card, styles.profile]}
      >
        <View style={styles.avatar}>
          <Text style={{ color: theme.ink, fontSize: 20 }}>
            {state.snapshot.device.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 17, color: theme.ink }}>{state.snapshot.device.name}</Text>
          <Text style={styles.caption}>{t('Así te ven en tus listas compartidas')}</Text>
        </View>
        <Icon name="edit" size={20} />
      </Pressable>
      {groups.map((group) => (
        <View key={group.title} style={{ gap: 8 }}>
          <Text style={styles.label}>{t(group.title)}</Text>
          <View style={styles.card}>
            {group.rows.map((row, i) => (
              <Pressable
                key={row.name}
                accessibilityRole="button"
                accessibilityLabel={t(row.name)}
                onPress={row.action}
                style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: theme.line }]}
              >
                <Icon name={row.icon} size={21} color={theme.green} />
                <Text style={{ flex: 1, fontSize: 15, color: theme.ink }}>{t(row.name)}</Text>
                {!!row.value && (
                  <Text style={[styles.caption, { maxWidth: '32%' }]}>{row.value}</Text>
                )}
                <Icon name="chevron" size={16} color={theme.muted} />
              </Pressable>
            ))}
          </View>
        </View>
      ))}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('Borrar mis datos')}
        onPress={onErase}
        style={[styles.card, styles.row]}
      >
        <Icon name="trash" color={theme.accent} size={20} />
        <Text style={{ flex: 1, color: '#A14734', fontSize: 15 }}>{t('Borrar mis datos')}</Text>
        <Icon name="chevron" size={16} color={theme.muted} />
      </Pressable>
      <Text style={[styles.caption, { textAlign: 'center', paddingVertical: 8 }]}>
        {t('Hecha para las pequeñas cosas')} · v{Constants.expoConfig?.version || '—'}
      </Text>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  page: { padding: 20, gap: 20, paddingBottom: 28 },
  heading: { fontFamily: theme.serif, fontSize: 32, color: theme.ink },
  card: {
    borderWidth: 1,
    borderColor: theme.line,
    borderRadius: 18,
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  profile: { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5EDDE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: { fontSize: 12, lineHeight: 18, color: theme.muted },
  label: { color: '#65746A', fontWeight: '600', fontSize: 11, letterSpacing: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
});
