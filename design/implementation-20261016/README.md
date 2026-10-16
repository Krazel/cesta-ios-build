# Cesta — implementación de las ocho propuestas elegidas

Fecha: 16/10/2026. Autorización humana: elección explícita B1–B8 en el chat Lista
compra. Se conservan las tres láminas originales y las capturas anteriores.

| Referencia elegida | Implementación |
| --- | --- |
| B1 Listas | Filas compactas con emoji, nombre, cantidad y estado. Activar/abrir compra y menú. Borrado dentro de opciones, manteniendo confirmación. Inicio conserva sus filas compactas previas. |
| B2 Productos | Tres filtros principales, selector visible de categoría con todas las opciones desplazables, destino y alcance de compra visibles. Añadido temporal junto al producto; adición repetible. Mismo selector en catálogo de una lista. |
| B3 Ajustes | Cabecera, perfil y grupos Preferencias / Ayuda / Tus datos. Idioma y muestra de tamaño dentro de sus ventanas. Borrado separado y versión leída de Expo. |
| B4 Pegar lista | Destino compacto, texto y revisión de productos. Nombre de nueva lista junto a la acción. Una sola acción principal por fase; excluir productos y volver a editar. Análisis local sin IA ni servicios nuevos. |
| B5 Producto | Nombre primero, foto opcional compacta, unidad libre con opciones comunes, categoría, icono y muestra. Edición en lista conserva cantidad, nota de 300 caracteres y alcance extra/habitual. Las miniaturas repetidas de la muestra son decorativas para accesibilidad. |
| B6 Compartir | Una acción Crear invitación, explicación breve de nube y otros dispositivos, participantes y caducidad. Tras crear, copiar/compartir/revocar como antes. Estado pendiente de conexión separado de sincronización ya activada; sin revocación antes de publicar. |
| B7 Opciones | Compra / Organizar / Limpieza, filas compactas y acciones destructivas con confirmación. Propietario y participante conservan sus permisos distintos. |
| B8 Compra | Composición compacta y porcentaje conservados. Confirmación de adición dentro de la zona de progreso, sin tapar el campo inferior. Errores diferenciados y legibles. Fuera del detalle, avisos ocupan una zona propia, no superpuesta. |

## «Empezar otra compra»

Aclara la antigua acción «Volver a usar». Por ejemplo, para hacer otra vez la
compra semanal, desmarca los productos habituales y retira los añadidos «Solo
esta compra». Mantiene la lista y sus habituales, y la activa en Inicio. Si hay
progreso o extras, pide confirmación y explica el alcance para participantes.
Quitar del inicio solo retira esa compra de Inicio: conserva productos y progreso.

No se ha cambiado el reductor de listas, motor de sincronización ni formato de
datos por este rediseño. El tutorial y las invitaciones de primera apertura se
conservan. Los nombres introducidos por personas no se traducen en los selectores.

## Verificación

- TypeScript y exportación web correctos.
- `scripts/verify-redesign-ui.mjs`: 25 comprobaciones por idioma (ES/EN), capturas
  de las ocho pantallas, tutorial, fotos JPEG reducidas, cantidades, extras,
  reutilización, categorías lejanas, nombre antes de foto, idioma/tamaño,
  teclado web reducido y ancho de 320 px. Cero errores de ejecución.
- Listas personales: cero llamadas API antes de pedir compartir. El caso de
  invitación con servidor simulado sin conexión inicia únicamente las peticiones
  de publicación expresamente solicitadas, incluidos sus reintentos. No confundir
  esas peticiones autorizadas con uso de nube por listas personales.
- `npm run test:cloud-ui`: tres pruebas con Worker/SQLite reales locales correctas:
  deltas entre dos contextos, cambios simultáneos, reconexión, recuperación offline,
  shell sin conexión y migración de datos previos. No producción ni dispositivos
  físicos. No se ha cambiado el backend.
- Vista local servida verificada: tutorial, listas guardadas y Ajustes nuevos.
- Revisión visual del agente contra B1–B8: paleta, serif, jerarquía, filas y
  agrupación conservadas. Las unidades, estados y textos son reales/dinámicos;
  no se reproducen inconsistencias ilustrativas de la maqueta.

Recibo y SHA-256 en `ui-receipt.json`; capturas en `screenshots/`; referencias
elegidas y texto de autorización en `approval.json`. La comparativa anterior
permanece como historial. El primer ensayo de UI encontró una miniatura duplicada
para lector de pantalla y se hizo decorativa; otro corrigió la expectativa del
test sobre reintentos tras solicitar compartir. La ejecución final ES/EN pasó.

## Distribución

Candidata local. Sin nueva IPA, compilación nativa, TestFlight ni despliegue web.
Última distribución: 1.2.1 (1) interna del13/10. Teclado/gestos/VoiceOver y fotos
en iPhone físico quedan pendientes para una futura beta expresamente solicitada.
La vista local `preview-local.mjs` sirve listas personales; las pruebas de nube
se ejecutaron con el servidor local de pruebas, no desde esa vista estática.
