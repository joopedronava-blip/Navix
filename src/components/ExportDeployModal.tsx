import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Github, 
  Globe, 
  ArrowRight, 
  CheckCircle2, 
  Info, 
  Cpu, 
  Key, 
  Settings, 
  ExternalLink,
  Code2,
  Copy,
  Terminal,
  Zap
} from 'lucide-react';

interface ExportDeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExportDeployModal({ isOpen, onClose }: ExportDeployModalProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'netlify' | 'pluggy'>('export');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const handleCopyCode = (code: string, label: string) => {
    navigator.clipboard.writeText(code);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 3000);
  };

  const pluggyCodeSnippet = `// Exemplo de integração oficial com o Pluggy Connect Widget
import React, { useEffect } from 'react';

// 1. Carregue o script do Pluggy Connect no seu index.html ou monte dinamicamente:
// <script src="https://cdn.pluggy.ai/connect-widget/v2/connect.js"></script>

declare global {
  interface Window {
    PluggyConnect: any;
  }
}

interface PluggyWidgetProps {
  connectToken: string; // Gerado de forma segura no seu backend via POST /connect_tokens
  onSuccess: (item: any) => void;
  onError: (error: any) => void;
}

export function PluggyConnectWidget({ connectToken, onSuccess, onError }: PluggyWidgetProps) {
  useEffect(() => {
    if (!window.PluggyConnect) {
      console.error("Pluggy Connect SDK não carregado!");
      return;
    }

    const pluggyConnect = new window.PluggyConnect({
      connectToken: connectToken,
      includeSandbox: true, // Habilita bancos de simulação para desenvolvimento
      onSuccess: (data) => {
        console.log("Conexão efetuada com sucesso!", data);
        onSuccess(data);
      },
      onError: (err) => {
        console.error("Erro de conexão", err);
        onError(err);
      },
      onClose: () => {
        console.log("Widget fechado pelo usuário");
      }
    });

    // Iniciar a abertura do modal oficial da Pluggy
    pluggyConnect.init();
  }, [connectToken]);

  return (
    <div className="p-4 text-center">
      <p className="text-sm text-zinc-400">O widget seguro do Pluggy Connect foi inicializado.</p>
    </div>
  );
}`;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-800 text-white flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/50 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-950 text-emerald-400 rounded-xl border border-emerald-800/30">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white text-base">
                Central de Publicação & Integrações Reais
              </h3>
              <p className="text-xs text-zinc-400">Exporte para o GitHub, publique no Netlify e conecte à Pluggy</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800/60 bg-zinc-950/40 px-4 shrink-0">
          <button
            onClick={() => setActiveTab('export')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === 'export'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Github className="w-4 h-4" />
            1. Enviar para o GitHub
          </button>
          <button
            onClick={() => setActiveTab('netlify')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === 'netlify'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Globe className="w-4 h-4" />
            2. Publicar no Netlify (Grátis)
          </button>
          <button
            onClick={() => setActiveTab('pluggy')}
            className={`flex items-center gap-1.5 py-3 px-3 text-xs font-semibold border-b-2 cursor-pointer transition-all ${
              activeTab === 'pluggy'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Cpu className="w-4 h-4" />
            3. Intermediadores Open Finance
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <AnimatePresence mode="wait">
            {activeTab === 'export' && (
              <motion.div
                key="export-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 flex items-start gap-3">
                  <div className="p-2 bg-zinc-900 rounded-lg border border-zinc-800 text-zinc-400">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Como exportar seus arquivos para o GitHub</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      O Google AI Studio possui um exportador integrado para o GitHub e exportação para arquivos ZIP locais. Você pode enviar todo o código para seu perfil do GitHub em poucos segundos.
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 pl-1.5">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                      1
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                      No canto superior direito da sua tela do <strong>Google AI Studio</strong>, clique no menu de configurações ou no botão de exportação.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                      2
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                      Selecione a opção <strong>Export to GitHub</strong> (Exportar para o GitHub). Ele pedirá sua autorização de conta caso seja a primeira vez.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                      3
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                      Escolha criar um novo repositório (ex: <code className="px-1.5 py-0.5 bg-zinc-950 rounded border border-zinc-800 text-emerald-400 text-[11px] font-mono">navix-openfinance</code>) e clique em confirmar para enviar os arquivos.
                    </p>
                  </div>
                </div>

                {/* Simulated visual help banner */}
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850/80 space-y-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-emerald-400 font-semibold">
                    <Github className="w-4 h-4" />
                    Pronto para o controle de versão real
                  </div>
                  <p className="text-[11px] text-zinc-500 max-w-md mx-auto">
                    Depois de enviar ao GitHub, qualquer alteração que você fizer pode ser sincronizada automaticamente para publicação na internet em tempo real.
                  </p>
                </div>
              </motion.div>
            )}

            {activeTab === 'netlify' && (
              <motion.div
                key="netlify-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 flex items-start gap-3">
                  <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/20 text-emerald-400">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Hospedagem Instantânea no Netlify</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      O Netlify oferece hospedagem estática gratuita de alto desempenho ideal para aplicativos React baseados em Vite. Nós já criamos e configuramos o arquivo <code className="text-emerald-400">netlify.toml</code> na raiz do projeto!
                    </p>
                  </div>
                </div>

                <div className="space-y-3.5 pl-1.5">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                      1
                    </div>
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                        Crie uma conta gratuita em <a href="https://www.netlify.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-semibold inline-flex items-center gap-0.5 hover:underline">Netlify.com <ExternalLink className="w-3 h-3" /></a> usando o login do seu GitHub.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                      2
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                      Clique em <strong>Add new site</strong> (Adicionar novo site) &gt; <strong>Import an existing project</strong> (Importar projeto existente) e escolha o provedor <strong>GitHub</strong>.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                      3
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                      Selecione o repositório que você acabou de exportar. O Netlify lerá nosso arquivo de configuração e preencherá automaticamente as configurações: comando <code className="text-emerald-400">npm run build</code> e diretório de publicação <code className="text-emerald-400">dist</code>.
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 text-xs font-bold flex items-center justify-center shrink-0">
                      4
                    </div>
                    <p className="text-xs text-zinc-300 leading-relaxed pt-0.5">
                      Clique em <strong>Deploy</strong> (Implantar). Em menos de 1 minuto seu site estará no ar com um link seguro HTTPS real para você acessar e compartilhar!
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'pluggy' && (
              <motion.div
                key="pluggy-tab"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4 text-left"
              >
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 flex items-start gap-3">
                  <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/20 text-emerald-400">
                    <Code2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-1">Como funciona a Integração Real (Pluggy.ai / Belvo)</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Para conectar a contas reais, obter saldos e ler extratos automáticos sem que o usuário precise digitar nada, você deve usar intermediadores Open Finance oficiais homologados pelo Banco Central, como a <strong>Pluggy</strong> ou a <strong>Belvo</strong>.
                    </p>
                  </div>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 text-xs space-y-3.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                    <Key className="w-4 h-4" />
                    <span>Passo a Passo para Integração de Produção</span>
                  </div>
                  
                  <ul className="space-y-2 text-zinc-400 list-disc list-inside pl-1 leading-normal">
                    <li>Cadastre-se na <a href="https://pluggy.ai" target="_blank" rel="noopener noreferrer" className="text-emerald-400 font-semibold hover:underline">Pluggy.ai <ExternalLink className="w-3 h-3 inline" /></a> para obter chaves gratuitas do plano sandbox.</li>
                    <li>Crie uma rota simples de backend para gerar o <code className="text-zinc-200">connectToken</code> com seu Client ID e Client Secret oficiais.</li>
                    <li>Substitua nosso formulário de simulação pelo código do widget oficial abaixo. Ele abre a tela de consentimento padrão conectando o login real do banco!</li>
                  </ul>
                </div>

                {/* Embedded Code block showing how to do it */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-zinc-950 px-4 py-2 rounded-t-xl border-t border-x border-zinc-800">
                    <span className="text-[10px] text-zinc-400 font-mono">PluggyConnectWidget.tsx</span>
                    <button
                      onClick={() => handleCopyCode(pluggyCodeSnippet, 'pluggy')}
                      className="text-xs font-medium text-emerald-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedText === 'pluggy' ? 'Copiado!' : 'Copiar Código'}
                    </button>
                  </div>
                  <pre className="p-4 bg-zinc-950 rounded-b-xl border-b border-x border-zinc-800 text-[10px] font-mono text-zinc-300 overflow-x-auto max-h-56 leading-relaxed">
                    {pluggyCodeSnippet}
                  </pre>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-zinc-800 bg-zinc-950/50 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <Info className="w-4 h-4" />
            <span>Configurações prontas para Netlify</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
          >
            Concluir Guia
          </button>
        </div>
      </motion.div>
    </div>
  );
}
