# Supabase Setup Instructions

## 1. Crear cuenta en Supabase
1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una cuenta gratis
3. Crea un nuevo proyecto (elige la región más cercana)
4. Espera 2-3 minutos mientras se crea el proyecto

## 2. Obtener credenciales
1. En el dashboard de tu proyecto, ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Pégalos en el archivo `.env.local`

## 3. Ejecutar el SQL Schema
1. En el dashboard, ve a **SQL Editor**
2. Click en **New query**
3. Copia todo el contenido de `supabase/schema.sql`
4. Pégalo en el editor
5. Click en **Run** (botón verde)
6. Verifica que dice "Success" ✅

## 4. Verificar tablas creadas
1. Ve a **Table Editor** en el sidebar
2. Deberías ver dos tablas:
   - `vaults` (para cuentas de usuario)
   - `secrets` (para secretos encriptados)

## 5. Reiniciar el servidor de desarrollo
```bash
npm run dev
```

## Seguridad Zero-Knowledge
- ✅ Los secretos se encriptan **localmente** antes de enviarse a Supabase
- ✅ Supabase solo almacena blobs encriptados indescifrables
- ✅ Tu master password **nunca** se envía al servidor
- ✅ Solo tú puedes desencriptar tus secretos

## Troubleshooting
- **Error de conexión:** Verifica que las URLs en `.env.local` sean correctas
- **RLS Policy errors:** Asegúrate de ejecutar todo el SQL schema
- **CORS errors:** Las variables de entorno deben empezar con `NEXT_PUBLIC_`
