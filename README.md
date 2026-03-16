# SyroxTech — Admin Panel

Panel de administración fullstack para gestión de productos, categorías y órdenes de venta.

🌐 **Demo en vivo:** https://syroxtech-challenge.vercel.app

---

## 🛠 Stack

**Backend**

- NestJS + TypeScript
- Prisma ORM
- PostgreSQL (Supabase)
- JWT Auth

**Frontend**

- Next.js 14 (App Router)
- Tailwind CSS + Shadcn UI
- Axios
- i18n ES/EN

---

## 🚀 Instalación local

### Requisitos

- Node.js 18+
- PostgreSQL local o cuenta en Supabase

### Backend

```bash
cd backend
npm install
```

Creá un archivo `.env` en `/backend`:

```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/ecommerce_db"
DIRECT_URL="postgresql://usuario:password@localhost:5432/ecommerce_db"
JWT_SECRET="tu_jwt_secret"
```

```bash
npx prisma migrate dev
npm run start:dev
```

El backend corre en `http://localhost:3000`

### Frontend

```bash
cd frontend
npm install
```

Creá un archivo `.env` en `/frontend`:

```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
```

```bash
npm run dev
```

El frontend corre en `http://localhost:3000` (o el siguiente puerto disponible)

---

## 🔐 Credenciales de prueba

```
Email: admin@test.com
Password: 1234
```

---

## 📦 Funcionalidades

### Categorías

- CRUD completo con subcategorías
- Validación para no eliminar categorías con productos asociados

### Productos

- CRUD completo con imagen, marca, stock y estado
- Búsqueda por nombre, marca y descripción
- Stock automático (Disponible / Agotado)

### Órdenes

- Crear órdenes con datos del cliente y múltiples productos
- Estados: En Preparación, Enviado, Completado, Cancelado
- Estado de pago: Pagado, Pendiente, Fallido
- Número de tracking
- Historial de cambios de estado
- Devolución automática de stock al cancelar o eliminar una orden
- Búsqueda por nombre, email o número de orden

### Dashboard

- Estadísticas en tiempo real (ingresos, productos, categorías, órdenes)
- Tabla de órdenes recientes

---

## 🌍 Internacionalización

El panel soporta español e inglés. El idioma se puede cambiar desde el navbar o la pantalla de login y se persiste en localStorage.

---

## 📁 Estructura del proyecto

```
syroxtech_challenge/
├── backend/          # NestJS API
│   ├── prisma/       # Schema y migraciones
│   └── src/
│       ├── auth/
│       ├── categories/
│       ├── products/
│       └── orders/
└── frontend/         # Next.js App
    └── src/
        ├── app/      # Páginas (App Router)
        ├── api/      # Axios + servicios
        ├── components/
        ├── context/  # LanguageContext
        ├── hooks/
        ├── lib/      # i18n + utils
        └── types/
```

---

## 🚢 Deploy

- **Backend:** Render
- **Frontend:** Vercel
- **Base de datos:** Supabase (PostgreSQL)
