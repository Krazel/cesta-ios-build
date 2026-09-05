# Cesta — iPhone para Sideloadly

Copia del cliente de Cesta para generar un IPA de iPhone sin firmar. Incluye la interfaz en español e inglés, listas compartidas, catálogo de productos y conversión local de texto en productos.

## Compilar

En Actions, ejecuta manualmente **Build iPhone IPA for Sideloadly** e introduce una URL de API accesible desde el teléfono. El flujo usa el runner estándar `macos-26` en este repositorio público y se bloquea si el repositorio pasa a ser privado. No utiliza certificados de Apple ni publica en TestFlight o App Store.

El resultado se llama `Cesta-Sideloadly.ipa` y se adjunta a la ejecución durante un día. Descárgalo y cárgalo en Sideloadly para firmarlo e instalarlo con tu Apple ID.

El servidor de sincronización se ejecuta por separado. Esta copia de compilación no contiene listas personales, datos SQLite, fotos de usuarios ni credenciales. La URL de la API queda incorporada en el cliente al compilar. Para usar una API de la red local, el teléfono debe estar en esa red y el servidor debe permanecer accesible.

También se puede ejecutar `node scripts/build-sideload-ipa.mjs` en un Mac con Xcode, CocoaPods, Node 24, las dependencias instaladas y `EXPO_PUBLIC_API_URL` configurada.

Documentación de instalación: https://sideloadly.io/
