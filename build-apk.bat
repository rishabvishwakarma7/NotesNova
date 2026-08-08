@echo off
echo ================================================
echo   NoteNova AI - APK Builder
echo ================================================
echo.

set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

cd /d "d:\Notes improviser\client"

echo [1/2] Syncing Capacitor...
call npx cap sync android

echo.
echo [2/2] Building APK...
cd android
call gradlew.bat assembleDebug

echo.
if exist "app\build\outputs\apk\debug\app-debug.apk" (
    copy "app\build\outputs\apk\debug\app-debug.apk" "d:\Notes improviser\NoteNova-AI-debug.apk" /Y
    echo ================================================
    echo   SUCCESS! APK saved to:
    echo   d:\Notes improviser\NoteNova-AI-debug.apk
    echo ================================================
) else (
    echo BUILD FAILED - check errors above
)
pause
