---
description: Asegurar compilatión estricta y control de bucles de error.
---

# Verificación Estricta y Control de Errores

Este workflow DEBE ser seguido por el agente después de realizar cambios sustanciales de código y antes de hacer `push` o notificar al usuario, para evitar que lleguen errores al entorno de producción (ej. Vercel).

## Paso 1: Verificación de Build (Simulación de Producción)

// turbo

1. Ejecuta el siguiente comando para probar si el proyecto compilará correctamente en Vercel:

   ```bash
   npm run build
   ```

2. Espera a que el comando termine. Lee exhaustivamente los logs de salida.

## Paso 2: Análisis y Autocorrección

Si el paso 1 arroja errores (Failed to compile, Type error, etc.):

1. Identifica el archivo exacto y la línea que falla.
2. Utiliza `view_file` para revisar el contexto del error y `replace_file_content` para solucionarlo.
3. Lleva un conteo estricto del número de intentos de autocorrección que has realizado para este ciclo.

## Paso 3: Límite de Intentos (El Freno de Mano)

- Si has intentado reparar los errores **10 VECES** sin conseguir un `Compiled successfully`, **DEBES DETENERTE INMEDIATAMENTE**.
- Llama a la herramienta `notify_user` e informa lo siguiente:
  > "🚨 He alcanzado el límite de seguridad de 10 intentos tratando de compilar y no lo he conseguido. El error fundamental parece ser [insertar resumen técnico]. Me detengo aquí por seguridad para evitar destruir el proyecto. ¿Cómo prefieres que proceda?"

## Paso 4: Aprobación y Deploy

Solo cuando el `npm run build` indique `Compiled successfully` y no arroje errores de Tipo (TypeScript) o de Linting:

1. Procede a limpiar el árbol de trabajo y hacer commit de forma segura (`git add .`, `git commit -m "..."`, `git push`).
2. Usa `notify_user` para avisar al usuario del éxito.
