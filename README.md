# Archivo (poesías, pensamientos, notas)

Web con cuentas de verdad (email + clave) para que cada persona tenga su
archivo privado. Hecha con React + Vite, guardada en Supabase (base de datos
+ login), hosteada gratis en Vercel.

Costo real: 0. Lo único que NO es gratis es un dominio propio tipo
"tuarchivo.com" (eso lo cobra el registrador del dominio, no Vercel ni
Supabase). Si te alcanza con una dirección gratis tipo
`tu-proyecto.vercel.app`, todo el proceso de abajo te sale $0.

## 1. Crear la base de datos (Supabase, gratis)

1. Andá a supabase.com y creá una cuenta gratis.
2. "New project": ponele un nombre, una contraseña para la base (guardala,
   no es la que van a usar tus amigos) y elegí una región cercana
   (por ejemplo São Paulo, si están en Argentina).
3. Cuando el proyecto esté listo, andá a **SQL Editor** (menú de la
   izquierda), pegá todo el contenido del archivo `supabase-schema.sql`
   que está en esta carpeta, y ejecutalo. Eso crea las tablas, la
   seguridad (cada usuario solo ve lo suyo) y la numeración automática
   de cada escrito.
4. Andá a **Project Settings > API**. Vas a necesitar dos datos de ahí:
   - **Project URL**
   - **anon public key**

5. Opcional: en **Authentication > Providers > Email**, podés desactivar
   "Confirm email" si querés que tus amigos entren directo sin tener que
   confirmar el mail primero. Por defecto queda activado (más prolijo,
   un paso más).

## 2. Configurar el proyecto localmente

1. Necesitás tener Node.js instalado (nodejs.org, gratis).
2. Abrí una terminal en esta carpeta y corré:
   ```
   npm install
   ```
3. Copiá `.env.example` y renombralo a `.env`. Adentro, reemplazá los
   valores con el Project URL y la anon key que copiaste en el paso
   anterior:
   ```
   VITE_SUPABASE_URL=https://tuproyecto.supabase.co
   VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
   ```
4. Para probarlo en tu computadora antes de publicarlo:
   ```
   npm run dev
   ```
   Te va a dar un link tipo `http://localhost:5173`.

## 3. Publicarlo gratis (Vercel)

La forma más simple es subir el código a GitHub y conectarlo con Vercel,
así cada vez que cambies algo se actualiza solo.

1. Creá un repositorio en github.com y subí esta carpeta. Todos los
   archivos están sueltos, sin subcarpetas, así que podés abrir esta
   carpeta en tu computadora, seleccionar todo lo que hay adentro
   (Cmd+A o Ctrl+A) y arrastrarlo de una sola vez a GitHub, usando el
   link "uploading an existing file" que aparece al crear el
   repositorio.
2. Andá a vercel.com, creá una cuenta gratis (podés entrar directo con
   tu cuenta de GitHub).
3. "Add New Project", elegí el repositorio que acabás de subir.
4. Antes de darle a "Deploy", abrí **Environment Variables** y agregá
   las mismas dos variables del paso anterior:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Deploy. En un minuto te da una dirección gratis tipo
   `archivo-web.vercel.app`, ya funcionando.

### Alternativa sin GitHub

Si no querés usar GitHub, podés instalar `npm i -g vercel`, correr
`vercel login`, y desde esta carpeta correr `vercel`. Te va a pedir las
variables de entorno la primera vez y te deja el sitio publicado igual.

## 4. Dominio propio (esto sí cuesta)

Si más adelante querés algo como "tuarchivo.com" en vez de
`.vercel.app`, comprás el dominio en un registrador (Namecheap,
Cloudflare, etc: suele rondar unos 10-15 USD por año) y lo conectás
en Vercel desde **Settings > Domains** del proyecto, siguiendo las
instrucciones que te va mostrando ahí. Vercel no cobra nada extra por
esto, el costo es solo el del registro del dominio en sí.

## Cómo funciona por dentro

- Cada persona crea su cuenta con su propio email y clave (Supabase
  Auth se encarga de eso, con confirmación por mail).
- Las políticas de seguridad de la base de datos (Row Level Security)
  hacen que cada usuario solo pueda leer, editar o borrar sus propios
  escritos, aunque miles de personas usen la misma web.
- Cada escrito nuevo recibe un número de archivo permanente (001, 002...)
  que no se reordena aunque borres algo.
