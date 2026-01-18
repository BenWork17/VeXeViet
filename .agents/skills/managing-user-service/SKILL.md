---
name: managing-user-service
description: Manages User Service operations including Prisma schema, migrations, authentication logic, and profile management. Use when working on user-related backend features.
---

# Managing User Service

This skill handles backend operations for the VeXeViet User Service.

## Capabilities
- Prisma schema modifications
- Database migrations (`npx prisma migrate dev`)
- Auth logic (JWT, Bcrypt)
- Profile & User CRUD operations

## Workflows
1. **Schema Update**:
   - Edit `services/user-service/prisma/schema.prisma`
   - Run `make db-migrate` or `npx prisma migrate dev`
2. **Testing**:
   - Run unit tests in `services/user-service`
