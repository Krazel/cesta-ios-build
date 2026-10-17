# Cesta — estado del producto

## Compras independientes y tutorial conjunto — 2026-10-17

Candidata1.4(1) implementada y autorizada para TestFlight interno. Listas e Inicio
separados mediante copias privadas con enlaces locales, actualización expresa en
opciones, retirada rápida y comprados al final incluso por pasillos. Tutorial
ES/EN explica compra conjunta por invitación. Migración conserva progreso anterior.
TypeScript,15pruebas de texto/modelo/sync,60capturas con comprobaciones ES/EN,
3cloud UI,2de aislamiento y1de migración persistente correctas. QA física pendiente.
D1 PR-016 revisión21 registra preparación; última entrega confirmada1.3(1).
Detalle store/TESTFLIGHT-2026-10-17.md. No despliegue web ni App Review.

## TestFlight 1.3 (1) entregado — 2026-10-16

Tutorial y B1–B8 ya están en TestFlight interno. Build
ea746207-c9c3-479b-ab7c-a22b9f10ac5b VALID, IN_BETA_TESTING, grupo existente y
notas ES/EN releídos; upload COMPLETE sin errores/avisos. CI38926116655 correcto,
fuente c3616ea1506038fb7fc662fba765cc7234951011. IPA11.235.962bytes,
SHA256ed1137ef1c92ef1173de8458451354735aafacf7ca81a7699da6b52aaca1ca43,
ZIP/identidad/arm64/HTTPS/permisos/perfil verificados, firma codesign correcta en CI.
Detalle store/TESTFLIGHT-2026-10-16.md y artifacts/testflight-20261016/.

Los usuarios existentes pueden ver el tutorial desde Ajustes; la primera apertura
automática corresponde a instalaciones nuevas. QA física de esta build pendiente.
App Store1.2 sigue PREPARE_FOR_SUBMISSION; externos sin activar. Repo PUBLIC y
secretos protegidos conservados. No despliegue web. Biblioteca PR-016 guardada y
releída en revisión20 con los demás valores conservados; recibo library-updated.json
de esta entrega. Las secciones siguientes son historial de preparación/candidata.

## Subida autorizada de 1.3 (1) — 2026-10-16

Usuario pide TestFlight del tutorial y B1–B8. CI38926116655 iniciada desde
c3616ea1506038fb7fc662fba765cc7234951011, repo PUBLIC y entorno protegido
verificados. Preflight Apple no contiene1.3 y confirma grupo interno existente.
App Store1.2 sigue en preparación. Candidata nueva todavía en compilación/firma;
última beta disponible sigue1.2.1(1) hasta procesado/grupo verificados. Detalle
store/TESTFLIGHT-2026-10-16.md; biblioteca PR-016 inicio revisión19 releída.

## Diseños B1–B8 implementados — 2026-10-16

El usuario eligió expresamente las ocho propuestas. Aplicadas: filas compactas
de Listas sin borrado directo; categorías accesibles y feedback por producto;
Ajustes agrupados con versión real; importación centrada en revisión; formulario
de producto con nombre primero, foto compacta, selectores y muestra; compartir
con una sola acción; opciones agrupadas; feedback de Compra junto al progreso.
Se conservan los datos, extras/habituales, permisos y sincronización existentes.

Por la duda del usuario, «Volver a usar» se llama «Empezar otra compra» y explica
que desmarca habituales y retira extras. Quitar de Inicio conserva el progreso.
Tutorial inicial/repetible conservado. TypeScript/exportación web correctos;
25 comprobaciones por idioma ES/EN y tres pruebas compartidas locales correctas.
Prueba real del enlace local también correcta. Evidencia y aprobación:
`design/implementation-20261016/README.md`. No nueva IPA, TestFlight ni despliegue;
última beta sigue 1.2.1 (1) interna. QA física pendiente. Biblioteca PR-016 guardada y releída en revisión18 con lectura fresca, conservando
versión, build y tracking de distribución. Recibo artifacts/ui-implementation-20261016/library-updated.json.

## Tutorial y revisión visual — 2026-10-16

Tutorial implementado en candidata local: cuatro pasos ES/EN antes de la primera
bienvenida, omitir/finalizar persistidos y repetición desde Ajustes. Usuarios ya
incorporados conservan su apertura; las invitaciones sobreviven al tutorial.
No cambia listas ni permisos. TypeScript y exportación web correctos; 17
comprobaciones por idioma y tres pruebas de compra compartida/local offline pasan.

Auditoría de todas las pestañas y ventanas: `design/review-20261016/AUDITORIA.md`.
Comparativa seleccionable A/B en `design/review-20261016/index.html`, con capturas
actuales y ocho propuestas de ChatGPT Imágenes. No hay selección del usuario ni
rediseños aplicados. Tutorial delegado revisado por el agente en navegador; no QA
física. No nueva IPA/TestFlight/despliegue. Última beta sigue 1.2.1 (1) interna.
Biblioteca PR-016 actualizada y releída a revisión17, conservando tracking y los
campos de distribución. Evidencia `artifacts/ui-review-20261016/`.

## TestFlight 1.2.1 (1) completado — 2026-10-13

Nueva beta interna entregada y verificada por API: build63e90ccf-5fbf-41e7-875e-2a37dc3638e4, VALID e IN_BETA_TESTING, grupo interno existente y notas ES/EN releídos. CI38448608042 success, commit1aa38a8b5fe68bf6f38d319b49809d836d8d6b95. IPA11.227.846bytes SHA256f5f67c674544e10cac42881ae35c0cbec260a19600801ee40f71dce2ac6d0ea9, verificado independientemente. Incluye correcciones de recuperación/plurales/permisos. Detalle store/TESTFLIGHT-2026-10-13.md y artifacts/testflight-20261013/.

El usuario ordenó poner público el repo antes de esta build; visibilidad PUBLIC confirmada, excepción a la preferencia privada anterior registrada en AGENTS. CI estándar/macOS y secretos existentes/main, sin gastos nuevos. Runtime Cloudflare local y trece pruebas pasan; bloqueos de acceso del12/10 resueltos mediante vías aprobadas, sin ACLs ni desactivar sandbox. Invitación del titular ya aceptada (INSTALLED para la app existente); no equivale a probar esta nueva beta.

Prueba física de1.2.1(1) pendiente en iPhone/iPad y redes distintas. No TestFlight externo ni App Review/publicación comercial: borrador App Store1.2 sigue PREPARE_FOR_SUBMISSION. Soporte/privacidad independientes conservados. Esta entrega responde a la petición del13/10; futuras builds necesitan petición expresa. Actualización final D1 con lectura fresca y conservación de valores ajenos; recibo artifacts/testflight-20261013/library-complete.json.

## Subida TestFlight solicitada — 2026-10-13

El usuario pide subir la candidata y después ordena explícitamente poner Krazel/cesta-ios-build público antes de las builds. Excepción documentada en AGENTS local; PATCH de visibilidad aceptado tras aclarar la instrucción posterior al auto-review, GET confirma PUBLIC. No se cambia visibilidad de otros productos ni soporte/privacidad. Auditoría de21commits sin patrones de claves/tokens ni archivos de firma/datos; secretos continúan en entorno protegido/main. Actions estándar públicas, sin activar gastos. No requiere login de facturación ni ampliar OAuth.

Apple releído: 1.2(1) VALID, tester INSTALLED, App Store1.2 PREPARE_FOR_SUBMISSION. Nueva candidata correctiva1.2.1(1), inexistente en Apple al preflight; no se degrada la línea1.2 heredada. Se aplica patch de marketing por correcciones de comportamiento y build1. TypeScript, trece pruebas de nube/sincronización/importación correctas; runtime Cloudflare local ya validado con la aprobación de acceso apropiada, sin ACLs ni despliegue. Detalle artifacts/testflight-20261013/apple-preflight.json. Se prepara compilación/firma/subida interna, sin App Review ni externos. No afirmar disponible antes de procesado y asignación.

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
