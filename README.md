# MyReadings - Frontend UI

This repository contains the source code for the MyReadings web application frontend. It is a Single-Page Application (SPA) built with Vue.js that provides the user interface for interacting with the `myreadings` backend services.

This repository is one of the three main components of the project:

- `myreadings`: The modular backend built with Quarkus.
- `myreadings_ui` (this repo): The frontend built with Vue.js.
- `myreadings_deploy`: The infrastructure and provisioning configuration.

## Technology Stack

- **Framework**: [Vue.js](https://vuejs.org/ "null") (v3) with the Composition API and `<script setup>` syntax.
- **Build Tool**: [Vite](https://vitejs.dev/ "null")
- **Language**: [TypeScript](https://www.typescriptlang.org/ "null")
- **UI Component Library**: [Vuetify](https://vuetifyjs.com/ "null")
- **State Management**: Vue Composables
- **Routing**: [Vue Router](https://router.vuejs.org/ "null")
- **HTTP Client**: [Axios](https://axios-http.com/ "null")
- **Authentication**: [@josempgon/vue-keycloak]https://github.com/JoseGoncalves/vue-keycloak "null") wrapper for `keycloak-js`.

## Project Setup and Development

### Prerequisites

Before running the frontend in development mode, you must have the backend application and its supporting infrastructure (databases, identity provider, etc.) up and running.

This project is decoupled from the backend and its deployment. For detailed instructions on how to launch the required infrastructure, please refer to the following repositories:

- **`myreadings_deploy`**: Contains the Docker Compose and Ansible configurations to start the entire infrastructure.
- **`myreadings`**: Contains the backend source code, which must be running to handle API requests.

### Installation

Clone the repository and install the dependencies using npm:

    npm install

### Compiles and Hot-Reloads for Development

To start the local development server with hot-reloading, run:

    npm run dev

The application will be available at `http://localhost:3000` (or the port specified by the `dev` script in `package.json`).

## Environment Configuration

This project uses `.env` files to manage environment-specific configurations, primarily the URLs for Keycloak and the backend API.

- **`.env.development`**: Used automatically when running `npm run dev`. This file contains URLs pointing to `localhost` with the appropriate ports, allowing the local dev server to connect to the infrastructure running in Docker.
- **`.env.docker`**: Used automatically by the `npm run build:docker` script. This file configures the application for the containerized environment, where API calls are proxied through Nginx.

## Building for Production

To create a production-ready build of the application, use the following scripts:

- **Standard Build**: Compiles and minifies for production. Uses the `.env.production` file if it exists.

      npm run build

- **Docker Build**: A specific script used within the `Dockerfile` to build the application with the correct environment variables for the containerized deployment.

      npm run build:docker

The build artifacts will be generated in the `dist/` directory.

## Linting and Formatting

- **Run ESLint**:

      npm run lint:eslint

- **Run OXLint**:

      npm run lint:oxlint

- **Run all linters**:

      npm run lint

- **Format code with Prettier**:

      npm run format
