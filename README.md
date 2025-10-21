
  # HU-001-Crear formulario

  This is a code bundle for HU-001-Crear formulario. The original project is available at https://www.figma.com/design/nUuuUt2CSPSMISnucvoHpG/HU-001-Crear-formulario.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.
  

## Environment variables

This project uses Vite environment variables prefixed with `VITE_`. Do not commit secret keys or credentials.

To create a local `.env` file from the example (PowerShell):

```powershell
# copy .env.example to .env (PowerShell)
Copy-Item -Path .env.example -Destination .env -Force

# then edit .env with your local values (use an editor like code . or notepad)
code .env
```

If you accidentally committed secrets, rotate those credentials immediately and remove the file from the repo history.

## Lockfile and package manager

This project uses npm as the package manager. To ensure reproducible installs across machines and CI, commit the `package-lock.json` file to the repository. Do not mix package managers (npm, yarn, pnpm) in the same project — choose one and stick to it.

Tips:
- Install dependencies with `npm ci` in CI for a clean, deterministic install from `package-lock.json`.
- If you switch to another manager (yarn or pnpm), commit its lockfile and remove `package-lock.json` to avoid confusion.
