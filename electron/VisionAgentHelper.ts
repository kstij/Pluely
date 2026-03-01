/**
 * VisionAgentHelper - Bridge between Electron and Vision Agents Python backend
 * Handles WebSocket communication for real-time screen analysis
 */

import WebSocket from 'ws'
import fs from 'fs'
import path from 'path'

interface AnalysisResult {
    context: string
    problem_statement: string
    key_points: string[]
    suggested_responses: Array<{
        option: string
        reasoning: string
    }>
    action_items: string[]
    confidence: number
    error?: string
}

interface VisionAgentConfig {
    serverUrl?: string
    wsUrl?: string
    reconnectInterval?: number
    maxRetries?: number
}

export class VisionAgentHelper {
    private ws: WebSocket | null = null
    private serverUrl: string
    private wsUrl: string
    private reconnectInterval: number
    private maxRetries: number
    private retryCount: number = 0
    private isConnected: boolean = false
    private pendingRequests: Map<string, {
        resolve: (value: AnalysisResult) => void
        reject: (reason: Error) => void
    }> = new Map()
    private messageId: number = 0

    constructor(config: VisionAgentConfig = {}) {
        this.serverUrl = config.serverUrl || 'http://127.0.0.1:8765'
        this.wsUrl = config.wsUrl || 'ws://127.0.0.1:8765/ws'
        this.reconnectInterval = config.reconnectInterval || 3000
        this.maxRetries = config.maxRetries || 5
    }

    /**
     * Check if the Vision Agent backend is running
     */
    public async checkHealth(): Promise<boolean> {
        try {
            const response = await fetch(`${this.serverUrl}/health`)
            if (response.ok) {
                const data = await response.json()
                console.log('[VisionAgent] Health check:', data)
                return true
            }
            return false
        } catch (error) {
            console.log('[VisionAgent] Backend not available:', error)
            return false
        }
    }

    /**
     * Connect to the Vision Agent WebSocket server
     */
    public async connect(): Promise<boolean> {
        if (this.isConnected) {
            return true
        }

        return new Promise((resolve) => {
            try {
                this.ws = new WebSocket(this.wsUrl)

                this.ws.on('open', () => {
                    console.log('[VisionAgent] WebSocket connected')
                    this.isConnected = true
                    this.retryCount = 0
                    resolve(true)
                })

                this.ws.on('message', (data: WebSocket.Data) => {
                    try {
                        const message = JSON.parse(data.toString())
                        this.handleMessage(message)
                    } catch (error) {
                        console.error('[VisionAgent] Failed to parse message:', error)
                    }
                })

                this.ws.on('close', () => {
                    console.log('[VisionAgent] WebSocket disconnected')
                    this.isConnected = false
                    this.handleDisconnect()
                })

                this.ws.on('error', (error: Error) => {
                    console.error('[VisionAgent] WebSocket error:', error)
                    this.isConnected = false
                    resolve(false)
                })

            } catch (error) {
                console.error('[VisionAgent] Failed to connect:', error)
                resolve(false)
            }
        })
    }

    /**
     * Disconnect from the WebSocket server
     */
    public disconnect(): void {
        if (this.ws) {
            this.ws.close()
            this.ws = null
        }
        this.isConnected = false
    }

    /**
     * Handle incoming WebSocket messages
     */
    private handleMessage(message: any): void {
        if (message.type === 'analysis' && message.requestId) {
            const pending = this.pendingRequests.get(message.requestId)
            if (pending) {
                pending.resolve(message.data)
                this.pendingRequests.delete(message.requestId)
            }
        } else if (message.type === 'analysis') {
            // Broadcast analysis without specific request ID
            console.log('[VisionAgent] Analysis received:', message.data)
        } else if (message.type === 'error') {
            console.error('[VisionAgent] Error from server:', message.message)
        }
    }

    /**
     * Handle WebSocket disconnection with auto-reconnect
     */
    private handleDisconnect(): void {
        if (this.retryCount < this.maxRetries) {
            this.retryCount++
            console.log(`[VisionAgent] Reconnecting... (attempt ${this.retryCount}/${this.maxRetries})`)
            setTimeout(() => this.connect(), this.reconnectInterval)
        } else {
            console.log('[VisionAgent] Max retries reached. Giving up.')
        }
    }

    /**
     * Analyze a screenshot image using Vision Agents
     * @param imagePath Path to the image file
     */
    public async analyzeImage(imagePath: string): Promise<AnalysisResult> {
        // Read image and convert to base64
        const imageBuffer = await fs.promises.readFile(imagePath)
        const base64Image = imageBuffer.toString('base64')
        const mimeType = this.getMimeType(imagePath)

        return this.analyzeImageData(base64Image, mimeType)
    }

    /**
     * Analyze image data directly (base64 encoded)
     * @param base64Image Base64 encoded image data
     * @param mimeType MIME type of the image
     */
    public async analyzeImageData(base64Image: string, mimeType: string = 'image/png'): Promise<AnalysisResult> {
        // Try HTTP API first (more reliable)
        try {
            const response = await fetch(`${this.serverUrl}/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: base64Image,
                    mime_type: mimeType,
                }),
            })

            if (response.ok) {
                return await response.json()
            }
        } catch (error) {
            console.log('[VisionAgent] HTTP API failed, trying WebSocket...')
        }

        // Fall back to WebSocket if connected
        if (this.isConnected && this.ws) {
            return this.analyzeViaWebSocket(base64Image, mimeType)
        }

        throw new Error('Vision Agent backend not available')
    }

    /**
     * Send analysis request via WebSocket
     */
    private async analyzeViaWebSocket(base64Image: string, mimeType: string): Promise<AnalysisResult> {
        return new Promise((resolve, reject) => {
            if (!this.ws || !this.isConnected) {
                reject(new Error('WebSocket not connected'))
                return
            }

            const requestId = `req_${++this.messageId}`

            // Set timeout
            const timeout = setTimeout(() => {
                this.pendingRequests.delete(requestId)
                reject(new Error('Analysis request timed out'))
            }, 30000)

            this.pendingRequests.set(requestId, {
                resolve: (result) => {
                    clearTimeout(timeout)
                    resolve(result)
                },
                reject: (error) => {
                    clearTimeout(timeout)
                    reject(error)
                },
            })

            this.ws.send(JSON.stringify({
                type: 'screenshot',
                requestId,
                image: base64Image,
                mime_type: mimeType,
            }))
        })
    }

    /**
     * Get MIME type from file path
     */
    private getMimeType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase()
        const mimeTypes: Record<string, string> = {
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
        }
        return mimeTypes[ext] || 'image/png'
    }

    /**
     * Check if connected to backend
     */
    public isBackendConnected(): boolean {
        return this.isConnected
    }

    /**
     * Convert Vision Agent analysis to the format used by existing LLMHelper
     */
    public convertToLLMFormat(analysis: AnalysisResult): any {
        return {
            problem_statement: analysis.problem_statement,
            context: analysis.context,
            suggested_responses: analysis.suggested_responses.map(r => r.option),
            reasoning: analysis.suggested_responses.map(r => r.reasoning).join('\n'),
            key_points: analysis.key_points,
            action_items: analysis.action_items,
            confidence: analysis.confidence,
        }
    }
}

export default VisionAgentHelper
