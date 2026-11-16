# Cómo integrar esto a tu rama

## 1. Crear tu rama desde IntelliJ

```
git checkout main
git pull origin main
git checkout -b feature/frontend
```

## 2. Copiar el proyecto

Copia todo el contenido de esta carpeta (`frontend/` sugerido como nombre)
dentro de la raíz del repo `proyecto_implementacion`, quedando así:

```
proyecto_implementacion/
├── src/            (backend Java, ya existe)
├── pom.xml
├── compose.yml
└── frontend/       <- lo que te entregué
    ├── src/
    ├── package.json
    ├── vite.config.js
    └── ...
```

## 3. Instalar y correr en desarrollo

```
cd frontend
npm install
npm run dev
```

Se abre en `http://localhost:5173`. El proxy configurado en `vite.config.js`
reenvía todo lo que empiece en `/api` hacia `http://localhost:8080`, así que
corre el backend normalmente (`docker compose up -d` o desde IntelliJ) y no
necesitas tocar CORS para desarrollar.

## 4. Pendiente para hablar con el equipo (backend)

`SecurityConfig` no tiene una política CORS configurada. Mientras el
frontend esté detrás del proxy de Vite esto no bloquea el desarrollo local,
pero si alguien abre el `index.html` de otra forma, o cuando dockericen el
frontend como contenedor aparte (requisito 3.4 del enunciado) y quede en
otro puerto/host, el navegador rechazará las peticiones sin un
`CorsConfigurationSource` que permita el origen del frontend. Vale la pena
que alguien del equipo lo agregue pronto.

## 5. Qué construí en este primer bloque (login)

- `src/api/httpClient.js`: cliente axios con el token en cada request y
  renovación automática vía `/api/auth/refresh` cuando el access token
  expira (401).
- `src/api/tokenStorage.js` y `src/api/authApi.js`: guardado de tokens y
  llamadas a `/api/auth/*`, alineadas 1:1 con `AuthController`.
- `src/context/AuthContext.jsx`: estado global de sesión (`user`, `roles`,
  `login`, `logout`), usado por el resto de la app.
- `src/routes/ProtectedRoute.jsx`: guard de rutas, ya soporta
  `requiredRole` para cuando protejamos pantallas por rol (ej.
  `ADMINISTRATOR`, `RACE_ORGANIZER`, `VIEWER` — así vienen los nombres en
  `UserProfileResponse.roles`, sin el prefijo `ROLE_` que sí usa Spring
  Security internamente).
- `src/pages/Login/`: pantalla de login con estados de validación, carga y
  error, más un panel de marca (`BrandPanel.jsx`).
- `src/pages/Dashboard/` y `src/pages/AccessDenied/`: placeholders mínimos
  solo para poder probar el flujo login → dashboard de punta a punta. Se
  reemplazan cuando construyamos esas pantallas de verdad.

## 6. Cómo probarlo

Con el backend corriendo, `DataSeeder` ya crea estos usuarios de ejemplo:

| Usuario     | Contraseña     | Rol             |
|-------------|----------------|-----------------|
| `admin`     | `Admin123!`    | ADMINISTRATOR   |
| `organizer` | `Organizer123!`| RACE_ORGANIZER  |
| `viewer`    | `Viewer123!`   | VIEWER          |

Entra a `/login`, inicia sesión con cualquiera y deberías caer en
`/dashboard` viendo tu nombre y tus roles.

## 7. Siguiente paso sugerido

Cuando quieras seguimos con el módulo de competidores (listado con
filtros/paginación + formulario de creación), que es el segundo módulo del
enunciado.
