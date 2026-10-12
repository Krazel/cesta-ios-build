# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Distribución — instrucción del usuario del 2026-09-05

No generar IPAs ni iniciar compilaciones nativas de distribución hasta que el usuario lo pida expresamente. Continuar las mejoras y su validación en la vista web. Esta instrucción sustituye la autorización anterior de generar un IPA después de cada cambio. Conservar las entregas existentes.

Excepción autorizada posteriormente el 2026-09-05: el usuario ha pedido expresamente generar el IPA que reúne autocompletado, listas guardadas sin casillas de compra, control de Inicio desde la lista, carruseles sin flechas y productos genéricos. Esta entrega está autorizada; futuras IPAs siguen requiriendo petición expresa.

Petición posterior del usuario: crear ficha de App Store Connect y subir Cesta a TestFlight. Está autorizada la preparación y subida de esta beta; no la publicación pública en App Store. Ver store/TESTFLIGHT-ESTADO.md para el bloqueo específico de transferencia de credenciales impuesto por revisión automática y el estado real de la ficha.

La autorización específica posterior «autorizo» permite transferir y guardar el material de firma Apple en los secretos del entorno app-store-production de Krazel/cesta-ios-build. La subida 1.1 (2) se completó y está en TestFlight interno. Esta autorización cubre la beta solicitada; no cambia la regla de futuras builds bajo petición ni autoriza publicación pública.

Petición expresa 2026-10-02: «pues haz testflight, pregúntale a cerebro cómo». Consultado el cerebro, completada Cesta 1.2 (1) con Internet en TestFlight interno, firma existente reutilizada. Detalle: store/TESTFLIGHT-2026-10-02.md. Esta autorización no incluye App Review ni publicación pública y no elimina la regla de futuras builds bajo petición.

## Código privado y próxima CI — 2026-10-12

Por petición posterior del usuario, Krazel/cesta-ios-build es privado. Soporte y privacidad están publicados aparte en https://krazel.github.io/cesta/support/ y https://krazel.github.io/cesta/privacy/, con URLs Apple verificadas por el cerebro y referencias locales conciliadas. Esta preferencia sustituye el requisito histórico de repositorio público para Actions. Antes de una próxima build expresamente solicitada, aplicar store/PRIVATE-CI-AUDIT-2026-10-12.md: comprobar acceso privado, guards de workflows, plan/cuota/almacenamiento y entorno protegido. No reabrir código ni activar gastos para compilar. D1 de esta separación lo concilia el cerebro; no repetir publicación ni parches Apple ya verificados.
