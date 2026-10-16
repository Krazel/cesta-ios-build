# Cesta: tutorial y revisión UI/UX — 16/10/2026

Actualización posterior del mismo día: el usuario eligió expresamente B1–B8.
Las ocho propuestas están implementadas en candidata local. «Volver a usar» se
aclara como «Empezar otra compra». Informe y evidencia posteriores en
`../implementation-20261016/README.md`. El resto de este documento conserva la
auditoría y la situación de las propuestas antes de esa elección.

Encargo del usuario: tutorial en primera apertura y recuperable desde Ajustes;
revisar cada página y ofrecer una alternativa de ChatGPT Imágenes donde convenga,
para elegir entre actual y propuesta. La elección visual sigue pendiente.

## Implementado

- `src/Tutorial.tsx`: cuatro pasos sobre Listas/Inicio, añadir/buscar/pegar,
  extras de esta compra frente a habituales, y compartir entre dispositivos.
- Idioma ES/EN automático mediante el idioma existente de Cesta. Sin un selector
  inicial ni dependencias nuevas. Anterior, Siguiente, Omitir y finalizar.
- `tutorialSeen` se guarda en el mismo almacenamiento local serializado que los
  datos. Completar u omitir evita repetirlo. Repetirlo desde Ajustes no modifica
  listas, productos, permisos ni la pestaña seleccionada.
- Las instalaciones ya incorporadas que carecen del campo se migran como vistas:
  mantienen su apertura habitual y pueden acceder al tutorial desde Ajustes.
  Las instalaciones nuevas lo ven antes del nombre opcional. Borrar los datos
  reinicia la primera apertura. Una invitación recibida se conserva durante ambos.
- Contenido desplazable con acciones inferiores, safe areas, controles con
  etiquetas, títulos y anuncio del número de paso. No animaciones ni red.

## Revisión por pantalla y decisión propuesta

| Página / ventana | Evaluación | Alternativa |
| --- | --- | --- |
| Inicio vacío | Clara orientación y acceso a Listas; pegar texto y crear están a mano. | Conservar. |
| Inicio con compras | Filas compactas; sigue funcionando al crecer el número de listas. | Conservar. |
| Listas guardadas | Prioridad media: cuatro tarjetas fuerzan desplazamiento; botones repetidos y borrado muy expuesto. | B1: filas compactas, estado y acción de Inicio; borrado en menú con confirmación. |
| Detalle de lista guardada | Distingue preparación de compra: no hay casillas y no se muestran extras puntuales. | Conservar. |
| Compra | Buen aprovechamiento del espacio, porcentaje y tamaños. Prioridad media: toast de adición puede cubrir el campo inferior durante varios segundos. El check genérico también se usa al notificar errores. | B8: misma composición, feedback corto en zona ya existente; distinguir éxito/error, sin ocultar fallos de sincronización. |
| Autocompletado y catálogo dentro de lista | Coincidencias seleccionables; composición acotada. Lista larga de categorías difícil de descubrir, igual que en Productos. | Aplicar el patrón de selector B2 al catálogo interior si se elige. Conservar sugerencias y foco. |
| Productos | Prioridad media: categorías lejos de las tres primeras quedan fuera de vista; carrusel poco evidente. Destino y alcance requieren lectura atenta. | B2: filtros principales y categoría explícita; destino visible y estado junto al producto. |
| Crear / editar producto | Prioridad media: foto opcional antecede al dato principal; chips de categorías ocupan casi toda la ventana. | B5: nombre primero, foto compacta y categoría en selector. En edición de producto de lista conservar cantidad, unidad, nota y alcance. |
| Pegar texto / previsualización | Prioridad media: destino, nombre e instrucciones desplazan los productos detectados. Acción final queda abajo. | B4: jerarquía texto → revisión → acción, destino compacto. No usar IA ni red para analizar. |
| Nueva lista / editar nombre y color | Flujo sencillo, nombre y personalización identificables; guardar y activar son distintos. | Conservar. |
| Opciones de lista | Prioridad media: filas altas, opciones de uso frecuente se mezclan con limpieza. | B7: grupos Compra / Organizar / Limpieza, manteniendo objetivos táctiles y confirmaciones. |
| Compartir / mis dispositivos | Prioridad media: tarjeta decorativa y dos botones para recorridos equivalentes; revocación mostrada incluso antes de crear invitaciones. | B6: una acción, explicación breve y participantes. Tras crear, presentar enlace/código, compartir/copiar y revocación. |
| Unirse | Campo único acepta enlace o código y explica acceso compartido. | Conservar. |
| Ajustes | Prioridad media: preferencias antes del título, titular grande y muestra de tamaño relegan ayuda/datos. Footer fijo v1.0 está desactualizado respecto a app.json 1.2.1. | B3: título al inicio, grupos y preferencias como filas; muestra de tamaño dentro de su ventana. Versión obtenida de configuración, no literal. |
| Tamaño | Tres opciones y muestra comprensible. | Conservar el componente dentro del acceso propuesto B3. |
| Perfil | Campo único, nombre visible para colaboradores. | Conservar. |
| Privacidad | Texto completo desplazable, contenido concreto sobre local/nube, invitaciones y copias. | Conservar; no sustituir obligaciones por solo una frase visual. |
| Copias y borrado | Exportar/importar mantiene copias privadas; borrado explica alcance y requiere confirmación. | Conservar lógica, textos y protecciones. No se ha hecho un borrado real ni alterado datos de producción. |
| Bienvenida | Idioma automático, nombre opcional y una acción. | Conservar tras el tutorial. |
| Tutorial | Implementado con navegación/omisión/repetición y desplazamiento a 320 px. | Revisado en navegador; prueba nativa pendiente. |

## Imágenes y comparación

`index.html` permite elegir A o B por pantalla, guardar la selección solo en ese
navegador y copiarla al chat. No cambia la aplicación ni llama a servicios.
Ocho opciones repartidas en tres láminas generadas con la herramienta integrada
de ChatGPT Imágenes, usando las capturas actuales como referencia de marca.

- `proposals/B1-B3.png`: Listas, Productos, Ajustes.
- `proposals/B4-B5.png`: Pegar lista, Crear producto.
- `proposals/B6-B8.png`: Compartir, Opciones, Compra.
- `current/`: capturas reales de la candidata web en ES/EN, incluidas las cuatro
  pantallas del tutorial. Datos sintéticos Alex/Semanal; no datos de clientes.

Son propuestas, no pantallas funcionales ni aprobaciones. Se mantiene la paleta,
tipografía y compactación ya elegidas. Al implementar una elección, todos los
datos seguirán siendo dinámicos: B1 «Abrir compra» solo para activas; B4 un único
CTA principal por fase (Preparar, después Añadir); B6 estado previo y posterior
a invitación. Ilustraciones y unidades de las maquetas son ejemplos. B8 muestra
el estado estable; el feedback breve aparece solo tras una acción.

## Verificación y límites

- `npm run typecheck`: correcto.
- `npm run build:web`: exportación correcta.
- `node scripts/verify-tutorial-ui.mjs`: 17 comprobaciones por idioma, ES/EN;
  primera apertura, anterior/siguiente/finalizar, omitir, repetir, persistencia,
  migración de usuario existente e invitación conservada. También fotos reales
  reducidas, pegar texto, sugerencias, porcentaje, extras frente a habituales,
  reutilización, contexto entre pestañas y viewport reducido. Cero peticiones API
  de listas personales y cero errores de ejecución. Recibo `ui-receipt.json`.
- `npm run test:cloud-ui`: 3/3 correctas con Worker/SQLite locales: compartir
  entre contextos, cambios simultáneos, recuperación offline, shell offline y
  migración de listas previas sin subida. Una primera ejecución falló porque el
  helper de test esperaba una pestaña oculta por el diálogo de invitación; se
  corrigió el helper para reconocer el diálogo. La siguiente ejecución pasó.
- Para capturas se sirve el exportado desde disco bajo HTTPS interceptado en
  Playwright. Un host HTTP ficticio no proporciona Web Crypto seguro; no usar su
  error de inicialización como evidencia sobre la app HTTPS real.
- Las capturas pequeñas tienen 320 × 568; las demás 390 × 844. No son capturas de
  TestFlight ni evidencias de teclado nativo, VoiceOver o escucha física.

No nueva IPA, build nativa, TestFlight ni despliegue web por este encargo. Última
distribución: 1.2.1 (1) interna del 13/10. Tutorial candidato local. Las propuestas
B solo se aplicarán después de la elección del usuario.
