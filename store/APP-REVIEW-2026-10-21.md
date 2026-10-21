# Cesta1.5.1 — preparación de revisión

Preparación digital completada y releída21/10/2026 (Madrid).
La prueba física sigue pendiente. No equivale a envío, aprobación ni publicación.
Autorización: dejar la app y su ficha definitivas para poder enviarlas a revisión;
se conserva la publicación manual y no se ejecuta el envío final.

## Estado comprobado

| Elemento | Evidencia y estado |
| --- | --- |
| Ficha | App6808982515, versión a3c47237-d259-4f39-8174-f7f332c67324,1.5.1/READY_FOR_REVIEW/MANUAL. Relectura API20/10UTC,21/10Madrid. |
| Castellano | Cesta: Lista de la compra · Prepara, guarda y compra. |
| Inglés | Cesta: Grocery Shopping List · Prepare, save and shop. |
| Descripción/notas | ES/EN, funciones reales, compras independientes de guardadas, nube opcional, anuncios y suscripciones mensuales equivalentes, EULA de Apple. Guardadas y releídas. |
| Datos de revisión | Contacto privado completo reutilizado, sin cuenta demo. No se publica el contacto privado en este repositorio. |
| Descarga y disponibilidad | Gratis,174territorios, China continental no disponible, sin expansión automática. Aprobación humana específica y relectura API. |
| Edad/categorías | Cuestionario completo: publicidad, referencias infrecuentes a alcohol por el catálogo; demás categorías negativas. Shopping/Productivity. |
| Acuerdos | Acuerdos gratuito/de pago, fiscalidad y DSA activos comprobados; ningún contrato nuevo aceptado. |
| Privacidad Apple |12tipos publicados; diagnósticos no vinculados ni seguimiento, seguimiento solo IDdispositivo. Incluye Funcionalidad para ubicación/interacción/rendimiento UMP. Correcciones y aviso legal confirmados expresamente y publicación releída. APP-PRIVACY-2026-10-21.md. |
| Política pública | https://krazel.github.io/cesta/privacy/ · commite87f999fe72adc6ed06ef5bbb8dfa61bfd7982df · SHA256f2128e1af2d50c20a5fa88e8b969e2f652317f47a26075f8f6a4dadfdbfbd715. Acceso público y contenido exacto comprobados, incluyendo finalidad UMP. |
| Soporte/EULA | https://krazel.github.io/cesta/support/ y EULA estándar Apple. Acceso comprobado; mismos enlaces en app y ficha. |
| Anuncios | Google Mobile Ads12.14.0/UMP3.1.0, banner propio, UMP/TCF+ATT, NPA/RDP fuera de consentimiento verificable, clasificación general. Aprobación Google pendiente de listado público; no declarar anuncios activos. |
| Suscripciones | Grupo22489005;6productos1,99/4,99/9,99/14,99/19,99/24,99€/mes, mismo beneficio. Locales/precios/notas completos y6capturas de revisión Apple COMPLETE. Todos READY_TO_SUBMIT, sin enviar/aprobar. La misma captura iPad nativa muestra los seis precios y todas las condiciones; SHA25690f81419bc1b733b1f5d031d57f8be6ce754a10a1f2b013928a75bfc39fd5d67. |
| Binario | Candidata1.5.1(3) subida, CI39511438120 correcta, fuente dba5c2219dd6b437d3cb0b3f6b541cd1987f8cbd. IPA12687010bytes, SHA25602753352a6829f630e804f5e2de9d809d511f7091afd86fb712a7a8a499d6fe7. Firma/arm64/HTTPS/permisos/perfil/13manifiestos comprobados independientemente, incluidos GMA y UMP exactos. Apple VALID/entrega COMPLETE sin avisos, seleccionada en borrador manual. Build99810cf0-04e7-4a7a-bb72-0ecba5bf5e74, sin grupos beta. Candidatas(1)/(2) canceladas. Última beta distribuida1.5(1), interna. |
| UI aprobada | B1–B8 conservadas. Correcciones de teclado y formularios sin rediseño. Capturas finales deben proceder del simulador de la misma candidata; ninguna imagen conceptual sustituye al runtime. |
| Lógica/consentimiento |19tests de lógica y19aserciones del Swift real de consentimiento pasan. No equivalen a consentimiento o transacciones en iPhone físico. |
| QA web | Nombre Alex preservado, importación/edición7→8productos, título conservado, cantidades y marcado13% correctos; flujo inglés7productos correcto. Export local de dba5c22. Sin despliegue de la web pública. |
| QA nativa |6recorridos correctos: ES/EN en iPhone17ProMax CI39515832517, iPhone17Pro CI39516687846 e iPad13M5 CI39512770525. Texto completo, importación, marcado, compra local, persistencia, caducidad y restauración pasan. Equivalencia del código comercial comprobada por Git: solo cambia harness/workflow. Incidencias de XCTest y límites físicos documentados en NATIVE-QA-2026-10-21.md. |
| Capturas |24capturas de galería Apple COMPLETE:4por idioma ES/EN y tamaño (iPhone grande, mediano Dynamic Island e iPad13).6recursos de revisión de suscripciones COMPLETE usan una captura iPad completa. El helper copia PNG nativo sin cambiar píxeles y conserva procedencia/SHA. Galería usa entitlement local verificado para que la app retire su banner. |
| Envío | Borrador c698d1c3-99bc-4083-849e-4d8c2bda35fe READY_FOR_REVIEW,8elementos: app+grupo+6versiones de suscripción. submittedDate vacío, sin envío. Todos los elementos releídos por API. No establecer submitted:true sin un encargo de envío. |
| QA física | Pendiente de prueba en iPhone de consentimiento, teclado y compras Sandbox/TestFlight. Esta sesión no controla un iPhone físico; no se declara una prueba que no ha ocurrido. |

## Evidencias locales

`artifacts/app-review-20261020/` conserva auditorías API, recibos comerciales,
de política y privacidad, capturas de la etiqueta publicada y QA web. El subdirectorio
`private/` contiene el contacto completo de Apple y no se publica.
CI/macOS estándar pública según excepción específica de Cesta13/10, entorno de
firma protegido existente. Sin gastos nuevos, testers externos ni cambios de otras apps.

Antes del envío real, releer esta tabla frente al IPA exacto y los estados de Apple.
Una build local, READY_TO_SUBMIT o READY_FOR_REVIEW no implica envío ni aprobación.

Comprobación cruzada correcta: `store/release-evidence/1.5.1-build3.json`.
Capturas originales y procedencia: `store/screenshots/1.5.1/provenance.json`.
Recorridos y límites: `store/NATIVE-QA-2026-10-21.md`.
La candidata no se ha añadido a grupos TestFlight. Última distribuida1.5(1) interna.
