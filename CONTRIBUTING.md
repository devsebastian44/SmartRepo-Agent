# Guía de Contribución al Bot de Automatización GitHub con IA

¡Gracias por tu interés en contribuir! Este documento proporciona las pautas para contribuir a este proyecto.

## Configuración de Desarrollo

1. Clona el repositorio
2. Instala las dependencias: `npm install`
3. Copia `.env.example` a `.env` y configura tus variables de entorno
4. Inicia el servidor de desarrollo: `npm run dev`

## Estilo de Código

Este proyecto utiliza ESLint y Prettier para el formateo de código:

- Ejecuta `npm run lint` para verificar el estilo del código
- Ejecuta `npm run lint:fix` para corregir automáticamente problemas de linting
- Ejecuta `npm run format` para formatear el código con Prettier

## Pruebas

- Ejecutar pruebas: `npm test`
- Ejecutar pruebas en modo watch: `npm run test:watch`
- Ejecutar pruebas con coverage: `npm test` (el coverage se genera automáticamente)

## Hooks Pre-commit

Este proyecto utiliza Husky y lint-staged para asegurar la calidad del código:

- El código se lintea y formatea automáticamente antes de cada commit
- Las pruebas se ejecutan automáticamente antes de hacer push (si está configurado)

## Enviar Cambios

1. Fork el repositorio
2. Crea una rama de feature: `git checkout -b feature/amazing-feature`
3. Confirma tus cambios: `git commit -m "feat: add amazing feature"`
4. Push a la rama: `git push origin feature/amazing-feature`
5. Abre un Pull Request

## Formato de Mensajes de Commit

Este proyecto sigue la especificación [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` para nuevas características
- `fix:` para correcciones de bugs
- `docs:` para cambios en documentación
- `style:` para cambios de estilo de código
- `refactor:` para refactorización de código
- `test:` para cambios en pruebas
- `chore:` para tareas de mantenimiento

## Seguridad

Si descubres una vulnerabilidad de seguridad, por favor repórtala de forma privada antes de crear un issue público.
