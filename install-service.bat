@echo off
:: Promonts 백엔드 Windows 서비스 등록 스크립트
:: 관리자 권한으로 실행 필요

set SERVICE_NAME=PromontsBackend
set JAR=C:\Users\littlebit\.openclaw\workspace\Promonts\backend\build\libs\backend-0.0.1-SNAPSHOT.jar
set LOG=C:\Users\littlebit\.openclaw\workspace\Promonts\backend-prod.log
set JAVA_PATH=java

echo [1/3] 기존 서비스 제거 (있으면)...
sc stop %SERVICE_NAME% >nul 2>&1
sc delete %SERVICE_NAME% >nul 2>&1
timeout /t 2 >nul

echo [2/3] NSSM 설치 확인...
where nssm >nul 2>&1
if %errorlevel% neq 0 (
    echo NSSM이 없습니다. winget으로 설치합니다...
    winget install NSSM.NSSM -e --silent
    if %errorlevel% neq 0 (
        echo winget 설치 실패. 수동 설치 필요:
        echo   1. https://nssm.cc/download 에서 nssm.exe 다운로드
        echo   2. C:\Windows\System32\ 에 복사
        echo   3. 이 스크립트 다시 실행
        pause
        exit /b 1
    )
)

echo [3/3] 서비스 등록 중...
nssm install %SERVICE_NAME% %JAVA_PATH%
nssm set %SERVICE_NAME% AppParameters ^
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
  -jar "%JAR%"
nssm set %SERVICE_NAME% AppDirectory C:\Users\littlebit\.openclaw\workspace\Promonts
nssm set %SERVICE_NAME% AppStdout %LOG%
nssm set %SERVICE_NAME% AppStderr %LOG%
nssm set %SERVICE_NAME% AppRotateFiles 1
nssm set %SERVICE_NAME% AppRotateBytes 10485760
nssm set %SERVICE_NAME% Start SERVICE_AUTO_START
nssm set %SERVICE_NAME% DisplayName "Promonts Backend"
nssm set %SERVICE_NAME% Description "Promonts Spring Boot Backend Service"

echo.
echo ✅ 서비스 등록 완료!
echo.
echo 시작하려면:
echo   sc start %SERVICE_NAME%
echo   또는
echo   nssm start %SERVICE_NAME%
echo.
echo 상태 확인:
echo   sc query %SERVICE_NAME%
echo.
echo 서비스 제거:
echo   nssm remove %SERVICE_NAME% confirm
echo.

set /p START=지금 바로 서비스를 시작할까요? (Y/N): 
if /i "%START%"=="Y" (
    nssm start %SERVICE_NAME%
    echo 서비스가 시작되었습니다.
    sc query %SERVICE_NAME%
)

pause
