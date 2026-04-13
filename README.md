# 🤖 Bot de Automatización para GitHub con IA

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?logo=express)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-412991?logo=openai)
![License](https://img.shields.io/badge/license-MIT-blue)
![Tests](https://img.shields.io/badge/tests-Jest-C21325?logo=jest)

**Un bot inteligente para GitHub que etiqueta y clasifica issues automáticamente y revisa pull requests usando Inteligencia Artificial.**

</div>

---

## ✨ Características

| Característica | Descripción |
|---------|-------------|
| 🔐 **Webhooks Seguros** | Valida cada petición mediante firmas HMAC-SHA256 |
| 🏷️ **Auto-etiquetado** | Clasifica los issues como `bug`, `enhancement` (mejora), `question` (pregunta), `security` (seguridad), etc. |
| 🧠 **Análisis con IA** | Genera respuestas técnicas y análisis de causa raíz utilizando OpenAI o modelos compatibles |
| 🔍 **Revisión de PR** | Detecta malas prácticas, diffs muy grandes, falta de pruebas y descripciones ambiguas |
| 📊 **Logs Estructurados** | Sistema de logs basado en Winston con rotación de archivos |
| 🛡️ **Límite de Peticiones** | Protege contra el abuso masivo de webhooks (Rate Limiting) |
| 🔀 **Soporte Multi-repositorio** | Lista de permitidos configurable para funcionar en múltiples repositorios |
| 🔄 **Respuestas de Respaldo** | Degradación elegante en caso de que la API de la IA no esté disponible |

---

## 🏗️ Estructura del Proyecto

```
github-ai-automation-bot/
├── app.js                          # Punto de entrada del servidor Express
├── configs/                        # Configuraciones, validación y definición de etiquetas (Privado en GitLab)
├── src/                            # Lógica principal del bot
├── tests/                          # Tests automatizados con Jest (Privado en GitLab)
├── docs/                           # Documentación del sistema
├── diagrams/                       # Modelos visuales técnicos
├── scripts/                        # Scripts DevSecOps (incluye publish_public.ps1) (Privado en GitLab)
├── .gitlab-ci.yml                  # Configuración de integración continua
├── .env.example
├── .gitignore
└── package.json
```

---

## 🔒 Arquitectura DevSecOps (GitLab ➔ GitHub)

> **⚠️ AVISO IMPORTANTE: Esta rama en GitHub es una representación pública (Portafolio Sanitizado).**

Este proyecto sigue una arquitectura **DevSecOps profesional**, separando rigurosamente el entorno de desarrollo y pruebas del portafolio público:

* **GitLab (Laboratorio Privado)**: Actúa como la *Única Fuente de Verdad* (Source of Truth). Contiene el código completo, las suites de *testing* (TDD/BDD), configuraciones sensibles (`configs/`), pipelines de CI/CD (`.gitlab-ci.yml`), y la lógica de validación. Todo el desarrollo se trackea frente a `origin-gitlab/main`.
* **GitHub (Portafolio Público)**: Solo incluye el código funcional básico, estructura limpia, documentación (`docs/`), diagramas y las pautas generales de uso.

### 📜 Script `publish_public.ps1`

El repositorio implementa una estrategia de publicación automatizada mediante `scripts/publish_public.ps1`.
El flujo obligatorio garantiza que ningún cambio pase a GitHub sin ser primero validado en el pipeline y luego sanitizado:

1. **Desarrollo en `main` (GitLab)**
2. Validación en integración continua (*tests, linters y auditoría npm*)
3. Ejecución de `publish_public.ps1` en PowerShell
4. Creación dinámica de la rama `public`
5. **Sanitización forzada**: Eliminación de `tests/`, `configs/`, `scripts/` y artefactos dependientes del pipeline privado.
6. **Deploy**: Push forzado (`--force`) a `origin/main` (GitHub) de manera limpia y restringida.

---

## 🚀 Inicio Rápido

### Requisitos Previos

- Node.js >= 18
- Una cuenta y un repositorio en GitHub
- Una API Key de OpenAI (o de un proveedor compatible como Groq, Gemini, OpenRouter)
- Alguna forma de exponer tu servidor local (por ejemplo, [ngrok](https://ngrok.com))

---

### 1. Clonar e Instalar

```bash
git clone https://github.com/TU_USUARIO/github-ai-automation-bot.git
cd github-ai-automation-bot
npm install
```

---

### 2. Configurar Variables de Entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` e ingresa tus credenciales:

```env
# Token de acceso personal de GitHub
# Permisos obligatorios: repo → issues (lectura/escritura), pull requests (lectura/escritura)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx

# El secreto que introducirás al crear el webhook en GitHub
GITHUB_WEBHOOK_SECRET=elige_un_secreto_fuerte_y_aleatorio

# API Key de la Inteligencia Artificial (OpenAI, Gemini, Groq, etc.)
AI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxx
AI_BASE_URL=
AI_MODEL=gpt-4o-mini

# (Opcional) restringir a repositorios específicos: "propietario/repo1,propietario/repo2"
ALLOWED_REPOSITORIES=
```

---

### 3. Ejecutar Localmente

```bash
# Desarrollo (se reinicia automáticamente ante cambios)
npm run dev

# Producción
npm start
```

El servidor iniciará en `http://localhost:3000`.

Verifica que está corriendo correctamente:
```bash
curl http://localhost:3000/health
# → {"status":"ok","service":"github-ai-automation-bot",...}
```

---

### 4. Exponer con ngrok (para pruebas locales)

```bash
# Instalar ngrok: https://ngrok.com/download
ngrok http 3000
```

Copia la URL HTTPS, por ejemplo:
```
https://abc123.ngrok-free.app
```

La URL o Endpoint de tu Webhook será:
```
https://abc123.ngrok-free.app/webhooks/github
```

---

### 5. Conectar a un Repositorio en GitHub

1. Ve a tu repositorio en GitHub
2. Navega a **Settings (Configuración) → Webhooks → Add webhook**
3. Rellena el formulario:

| Campo | Valor |
|-------|-------|
| **Payload URL** | `https://TU-DOMINIO/webhooks/github` |
| **Content type** | `application/json` |
| **Secret** | El mismo valor de `GITHUB_WEBHOOK_SECRET` que tienes en tu `.env` |
| **Events** | Selecciona: `Issues`, `Issue comments`, `Pull requests` |

4. Haz clic en **Add webhook**
5. GitHub enviará un evento `ping` — revisa los logs en tu consola para ver:
   ```
   🏓 Ping received from GitHub – webhook configured successfully!
   ```

---

## 🧪 Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
npm test

# Modo de observación (watch mode)
npm run test:watch

# Ver reporte de cobertura
npm test -- --coverage
```

---

## 🔄 Flujo de Eventos

### Al abrir un Issue (Issue Opened)

```
GitHub → POST /webhooks/github
  └── verifySignature()           ← rechaza si es inválido
  └── isAllowedRepository()       ← salta si no está en la lista permitida
  └── classifyIssue()             ← puntuación de palabras clave (bug / mejora / pregunta / ...)
  └── addLabels()                 ← aplica la etiqueta mediante la API de GitHub
  └── analyzeIssueAndRespond()    ← La IA genera una respuesta técnica
  └── createComment()             ← se publica el comentario en el issue
```

### Al abrir un Pull Request (Pull Request Opened)

```
GitHub → POST /webhooks/github
  └── verifySignature()
  └── getPullRequestFiles()       ← obtiene los archivos cambiados
  └── runStaticChecks()           ← análisis rápidos y estáticos (sin costo de IA)
  └── addLabels()
  └── analyzePullRequest()        ← La IA revisa los cambios de código (diff)
  └── createComment()             ← se publica el comentario de revisión
```

---

## 🌐 Desplegar en Producción

### Opción A – Railway (Recomendado, tiene capa gratuita)

```bash
# Instalar Railway CLI
npm install -g @railway/cli

railway login
railway init
railway up
```

Configura tus variables de entorno en el panel de Railway bajo la pestaña **Variables**.

### Opción B – Render

1. Conecta tu repositorio de GitHub a [render.com](https://render.com)
2. Crea un **Web Service** con lo siguiente:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
3. Añade tus variables de entorno en el panel de control de Render.

### Opción C – VPS (Ubuntu/Debian)

```bash
# Instalar Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Instalar gestor de procesos PM2
npm install -g pm2

# Clonar y configurar
git clone https://github.com/TU_USUARIO/github-ai-automation-bot.git
cd github-ai-automation-bot
npm install
cp .env.example .env
nano .env  # rellena con tus valores

# Iniciar usando PM2
pm2 start app.js --name "github-ai-bot"
pm2 startup
pm2 save
```

Apunta tu dominio a la IP del servidor y utiliza NGINX como proxy inverso:

```nginx
server {
    listen 80;
    server_name bot.tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header Host $host;
    }
}
```

---

## 🎨 Personalizando las Etiquetas

Puedes editar el archivo `config/labels.js` para definir tus propias etiquetas y palabras clave de clasificación:

```js
// Ejemplo: Añadir una etiqueta nueva
LABELS.NEEDS_TRIAGE = {
  name       : 'needs-triage',
  color      : 'f9ca24',
  description: 'Necesita ser revisado por un mantenedor',
};

// Añadir palabras clave que detonen la clasificación de bug
CLASSIFICATION_KEYWORDS.bug.push('regression', 'broke', 'invalid');
```

---

## 📋 Referencia de la API

### `GET /health`

Retorna el estado del servidor.

```json
{
  "status": "ok",
  "service": "github-ai-automation-bot",
  "timestamp": "2024-02-01T12:00:00.000Z",
  "version": "1.0.0"
}
```

### `POST /webhooks/github`

Recibe y procesa los eventos de GitHub. Requiere que la cabecera `X-Hub-Signature-256` sea válida.

---

## 🔒 Consideraciones de Seguridad

- **Validación de firmas:** Se verifica en cada petición entrante usando `crypto.timingSafeEqual` para prevenir ataques de sincronización temporal.
- **Tokens:** Se guardan única y exclusivamente en variables de entorno — jamás deben ser expuestos en el código fuente.
- **Límite de peticiones:** Protege contra abuso limitando las llamadas (por defecto 30 por minuto).
- **Prevención de bucle infinito:** El bot ignora cualquier comentario realizado por una cuenta del tipo `Bot` (para evitar responderse a sí mismo).
- **Lista de permitidos:** Restringe opcionalmente a qué repositorios debe responder tu bot.

---

## 🤝 Contribuir

1. Haz un Fork del repositorio
2. Crea una rama para tu característica: `git checkout -b feat/mi-nueva-funcion`
3. Haz tus modificaciones y añade pruebas (`tests/`)
4. Corre el comando `npm test` para asegurarte de que todo funciona
5. Abre y envía un Pull Request

---

## 📄 Licencia

MIT © 2024

---

<div align="center">
  Construido con ❤️ usando Node.js, Express e Inteligencia Artificial
</div>
