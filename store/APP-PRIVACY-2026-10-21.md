# Cesta1.5.1 — declaración de privacidad

Corrección autorizada y publicada en App Store Connect el21/10/2026 (Madrid).
La app sigue en preparación para envío; publicar la etiqueta no publica la app.

Se contrastó el código de sincronización y el manifiesto incluido en Google
Mobile Ads12.14.0, no una ficha de otra aplicación ni solo documentación genérica.
UMP3.1.0 gestiona las opciones regulatorias. Las versiones de SDK permanecen fijadas.

| Dato | Finalidad en Cesta | Vinculado | Seguimiento |
| --- | --- | --- | --- |
| Nombre | Funcionalidad: participantes de listas compartidas | Sí | No |
| ID de usuario | Funcionalidad: sincronización privada | Sí | No |
| Fotos o vídeos | Funcionalidad: fotos elegidas de productos compartidos | Sí | No |
| Otro contenido del usuario | Funcionalidad: listas, productos, cantidades y notas compartidas | Sí | No |
| Historial de compras | Funcionalidad: productos marcados como comprados en listas compartidas | Sí | No |
| ID del dispositivo | Publicidad de terceros y análisis del SDK | Sí | Sí, sujeto a permisos |
| Ubicación aproximada | Publicidad de terceros y análisis del SDK | Sí | No |
| Interacción con el producto | Publicidad de terceros y análisis del SDK | Sí | No |
| Datos de publicidad | Publicidad de terceros y análisis del SDK | Sí | No |
| Datos de rendimiento | Publicidad de terceros y análisis del SDK | No | No |
| Otros datos de diagnóstico | Publicidad de terceros y análisis del SDK | No | No |
| Datos de errores | Análisis del SDK | No | No |

Los datos personales de listas solo salen del dispositivo al compartir o usar
una lista en otros dispositivos. No se transmiten productos, fotos, participantes
ni credenciales de invitación a AdMob. Historial de compras describe la compra del
supermercado; no se recopilan tarjetas de pago ni se mantiene un servidor de
historial de transacciones de StoreKit. El entitlement se verifica localmente.

El SDK declara también capacidad para publicidad del desarrollador. Cesta no
implementa campañas propias ni esa finalidad; no se declaró sin evidencia.

Fuente binaria examinada: Cesta1.5(1), SHA256
`c921a6f24dd38b9f9790133e6d762e04b63b18e3c926f5802013590e53d85d8e`.
Manifiesto Google: `GoogleMobileAdsResources.bundle/PrivacyInfo.xcprivacy`, SHA256
`69fb112582fc23fc06c635c961d262a3f7b4b5654d284787491de3000dadf9d2`.
La candidata final debe verificar que conserva ese manifiesto y las versiones.

La app retrasa la inicialización de anuncios hasta completar UMP. ATT solo se
solicita con consentimiento TCF verificable para las finalidades y Google755;
señales ausentes, negativas, malformadas o no actualizadas no permiten
personalización. Fuera de TCF se usan solicitudes restringidas/no personalizadas.
La autorización Apple también debe estar concedida antes de personalizar.
Las funciones centrales no dependen del consentimiento. El contenido publicitario
se limita a la clasificación general. La aprobación comercial de AdMob sigue
pendiente de vincular y verificar el listado público cuando exista.

Prueba local: `artifacts/app-review-20261020/privacy-corrected-published.txt` y PNG.
Se releen12tipos; solo ID del dispositivo tiene seguimiento. Todos los diagnósticos
carecen de vinculación. La publicación expresa precisión/cumplimiento/mantenimiento
confirmados por el usuario para estos datos concretos.

Fuentes: [Apple privacidad](https://developer.apple.com/app-store/user-privacy-and-data-use/),
[Google divulgación de datos](https://developers.google.com/admob/ios/privacy/data-disclosure),
[Apple manifiestos](https://developer.apple.com/documentation/technotes/tn3182-adding-privacy-tracking-keys-to-your-privacy-manifest).
