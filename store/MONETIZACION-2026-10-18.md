# Cesta1.5 — Guardar en Listas y monetización

**Actualización19/10:** Cesta1.5(1) ya está en TestFlight interno, VALID y
IN_BETA_TESTING. Entrega autorizada después de esta preparación; ver
[recibo](TESTFLIGHT-2026-10-19.md). Anuncios test, QA física pendiente.
Los apartados siguientes registran la preparación del18/10.

Encargo humano del18/10/2026: guardar en Listas una compra hecha desde cero,
banner inferior AdMob como Voice Recorder, varios importes de suscripción para
quitar anuncios entre1,99 y25€, valoración nativa ocasional y recordatorio de
suscripción cada una o dos semanas. Implementado en candidata1.5 ES/EN.

## Comportamiento

Una compra de Inicio sin lista guardada ofrece **Guardar en Listas**. Crea una
guardada independiente sin progreso y enlaza la compra actual. A partir de ahí
la acción es **Actualizar lista**. Duplicar lista solo aparece en Listas.
Tutorial actualizado; añadir extras sigue sin modificar la guardada hasta
elegir expresamente guardar/actualizar.

Banner nativo adaptativo debajo de la navegación, separado de sus controles.
No reserva una franja vacía si no hay anuncio; se oculta con teclado, formularios,
tutorial o suscripción verificada. Sin intersticiales ni anuncios recompensados.
No envía contenido de listas, fotos, nombres o invitaciones a AdMob.
La web conserva compras y listas gratuitas, sin SDK publicitario ni pagos web.

**Ajustes → Quitar anuncios** muestra precios localizados obtenidos de StoreKit,
renovación mensual, mismo beneficio, restaurar compras, gestión en Apple,
privacidad y condiciones. Los importes mayores son apoyo adicional opcional.
No hay prueba gratuita. Compra cancelada o pendiente no desbloquea anuncios;
solo transacciones verificadas, vigentes y no revocadas. Se observan cambios
de StoreKit, caducidad y vuelta a primer plano; no hay indicador de pago confiado
únicamente al almacenamiento JavaScript. Borrar datos no cancela una suscripción.

Recordatorios locales: mínimo7días y3días distintos de uso antes de cualquier
petición. Valoración después de2compras completadas, mínimo120días entre intentos,
diálogo nativo decidido por Apple, sin filtrar estrellas ni premiar valoraciones.
Desactivado en TestFlight/sandbox. Recordatorio de suscripción máximo cada14días,
solo sin suscripción y con precios disponibles; «Ahora no» y «No volver a mostrar».
El opt-out persiste y puede cambiarse en las opciones de suscripción.
No se apilan peticiones en24horas; solo se intenta tras2minutos en el resumen
de Inicio sin teclado/ventana/consentimiento activo. Las fechas y contadores
permanecen en el dispositivo. Abrir manualmente suscripción/valoración también
aplaza la siguiente petición automática.

## Configuración verificada

AdMob propio de Cesta, creado en la cuenta existente:

- AppiOS `ca-app-pub-3425091654264901~5160228186`, todavía sin enlace de tienda pública.
- Banner «Cesta · banner inferior» `ca-app-pub-3425091654264901/3118097788`.
- Mensaje UMP «Cesta — consentimiento europeo ES/EN» **Publicado**, solo Cesta,
  inglés y español, aceptar/rechazar/gestionar; rechazo habilitado en todos los
  territorios del mensaje. Voice Recorder y Sopa conservados.
- Google Mobile Ads12.14.0 + UMP3.1.0; consentimiento antes del SDK/anuncios.
  ATT separado y condicionado a elegibilidad TCF, siguiendo Voice Recorder;
  rechazar consentimiento no inicia ATT. Reapertura desde Privacidad de anuncios.
  No se ha creado/publicado un mensaje IDFA de Cesta en AdMob.
- **Modo test**: banner oficial de Google `ca-app-pub-3940256099942544/2435281174`.
  `productionReady=false`; el plugin rechaza activar anuncios reales sin todos
  los indicadores de preparación. Publicar UMP no equivale a servir anuncios reales.

Apple API oficial: app6808982515, grupo22489005. Seis productos, mismo nivel1,
periodoONE_MONTH, planUPFRONT (pago íntegro de cada mes, sin compromiso de12meses),
ES/EN y175territorios con equivalencias Apple. Precios de España releídos:

| Producto (sufijo) | ID Apple | EUR/mes |
| --- | --- | --- |
|199|6824077121|1,99|
|499|6824077719|4,99|
|999|6824077931|9,99|
|1499|6824078448|14,99|
|1999|6824078694|19,99|
|2499|6824079016|24,99|

Prefijo: `com.dmkr.cesta.noads.monthly.`. Todos en **MISSING_METADATA**, no
enviados a revisión ni aprobados para cobro real. Falta captura de revisión de
la app nativa. No añadir una captura web fingiendo que acredita StoreKit.
Un solo grupo evita contratar varias opciones de Cesta simultáneamente.

Política pública ES/EN actualizada en el repositorio de soporte separado:
https://krazel.github.io/cesta/privacy/. Commit
`ec4bb21cd7a17f4e47cfb39e4f829c1572d128ad`, Pages39076225927 correcto,
GET anónimo200 y contenido exacto verificados. SHA256
`02402b932abde2504abecf5616f25dc219d09e1168618a6339a7527cdaebfd20`.
Distingue beta1.4 sin anuncios de candidata1.5 con Google/Apple y explica datos,
consentimiento, suscripción y recordatorios. Soporte y URLs Apple conservados.

## Verificación y distribución

Compilación nativa **sin firma para simulador** correcta en CI39075842510,
fuente7c99923; Expo autolinking reconoce CestaCommerce y CocoaPods integra los
dos SDK. Registro `artifacts/monetization-20261018/native-validation/` y huellas
de fuentes compiladas en `native-verified.json`. No archive, firma, IPA ni subida.
Los cambios posteriores de configuración usan el AppID propio con banner de prueba;
el código Swift compilado se conserva idéntico.

TypeScript, exportación web y19pruebas de política de recordatorios/texto/modelo/
sync correctos. Regresión web ES/EN con31comprobaciones por idioma y62capturas,
incluidos guardar compra nueva, seis precios no comprables en web y opt-out
persistente. Tres pruebas UI de nube local correctas (datos de prueba, no servicio
remoto). Recibos en `artifacts/ui-monetization-20261018/` y
`artifacts/monetization-20261018/`. Estas comprobaciones no validan una compra real
ni la presentación de anuncios/consentimiento en iPhone físico.

Última beta disponible sigue **1.4(1) en TestFlight interno**, sin esta integración.
App Store comercial1.2 en preparación; sin externos ni App Review. Configuración,
notas y workflow de una futura1.5(1) preparados, **sin ejecutar la distribución**.
Repositorio público por excepción humana de Cesta; runner estándar macOS,
sin nuevos gastos ni acceso a firma en la validación. Web pública sin desplegar
estos cambios; solo se publica la política de privacidad solicitada para AdMob.

## Antes de cobrar o activar anuncios reales

1. Nueva beta expresamente solicitada y prueba física: UMP EEE aceptar/rechazar/
   gestionar/retirar, sin ATT tras rechazo, sin anuncios previos a consentimiento;
   volver a primer plano, teclado, tamaños y navegación sin toques accidentales.
2. Sandbox Apple: seis precios reales de StoreKit, compra/pendiente/cancelación,
   restauración en otro dispositivo con mismoAppleID, caducidad y revocación.
   Quitar anuncios en todos esos estados y no cerrar el acceso gratuito a listas.
3. Captura nativa de revisión y completar metadatos de suscripciones. Revisar las
   declaraciones de privacidad Apple según los SDK reales y requisitos regionales
   de AdMob, incluidos mensajes/regímenes de estados de EEUU si se distribuye allí.
4. App Store/AdMob: enlace público, app-ads.txt y aprobación de disponibilidad.
   Activar producción solo tras verificarlo; no subir ni enviar App Review por
   completar esta lista. Mantener test ads durante QA, nunca pulsar anuncios reales.

Fuentes primarias consultadas: [ExpoSDK57](https://docs.expo.dev/versions/v57.0.0/),
[módulos locales](https://docs.expo.dev/modules/get-started/),
[Google iOS](https://developers.google.com/admob/ios/quick-start),
[UMP](https://developers.google.com/admob/ios/privacy),
[datos del SDK](https://developers.google.com/admob/ios/privacy/data-disclosure),
[precios Apple](https://developer.apple.com/documentation/appstoreconnectapi/configuring-subscription-prices-across-territories)
y [valoraciones nativas](https://developer.apple.com/documentation/storekit/requesting-app-store-reviews).
