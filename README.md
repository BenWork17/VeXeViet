# VeXeViet Frontend (`vexeviet-fe`)

Frontend Turborepo monorepo cho nền tảng đặt vé xe khách trực tuyến **VeXeViet**, kết nối trực tiếp tới Backend API Gateway tại `d:\Vexeviet\vexeviet-be` (`http://localhost:3000/api/v1`).

## Cấu trúc thư mục

```text
vexeviet-fe/
├── apps/
│   ├── web/              # (:8081) Ứng dụng đặt vé dành cho khách hàng (Next.js 14 App Router)
│   └── admin/            # (:8082) Cổng quản trị dành cho ADMIN & OPERATOR (Next.js 14 App Router)
├── packages/
│   ├── types/            # (@vexeviet/types) DTOs & API contracts dùng chung toàn FE
│   ├── api-client/       # (@vexeviet/api-client) Shared endpoints, chuẩn hoá lỗi + X-Request-Id, media helpers
│   ├── ui/               # (@vexeviet/ui) Design System primitives & hàm cn()
│   └── config/           # (@vexeviet/config) Shared TypeScript & ESLint presets
├── archive/
│   └── mobile/           # Bản prototype Expo/React Native (tách khỏi luồng build mặc định)
└── docs/                 # { design/, guides/, testing/, archive/ }
```

## Khởi chạy nhanh

```bash
pnpm install
cp .env.example .env.local
pnpm dev          # Chạy song song web (:8081) và admin (:8082)
```

### Các lệnh kiểm tra chất lượng mã nguồn

```bash
pnpm typecheck    # Kiểm tra TypeScript toàn monorepo
pnpm lint         # Kiểm tra ESLint
pnpm test:unit    # Chạy Unit Tests (Vitest)
pnpm build        # Build production cho tất cả packages và apps
```
