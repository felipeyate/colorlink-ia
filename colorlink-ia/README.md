# ColorLink · Frontend (portal de clientes)

Frontend en React del reto transversal **ColorLink** (Pintuco), enfocado en
registro, inicio de sesión y el formulario de solicitud del cliente.

Este proyecto **no usa Node, npm ni ningún bundler**. React y Babel se
cargan desde un CDN y Babel transforma el JSX directamente en el navegador,
así que puedes ejecutarlo abriendo `index.html` con la extensión **Live
Server** de VS Code, sin instalar nada más.

## Cómo ejecutarlo

1. Abre la carpeta `colorlink-frontend` en Visual Studio Code.
2. Instala la extensión **Live Server** (Ritwick Dey) si no la tienes — VS
   Code te la va a sugerir automáticamente gracias a `.vscode/extensions.json`.
3. Click derecho sobre `index.html` → **"Open with Live Server"**
   (o el botón "Go Live" en la barra inferior).
4. Se abre en el navegador en algo como `http://127.0.0.1:5500`.

> Necesitas conexión a internet la primera vez, porque React, ReactDOM y
> Babel standalone se cargan desde CDN (unpkg.com) y las tipografías desde
> Google Fonts.

## Estructura del proyecto

```
colorlink-frontend/
├── index.html                  # Punto de entrada, carga CDN + scripts en orden
├── css/
│   └── styles.css              # Todos los estilos (paleta navy/teal/lilac)
└── js/
    ├── icons.jsx                # Íconos SVG propios (sin dependencias externas)
    ├── data.jsx                 # Pasos del proceso, opciones y regex de validación
    ├── App.jsx                  # Componente raíz: maneja qué vista se muestra
    └── components/
        ├── Field.jsx             # Campo de formulario + botón primario reutilizables
        ├── BrandPanel.jsx        # Panel izquierdo: marca + "hilo del proceso"
        ├── MobileHeader.jsx      # Encabezado compacto para pantallas chicas
        ├── LoginView.jsx         # Inicio de sesión
        ├── RegisterView.jsx      # Creación de cuenta
        ├── RequestView.jsx       # Formulario de solicitud (2 pasos)
        └── SuccessView.jsx       # Confirmación con resumen de la solicitud
```

Los archivos `.jsx` se cargan en `index.html` como `<script type="text/babel">`
**en orden de dependencia** (íconos y datos primero, luego componentes,
al final `App.jsx`). Como no son módulos ES, las funciones y `const` de
nivel superior de cada archivo quedan disponibles como variables globales
para los siguientes scripts — por eso el orden en `index.html` importa.

## Flujo actual

`Login` → `Registro` → `Formulario de solicitud (2 pasos)` → `Confirmación`

El panel izquierdo muestra el hilo del proceso completo (Necesidad →
Solución técnica → Abastecimiento → Servicio → Calidad) y va marcando en
qué paso está el cliente.

## Conexión futura a Supabase

Por ahora todo funciona en memoria (sin `localStorage`, para que sea
compatible con cualquier entorno). Busca los comentarios `// TODO` en:

- `js/components/LoginView.jsx` → reemplazar por `supabase.auth.signInWithPassword(...)`
- `js/components/RegisterView.jsx` → reemplazar por `supabase.auth.signUp(...)`
- `js/components/RequestView.jsx` → reemplazar por `supabase.from('solicitudes').insert([...])`

Cuando conectes Supabase, lo más simple será agregar el SDK
(`@supabase/supabase-js`) vía CDN en `index.html`, igual que React, y crear
un archivo `js/supabaseClient.jsx` con la inicialización del cliente.
