# Cesta — auditoría de próxima CI privada, 2026-10-12

Alcance: documentación y lectura; sin cambios de workflows, funcionalidad, firma, secretos, builds, tienda ni pushes. Política común: .studio/private-code-ci-policy-20261012.md. Código privado y soporte separado autorizados por el usuario. PR-016 lo concilia el cerebro.

## Vía de compilación conservada

Repositorio Krazel/cesta-ios-build, main. TestFlight: workflow_dispatch manual en .github/workflows/testflight.yml, runner GitHub-hosted macos-26, contents:read, límite45min y entorno app-store-production. npm ci, TypeScript, importación de texto y scripts/build-testflight.mjs; archive Release arm64, firma Apple existente, exportación, validación y subida. Última ejecución acreditada36933000531: Cesta1.2(1), cuando el código aún era público. Retención del IPA/manifiesto1día; sin package-manager-cache de setup-node. La copia entregada se conserva localmente.

Sideloadly: workflow manual sideload-ipa.yml, macos-26, límite45min, comprobación Xcode, IPA sin firma de distribución y artifact1día. No sustituye TestFlight.

## Bloqueo concreto por privatización

Los archivos locales de ambos espejos siguen exigiendo repositorio público. TestFlight contiene `!github.event.repository.private` junto al control de propietario y main; Sideloadly contiene `github.event.repository.private == false`. Para un evento private=true, ambos jobs se omitirían con esa configuración. No se ha despachado una ejecución para demostrar algo deducible de las condiciones. El estado remoto vigente del workflow no ha podido releerse: antes de la siguiente build, obtenerlo por API y conciliar si ya cambió.

No basta con quitar el guard: primero confirmar acceso y gasto permitido. La adaptación futura debe aceptar el repo privado y conservar propietario/rama, disparo manual, firma protegida y aislamiento de PRs. No cambiar visibilidad ni utilizar un repositorio público de apoyo para exponer el código.

## Valores comprobados y desconocidos

| Dato | Estado |
|---|---|
| Visibilidad de código | PRIVATE, recibo del cerebro github-private-20261012-receipt.json |
| Sitio legal | PUBLIC, commitbc505eaf..., HTTP200 y Apple confirmados por recibos |
| Automatización conservada | GitHub-hosted macOS, manual; no vía privada validada todavía |
| Conector GitHub actual | GET de repo privado devuelve404; no se deduce de ello que gh del titular haya perdido autorización |
| CLI gh / API remota | Consultas de repo/permisos/runners/entorno/billing fallan por conexión |
| Permisos vigentes de Actions y lectura de automatizaciones privadas | Desconocidos |
| Plan vigente del titular | Desconocido |
| Minutos/cuota disponible, almacenamiento y caché consumidos | Desconocidos; no se infieren de la cuota genérica de un plan |
| Presupuestos, método de pago y bloqueo del exceso | Desconocidos; no se cambian |
| Entorno app-store-production y secretos accesibles en privado | Desconocidos; existencia autorizada y main verificados antes de privatizar, no equivalen a disponibilidad actual |
| Runners propios disponibles | Desconocidos; no hay un Mac propio acreditado en la documentación de esta entrega |

La [documentación vigente de Actions](https://docs.github.com/en/billing/concepts/product-billing/github-actions) indica que los repositorios privados usan las cuotas de minutos/almacenamiento del plan del titular; el exceso puede facturarse si hay medio de pago. macOS tiene coste distinto de Linux. Presupuesto y almacenamiento deben verificarse antes de usar CI. Los runners propios evitan los cargos de runner de GitHub, pero requieren equipo real y no acreditan ausencia de otros costes.

Según [GitHub Environments](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments), los entornos y sus secretos en repos privados requieren Pro/Team/Enterprise. Con Free, al convertir a privado se ignoran secretos y protecciones del entorno. No se sabe el plan de Krazel: esto es una dependencia por comprobar, no afirmación de que sus secretos se hayan borrado. No trasladarlos ni comprar un plan como parte de esta auditoría.

## Antes de la siguiente entrega expresamente solicitada

1. Leer identidad/permiso del titular y acceso de la automatización al repo privado; Actions habilitadas, rama/main, workflow remoto y política del entorno. Resolver acceso con el mecanismo autorizado, sin exponer ni duplicar credenciales.
2. Consultar plan, consumo de minutos y almacenamiento, límites/presupuesto, precio específico del runner elegido y disponibilidad del entorno de firma. Si no se puede garantizar la ejecución dentro de condiciones autorizadas, conservarla pendiente. No activar gasto.
3. Adaptar y revisar la condición de los workflows cuando corresponda, después de elegir una vía privada compatible. Si el entorno/cuota existente no lo permite, documentar una alternativa con recursos reales, sin dar por disponible un Mac propio ni contratarlo.
4. Verificar Apple para evitar repetir versión/build; la última entrega es1.2(1). Solo entonces ejecutar la nueva build solicitada y registrar su resultado.

Esta auditoría no autoriza ese despacho. Soporte y privacidad ya quedaron separados y no necesitan repetirse por el pendiente de CI. Evidencias de lectura/fallos y conciliación: .studio/support/cesta-private-repo-20261012/ci-audit-receipt.json y local-reconciliation-receipt.json.
