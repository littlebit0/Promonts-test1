@echo off
set JAR=C:\Users\littlebit\.openclaw\workspace\Promonts\backend\build\libs\backend-0.0.1-SNAPSHOT.jar
set LOG=C:\Users\littlebit\.openclaw\workspace\Promonts\backend-prod.log

java ^
  -Dspring.profiles.active=prod ^
  -DDATABASE_URL=jdbc:postgresql://localhost:5432/promonts ^
  -DDATABASE_USERNAME=promonts ^
  -DDATABASE_PASSWORD=promonts2026! ^
  -DJWT_SECRET=promonts-azure-production-secret-key-2026-minimum-32chars!! ^
  -DCORS_ALLOWED_ORIGINS=http://20.196.128.122,http://localhost ^
  -jar "%JAR%" > "%LOG%" 2>&1
