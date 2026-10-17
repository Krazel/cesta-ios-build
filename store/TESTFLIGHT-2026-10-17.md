# Cesta — compras independientes y tutorial conjunto

Petición humana17/10: separar compras de Inicio y listas guardadas, quitar fácilmente
una compra completa o incompleta, actualizar expresamente la guardada desde opciones,
y separar comprados al final incluso por pasillos. Tutorial ES/EN explica copia,
retirada, actualización y compra conjunta con invitación, dispositivos/redes distintas
y cambios offline. Respuesta expresa: «Sí, subir a TestFlight».

Candidata1.4(1), firma/grupo interno existentes; App Store1.2 sigue en preparación.
Repositorio PUBLIC verificado por API bajo excepción humana de13/10; macos-26
estándar. No App Review, externos ni gastos nuevos. Preflight Apple conserva1.3(1)
VALID y grupo interno; no afirmar entrega de1.4 hasta procesado y relectura.

Modelo: purchaseSources se guarda solo en el dispositivo, nunca en la nube.
Cada copia tiene IDs de lista/productos nuevos, propietario local, productos
sin marcar, cantidades/notas/fotos conservadas. Compartir requiere acción expresa.
Actualizar lista copia todo el contenido sin estado comprado; no cambia la compra.
Retirar una compra privada la elimina; una compartida se oculta solo aquí, sin
borrar a los demás ni perder sus cambios pendientes. Las guardadas no se alteran.
La migración conserva IDs y progreso de compras/nube/cola previos, crea una copia
privada reutilizable sin extras antiguos y marca la versión en el mismo guardado.
Backup conserva enlaces/tipo/actividad y los remapea a nuevos IDs al importar.

Evidencia QA: artifacts/ui-purchases-20261017; pruebas cloud locales separadas.
No equivale a QA física iPhone. No se despliega la web pública en este encargo.

## Entrega verificada

17/10/2026: **Cesta1.4(1) disponible en TestFlight interno**, Apple VALID e
IN_BETA_TESTING. Build68e9e8f8-88ac-455e-be6a-7d21928d375d, notas ES/EN y grupo
existente releídos. CI39051045729, fuente f8657aae745ba852b3970716b728342a608838fd.
Compras de Inicio separadas de Listas guardadas, copias con progreso independiente,
actualización expresa desde opciones, retirada fácil y comprados separados al final
incluso por pasillos. Tutorial ES/EN explica también compartir compras por invitación.
IPA11.238.653bytes, SHA2561ee8d7af1f04531a244bcfa71553246c2d7d881762965a83f99cc02fef229e28.
Firma/identidad/arm64/HTTPS/permisos/perfil comprobados. Quince pruebas de texto,
modelo y sync,56comprobaciones web ES/EN con60capturas, seis pruebas UI locales de
nube/aislamiento/migración correctas. Servicio público responde con protocolo2
por CI39051616877; timeout TCP de este equipo, no incidencia del Worker confirmada.
QA física pendiente. App Store1.2 PREPARE_FOR_SUBMISSION, externos sin activar.
Biblioteca PR-016 revisión22 guardada y releída. Web pública sin nuevo despliegue.

Upload COMPLETE sin errores/avisos; autoNotifyEnabled=true. Las betas previas se
conservan. El IPA se verificó de forma independiente (ZIP/CRC122entradas, iOS16.4,
iPhone/iPad, Xcode26.6/SDK26.5, diez manifiestos de privacidad sin tracking).
El verificador acepta literales Hermes ASCII o UTF-16LE: el separador «Bought ·»
usa UTF-16LE por el punto medio; corregido el verificador, sin cambio del binario.
No equiparar la presencia de marcadores en el IPA con QA física de interfaz.

Ruta IPA: artifacts/testflight-39051045729/Cesta-1.4-build1-TestFlight.ipa.
Recibos: artifacts/testflight-20261017/ y design/purchases-20261017/.
