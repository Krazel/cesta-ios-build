# Cesta — estado del producto

## Cierre de octubre retomado — 2026-10-12

Encargo vigente: CIERRE-OCTUBRE.md y .studio/coordination/cierre-octubre-20261012.md, PR-016. Correcciones candidatas locales: rechazos permanentes 400/413 de sincronización conservan los cambios pendientes en copia privada y liberan la lista compartida; errores temporales siguen en cola. Texto pegado reconoce plurales como «yogures» y «yogurts», conserva cantidades e identidad del catálogo y respeta coincidencias exactas de productos propios. Configuración candidata retira Face ID sin uso y textos LAN localizados; SecureStore sigue guardando credencial sin autenticación biométrica.

Verificados TypeScript, doce casos de operaciones/importación, exportación web e iOS/Hermes y recorridos ES/EN de fotos reales mediante selector web, persistencia, habitual/extra, reutilización, contexto entre pestañas, porcentaje, autocompletado, campos y pantalla320. Cero llamadas API para listas personales y cero errores de runtime. Evidencia artifacts/qa-october/ui-receipt.json y capturas. Son pruebas de navegador estático desde disco, no cloud ni iPhone. IPA1.2(1) conservado revalidado hash/CRC/manifiestos; Expo candidata introspectada sin compilar binario nativo. Hermes necesitó scratch en workspace por permiso denegado en Temp del sistema; resuelto sin tocar ACLs ni sandbox. Se conserva diseño aprobado.

CI privada preparada localmente: ambas guardas aceptan private, mantienen propietario/main y exigen input free_ci_verified false por defecto. TestFlight conserva entorno protegido y regresiones de sincronización. No nuevos jobs, gastos, pushes, secretos ni cambios Apple. Plan/cuota/entorno siguen por confirmar; conector privado404 y CLI sin red.

Prueba Worker/SQLite actual bloqueada por GetFinalPathNameByHandleW Acceso denegado, incluso con scratch dentro del workspace; no se cambian ACLs ni sandbox. Consultas Apple/Cloudflare/biblioteca fallan ENOTFOUND. No se reutiliza evidencia cloud de octubre anterior como prueba de la corrección actual. La vista local de listas personales está preparada en127.0.0.1:8790; apertura de panel queued, conexión de terminal EACCES, no afirmar revisión live del panel.

Paquete de entrega store/PREPARACION-TIENDA-OCTUBRE.md y protocolo store/QA-IPHONE-OCTUBRE.md. Faltan prueba física iPhone/iPad y redes distintas, aceptación de invitación si sigue pendiente, cuota/acceso CI, nueva build expresamente solicitada y capturas nativas/metadatos finales con lectura API. Última beta entregada sigue1.2(1) interna; estas correcciones no están todavía en TestFlight. No App Review/publicación por esta reanudación. Biblioteca de esta entrega pendiente de conciliar tras GET inaccesible; mantener misma ficha/revisión fresca/tracking. Activación En producción ya verificada por cerebro.

## Código privado y soporte independiente — 2026-10-12

Usuario autoriza privatizar el repositorio y conservar soporte/privacidad. El cerebro confirmó Krazel/cesta-ios-build PRIVATE y completó la separación: soporte https://krazel.github.io/cesta/support/ y privacidad https://krazel.github.io/cesta/privacy/. Commit público bc505eaf078d0b6c627711f008fc0067641d0abf solo con tres HTML aprobados; Pages built y HTTP200 anónimo con contenido exacto. Apple corrigió y releyó únicamente seis localizaciones, conservando los demás atributos. Recibos .studio/support/cesta-private-repo-20261012/public-commit-receipt.json y apple-public-links-receipt.json releídos; blobs y referencias locales/espejos verificados.

La limitación inicial de esta sesión quedó resuelta por coordinación para publicación/Apple. D1 PR-016 lo concilia el cerebro, con recibo central rev13 de fuente; no se repiten escrituras. Próxima CI privada requiere resolver guards solo-público de los workflows conservados y verificar acceso, plan, cuota y disponibilidad del entorno de firma; valores reales desconocidos por red/conector sin acceso privado. Auditoría: store/PRIVATE-CI-AUDIT-2026-10-12.md. Sin nuevos pushes, builds, gastos ni cambios de funcionalidad/distribución/review.

## Consulta de estado — 2026-10-12

Última entrega acreditada: 1.2 (1), TestFlight interno, según el cierre por API del 2026-10-02. Hoy la consulta a api.appstoreconnect.apple.com falla con ENOTFOUND y la lectura de la API de biblioteca con «Host desconocido». No se ha podido revalidar distribución, aceptación de invitación ni ficha D1 en vivo; no se han creado builds ni cambiado la app. La documentación disponible no contiene una validación física posterior de iPhone/iPad.

La revisión11 histórica tenía version/build=1.2/1 y detail correcto, pero distribution decía «Web pública + TestFlight interno 1.1 (2)». El cerebro conserva la conciliación de PR-016 en este encargo; no escribir de nuevo desde esta tarea ni usar esa revisión histórica.

## TestFlight completado — 2026-10-02

Última entrega nativa: **Cesta 1.2 (1)**, procesada VALID y habilitada IN_BETA_TESTING en el grupo interno existente. Apple buildID 0be948f9-0820-41ed-8452-77e515bd9f01. CI 36933000531 correcto, commit 45642ad286a1868bdd3b1408b4a5bd81f3662b73; firma existente reutilizada, HTTPS verificado dentro del IPA. Notas/descripciones ES/EN y contacto privado de beta guardados y releídos. Biblioteca PR-016 rev11 verificada, versión/build 1.2/1, TestFlight Interno, App Store En preparación y anuncios Por confirmar.

El titular sigue como INVITED: necesita aceptar la invitación existente. Instalación y pruebas físicas pendientes. No se ha activado TestFlight externo ni enviado a App Review/publicado en tienda. El provisional 1.2 (3) se corrigió a build1 al ser la primera compilación de esa versión; se conserva la línea 1.2 de Apple. Consulta al cerebro y entrega documentadas en store/TESTFLIGHT-2026-10-02.md, IPA y manifiesto en artifacts/testflight-36933000531/.

## Preparación de subida — 2026-10-01

Borrador App Store Connect 1.2 actualizado y releído por API: descripciones ES/EN con Internet, notas y contacto privado de revisión completos. TestFlight permanece en 1.1 (2), interno y LAN, sin nueva build. Online Cloudflare verificado de nuevo con tres recorridos reales correctos; candidata 1.2 (3) configura HTTPS sin permiso LAN. Faltan binario nativo, capturas y completar edad/privacidad y requisitos de envío. Detalle y evidencias: store/RELEASE-PREPARACION-2026-10-01.md. No se ha enviado a revisión pública.

Ficha central: PR-016, Cesta. Producto distinto de Lista Compra (PR-017). Ruta efectiva: C:\Users\dmkra\Documents\Codex Apps\Cesta. El traslado de Studio sigue pendiente.

Biblioteca D1 actualizada y verificada por lectura posterior, revisión 9: TestFlight Interno, App Store En preparación, anuncios Por confirmar. Se conserva 1.1 (2) como última versión nativa. Evidencia: artifacts/LIBRARY-RELEASE-VERIFICACION-2026-10-01.json.

## Estado vigente — nube y web, 2026-09-05

Última mejora web: bienvenida sin selector (idioma del dispositivo) ni textos retirados; habituales separados de productos «Solo esta compra», reutilización confirmada y sincronizada. Código público e6487c04ff74a54f61fde39019424a16b3c1adc3, Worker 82cd4b99-9931-4a31-8efa-2b9e8d198184. Cinco pruebas finales en Internet correctas. Detalles: store/PURCHASE-SCOPE-ESTADO.md. TestFlight no se ha actualizado.

Web pública: https://cesta.krazel-zodiac-daily.workers.dev. Listas personales locales y nube al compartir o vincular otros dispositivos; sincronización por eventos y recuperación sin conexión. Cloudflare Workers Free confirmado, sin activar pago. Detalles y evidencias: store/CLOUD-ESTADO.md.

La última entrega nativa sigue siendo TestFlight **1.1 (2)**, con el servicio LAN anterior. El código de **1.2 (3)** está preparado para HTTPS y su bundle JavaScript iOS se exportó correctamente. No se ha generado un IPA ni ejecutado una nueva subida; se conserva la pausa de nuevas entregas hasta petición expresa. La prueba de navegador no acredita funcionamiento físico en iPhone.

Repositorio público actualizado: 4bc347a83595bb5b3588eb54742e177c64cf731d. `npm run preview` abre la web pública; desarrollo aislado con `npm run build:web` y `npm run cloud:dev`. El servidor y los datos LAN se conservan como legado.

Biblioteca PR-016 sincronizada y verificada por lectura posterior, revisión 7. Las tres pruebas finales sobre Internet pasan, incluida recarga web sin conexión. Evidencia: artifacts/CLOUD-VERIFICACION.json y artifacts/LIBRARY-CLOUD-VERIFICACION.json.

## Historial — entrega Sideloadly anterior

Versión iOS **1.1**, build **1**, propósito **Local-QA / Sideloadly**. Archivo: `artifacts/Cesta-1.1-build1-Local-QA.ipa`, también disponible como `artifacts/Cesta-Sideloadly.ipa`. Se conserva la entrega anterior 1.0.0 (3).

Incluye autocompletado del catálogo al escribir en la lista, listas guardadas sin casillas ni progreso de compra, control +/× Inicio sin cerrar la lista, reinicio confirmado de listas completas, carruseles sin flechas con deslizamiento y arrastre web, y 18 productos genéricos nuevos. Idiomas ES y EN.

Commit: 77e0901f37a36437895f2bce93841240ccacdde7. Repositorio público: https://github.com/Krazel/cesta-ios-build. Compilación correcta: https://github.com/Krazel/cesta-ios-build/actions/runs/33965998398. SHA-256: 571A207685D6A27F99CFD898882832EC4347311CE689083C29D329621D320D9F. Tamaño: 8.554.308 bytes.

Se incrementó la versión menor desde la numeración heredada 1.0.0 por los cambios de comportamiento y se reinició el build. La candidata de autocompletado 1.1 (1) no llegó a entregarse: la ejecución 33965049386 fue cancelada. Esta entrega agrupa ambos encargos. No se ha publicado en App Store ni TestFlight; la versión npm es un metadato interno y la versión iOS procede de app.json.

## Verificación

TypeScript, exportación web y 19 recorridos de navegador correctos; parser y compilación nativa correctos en CI. Verificados tamaño y CRC de 89 entradas ZIP, arm64 para iPhone físico, versión/build, bundle ID, mínimo iOS 16.4, contenido JavaScript y excepción HTTP. Evidencia: artifacts/IPA-LISTAS-VERIFICACION.json. Capturas inspeccionadas: design/APPROVALS.md. Las pruebas web no validan la instalación ni el teclado físico.

## Instrucción y siguiente paso

El usuario autorizó expresamente este IPA después de la pausa anterior. **No generar futuras IPAs hasta que el usuario lo pida.** Instalar esta entrega con Sideloadly y comprobar teclado, gestos, listas y permisos en un iPhone físico. La API sigue siendo local: http://192.168.1.35:8787; requiere el ordenador encendido y la misma red para sincronizar. No hay despliegue de producción.

Biblioteca sincronizada y verificada por lectura posterior: PR-016, revisión 3, versión 1.1 build 1. Evidencia: artifacts/LIBRARY-LISTAS-VERIFICACION.json.

## App Store Connect y TestFlight
Ficha creada: 6808982515, Cesta: Lista de la compra. Versión 1.1 y metadatos ES/EN preparados, grupo interno creado vacío y perfil de firma válido. Candidata 1.1 (2), Bundle ID de distribución com.dmkr.cesta.B2X6D3A9J9. Subida pendiente: la revisión automática exige autorización específica para alojar las credenciales de Apple en los secretos protegidos de Krazel/cesta-ios-build. No se ha subido ningún binario a Apple. Continuidad: store/TESTFLIGHT-ESTADO.md.

### 2026-09-05 — TestFlight interno completado

Cesta 1.1 (2) subida y procesada VALID, estado IN_BETA_TESTING, grupo interno con la cuenta titular. Firma y validación Apple correctas. Run 33976286715, commit b521d1a4515b7d7d551c313af6450ab2fb68b444. IPA en artifacts/Cesta-1.1-build2-TestFlight.ipa; evidencia en artifacts/TESTFLIGHT-VERIFICACION.json y artifacts/IPA-TESTFLIGHT-VERIFICACION.json. El usuario autorizó específicamente los secretos de GitHub y el bloqueo anterior quedó resuelto. Ficha App Store creada con ES/EN; sin publicación pública. Prueba física pendiente. Sincronización limitada al servidor local.
