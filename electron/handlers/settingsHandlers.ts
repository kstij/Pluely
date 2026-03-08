import { ipcMain } from "electron"
import { AppState } from "../main"

export function setupSettingsHandlers(appState: AppState): void {
  ipcMain.handle("get-current-llm-config", async () => {
    const llmHelper = appState.processingHelper.getLLMHelper()
    return llmHelper.getCurrentConfig()
  })

  ipcMain.handle("switch-to-ollama", async (event, model, url) => {
    const llmHelper = appState.processingHelper.getLLMHelper()
    try {
      await llmHelper.switchToOllama(model, url)
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("get-available-ollama-models", async () => {
    const llmHelper = appState.processingHelper.getLLMHelper()
    try {
      const models = await llmHelper.getOllamaModels()
      return models
    } catch (error: any) {
      console.error("Error fetching models:", error)
      return []
    }
  })

  ipcMain.handle("switch-to-gemini", async (event, apiKey) => {
    const llmHelper = appState.processingHelper.getLLMHelper()
    try {
      if (apiKey) {
        // Handle API key update if provided
        await llmHelper.switchToGemini(apiKey)
      } else {
        // Switch to Gemini with existing key (assuming it is set)
        await llmHelper.switchToGemini()
      }
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("test-llm-connection", async () => {
    const llmHelper = appState.processingHelper.getLLMHelper()
    try {
      const result = await llmHelper.testConnection()
      return { success: result }
    } catch (error: any) {
      return { success: false, error: error.message }
    }
  })

  ipcMain.handle("gemini-chat", async (event, text: string) => {
    try {
      const llmHelper = appState.processingHelper.getLLMHelper()
      return await llmHelper.chat(text)
    } catch (error: any) {
      console.error("Gemini Chat Error:", error)
      throw error
    }
  })
}
