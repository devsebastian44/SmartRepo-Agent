# Contributing to GitHub AI Automation Bot

Thank you for your interest in contributing! This document provides guidelines for contributing to this project.

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and configure your environment variables
4. Start development server: `npm run dev`

## Code Style

This project uses ESLint and Prettier for code formatting:

- Run `npm run lint` to check code style
- Run `npm run lint:fix` to automatically fix linting issues
- Run `npm run format` to format code with Prettier

## Testing

- Run tests: `npm test`
- Run tests in watch mode: `npm run test:watch`
- Run tests with coverage: `npm test` (coverage is generated automatically)

## Pre-commit Hooks

This project uses Husky and lint-staged to ensure code quality:

- Code is automatically linted and formatted before each commit
- Tests run automatically before pushing (if configured)

## Submitting Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m "feat: add amazing feature"`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Commit Message Format

This project follows [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` for new features
- `fix:` for bug fixes
- `docs:` for documentation changes
- `style:` for code style changes
- `refactor:` for code refactoring
- `test:` for test changes
- `chore:` for maintenance tasks

## Security

If you discover a security vulnerability, please report it privately before creating a public issue.
