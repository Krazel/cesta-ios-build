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

## Excepción expresa posterior — 2026-10-13

El usuario solicita «sube a testflight» y, ante la comprobación de cuota privada, ordena: «tiene que ser repositorio público antes de hacer [...] las builds [...] ponlo público». Esta instrucción humana posterior autoriza volver público únicamente Krazel/cesta-ios-build y ejecutar la beta solicitada mediante runner estándar público, sin nuevos gastos. Sustituye para Cesta la prohibición anterior de reabrir código. Conservar soporte/privacidad independientes y secretos protegidos; no publicar Studio, APIs/IOS, datos, material de firma ni contactos privados. No autoriza App Review, testers externos ni cambios de otros productos. Comprobar y releer la visibilidad por API; esta anotación no significa que el cambio ya se haya realizado.

## TestFlight del rediseño — 2026-10-16

Tras elegir e implementar B1–B8, el usuario pide expresamente «súbelo a
TestFlight». Autoriza compilar, firmar, subir y distribuir internamente Cesta
1.3 (1), con el tutorial y esos diseños, reutilizando el grupo y firma existentes.
Conservar el repositorio público según la excepción anterior. No incluye App
Review, distribución externa ni publicación comercial. Futuras builds requieren
otra petición expresa. Detalle y estado real: store/TESTFLIGHT-2026-10-16.md.

## Compras independientes — 2026-10-17

El usuario pide separar Listas (contenido reutilizable) de Inicio (copias de compra
independientes), retirada fácil, comprados al final incluso por pasillos y tutorial
que explique también compras conjuntas. Responde expresamente «Sí, subir a
TestFlight» al terminar. Autoriza esta beta1.4(1), firma y grupo interno existentes;
no App Review, externos ni publicación comercial. Conservar excepción pública
para CI estándar sin nuevos gastos. No autoriza futuras builds automáticas.
