
  <div align="center">

  # Talento‑Hub Frontend

  Interfaz web para la gestión de vacantes, empresas y candidatos.

  Repositorio basado en la HU‑001 **"Crear formulario"**.

  [Diseño en Figma](https://www.figma.com/design/nUuuUt2CSPSMISnucvoHpG/HU-001-Crear-formulario)

  </div>

  ---

  ## 🚀 Cómo ejecutar el proyecto

  1. **Instalar dependencias**

     ```powershell
     npm install
     ```

  2. **Levantar el servidor de desarrollo**

     ```powershell
     npm run dev
     ```

     Por defecto Vite arranca en `http://localhost:5173` (o el puerto que te indique la consola).

  ---

  ## ⚙️ Variables de entorno

  Este proyecto usa variables de entorno de Vite, siempre con el prefijo `VITE_`.

  > ⚠️ **Importante:** no subas al repositorio llaves secretas, tokens ni credenciales.

  Para crear tu archivo `.env` local desde el ejemplo (PowerShell):

  ```powershell
  # Copiar .env.example a .env
  Copy-Item -Path .env.example -Destination .env -Force

  # Editar .env con tus valores locales
  code .env
  ```

  Si llegas a cometer un secreto por error, rota las credenciales de inmediato y limpia el historial del repositorio.

  ---

  ## 📦 Gestor de paquetes

  Este proyecto utiliza **npm** como gestor de paquetes.

  - Se recomienda **confirmar** el archivo `package-lock.json` en el repositorio.
  - No mezcles gestores (npm, yarn, pnpm) en el mismo proyecto.

  Algunos tips:

  - En CI, usa:

    ```powershell
    npm ci
    ```

    para instalaciones limpias y determinísticas basadas en `package-lock.json`.

  - Si alguna vez cambias de gestor, confirma el nuevo lockfile y elimina `package-lock.json` para evitar confusiones.

  ---

  ## 🧩 Stack principal

  - **Framework:** React + TypeScript (Vite)
  - **Estilos:** Tailwind / componentes tipo shadcn
  - **Gestor de paquetes:** npm

  ---

  ## 📚 Notas

  - Asegúrate de tener Node.js actualizado.
  - Si algo no arranca, borra `node_modules` y el lockfile y reinstala:

    ```powershell
    Remove-Item -Recurse -Force node_modules
    Remove-Item package-lock.json
    npm install
    ```

