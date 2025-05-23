# Plataforma E-Commerce Pacha Jujuy 🌵🛒

## Descripción General

Pacha Jujuy es una aplicación de comercio electrónico full-stack construida con tecnologías web modernas. La plataforma ofrece una experiencia de compra completa con navegación de productos, gestión de carrito, autenticación de usuarios y procesamiento seguro de pagos a través de PayPal y MercadoPago.

## 🛠️ Stack Tecnológico

### Frontend
* **Framework**: Angular 13
* **Lenguajes**: TypeScript, HTML, CSS
* **Bibliotecas UI**: Bootstrap
* **Notificaciones**: ngx-toastr
* **Integración de Pagos**: ngx-paypal

### Backend
* **Runtime**: Node.js
* **Framework**: Express
* **Autenticación**: JSON Web Token (JWT)
* **Encriptación**: Crypto.js

### Base de Datos
* **MongoDB**: Base de datos NoSQL para almacenar información de productos, usuarios y pedidos.

## ✨ Características

* Autenticación de usuarios y gestión de cuentas.
* Catálogo de productos con filtrado y capacidades de búsqueda.
* Funcionalidad de carrito de compras.
* Proceso de pago seguro.
* Procesamiento de pagos con PayPal y MercadoPago.
* Historial de pedidos y seguimiento.
* Diseño *responsive* para móviles y escritorio.

## 🚀 Instalación

### Requisitos Previos
* Node.js y npm
* Angular CLI
* MongoDB (Instalado y corriendo)

### Instrucciones de Configuración

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/choqooz/Pacha-Jujuy.git](https://github.com/choqooz/Pacha-Jujuy.git)
    cd Pacha-Jujuy
    ```

2.  **Instalar dependencias del backend:**
    ```bash
    cd backend
    npm install
    ```

3.  **Instalar dependencias del frontend:**
    ```bash
    cd ../frontend
    npm install
    ```

4.  **Configurar variables de entorno:**
    * Crea un archivo `.env` en el directorio `backend/` basándote en el archivo `backend/.env.example`. Asegúrate de configurar la URI de conexión a MongoDB y las claves secretas (JWT, IDs de PayPal/MercadoPago).
    * Actualiza las URLs de la API en `frontend/src/environments/environment.ts` y `environment.prod.ts` si es necesario.

5.  **Iniciar el servidor backend:**
    ```bash
    cd backend
    npm start
    ```

6.  **Iniciar el servidor de desarrollo frontend:**
    ```bash
    cd ../frontend
    ng serve -o
    ```

7.  **Acceder a la aplicación:**
    La aplicación estará disponible en `http://localhost:4200`. El backend por defecto corre en el puerto especificado en el `.env` (usualmente 3000).

## 🔌 Documentación API (Endpoints Backend)

El backend expone las siguientes APIs RESTful (ruta base `/api`):

### Autenticación y Usuarios (`/users`)
* `POST /register`: Registro de un nuevo usuario.
* `POST /login`: Autenticación de usuario y obtención de token JWT.
* `GET /profile`: Obtener el perfil del usuario autenticado (requiere token).
* `PUT /profile`: Actualizar el perfil del usuario autenticado (requiere token).
* `GET /`: Listar todos los usuarios (solo admin).
* `DELETE /:id`: Eliminar un usuario por ID (solo admin).
* `GET /:id`: Obtener detalles de un usuario por ID (solo admin).
* `PUT /:id`: Actualizar un usuario por ID (solo admin).

### Productos (`/products`)
* `GET /`: Listar todos los productos (con filtros opcionales por query params: `keyword`, `category`, `pageNumber`, `pageSize`).
* `GET /:id`: Obtener detalles de un producto específico por ID.
* `GET /categories`: Obtener todas las categorías de productos existentes.
* `POST /`: Crear un nuevo producto (solo admin).
* `PUT /:id`: Actualizar un producto existente por ID (solo admin).
* `DELETE /:id`: Eliminar un producto por ID (solo admin).
* `POST /:id/reviews`: Crear una nueva reseña para un producto (requiere token).

### Pedidos (`/orders`)
* `POST /`: Crear un nuevo pedido (requiere token).
* `GET /myorders`: Obtener el historial de pedidos del usuario autenticado (requiere token).
* `GET /`: Obtener todos los pedidos (solo admin).
* `GET /:id`: Obtener detalles de un pedido específico por ID (requiere token).
* `PUT /:id/pay`: Marcar un pedido como pagado (generalmente actualizado tras confirmación de pago).
* `PUT /:id/deliver`: Marcar un pedido como entregado (solo admin).

### Pagos (`/payments` o integrado en `/orders`)
* `GET /config/paypal`: Obtener el Client ID de PayPal.
* `POST /create-payment-intent/mercadopago`: Generar una preferencia de pago con MercadoPago.
* *(Callbacks/Webhooks como `/success`, `/failure`, `/webhook/mercadopago`)*: Rutas para manejar las respuestas de las pasarelas de pago.

## 🧑‍💻 Colaboradores

* Baysse, Juan Benjamin ([@JuanBaysse](https://github.com/JuanBaysse))
* Diaz, Marcos Ignacio ([@DzFox3](https://github.com/DzFox3))
* Estrada, Rodolfo Ezequiel ([@choqooz](https://github.com/choqooz))
* Molina, Gabriel Eduardo ([@gabrielmol92](https://github.com/gabrielmol92))
* Rodriguez, Elio Nelson ([@ElioNRodriguez](https://github.com/ElioNRodriguez))
