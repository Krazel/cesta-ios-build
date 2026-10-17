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
