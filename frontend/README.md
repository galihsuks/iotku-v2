# Galih Base App - React Admin

Frontend ini adalah admin panel untuk `galih-base-app`.

Project React ini fokus pada:
- customer dan admin app setelah user lolos login dari CodeIgniter
- protected routing
- sidebar berbasis menu access dari backend
- access control per halaman
- reusable UI components
- React Query untuk fetching API
- Zustand untuk state global ringan

## Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS v4
- React Router
- TanStack React Query
- Zustand
- React Hook Form
- Zod
- Axios
- Lucide React

## Tujuan Project

Admin app ini dirancang sebagai base app yang reusable, jadi bukan sekadar demo Vite biasa.

Hal-hal yang sudah disiapkan:
- struktur folder per page
- auth flow
- reusable form component
- reusable modal, table, button, badge, filter grid
- toast notification
- error template page
- menu access dan access control berbasis API backend
- lazy-loaded route untuk optimasi bundle

## Menjalankan Project

## 1. Install dependency

```bash
npm install
```

## 2. Siapkan environment

File `.env` yang dipakai saat ini:

```env
VITE_API_URL=http://localhost:8080
VITE_APP_TITLE=Galih Base App
```

Pastikan `VITE_API_URL` mengarah ke project CodeIgniter.

## 3. Jalankan development server

```bash
npm run dev
```

Default:

- frontend:
  [http://localhost:5173](http://localhost:5173)

## 4. Build production

```bash
npm run build
```

## Script yang tersedia

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Struktur Folder Ringkas

```text
src/
  api/
  assets/
  components/
  constants/
  hooks/
  interfaces/
  layouts/
  lib/
  pages/
  routes/
  store/
  utils/
```

## Struktur Page

Page disusun dengan pola seperti ini:

```text
src/pages/{group}/{menu}/
  {Menu}Page.tsx
  components/
  schemas/
```

Group utama yang sekarang dipakai:

- `customer`
- `main`
- `system`

## Routing Saat Ini

Route utama:

- `/customer/cart`
- `/customer/orders`
- `/customer/history`
- `/customer/profile`
- `/admin/dashboard`
- `/admin/system/menu`
- `/admin/system/role`
- `/admin/system/user`
- `/admin/system/parameter`
- `/admin/system/log`

Routing sudah memakai:
- `RouterProvider`
- protected route
- guest route
- lazy loading per page

File penting:
- `src/App.tsx`
- `src/routes/router.tsx`

## Auth dan Access Control

Flow auth:

1. user login lewat halaman CodeIgniter di `/login`
2. CodeIgniter menyimpan session auth dan cookie `auth_token`
3. React bootstrap user login lewat `GET /api/auth/me`
4. request API protected otomatis kirim cookie via `withCredentials`
5. jika `401`, user di-logout otomatis dan dikirim balik ke `/login`

Flow access:

1. app ambil daftar menu dari `/api/access/menu`
2. setiap halaman aktif ambil access control dari `/api/access/control/{menu_id}`
3. hasil access control disimpan di Zustand
4. komponen tinggal pakai:

```ts
const hasAccess = useHasAccess();
```

Contoh:

```tsx
{hasAccess("C") ? <Button>Add</Button> : null}
```

Kode access yang dipakai:

- `C` = Create
- `R` = Read
- `U` = Update
- `D` = Delete
- `AC` = Access Control

## Data Fetching

Project ini memakai pola:

- `src/api/{feature}/{feature}Api.ts`
- `src/api/{feature}/{feature}Query.ts`

Contoh:

- `authApi.ts`
- `authQuery.ts`

Beberapa query sudah dioptimasi:
- `access/menu` hanya fetch sekali per sesi login
- `access/control/{menu_id}` di-cache per menu id

## Reusable UI yang Sudah Ada

Komponen reusable utama:

- `Button`
- `Badge`
- `Table`
- `Modal`
- `FilterGrid`
- `FormInput`
- `FormFile`
- `FormCheckbox`
- `FormRadio`
- `ToastContainer`
- `PageHeader`
- `AppLogo`

## Table

`TableColumn` mendukung properti:

- `key`
- `header`
- `className`
- `hidden`
- `render`

Contoh use case `hidden`:
- kolom actions disembunyikan jika user tidak punya akses sama sekali

## Styling

Theme warna memakai semantic token berbasis Tailwind:

- `primary`
- `secondary`
- `success`
- `info`
- `warning`
- `danger`
- `light`
- `dark`

Contoh:

- `bg-primary-600`
- `text-dark-900`
- `border-warning-200`

Scrollbars juga sudah dibuat minimalis dan mengikuti theme project.

## Error Handling

Sudah ada template untuk:

- `Forbidden`
- `NotFound`
- `InternalServerError`
- `NetworkError`

Sumber error bisa dari:
- HTTP status backend
- route React yang tidak ada
- network failure

## Notifikasi dan Logging

- toast notification memakai Zustand store
- frontend error bisa dikirim ke backend log API
- logger lokal lama sudah dihapus

## Halaman System yang Sudah Ada

- Menu management
- Role management
- User management
- Parameter management
- Log monitoring

Semua halaman tersebut sudah memakai:
- page header
- filter
- modal form / delete
- table
- akses berbasis `hasAccess(...)`

## Catatan Build

Route page sudah di-lazy-load, jadi bundle awal lebih ringan dibanding sebelumnya.

Kalau `npm run build` berhasil, maka output siap di-serve sebagai static admin app.

## Integrasi dengan CodeIgniter

Frontend ini diasumsikan consume backend CodeIgniter pada:

- `POST /api/auth/logout`
- `GET /api/auth/me`
- `GET /api/access/menu`
- `GET /api/access/control/{menu_id}`
- endpoint master lain sesuai feature

Jadi agar app ini jalan penuh, backend CodeIgniter harus:

1. sudah migrate
2. sudah seed
3. punya akun super admin

Seeder backend yang direkomendasikan:

```bash
php spark db:seed BaseAppSeeder
```

## Saran Penggunaan

Project ini cocok jadi base admin panel jika kamu butuh:

- UI admin modern
- akses menu per role
- access control per action
- reusable component yang konsisten
- struktur project yang gampang dikembangkan lagi
