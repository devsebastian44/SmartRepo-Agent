# SmartRepo Agent

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat&logo=express&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?style=flat&logo=openai&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-CI%2FCD-2088FF?style=flat&logo=github-actions&logoColor=white)
![Jest](https://img.shields.io/badge/Testing-Jest-C21325?style=flat&logo=jest&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-brightgreen?style=flat)

---

## 🧠 Overview

**SmartRepo Agent** es un bot de automatización inteligente para GitHub construido sobre **Node.js 18+ y Express**, que escucha eventos de webhooks en tiempo real para realizar dos funciones principales de forma completamente autónoma: **clasificar y etiquetar issues** mediante análisis de palabras clave y una capa de IA (OpenAI o modelos compatibles como Groq, Gemini u OpenRouter), y **revisar Pull Requests** detectando malas prácticas, diffs excesivos, ausencia de tests y descripciones ambiguas.

A partir del análisis de la estructura del repositorio (`app.js`, `src/`, `configs/`, `.env.example`, `babel.config.js`, `nodemon.json`, `.eslintrc.json`, `prettier.config.js`, `docker-compose.yml`, `.nvmrc`) y de los archivos de configuración detectados, el sistema opera como un servidor web Express que expone un endpoint de webhooks (`POST /webhooks/github`) con verificación criptográfica de firmas HMAC-SHA256 sobre cada petición entrante, un endpoint de salud (`GET /health`), logging estructurado con Winston, rate limiting por defecto y soporte para múltiples repositorios mediante lista de permitidos configurable.

El proyecto sigue una arquitectura profesional con integración nativa en GitHub, utilizando un flujo de trabajo optimizado para la automatización de issues y Pull Requests.

---

## ⚙️ Features

- **Webhook server seguro con verificación HMAC-SHA256** — Valida cada petición entrante de GitHub usando `crypto.timingSafeEqual` para prevenir ataques de temporización, rechazando inmediatamente cualquier evento con firma inválida.
- **Auto-etiquetado de issues basado en IA** — Clasifica automáticamente los issues abiertos en categorías (`bug`, `enhancement`, `question`, `security`, etc.) mediante análisis de palabras clave sobre título y descripción, aplicando las etiquetas vía GitHub REST API.
- **Análisis de issues con IA generativa** — Envía el contenido del issue al modelo de IA configurado (GPT-4o-mini por defecto) y publica automáticamente un comentario técnico con análisis de causa raíz o respuesta contextual directamente en el issue.
- **Revisión automática de Pull Requests** — Analiza los archivos modificados en cada PR, ejecuta chequeos estáticos (diffs muy grandes, ausencia de tests, descripciones ambiguas) y usa IA para revisar el diff completo, publicando un comentario de revisión detallado.
- **Rate limiting integrado** — Protege el servidor contra abuso masivo de webhooks limitando las peticiones entrantes (30 por minuto por defecto), retornando `429 Too Many Requests` cuando se supera el umbral.
- **Soporte multi-repositorio con allowlist** — La variable `ALLOWED_REPOSITORIES` permite configurar en qué repositorios opera el bot, ignorando silenciosamente los eventos de repositorios no autorizados.
- **Degradación elegante** — En caso de que la API de IA no esté disponible o retorne error, el sistema publica respuestas de fallback predefinidas sin interrumpir el flujo de procesamiento.
- **Prevención de bucles infinitos** — El bot detecta automáticamente si el evento proviene de una cuenta de tipo Bot y lo ignora, evitando que se responda a sí mismo indefinidamente.
- **Logging estructurado con Winston** — Sistema de logs con niveles (info, warn, error), formato legible en consola y rotación automática de archivos de log en producción.
- **Hot-reload en desarrollo** — `nodemon.json` configura el reinicio automático del servidor ante cambios en el código fuente durante el desarrollo.
- **Contenerización Docker** — `Dockerfile` y `docker-compose.yml` permiten levantar el bot en un entorno aislado y reproducible con un único comando.
- **Labels personalizables** — `configs/labels.js` expone la definición de etiquetas y palabras clave de clasificación como configuración editable sin modificar el core del sistema.

---

## 🛠️ Tech Stack

| Componente | Tecnología |
|---|---|
| Lenguaje principal | JavaScript (Node.js 18+) |
| Framework web | Express 4.x |
| IA / LLM | OpenAI API (GPT-4o-mini) / Groq / Gemini / OpenRouter |
| Verificación segura | `crypto.timingSafeEqual` (HMAC-SHA256) |
| Logging | Winston (structured + file rotation) |
| Testing | Jest (TDD/BDD) |
| Transpilación | Babel |
| Linting | ESLint |
| Formateo | Prettier |
| Dev server | Nodemon |
| Contenerización | Docker + docker-compose |
| Gestión de versiones Node | nvm (`.nvmrc`) |
| Pipeline CI/CD | GitHub Actions |
| Proceso en producción | PM2 |
| Proxy inverso (producción) | NGINX |

---

## 📦 Installation

### Requisitos previos

- Node.js 18 o superior (`nvm use` para usar la versión del `.nvmrc`)
- npm
- Una cuenta GitHub con acceso a configurar webhooks en el repositorio objetivo
- API Key de OpenAI o de un proveedor compatible (Groq, Gemini, OpenRouter)
- Herramienta para exponer el servidor local (ngrok) durante el desarrollo

### Instalación local (desarrollo)

```bash
# 1. Clonar el repositorio
git clone https://github.com/devsebastian44/SmartRepo-Agent.git
cd SmartRepo-Agent

# 2. (Opcional) Usar la versión exacta de Node especificada en .nvmrc
nvm use

# 3. Instalar dependencias
npm install

# 4. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales (ver sección de configuración)
```

### Instalación con Docker

```bash
# Levantar el servicio completo con docker-compose
docker-compose up --build

# O en segundo plano
docker-compose up -d --build

# Ver logs del contenedor
docker-compose logs -f
```

---

## ▶️ Usage

### 1. Configurar variables de entorno

Edita el archivo `.env` con tus credenciales:

```bash
# Token de GitHub con permisos sobre issues y pull requests
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# Secreto para verificar firmas de webhooks (genera uno aleatorio y robusto)
GITHUB_WEBHOOK_SECRET=elige_un_secreto_fuerte_y_aleatorio

# API Key del proveedor de IA
AI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx

# URL base del proveedor (vacío para OpenAI; ajusta para Groq, Gemini, etc.)
AI_BASE_URL=

# Modelo a utilizar
AI_MODEL=gpt-4o-mini

# (Opcional) Restricción de repositorios: "propietario/repo1,propietario/repo2"
ALLOWED_REPOSITORIES=
```

### 2. Iniciar el servidor

```bash
# Modo desarrollo (hot-reload con nodemon)
npm run dev

# Modo producción
npm start

# Verificar que el servidor está activo
curl http://localhost:3000/health
# → { "status": "ok", "service": "smartrepo-agent", "version": "1.0.0" }
```

### 3. Exponer el servidor con ngrok (desarrollo local)

```bash
# Instalar ngrok: https://ngrok.com/download
ngrok http 3000

# Copiar la URL HTTPS generada, por ejemplo:
# https://abc123.ngrok-free.app

# El endpoint del webhook será:
# https://abc123.ngrok-free.app/webhooks/github
```

### 4. Configurar el webhook en GitHub

En tu repositorio de GitHub:
`Settings → Webhooks → Add webhook`

| Campo | Valor |
|---|---|
| **Payload URL** | `https://TU-DOMINIO/webhooks/github` |
| **Content type** | `application/json` |
| **Secret** | Valor de `GITHUB_WEBHOOK_SECRET` en `.env` |
| **Events** | `Issues`, `Issue comments`, `Pull requests` |

Al guardar, GitHub enviará un evento `ping`. Verifica en los logs del servidor:
```
🏓 Ping received from GitHub — webhook configured successfully!
```

### 5. Ejecutar tests

```bash
# Ejecutar suite completa de Jest
npm test

# Modo observación (watch mode)
npm run test:watch

# Reporte de cobertura
npm test -- --coverage
```

### Flujo de eventos procesados

```
═══════════════════════════════════════════════════════
  ISSUE ABIERTO
═══════════════════════════════════════════════════════
GitHub → POST /webhooks/github
  ├── verifySignature()         → rechaza si firma HMAC inválida
  ├── isAllowedRepository()     → ignora si no está en allowlist
  ├── classifyIssue()           → análisis de palabras clave
  │     └── bug / enhancement / question / security / ...
  ├── addLabels()               → aplica etiquetas vía GitHub API
  ├── analyzeIssueWithAI()      → envía título+body al modelo LLM
  └── createComment()           → publica respuesta técnica en el issue

═══════════════════════════════════════════════════════
  PULL REQUEST ABIERTO
═══════════════════════════════════════════════════════
GitHub → POST /webhooks/github
  ├── verifySignature()
  ├── isAllowedRepository()
  ├── getPullRequestFiles()     → obtiene archivos y diff del PR
  ├── runStaticChecks()         → chequeos sin costo de IA:
  │     ├── diff demasiado grande (> umbral configurado)
  │     ├── ausencia de tests
  │     └── descripción vacía o ambigua
  ├── addLabels()
  ├── analyzePRWithAI()         → el LLM revisa el diff completo
  └── createComment()           → publica revisión detallada en el PR
```

---

## 📁 Project Structure

```
SmartRepo-Agent/
│
├── app.js                         # Entry point del servidor Express:
│                                  # inicializa middlewares, rate limiter,
│                                  # registro de rutas y arranque en puerto 3000
│
├── src/                           # Lógica principal del bot:
│                                  # handlers de webhooks, clasificador de issues,
│                                  # cliente de IA, revisor de PRs,
│                                  # cliente GitHub API e integración Winston
│
├── docs/                          # Documentación técnica del sistema:
│                                  # guías de configuración, referencia de API
│                                  # y documentación de arquitectura
│
├── diagrams/                      # Modelos visuales técnicos:
│                                  # flujo de eventos, arquitectura de componentes
│                                  # y diagramas de secuencia
│
├── Dockerfile                     # Imagen Docker del bot:
│                                  # base node:18-alpine, instalación de deps,
│                                  # configuración de usuario no-root
│
├── docker-compose.yml             # Orquestación de servicios:
│                                  # bot + variables de entorno
│
├── .env.example                   # Plantilla de variables de entorno:
│                                  # GITHUB_TOKEN, WEBHOOK_SECRET, AI_API_KEY,
│                                  # AI_MODEL, ALLOWED_REPOSITORIES
│
├── babel.config.js                # Configuración de Babel:
│                                  # transpilación ES modules → CommonJS
│                                  # (compatibilidad Jest)
│
├── nodemon.json                   # Configuración de hot-reload:
│                                  # extensiones vigiladas y archivos ignorados
│
├── .eslintrc.json                 # Reglas de linting ESLint
├── prettier.config.js             # Reglas de formateo Prettier
├── .editorconfig                  # Consistencia entre editores
├── .nvmrc                         # Versión exacta de Node.js (18+)
├── .dockerignore                  # Exclusiones de imagen Docker
├── .gitignore                     # Exclusiones de Git
├── CHANGELOG.md                   # Historial de cambios por versión
├── CONTRIBUTING.md                # Guía de contribución al proyecto
├── LICENSE                        # Licencia MIT
├── package.json                   # Dependencias y scripts npm
└── package-lock.json              # Lockfile de dependencias
```


---

## 🚀 Deployment

### Opción A — Railway (recomendado, capa gratuita disponible)

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```
Configura las variables de entorno en el panel de Railway → pestaña **Variables**.

### Opción B — Render

1. Conecta el repositorio en [render.com](https://render.com) → **New Web Service**
2. Build command: `npm install` | Start command: `npm start`
3. Añade las variables de entorno en el panel de Render.

### Opción C — VPS Ubuntu/Debian con PM2 + NGINX

```bash
# Instalar Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar PM2 (gestor de procesos en producción)
npm install -g pm2

# Clonar, configurar y arrancar
git clone https://github.com/devsebastian44/SmartRepo-Agent.git
cd SmartRepo-Agent && npm install
cp .env.example .env && nano .env

pm2 start app.js --name "smartrepo-agent"
pm2 startup && pm2 save
```

Configurar NGINX como proxy inverso:
```nginx
server {
    listen 80;
    server_name bot.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

---

## 🔐 Security

El sistema está diseñado con **seguridad por defecto** en cada capa del stack:

### Verificación criptográfica de webhooks

Cada petición entrante es verificada mediante HMAC-SHA256 antes de ser procesada. La comparación se realiza con `crypto.timingSafeEqual` para eliminar la vulnerabilidad de timing attacks:

```javascript
// Comparación en tiempo constante — previene timing attacks
const isValid = crypto.timingSafeEqual(
  Buffer.from(expectedSignature),
  Buffer.from(receivedSignature)
);
if (!isValid) return res.status(401).send('Unauthorized');
```

### Protección contra bucles infinitos

El bot inspecciona el campo `sender.type` de cada evento de GitHub. Si el emisor es una cuenta de tipo `Bot`, el evento es descartado silenciosamente, eliminando el riesgo de que el sistema se responda a sí mismo en cadena.

### Gestión segura de credenciales

Todas las credenciales (tokens GitHub, API keys de IA, webhook secrets) se gestionan exclusivamente mediante variables de entorno. El `.gitignore` excluye el archivo `.env` y el `.env.example` contiene únicamente placeholders sin valores reales.

### Rate Limiting

El middleware de rate limiting bloquea peticiones excesivas al endpoint de webhooks, protegiendo el servidor contra ataques de abuso o bucles de eventos no controlados del lado de GitHub:

```
Límite por defecto: 30 peticiones / minuto / IP
Respuesta al superar límite: 429 Too Many Requests
```

### Allowlist de repositorios

La variable `ALLOWED_REPOSITORIES` restringe en qué repositorios actúa el bot. Los eventos de repositorios no listados son ignorados sin respuesta, reduciendo la superficie de acción del sistema.

### Auditoría de dependencias

El pipeline CI/CD en GitLab ejecuta `npm audit` en cada push, detectando vulnerabilidades conocidas en el árbol de dependencias antes de cualquier publicación.

---


---

## 🚀 Roadmap

Posibles extensiones identificadas desde la arquitectura y las capacidades del sistema actual:

- [ ] **Soporte Slack / Discord** — Publicar notificaciones de decisiones del bot en canales de comunicación del equipo cuando se apliquen etiquetas o se haga una revisión de PR.
- [ ] **Clasificación semántica con embeddings** — Reemplazar la clasificación por palabras clave con embeddings vectoriales del modelo de IA para lograr mayor precisión en la categorización de issues.
- [ ] **Detector de duplicados de issues** — Usar similitud de embeddings para detectar y señalar issues potencialmente duplicados antes de aplicar etiquetas.
- [ ] **Soporte para GitLab webhooks** — Extender el sistema para procesar Merge Requests e issues de GitLab además de GitHub, con un adaptador de eventos unificado.
- [ ] **Panel de métricas** — Endpoint `/metrics` (Prometheus-compatible) para exponer estadísticas del bot: issues procesados, tasa de clasificación, tiempos de respuesta de IA y errores.
- [ ] **Modo dry-run** — Variable `DRY_RUN=true` que procese los eventos y loguee las acciones que tomaría sin aplicar etiquetas ni publicar comentarios reales.
- [ ] **Configuración por repositorio** — Soporte para un archivo `.smartrepo.yml` en el repositorio objetivo que defina reglas, etiquetas y umbrales personalizados por proyecto.
- [ ] **Caché de respuestas IA** — Implementar caché con TTL sobre respuestas del LLM para issues con contenido muy similar, reduciendo costos de API.

---

## 📄 License

Este proyecto está bajo la licencia **MIT**.

```
MIT License — Copyright (c) Sebastian Zhunaula (devsebastian44)
Se permite el uso, copia, modificación y distribución con o sin
fines comerciales, conservando el aviso de copyright original.
```

---

## 👨‍💻 Author

**Sebastian Zhunaula**
[GitHub: @devsebastian44](https://github.com/devsebastian44)

> Bot desarrollado como laboratorio de automatización inteligente de repositorios,
> combinando integración con la GitHub REST API, webhooks seguros con HMAC-SHA256
> e IA generativa para clasificación autónoma de issues y revisión de Pull Requests.