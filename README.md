# Práctica 2 - Arquitectura y Programacion de Sistemas en Internet

## Objetivo del proyecto 
Implementar una API REST básica para gestionar los libros y los préstamos de una biblioteca. El objetivo es practicar rutas, métodos HTTP, rutas dinámicas (:id), parámetros de consulta, códigos de estado y lógica de negocio dentro de los handlers.

Proyecto desarrollado con Node.js, TypeScript y Express.

## Requisitos previos

Para ejecutar el proyecto es necesario tener instalado:

- [Node.js](https://nodejs.org/)
- npm, incluido con Node.js.

## Instalación

1. Clonar el repositorio de GitHub:

   ```bash
   git clone URL_DEL_REPOSITORIO
   ```

2. Acceder a la carpeta del proyecto:

   ```bash
   cd practica2
   ```

3. Instalar las dependencias:

   ```bash
   npm install
   ```

## Ejecución del servidor

Para compilar el proyecto TypeScript, ejecutar:

```bash
npm run build
```

Una vez finalizada la compilación correctamente, arrancar el servidor con:

```bash
npm start
```

## Modo desarrollo

Para ejecutar el proyecto en modo desarrollo, utilizar:

```bash
npm run dev
```

Este comando ejecuta el archivo `src/index.ts` mediante `tsx`.

## Tecnologías utilizadas

- Node.js
- TypeScript
- Express