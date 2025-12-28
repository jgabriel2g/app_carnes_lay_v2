; Script personalizado de NSIS para instalador/desinstalador

!macro customInstall
  ; Cerrar la app si está corriendo antes de instalar
  nsExec::Exec 'taskkill /F /IM "Carnes Lay.exe" /T'
  Pop $0
  Sleep 1000
!macroend

!macro customUnInstall
  ; Cerrar la app si está corriendo antes de desinstalar
  nsExec::Exec 'taskkill /F /IM "Carnes Lay.exe" /T'
  Pop $0

  ; Esperar 1 segundo para que se cierren los procesos
  Sleep 1000

  ; Eliminar datos de usuario (AppData)
  RMDir /r "$APPDATA\carnes-lay"
  RMDir /r "$LOCALAPPDATA\carnes-lay"
  RMDir /r "$LOCALAPPDATA\carnes-lay-updater"

  ; Eliminar accesos directos del escritorio si existen
  Delete "$DESKTOP\Carnes Lay.lnk"

  ; Limpiar cache y archivos temporales
  RMDir /r "$TEMP\carnes-lay"
!macroend
