# Cesta

Última beta entregada: **1.5 (1)** en TestFlight interno, verificada el19/10.
[Entrega](store/TESTFLIGHT-2026-10-19.md): Guardar en Listas/Actualizar lista,
banner nativo AdMob de prueba, consentimiento ES/EN, seis suscripciones mensuales
para quitar anuncios y recordatorios moderados. Suscripciones sin aprobación
comercial; QA de compras/consentimiento en iPhone físico pendiente.
[Configuración y privacidad](store/MONETIZACION-2026-10-18.md),
[prueba física](store/QA-IPHONE-OCTUBRE.md). No anuncios reales ni App Review.
QA de interfaz: `node scripts/verify-monetization-ui.mjs` tras `npm run build:web`.
La vista web no valida StoreKit ni anuncios de iPhone.

Aplicación de listas de la compra para iPhone y web, en castellano e inglés.

Web: https://cesta.krazel-zodiac-daily.workers.dev. `npm run preview` abre esta dirección pública. TestFlight interno1.5(1), con Internet, del2026-10-19; las pruebas físicas de esta beta siguen pendientes. No nueva publicación web por esta subida.

El usuario ordenó el 13/10 volver público Krazel/cesta-ios-build antes de esta build, para usar Actions estándar gratuitas; visibilidad PUBLIC releída por API. Esta excepción sustituye para Cesta la preferencia privada del 12/10. Soporte público: https://krazel.github.io/cesta/support/. Privacidad pública: https://krazel.github.io/cesta/privacy/. Se conservan los secretos en app-store-production, restringido a main. La CI de TestFlight sigue exigiendo propietario y main; si se vuelve a privado, requiere comprobación de cuota/entorno antes de su input manual. No se activan planes ni gastos.

## Modelo local y sincronización

Las listas personales, catálogo y favoritos se guardan en el dispositivo. Crear, editar, marcar, importar y reutilizar una lista personal no contacta con la API.

Al elegir **Compartir lista → Crear invitación**, solo esa lista se publica en el servicio. Cada lista compartida tiene su propio Durable Object de Cloudflare con almacenamiento SQLite y conexiones WebSocket con hibernación. No hay consultas periódicas: al conectar se recupera la lista y las confirmaciones de operaciones pendientes; después se envían cambios. Los identificadores únicos evitan duplicados al reintentar una operación. Las operaciones de un lote se guardan de forma atómica.

Las invitaciones caducan a los siete días y una nueva sustituye la anterior. Los participantes editan; el propietario gestiona invitaciones y expulsiones. El propietario puede volver a una copia local retirando la lista de la nube para todos. Un participante puede salir y guardar su copia. El borrado de datos compartidos necesita conexión y confirmación del servidor.

Las listas de la beta LAN anterior se conservan localmente, incluidos cambios pendientes. No se suben automáticamente a otro proveedor. Necesitan invitaciones nuevas. El registro local v1 se conserva para recuperación hasta borrar los datos de Cesta. La base del antiguo servidor sigue en data/ y no se modifica por esta migración.

## Listas habituales y compra actual

El inicio usa el idioma del dispositivo (castellano o inglés, con inglés para otros idiomas); el selector permanece en Ajustes. Las preferencias de idioma ya guardadas se respetan.

Listas guarda contenido reutilizable. **Añadir al inicio** copia sus productos a
una compra privada independiente con progreso propio; no activa la misma lista.
Añadir, editar o comprar en Inicio no cambia la guardada. **Actualizar lista**, en
las opciones de la compra, guarda expresamente todo el contenido sin marcas.
Cada activación crea una compra nueva; **×** o **Terminar compra** retira la compra
y conserva la guardada. La retirada de una compra compartida solo la oculta aquí,
sin borrar a los demás. Lo comprado va al final tras un divisor, también por pasillos.
La migración conserva progreso y enlaces compartidos y crea una guardada privada.
Las copias de seguridad conservan el tipo/enlace/actividad y remapean sus IDs.

## Desarrollo local

Node 24. Instalación: `npm ci`.

- `npm run build:web`: genera la web y su caché sin conexión.
- `npm run cloud:dev`: ejecuta el Worker local en http://localhost:8788.
- `npm run typecheck`: comprueba TypeScript.
- `npm run test:cloud`: prueba permisos, operaciones simultáneas, reintentos, eventos, expulsiones y borrado en el runtime de Cloudflare.
- `npm run test:cloud-ui`: prueba dos navegadores, ausencia de API para listas locales, recuperación offline y migración LAN.
- `npm run test:text-import`: comprueba la conversión local de texto a productos.

El primer acceso a la web requiere Internet. Después puede reabrirse sin conexión mientras el navegador conserve sus archivos y datos. Las API y las invitaciones no se almacenan en la caché del service worker.

## Despliegue

`wrangler.jsonc` identifica el Worker cesta en la cuenta existente de Studio. El plan Workers Free se verificó en el panel el 2026-09-05. No se activó ningún plan de pago. Las cuotas se comparten con otros servicios de esa cuenta. Las listas sincronizadas se limitan a 32 participantes, 1000 productos y unos 750 KB para mantener las fotos y el estado dentro del tamaño admitido por la conexión.

Compilar y verificar antes de `npx wrangler deploy`. El despliegue publica la web y la API; no equivale a una entrega de iPhone. Los archivos de estado local, logs y credenciales no pertenecen a Git ni al sitio de soporte.

## iPhone

El código mantiene Expo SDK 57 / React Native 0.86. La app nativa debe compilarse con la URL HTTPS publicada. Las builds previas de TestFlight conservan la URL LAN incluida en su binario. Una prueba web no valida teclado, fotos ni instalación física de iOS. Las entregas y la autorización vigente constan en AGENTS.md, ESTADO.md y store/TESTFLIGHT-ESTADO.md.

Privacidad: [docs/privacy.md](docs/privacy.md). Soporte: [docs/support.md](docs/support.md).
