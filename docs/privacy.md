# Cesta — privacidad / privacy

Actualizado / Updated: 2026-09-05. Responsable / Operator: Krazel Studio. Contacto / Contact: coderappskrazel@gmail.com.

## Castellano

Cesta guarda las listas personales, favoritos, catálogo propio, fotos elegidas y preferencias en el dispositivo o navegador. No se envían a nuestro servidor al crear o editar una lista personal. La web descarga sus archivos desde Cloudflare y puede conservarlos para funcionar sin conexión; Cloudflare recibe los datos de conexión necesarios para servirlos, como la dirección IP y las cabeceras HTTP.

Al crear una invitación o elegir usar una lista en otros dispositivos, esa lista se almacena en Cloudflare Workers y Durable Objects. Incluye nombre, productos, cantidades, notas, fotos comprimidas y nombres de participantes. Una credencial aleatoria identifica cada dispositivo; el servidor conserva un identificador derivado de ella, permisos de acceso e identificadores de operaciones para evitar duplicados. La credencial privada se guarda en Keychain en iOS o en el almacenamiento del navegador. Las conexiones usan HTTPS/WSS. No hay anuncios, analítica de terceros ni acceso a contactos.

Los participantes autorizados pueden consultar y editar la lista. Una invitación permite añadir un participante durante siete días. Crear otra invitación reemplaza la anterior; desactivarla o expulsar a un participante invalida el enlace anterior. Expulsar a alguien no puede borrar copias que ya descargó. Las listas locales no se sincronizan automáticamente con otro navegador, móvil o equipo.

Se transmite una copia inicial y se recupera el estado al reconectar; durante una sesión se envían los cambios. Las fotos forman parte de los datos de la lista. Compartir puede consumir cuota aunque no se edite: conexión, autenticación y recuperación de novedades también requieren recursos. No se promete una capacidad ilimitada del plan gratuito.

Los datos compartidos se conservan mientras exista la lista. El propietario puede eliminarla o guardar una copia local y retirar la copia compartida. El borrado elimina el contenido, participantes, invitaciones y registros de cambios; puede quedar una marca sin contenido que impide recrear accidentalmente la misma lista. Salir de una lista ajena elimina el acceso de ese dispositivo, no el contenido de los demás. Para borrar datos compartidos se necesita conexión y confirmación del servidor. Exportar una copia no incluye credenciales y al importarla se crean listas privadas.

Si se revoca el acceso con cambios pendientes, Cesta conserva una copia local de esos cambios cuando es posible. Borrar los datos del navegador o desinstalar la app sin exportar una copia puede perder listas personales y credenciales. Los proveedores pueden conservar copias técnicas durante sus ciclos de recuperación; no prometemos borrado físico instantáneo de sus copias de seguridad. No enviamos deliberadamente las listas ni los códigos de invitación a registros de analítica. Cloudflare puede procesar datos de conexión para operación y seguridad.

La versión 1.1 anterior utilizaba un servidor de la red local. Al pasar a este modelo, sus datos guardados se conservan localmente y se necesita una invitación nueva para compartirlos por Internet. La versión previa de los datos se conserva para recuperación hasta borrar los datos de Cesta. El nuevo servicio no importa automáticamente la base de datos de aquel servidor.

TestFlight puede proporcionar a Apple datos de instalación, uso, fallos y comentarios según sus propias condiciones. Para consultas o solicitudes de eliminación, utiliza el correo de contacto; no publiques credenciales ni invitaciones en incidencias públicas.

## English

Personal lists, favourites, custom products, selected photos and preferences stay on the device or browser. Creating or editing a personal list does not send it to our server. The website downloads its files from Cloudflare and may cache them for offline use. Cloudflare receives connection data needed to serve the website, including IP addresses and HTTP headers.

Creating an invitation or choosing to use a list on other devices stores that list in Cloudflare Workers and Durable Objects. This includes its name, items, quantities, notes, compressed photos and participant names. A random device credential is stored in iOS Keychain or browser storage. The server stores a derived identifier, permissions and operation identifiers to prevent duplicate changes. Connections use HTTPS/WSS. There are no ads, third-party analytics or contact access.

Authorized participants can view and edit a shared list. Invitations last seven days. A new invitation replaces the previous one; revoking invitations or removing a participant invalidates the previous link. Removing access cannot erase downloaded copies. Local lists do not automatically synchronize with another browser or device.

The initial list and reconnection state are transferred; active sessions send changes. Photos are included in list data. Connections, authentication and catching up still consume resources. Free hosting is subject to quotas, not unlimited capacity.

Shared content remains until the owner deletes the list or keeps a private copy and removes the cloud list. Deletion removes its content, participants, invitations and operation records; a content-free tombstone may remain to prevent accidental recreation. Leaving someone else's list removes that device's access without deleting everyone else's content. Cloud deletion requires connectivity and server confirmation. Backups omit credentials and are imported as private lists.

If access is removed with pending edits, Cesta keeps a local recovery copy when possible. Clearing browser data or uninstalling without a backup can lose personal lists and credentials. Provider recovery copies may persist through their technical backup cycles; immediate physical erasure from provider backups is not guaranteed. Lists and invitation codes are not deliberately sent to analytics logs. Cloudflare may process connection data for operations and security.

Version 1.1 used a local-network server. Its cached data is preserved locally when upgrading and needs a new invitation for internet sharing. The old local data record remains for recovery until Cesta data is erased. The new service does not automatically import the old server database.

Apple may collect TestFlight installation, usage, crash and feedback information under its own terms. Contact coderappskrazel@gmail.com for privacy questions or deletion requests. Never post credentials or invitations in public issues.
