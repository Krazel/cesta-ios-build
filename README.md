# Cesta

Aplicación de listas de la compra para iPhone y web, en castellano e inglés.

Web: https://cesta.krazel-zodiac-daily.workers.dev. `npm run preview` abre esta dirección pública. La versión de TestFlight 1.1 (2) conserva el servicio LAN; la candidata con Internet es 1.2 (3), todavía sin distribuir.

## Modelo local y sincronización

Las listas personales, catálogo y favoritos se guardan en el dispositivo. Crear, editar, marcar, importar y reutilizar una lista personal no contacta con la API.

Al elegir **Compartir lista** o **Usar en mis dispositivos**, solo esa lista se publica en el servicio. Cada lista compartida tiene su propio Durable Object de Cloudflare con almacenamiento SQLite y conexiones WebSocket con hibernación. No hay consultas periódicas: al conectar se recupera la lista y las confirmaciones de operaciones pendientes; después se envían cambios. Los identificadores únicos evitan duplicados al reintentar una operación. Las operaciones de un lote se guardan de forma atómica.

Las invitaciones caducan a los siete días y una nueva sustituye la anterior. Los participantes editan; el propietario gestiona invitaciones y expulsiones. El propietario puede volver a una copia local retirando la lista de la nube para todos. Un participante puede salir y guardar su copia. El borrado de datos compartidos necesita conexión y confirmación del servidor.

Las listas de la beta LAN anterior se conservan localmente, incluidos cambios pendientes. No se suben automáticamente a otro proveedor. Necesitan invitaciones nuevas. El registro local v1 se conserva para recuperación hasta borrar los datos de Cesta. La base del antiguo servidor sigue en data/ y no se modifica por esta migración.

## Listas habituales y compra actual

El inicio usa el idioma del dispositivo (castellano o inglés, con inglés para otros idiomas); el selector permanece en Ajustes. Las preferencias de idioma ya guardadas se respetan.

En Inicio, los productos nuevos son **Solo esta compra** por defecto. Se puede elegir **Guardar como habitual**, también desde el catálogo o al editar el producto. La sección Listas muestra únicamente los habituales. Quitar una lista de Inicio y volver a abrirla conserva la compra en curso, incluidos sus extras. **Volver a usar** pide confirmación si hay compras marcadas o extras: retira los extras y desmarca los habituales. En listas compartidas esta acción se aplica a todos; respeta las adiciones posteriores y los productos que otra persona acaba de convertir en habituales. Los productos anteriores a esta mejora siguen siendo habituales.

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

Compilar y verificar antes de `npx wrangler deploy`. El despliegue publica la web y la API; no equivale a una entrega de iPhone. Los archivos de estado local, logs y credenciales no pertenecen al repositorio público.

## iPhone

El código mantiene Expo SDK 57 / React Native 0.86. La app nativa debe compilarse con la URL HTTPS publicada. Las builds previas de TestFlight conservan la URL LAN incluida en su binario. Una prueba web no valida teclado, fotos ni instalación física de iOS. Las entregas y la autorización vigente constan en AGENTS.md, ESTADO.md y store/TESTFLIGHT-ESTADO.md.

Privacidad: [docs/privacy.md](docs/privacy.md). Soporte: [docs/support.md](docs/support.md).
