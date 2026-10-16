# Cesta — TestFlight del tutorial y diseños B1–B8

Autorización: petición humana expresa «súbelo a TestFlight», después de elegir las
ocho propuestas. Versión nueva **1.3 (1)** por tutorial y cambios de pantallas y
flujos; se conserva la línea 1.x heredada sin degradarla a 0.x. No publicación
comercial ni beta externa. App Store 1.2 permanece en preparación.

Preflight Apple 16/10: Bundle ID com.dmkr.cesta.B2X6D3A9J9, app6808982515;
1.2.1(1),1.2(1),1.1(2) VALID, sin1.3. Grupo interno existente
0bedf097-fcf7-40bc-a367-949b900c4883, tester INSTALLED para la app existente.
No interpretar esa instalación como QA física de esta candidata.

Fuente: c3616ea1506038fb7fc662fba765cc7234951011. CI manual
https://github.com/Krazel/cesta-ios-build/actions/runs/38926116655.
Repositorio PUBLIC y permisos/entorno app-store-production comprobados por API.
Se reutilizan seis secretos protegidos existentes; sin transferencias nuevas,
planes, runners grandes ni gasto activado. Runner estándar macos-26.

Incluye tutorial de primera apertura/repetición, biblioteca compacta, filtros y
categorías explícitos, Ajustes agrupados, importación y formulario renovados,
invitación unificada, menú agrupado y feedback en cabecera. «Empezar otra compra»
desmarca habituales y retira extras, con confirmación si procede. Quitar de Inicio
conserva progreso. Los datos y motor de nube no cambian.

Verificación previa: TypeScript, cincuenta comprobaciones web ES/EN y tres
pruebas compartidas locales correctas, más comprobación del enlace de candidata.
CI repite TypeScript, texto y motor de sincronización antes de archive/firma y
validación/subida con altool. No afirmar disponible hasta VALID y grupo releído.
Prueba de iPhone físico pendiente.

Evidencia de esta subida: artifacts/testflight-20261016/. Se conserva la entrega
1.2.1(1) y su carpeta. Los metadatos1.3 están preparados localmente; no se cambia
el borrador de App Store por este encargo. Biblioteca PR-016 actualizada/releída
al iniciar en revisión19; cierre con lectura fresca después de validar la beta.

## Entrega completada

CI38926116655 correcto. altool aceptó la transferencia sin errores,
Delivery UUID/buildID **ea746207-c9c3-479b-ab7c-a22b9f10ac5b**. API de
buildUploads devuelve COMPLETE sin errores ni avisos. Apple marca **1.3 (1)
VALID**, expired=false. Notas ES/EN guardadas y releídas; asignación al grupo
interno existente comprobada; **IN_BETA_TESTING**, autoNotifyEnabled=true.
Externo READY_FOR_BETA_SUBMISSION, sin activarlo. Última lectura conserva todas
las betas anteriores y App Store1.2 PREPARE_FOR_SUBMISSION.

IPA: artifacts/testflight-38926116655/Cesta-1.3-build1-TestFlight.ipa,
**11.235.962 bytes**, SHA-256
**ed1137ef1c92ef1173de8458451354735aafacf7ca81a7699da6b52aaca1ca43**.
Verificación independiente: ZIP/CRC122 entradas, arm64 físico, identidad/versión,
perfil y caducidad, iPhone/iPad, iOS mínimo16.4, Xcode26.6/SDK26.5, HTTPS y
marcadores del tutorial/nueva interfaz dentro del bundle. Diez manifiestos de
privacidad sin tracking; permisos de Face ID/cámara/micrófono/LAN ausentes.
Firma verificada por codesign en CI. No equivale a probar interfaz o teclado en
un dispositivo físico.

Recibos: apple-complete.json, upload-status.json, final/apple-preflight.json y
source-receipt.json en artifacts/testflight-20261016/; ipa-verification.json y
testflight-build.json junto al IPA. Fuente exacta c3616ea1506038fb7fc662fba765cc7234951011.
Repositorio PUBLIC conservado. No App Review, externos ni despliegue web.

Biblioteca PR-016 actualizada y releída en revisión20, versión1.3/build1 y
TestFlight Interno, conservando tracking y campos ajenos. Recibo
artifacts/testflight-20261016/library-updated.json. Entrega cerrada; siguientes
pasos son prueba física y preparación comercial, no otra subida automática.
