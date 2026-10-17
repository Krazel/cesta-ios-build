import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { t } from './i18n';
import { Button, Icon, s, theme } from './ui';

const steps = [
  {
    icon: 'lists',
    title: 'Guarda una lista. Úsala cuando quieras.',
    body: 'En Listas guardas tus productos habituales. «Añadir al inicio» copia su contenido a una compra independiente. Puedes añadirla varias veces; cada compra tiene su propio progreso.',
    label: 'Listas → Inicio',
    rows: ['🛒  Compra semanal', '🍝  Noche de pasta'],
    hint: 'Añadir al inicio',
  },
  {
    icon: 'plus',
    title: 'Añade a tu manera.',
    body: 'Escribe un producto y elige una sugerencia, busca en Productos o pega un texto desde Inicio. También puedes crear productos con tu propia foto.',
    label: 'Añadir producto',
    rows: ['🍝  Espaguetis', '🍅  Tomates'],
    hint: 'Escribe, busca o pega',
  },
  {
    icon: 'check',
    title: 'Lo de hoy y lo de siempre.',
    body: 'Lo comprado baja a una sección separada. Quita la compra de Inicio con × cuando quieras; tu lista guardada sigue igual. Para conservar cambios, abre las opciones ··· y pulsa «Actualizar lista».',
    label: 'Compra semanal',
    rows: ['✓  Pan', '🥑  Aguacate'],
    hint: 'Compra independiente · Actualizar lista',
  },
  {
    icon: 'people',
    title: 'También podéis comprar juntos.',
    body: 'Para una compra conjunta, abre ··· → Compartir lista y envía la invitación. La otra persona pulsa «Unirme» o abre el enlace. Ambos podéis añadir productos y marcar lo comprado desde distintos dispositivos y redes. Sin conexión, los cambios esperan hasta reconectar.',
    label: 'Compartir lista',
    rows: ['🔗  Enviar invitación', '🛒  La misma compra para todos'],
    hint: 'Vuelve a verlo desde Ajustes',
  },
];

export function Tutorial({ onClose }: { onClose: () => Promise<void> }) {
  const insets = useSafeAreaInsets();
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const step = steps[index];
  const finish = async () => {
    setBusy(true);
    setError('');
    try {
      await onClose();
    } catch {
      setError(t('No se ha podido guardar. Inténtalo de nuevo.'));
      setBusy(false);
    }
  };
  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <View style={styles.width}>
        <View style={styles.top}>
          <Text style={styles.brand}>
            cesta<Text style={{ color: theme.accent }}>.</Text>
          </Text>
          <Button
            small
            secondary
            title={t('Omitir tutorial')}
            onPress={() => void finish()}
            disabled={busy}
          />
        </View>
        <ScrollView key={index} contentContainerStyle={styles.content}>
          <Text accessibilityLiveRegion="polite" style={styles.counter}>
            {t('Tutorial · {0} de {1}', index + 1, steps.length)}
          </Text>
          <View accessible={false} accessibilityElementsHidden aria-hidden style={styles.preview}>
            <View style={styles.badge}>
              <Icon name={step.icon} size={30} color={theme.green} />
            </View>
            <Text style={styles.previewTitle}>{t(step.label)}</Text>
            {step.rows.map((row) => (
              <View key={row} style={styles.row}>
                <Text style={styles.rowText}>{t(row)}</Text>
              </View>
            ))}
            <Text style={styles.hint}>{t(step.hint)}</Text>
          </View>
          <Text accessibilityRole="header" style={styles.title}>
            {t(step.title)}
          </Text>
          <Text style={styles.body}>{t(step.body)}</Text>
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
        </ScrollView>
        <View style={styles.footer}>
          <View
            style={styles.progress}
            accessibilityLabel={t('Paso {0} de {1}', index + 1, steps.length)}
          >
            {steps.map((_, i) => (
              <View key={i} style={[styles.dot, i === index && styles.selected]} />
            ))}
          </View>
          <View style={[s.row, { gap: 12 }]}>
            {index > 0 && (
              <Button
                secondary
                title={t('Anterior')}
                onPress={() => setIndex(index - 1)}
                disabled={busy}
              />
            )}
            <View style={{ flex: 1 }}>
              <Button
                title={
                  busy
                    ? t('Guardando…')
                    : index === steps.length - 1
                      ? t('Entendido, vamos')
                      : t('Siguiente')
                }
                icon="arrow"
                disabled={busy}
                onPress={() => (index === steps.length - 1 ? void finish() : setIndex(index + 1))}
              />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.bg },
  width: { flex: 1, width: '100%', maxWidth: 520, alignSelf: 'center' },
  top: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  brand: { fontFamily: theme.serif, fontSize: 32, color: theme.ink },
  content: { paddingHorizontal: 24, paddingBottom: 24, gap: 20 },
  counter: { color: theme.green, fontSize: 14, fontWeight: '600' },
  preview: { borderRadius: 24, padding: 20, backgroundColor: '#E9EFDF', gap: 12 },
  badge: {
    backgroundColor: theme.white,
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewTitle: { fontSize: 18, fontWeight: '600', color: theme.ink },
  row: { padding: 14, backgroundColor: theme.white, borderRadius: 14 },
  rowText: { fontSize: 16, color: theme.ink },
  hint: { color: theme.green, fontSize: 13, lineHeight: 20 },
  title: { fontFamily: theme.serif, fontSize: 32, lineHeight: 38, color: theme.ink },
  body: { fontSize: 17, lineHeight: 26, color: theme.ink },
  footer: { paddingHorizontal: 24, paddingBottom: 20, gap: 20 },
  progress: { flexDirection: 'row', justifyContent: 'center', gap: 8, paddingTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#D0D6C9' },
  selected: { width: 24, backgroundColor: theme.green },
  error: { fontSize: 15, color: '#AC5141' },
});
