<div align="center">

# 🐫 The Great EIA Camel vs. Dwarf Racing System 🧝

### Backend — API REST

Sistema de información para la liga ficticia de carreras **EIA Camel vs. Dwarf**.
Construido con **Java 21** y **Spring Boot**, con persistencia en **PostgreSQL**, autenticación **JWT** y autorización por roles.

*Proyecto académico — Universidad EIA, Implementación de Software*

[![Java](https://img.shields.io/badge/Java-21-orange?logo=openjdk&logoColor=white)](#)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.x-brightgreen?logo=springboot&logoColor=white)](#)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?logo=postgresql&logoColor=white)](#)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](#)
[![JWT](https://img.shields.io/badge/Auth-JWT-black?logo=jsonwebtokens&logoColor=white)](#)

</div>

---

## 📑 Tabla de contenidos

- [Stack tecnológico](#-stack-tecnológico)
- [Arquitectura](#-arquitectura)
- [Módulos funcionales](#-módulos-funcionales)
- [Roles y permisos](#-roles-y-permisos)
- [Modelo de datos](#-modelo-de-datos-diagrama-entidad-relación)
- [Requisitos previos](#-requisitos-previos)
- [Configuración](#-configuración)
- [Cómo levantar el proyecto](#-cómo-levantar-el-proyecto)
- [Datos iniciales (seed)](#-datos-iniciales-seed)
- [Documentación de la API](#-documentación-de-la-api)
- [Pruebas automatizadas](#-pruebas-automatizadas)
- [Estructura del proyecto](#-estructura-del-proyecto)
- [Flujo de trabajo en Git](#-flujo-de-trabajo-en-git)
- [Variables de entorno](#-variables-de-entorno)

---

## ⚙️ Stack tecnológico

| Componente | Tecnología |
|---|---|
| 🧩 Lenguaje | Java 21 |
| 🌱 Framework | Spring Boot 3.x |
| 📦 Módulos Spring | Spring Web · Spring Data JPA · Spring Security · Spring Validation |
| 🗄️ Base de datos | PostgreSQL 16 (Docker) |
| 🔐 Autenticación | JWT (access + refresh token), BCrypt |
| 🧪 Testing | JUnit 5, MockMvc, H2 (solo para tests) |
| 🐳 Contenerización | Docker + Docker Compose |
| 🔨 Build | Maven |

---

## 🏛️ Arquitectura

El backend sigue una arquitectura en capas:

```
Controller  →  Service  →  Repository  →  Base de datos
    ↓             ↓
   DTO        Reglas de negocio
```

| Capa | Responsabilidad |
|---|---|
| **Controller** | Recibe peticiones HTTP, valida el formato de entrada (`@Valid`) y delega en el servicio. No contiene lógica de negocio. |
| **Service** | Implementa las reglas de negocio (elegibilidad, transiciones de estado, cálculo de puntos, etc.) y coordina repositorios. |
| **Repository** | Acceso a datos vía Spring Data JPA. |
| **DTO** | Contratos de entrada/salida de la API; las entidades JPA nunca se exponen directamente. |
| **Security** | Autenticación JWT, filtro de autenticación, configuración de Spring Security. |
| **Exception** | Manejo centralizado de errores con formato de respuesta consistente. |
| **Config** | Configuración transversal (encoders, seed de datos, etc.). |

---

## 🧭 Módulos funcionales

1. 🔐 **Autenticación y Seguridad** — registro, login, refresh token, perfil, JWT, BCrypt, roles.
2. 🏃 **Gestión de Competidores** — CRUD, filtros, paginación, reglas de tipo/estado.
3. 👥 **Gestión de Equipos** — CRUD, miembros, restricciones de pertenencia y capacidad.
4. 🏁 **Gestión de Carreras** — CRUD, máquina de estados (`DRAFT → ... → COMPLETED/CANCELLED`).
5. 📝 **Inscripción a Carreras** — validación de elegibilidad, tipo de inscripción vs. tipo de carrera, posiciones de salida.
6. 🏆 **Resultados y Clasificaciones** — registro de resultados oficiales, cálculo de puntos, standings de competidores y equipos.
7. 🖥️ **Interfaz Gráfica** — *(repositorio de frontend, fuera del alcance de este README)*.
8. 📋 **Audit Log** — bitácora transversal de acciones sensibles (login, cambios de estado, decisiones de inscripción, resultados), visible solo para administradores.

---

## 🔑 Roles y permisos

| Rol | Permisos mínimos |
|---|---|
| 🛡️ `ADMINISTRATOR` | Gestión total: usuarios, competidores, equipos, carreras, inscripciones, resultados, auditoría. |
| 🎙️ `RACE_ORGANIZER` | Gestiona carreras, inscripciones y resultados; consulta competidores y equipos. |
| 👁️ `VIEWER` | Solo lectura de información pública: horarios, resultados y clasificaciones. |

**Reglas de seguridad aplicadas:**
- 🚫 `401 Unauthorized` cuando falta token o es inválido.
- 🚫 `403 Forbidden` cuando el usuario autenticado no tiene el rol requerido.
- 🔒 Contraseñas cifradas con BCrypt; nunca se devuelven contraseñas ni tokens en las respuestas de la API.
- ⏱️ Tokens con expiración configurable (`JWT_EXPIRATION`, `JWT_REFRESH_EXPIRATION`).

---

## 🗂️ Modelo de datos (Diagrama Entidad-Relación)

```mermaid
erDiagram
    ROLE ||--o{ USER : "asignado a"
    USER {
        bigint id PK
        string username UK
        string email UK
        string password_hash
        string full_name
        boolean enabled
        datetime created_at
    }
    ROLE {
        bigint id PK
        string name UK "ADMINISTRATOR, RACE_ORGANIZER, VIEWER"
    }

    COMPETITOR ||--o{ TEAM_MEMBER : "participa como"
    TEAM ||--o{ TEAM_MEMBER : "tiene"
    COMPETITOR {
        bigint id PK
        string name
        string nickname UK
        string competitor_type "DWARF, CAMEL, MEDIUM, OTHER"
        date date_of_birth
        int approximate_age
        double weight
        double height
        string country_of_origin
        string status "ACTIVE, INJURED, SUSPENDED, RETIRED"
        date registration_date
        int victories
        int defeats
        int races_completed
    }
    TEAM {
        bigint id PK
        string name UK
        string description
        date creation_date
        string status "ACTIVE, SUSPENDED, INACTIVE"
        string coach_name
        int victories
        int defeats
    }
    TEAM_MEMBER {
        bigint id PK
        bigint team_id FK
        bigint competitor_id FK
        datetime joined_at
        datetime removed_at
        boolean active
    }

    RACE ||--o{ RACE_REGISTRATION : "recibe"
    COMPETITOR ||--o{ RACE_REGISTRATION : "se inscribe"
    TEAM ||--o{ RACE_REGISTRATION : "se inscribe"
    RACE {
        bigint id PK
        string name
        string description
        datetime scheduled_at
        string start_location
        string finish_location
        double distance_meters
        int max_participants
        string race_type "INDIVIDUAL, TEAM, MIXED"
        string status "DRAFT...COMPLETED, CANCELLED"
        string organizer
        datetime registration_deadline
        datetime created_at
        datetime updated_at
    }
    RACE_REGISTRATION {
        bigint id PK
        bigint race_id FK
        bigint competitor_id FK "nullable"
        bigint team_id FK "nullable"
        datetime registered_at
        string status "PENDING, APPROVED, REJECTED, CANCELLED"
        int starting_position
        string validation_notes
        string rejection_reason
        string registered_by
    }

    RACE_REGISTRATION ||--o| RACE_RESULT : "genera"
    RACE ||--o{ RACE_RESULT : "produce"
    RACE_RESULT {
        bigint id PK
        bigint race_id FK
        bigint registration_id FK UK
        int starting_position
        int final_position
        double completion_time_seconds
        double penalty_time_seconds
        string status "FINISHED, DISQUALIFIED, DID_NOT_FINISH, DID_NOT_START"
        string notes
        string recorded_by
        datetime recorded_at
    }

    AUDIT_LOG {
        bigint id PK
        string username
        string action
        string entity_type
        string entity_id
        datetime occurred_at
        string description
        string previous_value
        string new_value
    }
```

> **📌 Notas sobre el modelo:**
> - `TeamMember` es una entidad intermedia (no un simple join table) porque necesitamos historial: cuándo entró un competidor a un equipo y cuándo salió (`active`, `joined_at`, `removed_at`).
> - `RaceRegistration` tiene `competitor_id` y `team_id` nullable — exactamente uno de los dos debe estar presente, según el tipo de inscripción, validado a nivel de servicio.
> - `RaceResult` se relaciona 1-a-1 con `RaceRegistration` (no directamente con competidor/equipo), reutilizando toda la validación de elegibilidad ya aplicada en la inscripción.
> - `AuditLog` es una tabla independiente, sin llaves foráneas hacia las demás entidades, ya que registra eventos de cualquier tipo de entidad (`entity_type` + `entity_id` como referencia flexible).

---

## ✅ Requisitos previos

- ☕ **Java 21** (JDK)
- 🔨 **Maven 3.9+** (o el wrapper del IDE)
- 🐳 **Docker** y **Docker Compose**
- 💻 **IntelliJ IDEA** (recomendado) u otro IDE compatible con Maven

---

## 🛠️ Configuración

**1.** Clona el repositorio:
```bash
git clone <url-del-repositorio>
cd racingleague
```

**2.** Crea tu archivo `.env` en la raíz del proyecto (basado en `.env.example`):
```env
DB_NAME=racingleague
DB_USERNAME=racing_user
DB_PASSWORD=racing_pass
JWT_SECRET=cambia_esto_por_una_clave_larga_y_secreta_de_al_menos_32_caracteres
JWT_EXPIRATION=3600000
JWT_REFRESH_EXPIRATION=86400000
```

---

## 🚀 Cómo levantar el proyecto

### Opción A — Todo en Docker (recomendado, un solo comando)

```bash
docker compose up -d --build
```

Esto levanta:
- 🗄️ Contenedor `racingleague-db` (PostgreSQL 16, con volumen persistente `racingleague_data`)
- ⚙️ Contenedor `racingleague-backend` (API Spring Boot, puerto `8080`)

Verifica que ambos estén corriendo:
```bash
docker compose ps
```

Para ver los logs del backend:
```bash
docker compose logs -f backend
```

Para detener todo:
```bash
docker compose down
```

Para detener y borrar también los datos persistidos:
```bash
docker compose down -v
```

### Opción B — Backend local (IntelliJ) + solo base de datos en Docker

Útil durante el desarrollo activo, para tener recarga rápida sin reconstruir la imagen.

**1.** Levanta solo la base de datos:
```bash
docker compose up -d db
```

**2.** Configura las variables de entorno en tu Run Configuration de IntelliJ (o usa el plugin EnvFile para cargar el `.env` automáticamente). Como el puerto expuesto de Postgres es `5433` (para no chocar con instalaciones locales), asegúrate de tener:
```env
DB_HOST=localhost
DB_PORT=5433
```

**3.** Corre `RacingleagueApplication` desde IntelliJ.

La API queda disponible en `http://localhost:8080`

---

## 🌱 Datos iniciales (seed)

Al arrancar por primera vez, el `DataSeeder` inserta automáticamente:

| Tipo | Cantidad | Detalle |
|---|---|---|
| 👤 Usuarios | 3 | `admin` / `organizer` / `viewer` (ver credenciales abajo) |
| 🏃 Competidores | 9 | 5 enanos, 2 camellos, 2 medianos |
| 👥 Equipos | 2 | Erebor Racers, Desert Storm |
| 🏁 Carreras | 3 | Una en `DRAFT`, una en `OPEN_FOR_REGISTRATION`, una `COMPLETED` |
| 📝 Inscripciones y resultados | — | La carrera completada incluye inscripciones aprobadas y resultados oficiales |

**Credenciales de prueba:**

| Usuario | Contraseña | Rol |
|---|---|---|
| `admin` | `Admin123!` | 🛡️ ADMINISTRATOR |
| `organizer` | `Organizer123!` | 🎙️ RACE_ORGANIZER |
| `viewer` | `Viewer123!` | 👁️ VIEWER |

---

## 📡 Documentación de la API

Formato de error estándar en toda la API:

```json
{
  "timestamp": "2026-08-15T14:30:00",
  "status": 404,
  "error": "Not Found",
  "message": "Competitor with ID 45 was not found",
  "path": "/api/competitors/45"
}
```

### Endpoints principales

| Módulo | Método | Ruta | Rol requerido |
|---|---|---|---|
| 🔐 Auth | POST | `/api/auth/register` | Público |
| 🔐 Auth | POST | `/api/auth/login` | Público |
| 🔐 Auth | POST | `/api/auth/refresh` | Público |
| 🔐 Auth | GET | `/api/auth/profile` | Autenticado |
| 🛡️ Admin | GET | `/api/admin/users` | ADMINISTRATOR |
| 🛡️ Admin | PUT | `/api/admin/users/{id}/role` | ADMINISTRATOR |
| 🏃 Competidores | POST/PUT/PATCH/DELETE | `/api/competitors/**` | ADMINISTRATOR |
| 🏃 Competidores | GET | `/api/competitors/**` | ADMINISTRATOR, RACE_ORGANIZER |
| 👥 Equipos | POST/PUT/DELETE | `/api/teams/**` | ADMINISTRATOR |
| 👥 Equipos | GET | `/api/teams/**` | ADMINISTRATOR, RACE_ORGANIZER |
| 🏁 Carreras | POST/PUT/PATCH | `/api/races/**` | ADMINISTRATOR, RACE_ORGANIZER |
| 🏁 Carreras | GET | `/api/races/**` | Autenticado |
| 🏁 Carreras | DELETE | `/api/races/{id}` | ADMINISTRATOR |
| 📝 Inscripciones | POST/PATCH/DELETE/GET | `/api/registrations/**`, `/api/races/{id}/registrations` | ADMINISTRATOR, RACE_ORGANIZER |
| 🏆 Resultados | POST/PUT/GET | `/api/races/{id}/results`, `/api/results/**` | ADMINISTRATOR, RACE_ORGANIZER |
| 📊 Standings | GET | `/api/standings/competitors`, `/api/standings/teams` | Público |
| 📋 Auditoría | GET | `/api/audit-logs` | ADMINISTRATOR |

> Todos los endpoints son testeables de forma independiente con Postman o `curl` (ver ejemplos en cada sección del desarrollo del proyecto).

---

## 🧪 Pruebas automatizadas

El proyecto incluye 15 tests automatizados mínimos, usando JUnit 5 + MockMvc + H2 (perfil `test`).

Ejecutar todos los tests:
```bash
mvn test
```

O desde IntelliJ: click derecho sobre `src/test/java` → `Run 'All Tests'`.

**Cobertura de los tests:**
- ✔️ Creación y validación de competidores (peso inválido, nickname duplicado).
- ✔️ Creación y validación de carreras (fecha en el pasado).
- ✔️ Reglas de inscripción (competidor activo, suspendido, duplicado, fuera de plazo).
- ✔️ Reglas de resultados (resultado válido, dos ganadores).
- ✔️ Seguridad (401 sin token, 403 por rol insuficiente, 404 en recurso inexistente).

> H2 se usa **exclusivamente** para pruebas automatizadas (`src/test/resources/application.yml`), nunca como base de datos final.

---

## 📁 Estructura del proyecto

```
racingleague/
├── src/
│   ├── main/
│   │   ├── java/com/eia/racingleague/
│   │   │   ├── config/          # Configuración transversal (encoders, seed de datos)
│   │   │   ├── controller/      # Controladores REST
│   │   │   ├── service/         # Lógica de negocio
│   │   │   │   └── spec/        # Specifications para filtros dinámicos
│   │   │   ├── repository/      # Repositorios Spring Data JPA
│   │   │   ├── model/           # Entidades JPA y enumeraciones
│   │   │   ├── dto/             # DTOs de entrada/salida por módulo
│   │   │   ├── security/        # JWT, filtros y configuración de Spring Security
│   │   │   └── exception/       # Excepciones de negocio y manejador global
│   │   └── resources/
│   │       └── application.yml
│   └── test/
│       ├── java/com/eia/racingleague/
│       │   ├── controller/      # Tests de integración con MockMvc
│       │   ├── service/         # Tests de lógica de negocio
│       │   └── util/            # Helpers de autenticación para tests
│       └── resources/
│           └── application.yml  # Perfil de test con H2
├── Dockerfile
├── .dockerignore
├── compose.yml
├── .env.example
├── .gitignore
├── pom.xml
└── README.md
```

---

## 🌿 Flujo de trabajo en Git

Ramas utilizadas en este proyecto:

```
main                    → versión estable, desplegable
develop                 → integración de features
feature/security        → Módulo 1
feature/competitors     → Módulo 2 (y equipos)
feature/races           → Módulos 4, 5 y 6
feature/results
feature/frontend        → interfaz gráfica
```

**Convenciones:**
- ✍️ Commits descriptivos por integrante (nada de un único commit `final`).
- 🔀 Pull requests hacia `develop` antes de fusionar a `main`.
- 🚫 `.gitignore` excluye `target/`, `.idea/`, `.env` y artefactos de build.

---

## 🔧 Variables de entorno

| Variable | Descripción | Ejemplo |
|---|---|---|
| `DB_HOST` | Host de la base de datos | `db` (Docker) / `localhost` (local) |
| `DB_PORT` | Puerto de PostgreSQL | `5432` (Docker) / `5433` (local) |
| `DB_NAME` | Nombre de la base de datos | `racingleague` |
| `DB_USERNAME` | Usuario de la base de datos | `racing_user` |
| `DB_PASSWORD` | Contraseña de la base de datos | *(secreto)* |
| `JWT_SECRET` | Clave de firma de los tokens JWT | *(secreto, mínimo 32 caracteres)* |
| `JWT_EXPIRATION` | Expiración del access token (ms) | `3600000` (1 hora) |
| `JWT_REFRESH_EXPIRATION` | Expiración del refresh token (ms) | `86400000` (24 horas) |
| `API_BASE_URL` | URL base de la API (usada por el frontend) | `http://localhost:8080` |

> Todos los valores sensibles se gestionan vía `.env` (excluido de Git) y solo se documenta su estructura en `.env.example`.

---

<div align="center">

*Universidad EIA — Implementación de Software* 🎓

</div>
