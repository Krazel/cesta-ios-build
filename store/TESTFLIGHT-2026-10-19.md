# Cesta1.5(1) — TestFlight interno — 19/10/2026

Petición expresa: «pues sube a testflight». Autoriza compilación, firma y subida
al grupo interno existente; no App Review, externos ni publicación comercial.

Preparación verificada por API:1.5 todavía no existe; última beta1.4(1) válida.
App6808982515, bundlecom.dmkr.cesta.B2X6D3A9J9, equipoB2X6D3A9J9,
grupo interno0bedf097-fcf7-40bc-a367-949b900c4883. App Store1.2 permanece en
PREPARE_FOR_SUBMISSION. Firma existente en entornoapp-store-production restringido
a main. Repo PUBLIC conforme a excepción humana específica de Cesta; runner
estándar macos-26 sin plan/gastos nuevos, sin caché automático; cero artefactos
remotos conservados antes de iniciar y retención nueva de1día.

Versión1.5 conserva la línea histórica1.x ya usada en Apple; no se degrada a0.x.
Build1 por ser la primera compilación distribuida de1.5. Incluye guardar compras
en Listas, AdMob/UMP con banner de prueba, suscripciones opcionales desde Ajustes,
valoración nativa y recordatorio de apoyo desactivable cada14días como máximo.
La valoración nativa está desactivada en TestFlight. Compras en sandbox de Apple,
no cobros reales; productos aún no aprobados y captura de revisión pendiente.
No se afirma que StoreKit proporcione ya todos los precios sin comprobar en iPhone.

Validación previa: iOS simulador sin firma CI39075842510, TypeScript,19pruebas,
62checks web ES/EN,3cloudUI locales y paquete Hermes784módulos correctos en el
encargo anterior. Cambios de esta entrega limitados a autorización, notas para
testers y auditoría del IPA adaptada al SDK publicitario real.

La auditoría del nuevo IPA debe comprobar identidad/versión/build, SHA/ZIP,
arm64/firma/perfil, HTTPS, permisos, appID propio de AdMob y unidad oficial de
prueba, manifiestos Google/UMP preservados y presencia del módulo CestaCommerce.
No confundir manifiesto propio sin tracking con ausencia de datos de terceros.

Evidencia actual: `artifacts/testflight-20261019/apple-preflight.json` y ficha
PR-016 revisión24 leída. Última distribuida sigue1.4(1) hasta procesar y releer
la nueva por API. Registrar CI, commit, entrega, grupo, localizaciones y hash al
completar. QA física queda pendiente; no es un requisito que pueda simularse con
las comprobaciones de navegador o inventario del IPA.

Fuentes actuales comprobadas: [subidas Apple](https://developer.apple.com/help/app-store-connect/manage-builds/upload-builds/),
[compras en TestFlight](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testing-subscriptions-and-in-app-purchases-in-testflight)
y [CI estándar pública](https://docs.github.com/en/billing/concepts/product-billing/github-actions).
