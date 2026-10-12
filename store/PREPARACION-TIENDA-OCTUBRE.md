# Cesta — paquete local de preparación, 12/10/2026

No es un envío a Apple. Ficha6808982515 y última beta1.2(1) interna; no revisión/página pública App Store acreditada. En esta sesión Apple, Cloudflare y biblioteca fallan ENOTFOUND. No se cambia distribución ni se selecciona/repite un binario. Soporte/privacidad ya migrados por cerebro, seis URLs releídas en su recibo.

## Fuente e inventario de datos

Revisados App.tsx, src/store.ts, photos.ts, syncEngine.ts, cloud/worker.mjs, dependencias y el IPA entregado con SHA256790680d0…a98a. Diez manifiestos de privacidad, sin NSPrivacyTracking ni datos recogidos declarados por esos manifiestos; no significa que la app no recoja datos: el backend de listas compartidas sí conserva datos. Inventario completo del IPA en artifacts/qa-october/delivered-ipa-inventory.json. No acredita un binario nuevo ni escucha/prueba física.

| Dato real | Local / transmisión | Propósito y control |
|---|---|---|
| Listas, cantidades, notas y marcado de compra | Personales locales; Cloudflare solo opt-in por compartir/vincular | Funcionalidad; borrar lista/copia local/exportar |
| Fotos elegidas | JPEG comprimido hasta60.000 caracteres; solo viaja con lista opt-in | Identificar producto; quitar foto; no acceso a toda la galería |
| Nombre visible | Local; compartido como participante/addedBy | Atribuir cambios; no se requiere nombre legal |
| Credencial aleatoria de instalación | Keychain iOS / almacenamiento web; autorización HTTPS/WSS | Acceso; servidor deriva identificador hash, no contraseñas/correos/contactos |
| IDs de operaciones, participantes e invitaciones | Compartidas en servidor | Evitar duplicados, permisos; revocar y borrado |
| Conexión/IP/cabeceras del proveedor | Servicio Cloudflare y descarga web | Operación/seguridad; confirmar retención real antes de declaración final |

No SDK de anuncios, analítica, pagos, contactos, ubicación ni salud en el código revisado. La candidata desactiva la descripción Face ID añadida por SecureStore, elimina texto LAN localizado y conserva fotos. Introspección Expo TestFlight verificada; no requireAuthentication en los accesos a SecureStore. El IPA1.2(1) conservado aún contiene descripción Face ID, aunque Cesta no usa autenticación biométrica. La próxima build debe revalidar permisos y manifiestos del archive exacto.

Propuesta de App Privacy para conciliar con el formulario real: Other User Content (listas/notas), Photos or Videos (solo fotos elegidas), identificador de usuario/instalación y nombre visible según clasificación de Apple; funcionalidad y vinculados a participante/instalación, sin tracking. Evaluar Purchase History para el marcado de productos comprados y la categoría exacta del identificador sin duplicar tipos por precaución. Confirmar datos/retención de Cloudflare. No declarar «datos no recogidos» ni anónimos solo por no tener login: el hash identifica al participante. Aún no se han guardado respuestas en Apple. [Criterios oficiales de privacidad](https://developer.apple.com/app-store/app-privacy-details/), consultados12/10.

## Edad y contenido

Cuestionario pendiente de lectura por API y guardado/relectura. Catálogo incluye cerveza/vino: propuesta alcoholTobaccoOrDrugUseOrReferences INFREQUENT_OR_MILD, sin promover consumo. Sin violencia, sexualidad, gambling, loot boxes, salud médica, publicidad ni navegador integrado. No hay feed, descubrimiento social ni distribución pública de fotos/texto; compartir listas privadas por invitación no es por sí solo socialMedia. Evaluar userGeneratedContent frente a la definición de distribución amplia y messagingAndChat frente a la edición colaborativa de notas; justificar la respuesta con el recorrido real, no copiar otro producto. Sin Kids category ni control parental/age assurance implementados. No inventar el rating calculado. [Definiciones Apple](https://developer.apple.com/help/app-store-connect/reference/app-information/age-ratings-values-and-definitions), consultadas12/10.

## Capturas y metadatos

release-metadata.json conserva ES/EN, URLs públicas y descripción existente; notas de revisión corrigen la referencia obsoleta a TestFlight1.1(LAN). Borrador solo local, no PATCH Apple realizado. La futura entrega debe llevar versión/build nueva cotejada por API; no volver a subir1.2(1).

Capturas web QA en artifacts/qa-october con hashes y procedencia offline-static-browser. Son evidencia de interfaz, no capturas nativas para subir. Mantener referencias design/APPROVALS.md. Plan nativo ES/EN: compra con progreso y extras; Listas con habituales; catálogo con foto de ejemplo; importación de texto; compartir con nombres/códigos de prueba. Sin datos personales ni invitaciones activas reales en material de tienda.

Dispositivos requeridos por la [tabla Apple vigente](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications): iPhone Dynamic Island tamaño medio y iPad 13 por supportsTablet. Usar capturas reales de un dispositivo admitido, por ejemplo iPhone 1179×2556 o 1206×2622 e iPad 2064×2752 o 2048×2732. PNG/JPEG sin transparencia. No escalar imágenes web para aparentar captura nativa. Grabar versión/build y comparar con referencias antes de subida.

## Pendientes que bloquean publicación

API: revisar estado/versiones/grupo/tester, edad, derechos, privacidad, contactos/URLs, capturas y requisitos de cuenta sin aceptar acuerdos ni enviar review. CI: verificar acceso privado, entorno de firma y cuota/budget gratuito antes del input manual; sin gasto ni push desde esta sesión. QA: seguir QA-IPHONE-OCTUBRE.md en dispositivos reales y redes distintas; aceptar invitación interna si sigue pendiente. Después, build expresamente solicitada, QA de binario exacto, capturas nativas y autorización de envío cuando corresponda.

Biblioteca PR-016: activación de octubre acreditada por cerebro. Actualización de esta entrega local pendiente por ENOTFOUND en GET /api/projects; no se escriben exportaciones/semillas para simular D1. Conciliar con revisión fresca y conservar tracking (TestFlight interno, App Store en preparación; anuncios vigentes por releer).
