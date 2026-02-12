# SQL Interface – Proyecto Municipalidad

## 📌 Descripción General

**SQL Interface** es un proyecto de practica orientado al desarrollo de una **interfaz web moderna** para la gestión y visualización de datos almacenados en bases de datos SQL. El sistema busca simplificar la interacción con la base de datos mediante una aplicación web intuitiva, permitiendo consultar, administrar y visualizar información sin necesidad de conocimientos avanzados en SQL.

El proyecto está enfocado en buenas prácticas de desarrollo, separación de responsabilidades y una experiencia de usuario clara, utilizando tecnologías actuales del ecosistema web.

---

## 🎯 Objetivo del Proyecto

Desarrollar una plataforma web que permita:

* Facilitar el acceso a información almacenada en bases de datos SQL.
* Proveer una interfaz gráfica amigable para la ejecución de consultas.
* Mejorar la visualización y gestión de datos.
* Reducir errores humanos al interactuar directamente con SQL.

---

## 🏗️ Arquitectura del Proyecto

El proyecto sigue una arquitectura **Frontend desacoplada**, organizada de la siguiente manera:

```
SQL_Interface/
│
├── my-app/                # Aplicación Frontend
│   ├── app/               # Rutas y vistas (Next.js)
│   ├── components/        # Componentes reutilizables
│   ├── global.css/            # Estilos globales
│   ├── public/            # Recursos estáticos
│   ├── package.json       # Dependencias del proyecto
│   └── tailwind.config.ts # Configuracion de plugins
│
└── README.md              # Documentación general
```
---

## 🧰 Tecnologías Utilizadas
### Frontend

* **Next.js** – Framework React para aplicaciones web modernas
* **TypeScript** – Tipado estático para mayor robustez
* **Tailwind CSS** – Estilizado rápido y consistente
* **React** – Construcción de interfaces dinámicas

### Herramientas

* **PNPM** – Gestor de paquetes
* **Git** – Control de versiones

---

## 🚀 Instalación y Ejecución

### Requisitos Previos

* Node.js 18+
* PNPM instalado

### Pasos

```bash
# Clonar el repositorio
git clone <https://github.com/Nicolas-15/SQL_Interface.git>

# Ingresar al proyecto
cd SQL_Interface/my-app

# Instalar dependencias
pnpm install

# Ejecutar en modo desarrollo
pnpm dev
```
La aplicación estará disponible en:
http://localhost:3000

## 👨‍🎓 Autor

**Nicolás Alejandro López Plaza**
Proyecto de practica / Informatica
