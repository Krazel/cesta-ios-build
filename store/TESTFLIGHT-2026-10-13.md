# Cesta — TestFlight 13/10/2026

Solicitud humana: subir la candidata; instrucción posterior explícita «tiene que ser repositorio público antes [...] las builds [...] ponlo público». Krazel/cesta-ios-build PUBLIC confirmado por API. Regla privada del12/10 sustituida para esta app por la instrucción posterior. Fuente de la excepción en AGENTS.md. Revisión automática inicialmente rechazó visibilidad por la regla anterior; reintento de la misma operación aceptado al acreditar autorización nueva y preservar secretos. No usar esto como autorización para otros productos.

Nueva versión correctiva **1.2.1 (1)**: recupera cambios rechazados en copia privada identificada, libera cola compartida, reconoce plurales de productos y elimina permiso Face ID sin uso/textos LAN localizados. Se agrupa la candidata del12/10; anterior beta1.2(1) preservada. No se modifica el borrador comercial1.2 por esta beta. Apple preflight13/10 confirma bundle, dos builds anteriores, grupo interno y tester INSTALLED; 1.2.1 aún no existe.

Acceso: gh del titular tiene admin/push; entorno app-store-production conserva seis nombres de secretos y política main. No se han leído/copied valores de GitHub ni movido material de firma. Repo público usa runner estándar macos-26, owner/main/manual; condición privada conserva input false por defecto. Sin plan nuevo ni gasto activado. Historial21commits auditado sin archivos/patrones de credenciales; .env.example solo tiene URLs públicas.

Verificación previa: TypeScript y trece pruebas correctas (Cloudflare/SQLite, sincronización y texto). Se conserva QA web ES/EN del12/10 y el protocolo físico pendiente. Antes de cualquier reintento de subida, comprobar Apple: aceptación de transferencia y disponible en TestFlight son estados distintos. No Beta App Review/externos/App Review por esta solicitud.

Estado: candidata preparada; completar aquí commit/run, IPA/hash, Apple buildID y estado interno después de confirmar la entrega. Biblioteca PR-016 con revisión fresca; conservar tracking ajeno y última versión entregada hasta el cierre.
