# Tamkin Application

## ملاحظة مهمة للـ Git

تأكد من commit الملفات التالية:

- `.env.prod` و `.env.test` (تحتوي على إعدادات غير حساسة)
- جميع ملفات `docker-compose.*.yml`
- جميع ملفات `nginx/*.conf`
- ملفات الكود في `tamkin-frontend/` و `tamkin-backend/`

الملفات المستثناة من Git:

- `node_modules/`
- `.next/` و `dist/`
- `.env` المحلية
- `postgres-data*/`

## ملفات الإعداد

- `.env.prod` - إعدادات بيئة الإنتاج
- `.env.test` - إعدادات بيئة الاختبار

ملحوظة: ملفات `.env` موجودة في الـ root فقط، Docker Compose بيمرر المتغيرات للـ containers مباشرة.

## تشغيل البيئات المختلفة

### Local Development Environment

```bash
docker-compose up -d
```

### Production Environment

```bash
docker-compose --env-file .env.prod -f docker-compose.prod.yml up -d
```

### Test Environment

```bash
docker-compose --env-file .env.test -f docker-compose.test.yml up -d
```

### إيقاف الخدمات

```bash
# Local
docker-compose down

# Production
docker-compose -f docker-compose.prod.yml down

# Test
docker-compose -f docker-compose.test.yml down
```

## المنافذ (Ports)

### Local

- Nginx (Main Entry): http://localhost:3080
- PostgreSQL: localhost:5434

### Production

- Nginx (Main Entry): http://localhost:8080
- PostgreSQL: localhost:5433

### Test

- Nginx (Main Entry): http://localhost:8000
- PostgreSQL: localhost:5432

ملحوظة: Nginx بيعمل reverse proxy للـ frontend والـ backend. استخدم `/api` للوصول للـ backend API.
