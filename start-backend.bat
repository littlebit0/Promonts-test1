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
  -DMICROSOFT_CLIENT_ID=ba630253-585b-4120-8e51-bd2f7b146701 ^
  -DMICROSOFT_CLIENT_SECRET=Yu48Q~zL0KSveTKl1QvHq94y~jMu6pxxLkT2~b_z ^
  -DMICROSOFT_TENANT_ID=bee9c342-a775-4fc4-9f88-85472fbc9a97 ^
  -DMICROSOFT_REDIRECT_URI=http://20.196.128.122:8080/login/oauth2/code/microsoft ^
  -DFRONTEND_URL=http://20.196.128.122 ^
  -jar "%JAR%" > "%LOG%" 2>&1
