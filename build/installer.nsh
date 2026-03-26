; Script personalizado de NSIS para instalador/desinstalador

!macro customInstall
  ; Intentar cierre limpio primero, luego forzar
  nsExec::Exec 'taskkill /IM "Carnes Lay.exe"'
  Pop $0
  Sleep 1500
  ; Forzar si sigue corriendo
  nsExec::Exec 'taskkill /F /IM "Carnes Lay.exe" /T'
  Pop $0
  Sleep 1000
!macroend

!macro customUnInstall
  ; Intentar cierre limpio primero, luego forzar
  nsExec::Exec 'taskkill /IM "Carnes Lay.exe"'
  Pop $0
  Sleep 1500
  nsExec::Exec 'taskkill /F /IM "Carnes Lay.exe" /T'
  Pop $0
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
