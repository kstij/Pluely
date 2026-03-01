import React, { useState, useEffect } from 'react';
import { 
  Cloud, 
  Cpu, 
  Settings, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  RefreshCw,
  Zap,
  Lock,
  ChevronDown
} from 'lucide-react';
import { cn } from '../../../shared/lib/utils';

interface ModelConfig {
  provider: "ollama" | "gemini";
  model: string;
  isOllama: boolean;
}

interface ModelSelectorProps {
  onModelChange?: (provider: "ollama" | "gemini", model: string) => void;
  onChatOpen?: () => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ onModelChange, onChatOpen }) => {
  const [currentConfig, setCurrentConfig] = useState<ModelConfig | null>(null);
  const [availableOllamaModels, setAvailableOllamaModels] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error' | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<"ollama" | "gemini">("gemini");
  const [selectedOllamaModel, setSelectedOllamaModel] = useState<string>("");
  const [ollamaUrl, setOllamaUrl] = useState<string>("http://localhost:11434");

  useEffect(() => {
    loadCurrentConfig();
  }, []);

  const loadCurrentConfig = async () => {
    try {
      setIsLoading(true);
      const config = await window.electronAPI.getCurrentLlmConfig();
      setCurrentConfig(config);
      setSelectedProvider(config.provider);
      
      if (config.isOllama) {
        setSelectedOllamaModel(config.model);
        await loadOllamaModels();
      }
    } catch (error) {
      console.error('Error loading current config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOllamaModels = async () => {
    try {
      const models = await window.electronAPI.getAvailableOllamaModels();
      setAvailableOllamaModels(models);
      
      // Auto-select first model if none selected
      if (models.length > 0 && !selectedOllamaModel) {
        setSelectedOllamaModel(models[0]);
      }
    } catch (error) {
      console.error('Error loading Ollama models:', error);
      setAvailableOllamaModels([]);
    }
  };

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      const result = await window.electronAPI.testLlmConnection();
      setConnectionStatus(result.success ? 'success' : 'error');
      if (!result.success) {
        setErrorMessage(result.error || 'Unknown error');
      } else {
        setTimeout(() => setConnectionStatus(null), 3000);
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(String(error));
    }
  };

  const handleProviderSwitch = async () => {
    try {
      setConnectionStatus('testing');
      let result;
      
      if (selectedProvider === 'ollama') {
        result = await window.electronAPI.switchToOllama(selectedOllamaModel, ollamaUrl);
      } else {
        result = await window.electronAPI.switchToGemini(geminiApiKey || undefined);
      }

      if (result.success) {
        await loadCurrentConfig();
        setConnectionStatus('success');
        onModelChange?.(selectedProvider, selectedProvider === 'ollama' ? selectedOllamaModel : 'gemini-2.0-flash');
        
        // Auto-open chat window after successful model change
        setTimeout(() => {
          onChatOpen?.();
          setConnectionStatus(null);
        }, 1000);
      } else {
        setConnectionStatus('error');
        setErrorMessage(result.error || 'Switch failed');
      }
    } catch (error) {
      setConnectionStatus('error');
      setErrorMessage(String(error));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8 bg-black border border-white/20">
        <Loader2 className="w-6 h-6 text-white animate-spin" />
        <span className="ml-3 text-sm text-gray-400 font-mono">INITIALIZING_SYSTEM...</span>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden bg-black border border-white/20 transition-all duration-300 group hover:border-white/40">
      
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/20 bg-white/5">
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-white" />
          <h3 className="text-sm font-semibold text-white tracking-wide uppercase font-mono">
            System Config
          </h3>
        </div>
        
        {/* Status Indicator */}
        <div className="flex items-center space-x-2 bg-black px-3 py-1 border border-white/20">
          {connectionStatus === 'testing' ? (
            <Loader2 className="w-3 h-3 text-white animate-spin" />
          ) : connectionStatus === 'success' ? (
            <CheckCircle className="w-3 h-3 text-white" />
          ) : connectionStatus === 'error' ? (
            <AlertCircle className="w-3 h-3 text-white" />
          ) : (
            <div className="w-2 h-2 bg-white animate-pulse" />
          )}
          <span className={cn(
            "text-xs font-mono font-medium",
            connectionStatus === 'testing' ? 'text-gray-400' :
            connectionStatus === 'success' ? 'text-white' :
            connectionStatus === 'error' ? 'text-white' : 'text-gray-500'
          )}>
            {connectionStatus === 'testing' ? 'CONNECTING' :
             connectionStatus === 'success' ? 'ONLINE' :
             connectionStatus === 'error' ? 'ERROR' : 'READY'}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-6">
        
        {/* Current Status Display */}
        {currentConfig && (
          <div className="relative group/status">
            <div className="relative flex items-center justify-between p-3 bg-white/5 border border-white/10 hover:border-white/30 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/10 text-white">
                  {currentConfig.provider === 'ollama' ? <Cpu className="w-4 h-4" /> : <Cloud className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-0.5">Active Model</div>
                  <div className="text-sm font-mono text-white">{currentConfig.model}</div>
                </div>
              </div>
              <div className="px-2 py-1 bg-white/10 text-[10px] text-gray-400 font-mono uppercase">
                {currentConfig.provider === 'ollama' ? 'LOCAL' : 'CLOUD'}
              </div>
            </div>
          </div>
        )}

        {/* Provider Switcher Tabs */}
        <div className="grid grid-cols-2 p-1 bg-black border border-white/20">
          <button
            onClick={() => setSelectedProvider('gemini')}
            className={cn(
              "flex items-center justify-center space-x-2 py-2 text-xs font-medium transition-all duration-200 font-mono uppercase",
              selectedProvider === 'gemini'
                ? "bg-white text-black"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            )}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span>Gemini Cloud</span>
          </button>
          <button
            onClick={() => setSelectedProvider('ollama')}
            className={cn(
              "flex items-center justify-center space-x-2 py-2 text-xs font-medium transition-all duration-200 font-mono uppercase",
              selectedProvider === 'ollama'
                ? "bg-white text-black"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            )}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Ollama Local</span>
          </button>
        </div>

        {/* Configuration Fields */}
        <div className="space-y-4">
          {selectedProvider === 'gemini' ? (
            <div className="space-y-2 animate-fade-in-down">
              <label className="flex items-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                <Lock className="w-3 h-3 mr-1.5" /> API Key
              </label>
              <input
                type="password"
                placeholder="Enter Gemini API Key..."
                value={geminiApiKey}
                onChange={(e) => setGeminiApiKey(e.target.value)}
                className="w-full px-4 py-3 bg-black border border-white/20 text-sm text-white font-mono placeholder-gray-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
              />
              <p className="text-[10px] text-gray-500 pl-1">
                Leave empty to keep existing key configuration.
              </p>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in-down">
              <div className="space-y-2">
                <label className="flex items-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                  <Zap className="w-3 h-3 mr-1.5" /> Server URL
                </label>
                <input
                  type="url"
                  value={ollamaUrl}
                  onChange={(e) => setOllamaUrl(e.target.value)}
                  className="w-full px-4 py-3 bg-black border border-white/20 text-sm text-white font-mono placeholder-gray-700 focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all"
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                    <Cpu className="w-3 h-3 mr-1.5" /> Model Selection
                  </label>
                  <button
                    onClick={loadOllamaModels}
                    className="p-1 text-gray-500 hover:text-white transition-colors hover:bg-white/10"
                    title="Refresh models"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                  </button>
                </div>
                
                <div className="relative">
                  {availableOllamaModels.length > 0 ? (
                    <div className="relative">
                      <select
                        value={selectedOllamaModel}
                        onChange={(e) => setSelectedOllamaModel(e.target.value)}
                        className="w-full appearance-none px-4 py-3 bg-black border border-white/20 text-sm text-white font-mono focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-all cursor-pointer"
                      >
                        {availableOllamaModels.map((model) => (
                          <option key={model} value={model} className="bg-black text-white">
                            {model}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-3 text-xs text-gray-400 bg-white/5 border border-white/10">
                      <AlertCircle className="w-3 h-3 mr-2" />
                      <span>No models detected. Is Ollama running?</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Actions Footer */}
        <div className="grid grid-cols-4 gap-3 pt-2">
          <button
            onClick={testConnection}
            disabled={connectionStatus === 'testing'}
            className="col-span-1 py-2.5 px-4 bg-transparent hover:bg-white/10 text-white text-xs font-bold uppercase rounded-none font-mono border border-white/20 hover:border-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            TEST
          </button>
          <button
            onClick={handleProviderSwitch}
            disabled={connectionStatus === 'testing'}
            className={cn(
              "col-span-3 py-2.5 px-4 text-xs font-bold tracking-wide uppercase shadow-lg transition-all transform active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none font-mono",
              "bg-white text-black hover:bg-gray-200 border border-white"
            )}
          >
            {connectionStatus === 'testing' ? (
              <span className="flex items-center justify-center">
                <Loader2 className="w-3 h-3 mr-2 animate-spin" /> PROCESSING...
              </span>
            ) : (
              "APPLY CONFIGURATION"
            )}
          </button>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className="p-3 bg-white/5 border border-white/20 flex items-start space-x-2 animate-fade-in-up">
            <AlertCircle className="w-4 h-4 text-white shrink-0 mt-0.5" />
            <p className="text-xs text-white font-mono break-all">{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelSelector;