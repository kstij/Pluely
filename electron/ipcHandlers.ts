// ipcHandlers.ts

import { ipcMain, app } from "electron"
import { AppState } from "./main"
import { setupWindowHandlers } from "./handlers/windowHandlers"
import { setupScreenshotHandlers } from "./handlers/screenshotHandlers"
import { setupProcessingHandlers } from "./handlers/processingHandlers"
import { setupSettingsHandlers } from "./handlers/settingsHandlers"

export function initializeIpcHandlers(appState: AppState): void {
  // Setup Window Handlers
  setupWindowHandlers(appState)

  // Setup Screenshot Handlers
  setupScreenshotHandlers(appState)

  // Setup Processing Handlers
  setupProcessingHandlers(appState)

  // Setup Settings Handlers
  setupSettingsHandlers(appState)

  ipcMain.handle("quit-app", () => {
    app.quit()
  })
}
