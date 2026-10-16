# Referencias visuales de Cesta

## Tutorial y alternativas UI/UX — 2026-10-16

El usuario encarga implementar el tutorial y ofrecer alternativas con ChatGPT
Imágenes para escoger. Tutorial delegado implementado manteniendo el estilo:
cuatro pasos, ES/EN, primera apertura y repetición en Ajustes. Capturas web en
`review-20261016/current/tutorial-{1,2,3,4}-{es,en}.png`, 390×844, y prueba pequeña
320×568. Revisión del agente; no aprobación humana posterior ni prueba nativa.

Las ocho alternativas B están en tres láminas de `review-20261016/proposals/`.
**Pendientes de elección, no aprobadas ni implementadas.** A son capturas de la
candidata web actual. El registro de selección en la comparativa pertenece solo
al navegador y debe confirmarse en el chat. No se toma una selección de QA como
elección humana. Auditoría, pruebas y límites en `review-20261016/AUDITORIA.md`;
SHA-256 en `review-20261016/manifest.json`. Se conserva todo el historial previo.

## Idioma automático y compra actual — 2026-09-05

Implementación dentro de la delegación del usuario, sin rediseñar la interfaz compacta. Estados: bienvenida sin selector ni textos retirados; compra Semanal con dos habituales y dos extras marcados «Solo esta compra»; biblioteca Semanal con solo dos habituales. Referencias ES/EN en `approved/onboarding-device-{es,en}.png`, `approved/purchase-extras-{es,en}.png` y `approved/saved-regular-{es,en}.png`. Chrome 390 × 844, revisión del agente; no aprobación posterior del usuario ni prueba nativa. Se conservan referencias anteriores. Registro SHA-256 completo: `../artifacts/PURCHASE-VISUAL-HASHES.json`.

- Bienvenida ES: 53F2810265B3F63E2AC2EE95C2EBB8CE593991AC2401B2639C39D66F2F934861.
- Bienvenida EN: 905CBE5F8565702BDE1784A5C24D7A92EFBDEB54B519A0A9E3C84365BAE53688.
- Compra ES: 9AF9317D9D3F6A8EDFE4B3B3059B66A1A489380D2968FD3C54AB3AEA492D1536.
- Compra EN: 3DB7B76C758B4547FEC6ACF08315DB96DAE17B2FFE08379C81C16CC4E07830C4.
- Guardada ES: 6AD06F9FFAE8B7C4529C3E37423BA97E91A9CE7A75027F9672EA484A9FC44BDD.
- Guardada EN: 44FCA7A0791098D1C5C34B9CC1EC6B373DB521E8A8DE1CD0B8409CF08B33D9C9.

## Autocompletado de productos — 2026-09-05

El usuario pidió coincidencias seleccionables al escribir en «Añadir producto», como en Productos, y mantiene delegadas las decisiones de implementación. Se conserva el diseño compacto elegido previamente. Esta referencia registra la implementación revisada por el agente dentro de esa delegación; no implica una revisión posterior del usuario ni una validación nativa.

- Estado: lista Noche de pasta / Pasta night, texto «pasta», catálogo desplegado sobre el campo, cinco productos existentes.
- Entorno: Chrome, viewport móvil 390 × 844; idiomas ES y EN; fecha 2026-09-05.
- Fuente: commit de compilación `9d7af0cb9c6b6803aa5642ac22f5887a32142c97`.
- ES: `approved/autocomplete-es.png`; SHA-256 `13D7EB30B4659F041C4673D9E9B336713157E95645583358CCEAFE0834A98E03`.
- EN: `approved/autocomplete-en.png`; SHA-256 `BD539A5059C67A8F31033427AED26B4D4A04790C5FFC4A8B5B10105CFF5B7F7E`.

Comparación visual realizada: misma tipografía y colores, imágenes del catálogo, nombre/categoría/unidad y botón de adición. La zona de coincidencias tiene altura limitada y desplazamiento independiente. No tapa el campo ni la navegación inferior. El teclado físico de iOS queda pendiente de validación en el dispositivo.

## Listas guardadas y productos genéricos — 2026-09-05

Implementación dentro de la delegación visual vigente y la petición expresa del usuario. Se conserva el diseño compacto, con botón +/× Inicio en cabecera, filas de biblioteca sin casillas y categorías sin flechas. Inspección del agente en Chrome, 390 × 844, ES/EN; no implica validación del teclado o VoiceOver en dispositivo físico.

- Estado ES: Noche de pasta guardada, cinco productos y botón + Inicio. `approved/library-preparation-es.png`; SHA-256 `98DB544235F0C83D413BBD366CAD8EA1077A487E5759589C92427DB1D27FEBB3`.
- Estado EN equivalente: `approved/library-preparation-en.png`; SHA-256 `55BEF6D884576A34680A34B686EFDD86E79A5C5184C04B2956503010ABC85FBE`.
- Productos EN, búsqueda Fish, lista de destino Pasta night y categorías sin flechas: `approved/generic-products-en.png`; SHA-256 `F5ECDF638DF65A699DD16D311E64E11AC930B7B4DEDD5E101F8205B3C5247077`.
- Fuente: `77e0901f37a36437895f2bce93841240ccacdde7`.
