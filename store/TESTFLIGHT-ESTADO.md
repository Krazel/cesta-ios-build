# Cesta — preparación de TestFlight

## Entrega1.4(1) — 17/10/2026

17/10/2026: **Cesta1.4(1) disponible en TestFlight interno**, Apple VALID e
IN_BETA_TESTING. Build68e9e8f8-88ac-455e-be6a-7d21928d375d, notas ES/EN y grupo
existente releídos. CI39051045729, fuente f8657aae745ba852b3970716b728342a608838fd.
Compras de Inicio separadas de Listas guardadas, copias con progreso independiente,
actualización expresa desde opciones, retirada fácil y comprados separados al final
incluso por pasillos. Tutorial ES/EN explica también compartir compras por invitación.
IPA11.238.653bytes, SHA2561ee8d7af1f04531a244bcfa71553246c2d7d881762965a83f99cc02fef229e28.
Firma/identidad/arm64/HTTPS/permisos/perfil comprobados. Quince pruebas de texto,
modelo y sync,56comprobaciones web ES/EN con60capturas, seis pruebas UI locales de
nube/aislamiento/migración correctas. Servicio público responde con protocolo2
por CI39051616877; timeout TCP de este equipo, no incidencia del Worker confirmada.
QA física pendiente. App Store1.2 PREPARE_FOR_SUBMISSION, externos sin activar.
Biblioteca PR-016 revisión22 guardada y releída. Web pública sin nuevo despliegue.

Los apartados siguientes conservan el historial.

16/10/2026: última beta **1.3 (1)** interna, Apple VALID e IN_BETA_TESTING,
CI38926116655, build ea746207-c9c3-479b-ab7c-a22b9f10ac5b. Tutorial y B1–B8
incluidos; firma, IPA, HTTPS, permisos, notas ES/EN y grupo existente verificados.
Biblioteca PR-016 revisión20 guardada/releída. QA física pendiente; sin externos
ni App Review. Detalle [entrega del16/10](TESTFLIGHT-2026-10-16.md). Los apartados
siguientes conservan las entregas y decisiones anteriores.

13/10/2026: última beta **1.2.1 (1)** interna, Apple VALID e IN_BETA_TESTING; CI38448608042, build63e90ccf-5fbf-41e7-875e-2a37dc3638e4. Recuperación/plurales/permisos corregidos. Repositorio PUBLIC por petición expresa posterior a la regla privada. API y runtime local recuperados mediante vías aprobadas; tester ya INSTALLED para la app existente. Prueba física de esta nueva build pendiente. No externos/App Review; borrador comercial1.2 sigue en preparación. Recibo store/TESTFLIGHT-2026-10-13.md y D1 PR-016 rev16 verificada; versiones anteriores conservadas como historial.

## Enlaces tras privatización — 2026-10-12

El código es privado y soporte/privacidad ya son públicos e independientes: https://krazel.github.io/cesta/support/ y https://krazel.github.io/cesta/privacy/. El cerebro publicó los tres HTML aprobados y verificó Pages built, HTTP200 anónimo y seis actualizaciones de URL en Apple con relectura; esta tarea concilió referencias locales/espejos sin repetir escrituras. Recibos en .studio/support/cesta-private-repo-20261012/ desde la raíz de Studio. La próxima build privada requiere la auditoría store/PRIVATE-CI-AUDIT-2026-10-12.md; no se da por gratuita ilimitada ni se despacha en este encargo. La entrega actual acreditada sigue siendo TestFlight interno1.2 (1); lo que sigue es historial de1.1.

Petición expresa del usuario: crear la ficha de producto y subir la app a TestFlight. No incluye el envío de la versión pública a App Review.

## Completado

- App Store Connect: Cesta: Lista de la compra, Apple ID 6808982515, SKU krazel-cesta-ios, principal es-ES.
- Ficha: https://appstoreconnect.apple.com/apps/6808982515/distribution
- Versión editable 1.1, publicación manual, categoría SHOPPING. Metadatos de ficha y beta en es-ES y en-US, con soporte y privacidad reales en docs/ del repositorio público.
- Grupo interno vacío Cesta — Pruebas internas: 0bedf097-fcf7-40bc-a367-949b900c4883. No se han enviado invitaciones a terceros.
- ID registrado en Apple verificado: com.dmkr.cesta.B2X6D3A9J9 (4HDFQQFNBQ), equipo B2X6D3A9J9. app.config.js aplica este ID solo a CESTA_DISTRIBUTION=testflight; Sideloadly mantiene com.dmkr.cesta. Son instalaciones separadas.
- Perfil App Store: X7CU2U546W, UUID 88d5bcfd-abe2-4937-b28e-3ff3e64a652c. Certificado de distribución existente reutilizado: 2K3G3RTCS5, válido hasta 2027-08-08.
- Credenciales existentes conservadas en APIs/IOS, fuera del repositorio público. Perfil específico en APIs/IOS/Cesta Distribution.
- Candidata TestFlight 1.1 (2): recompilación de firma de 1.1, sin cambios funcionales. Configuración Expo comprobada, TypeScript y sintaxis de scripts correctos. Evidencia de metadatos guardados y releídos: artifacts/APP-STORE-PREPARACION.json.

## Autorización específica concedida

El usuario respondió «autorizo» a la pregunta específica sobre transferir la clave API, certificado privado, contraseña y perfil al entorno app-store-production de Krazel/cesta-ios-build. El script se ejecutó correctamente el 2026-09-05. Se verificaron los seis nombres de secretos y la política exclusiva para main. Se inició la ejecución 33976286715, commit b521d1a, para 1.1 (2). El titular de la cuenta se añadió al grupo interno; no se añadieron terceros.

### Historial del bloqueo ya resuelto

La revisión automática rechazó ejecutar artifacts/configure-testflight-secrets.mjs porque requiere autorización específica para transferir a GitHub la clave privada API de App Store Connect, el certificado de distribución con su clave privada (.p12), su contraseña y el perfil de Cesta. No se ha ejecutado ese script, no se ha configurado el entorno ni se ha subido la beta.

Destino preparado: secretos de Krazel/cesta-ios-build, entorno app-store-production, limitado a main. El workflow testflight.yml es manual, verifica propietario/rama/repositorio público y no se ejecuta desde pull requests. Los valores privados no se imprimen ni se incluyen en Git. El script de firma elimina su llavero temporal y archivos de claves al terminar.

La discrepancia inicial de Bundle ID que bloqueó abrir el formulario quedó resuelta antes de crear la ficha: se comprobó por API el registro de Cesta y se aplicó a la configuración de TestFlight. No queda pendiente aprobación por esa discrepancia.

## Siguiente paso tras autorización específica

1. Ejecutar artifacts/configure-testflight-secrets.mjs y verificar solo los nombres de secretos y la restricción de rama.
2. Verificar el repositorio público y ausencia de build 1.1 (2) en Apple; ejecutar manualmente testflight.yml.
3. Comprobar archive, firma, validación, aceptación de subida y procesamiento VALID en Apple.
4. Descargar el IPA firmado y manifiesto, validar sus metadatos y asignar la build al grupo interno. No invitar a otras personas sin autorización.
5. Registrar el estado real y artefactos en ESTADO.md y ficha PR-016 de la biblioteca, con revisión y lectura posterior.

Esta beta mantiene el servidor local http://192.168.1.35:8787. Las listas funcionan offline; compartir requiere la misma red y el servidor encendido. El servidor no se ha desplegado en Internet. No afirmar disponibilidad externa, aprobación de Beta App Review ni publicación pública. Las capturas web anteriores no son capturas nativas para la tienda.

## Entrega TestFlight completada — 2026-09-05

- Cesta 1.1 (2), Apple build bc08d768-5828-40bd-a9c8-931d948e8b5f: procesamiento VALID; internalBuildState IN_BETA_TESTING.
- Grupo Cesta — Pruebas internas: build asignada y cuenta titular añadida. Notas de prueba es-ES y en-US guardadas y verificadas.
- Run https://github.com/Krazel/cesta-ios-build/actions/runs/33976286715, commit b521d1a4515b7d7d551c313af6450ab2fb68b444. Archive, firma, exportación, validación Apple y subida completados sin errores.
- IPA firmado: artifacts/Cesta-1.1-build2-TestFlight.ipa, 11.214.297 bytes. SHA-256 d13b35bc4b096215a8bd95b3aefd03103850530ceafe88fabe47293c23eea5dc.
- Verificación local independiente: 122 entradas ZIP con CRC correcto, bundle/version/build, arm64 físico, perfil y recursos de firma presentes, cifrado no exento false, contenido de las mejoras y API local. Firma validada en macOS. Prueba física pendiente.
- Evidencias: artifacts/TESTFLIGHT-VERIFICACION.json, artifacts/testflight-build.json, artifacts/IPA-TESTFLIGHT-VERIFICACION.json y artifacts/testflight-run-33976286715.log.
- La autorización específica del usuario resolvió el bloqueo previo. No quedan bloqueos de credenciales.
- No se ha enviado a revisión pública ni activado pruebas externas. Siguiente instalación mediante TestFlight de la cuenta titular. Compartir sigue requiriendo la misma red y el servidor local encendido.
- No volver a subir build 2. Para una siguiente entrega autorizada, comprobar primero las builds de Apple e incrementar el número de compilación.
