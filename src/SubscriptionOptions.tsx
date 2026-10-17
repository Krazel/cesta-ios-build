import React, { useEffect, useState } from 'react';
import { Linking, Platform, Pressable, Text, View } from 'react-native';
import {
  buySubscription,
  loadStoreProducts,
  restoreSubscriptions,
  useCommerce,
  setSupportReminders,
  supportRemindersEnabled,
} from './commerce';
import { Button, s, theme } from './ui';
import { t } from './i18n';
const caption = { fontSize: 12, color: theme.muted, lineHeight: 18 };
const privacy = 'https://krazel.github.io/cesta/privacy/';
const terms = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const manage = 'https://apps.apple.com/account/subscriptions';
export function SubscriptionOptions() {
  const store = useCommerce();
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [reminders, setReminders] = useState(true);
  useEffect(() => {
    void loadStoreProducts().catch(() =>
      setMessage(t('No se han podido cargar los precios. Inténtalo de nuevo.')),
    );
    void supportRemindersEnabled()
      .then(setReminders)
      .catch(() => {});
  }, []);
  async function run(task: () => Promise<void>) {
    setBusy(true);
    setMessage('');
    try {
      await task();
    } catch {
      setMessage(t('No se ha podido completar. Comprueba la conexión e inténtalo de nuevo.'));
    } finally {
      setBusy(false);
    }
  }
  const preview = Platform.OS === 'web';
  return (
    <View style={{ gap: 16 }}>
      <Text style={s.body}>
        {store.adsRemoved
          ? t('Gracias por apoyar Cesta. No verás anuncios mientras tu suscripción esté activa.')
          : t(
              'Elige un importe mensual. Todas las opciones quitan los mismos anuncios; las demás funciones siguen disponibles para todos.',
            )}
      </Text>
      {preview && (
        <Text style={caption}>
          {t('Vista previa. La compra y el precio definitivo se muestran en la app para iPhone.')}
        </Text>
      )}
      {(preview && !store.products.length
        ? [1.99, 4.99, 9.99, 14.99, 19.99, 24.99].map((amount) => ({
            id: String(amount),
            price: new Intl.NumberFormat(undefined, { style: 'currency', currency: 'EUR' }).format(
              amount,
            ),
            name: '',
            amount,
          }))
        : store.products
      ).map((product, index) => (
        <Pressable
          key={product.id}
          accessibilityRole="button"
          accessibilityLabel={t('Suscribirme por {0} al mes', product.price)}
          disabled={busy || !store.supported || store.adsRemoved}
          onPress={() =>
            void run(async () => {
              const result = await buySubscription(product.id);
              if (result.outcome === 'pending')
                setMessage(
                  t('Compra pendiente de aprobación. Los anuncios se quitarán cuando se confirme.'),
                );
              else if (result.adsRemoved) setMessage(t('Suscripción activa. Anuncios quitados.'));
            })
          }
          style={[
            s.row,
            {
              borderWidth: 1,
              borderColor: index === 0 ? theme.green : theme.line,
              borderRadius: 14,
              padding: 14,
              minHeight: 58,
              backgroundColor: index === 0 ? '#E5EDDE' : '#fff',
              justifyContent: 'space-between',
              opacity: busy ? 0.5 : 1,
            },
          ]}
        >
          <View style={{ gap: 3 }}>
            <Text style={{ fontSize: 17, color: theme.ink, fontWeight: '600' }}>
              {product.price} {t('/ mes')}
            </Text>
            <Text style={caption}>
              {index === 0
                ? t('Mismo beneficio en todas las opciones')
                : t('Apoyo adicional · mismo beneficio')}
            </Text>
          </View>
          <Text style={{ color: theme.green }}>{store.adsRemoved ? '✓' : t('Elegir')}</Text>
        </Pressable>
      ))}
      {store.supported && !store.products.length && (
        <>
          <Text style={s.body}>
            {t('Los precios de Apple no están disponibles ahora. No se hará ningún cargo.')}
          </Text>
          <Button
            secondary
            title={t('Volver a cargar precios')}
            disabled={busy}
            onPress={() =>
              void run(async () => {
                await loadStoreProducts();
              })
            }
          />
        </>
      )}
      {!!message && (
        <Text accessibilityRole="alert" style={s.body}>
          {message}
        </Text>
      )}
      <Text style={[caption, { lineHeight: 19 }]}>
        {t(
          'Suscripción mensual con renovación automática. Apple confirma el precio antes de comprar y cobrará a tu cuenta. Se renueva al precio mostrado salvo que la canceles al menos 24 horas antes del final del periodo. Puedes cancelarla o cambiarla en los ajustes de tu cuenta de Apple. No hay prueba gratuita.',
        )}
      </Text>
      <Button
        secondary
        title={t('Restaurar compras')}
        disabled={busy || !store.supported}
        onPress={() =>
          void run(async () => {
            const value = await restoreSubscriptions();
            setMessage(
              t(
                value.adsRemoved
                  ? 'Compras restauradas. Anuncios quitados.'
                  : 'No hay una suscripción activa para restaurar.',
              ),
            );
          })
        }
      />
      <Button
        secondary
        title={t('Gestionar suscripción')}
        onPress={() =>
          void Linking.openURL(manage).catch(() =>
            setMessage(t('No se ha podido abrir el enlace.')),
          )
        }
      />
      <View style={[s.row, { justifyContent: 'space-between', gap: 12 }]}>
        {[
          [t('Privacidad'), privacy],
          [t('Condiciones'), terms],
        ].map(([label, url]) => (
          <Pressable
            key={url}
            accessibilityRole="link"
            accessibilityLabel={label}
            onPress={() =>
              void Linking.openURL(url).catch(() =>
                setMessage(t('No se ha podido abrir el enlace.')),
              )
            }
            style={{ minHeight: 44, justifyContent: 'center' }}
          >
            <Text style={{ color: theme.green, textDecorationLine: 'underline' }}>{label}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityLabel={t('Recordatorios para quitar anuncios')}
        accessibilityState={{ checked: reminders }}
        aria-checked={reminders}
        onPress={() => {
          const next = !reminders;
          void setSupportReminders(next)
            .then(() => setReminders(next))
            .catch(() => setMessage(t('No se ha podido guardar. Inténtalo de nuevo.')));
        }}
        style={[s.row, { gap: 10, minHeight: 44 }]}
      >
        <Text style={{ color: theme.green, fontSize: 19 }}>{reminders ? '☑' : '☐'}</Text>
        <Text style={[caption, { flex: 1 }]}>
          {t('Recordatorios ocasionales para quitar anuncios (cada 14 días como máximo).')}
        </Text>
      </Pressable>
    </View>
  );
}
