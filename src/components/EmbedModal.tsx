import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Code,
  Globe,
  Share2,
  ExternalLink,
  Monitor,
} from 'lucide-react';
import { Form } from '../types/index.ts';
import { useLanguage } from '../i18n/index.tsx';

interface EmbedModalProps {
  form: Form;
  onClose: () => void;
  onOpenSimulator?: (form: Form) => void;
}

export const EmbedModal: React.FC<EmbedModalProps> = ({ form, onClose, onOpenSimulator }) => {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'script' | 'iframe' | 'link'>('script');
  const [copied, setCopied] = useState<string | null>(null);

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://formpulse.app';
  const publicUrl = `${baseUrl}/f/${encodeURIComponent(form.id)}`;
  const widgetScriptUrl = `${baseUrl}/widget.js`;

  const scriptCode = `<!-- FormPulse Conversational Widget -->
<script
  src="${widgetScriptUrl}"
  data-form-id="${form.id}"
  data-position="${form.theme?.position || 'bottom-right'}"
  data-color="${form.theme?.primaryColor || '#18181b'}"
  async>
</script>`;

  const iframeCode = `<iframe
  src="${publicUrl}"
  width="100%"
  height="600px"
  style="border: none; border-radius: 12px;"
  title="${form.title}">
</iframe>`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-zinc-950 text-sm">
              {language === 'fr' ? 'Intégrer & Partager le formulaire' : 'Embed & Share Form'}
            </h3>
            <p className="text-xs text-zinc-500">
              {language === 'fr' ? 'Déployer le widget conversationnel pour ' : 'Deploy conversational widget for '}
              <span className="font-medium text-zinc-800">{form.title}</span>
            </p>
          </div>
          <button type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-zinc-200/80 px-6 pt-3 bg-[#fafafa] gap-6 text-xs">
          <button type="button"
            onClick={() => setActiveTab('script')}
            className={`pb-2.5 font-medium border-b-2 flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === 'script'
                ? 'border-zinc-950 text-zinc-950 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>{language === 'fr' ? 'Balise Script' : 'Script Tag'}</span>
          </button>
          <button type="button"
            onClick={() => setActiveTab('link')}
            className={`pb-2.5 font-medium border-b-2 flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === 'link'
                ? 'border-zinc-950 text-zinc-950 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>{language === 'fr' ? 'Lien Public' : 'Public URL'}</span>
          </button>
          <button type="button"
            onClick={() => setActiveTab('iframe')}
            className={`pb-2.5 font-medium border-b-2 flex items-center gap-1.5 cursor-pointer transition ${
              activeTab === 'iframe'
                ? 'border-zinc-950 text-zinc-950 font-semibold'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>Iframe</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 space-y-4">
          {activeTab === 'script' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-900">
                    JavaScript Snippet
                  </div>
                  <p className="text-[11px] text-zinc-500">
                    Paste this snippet before the closing &lt;/body&gt; tag on any website.
                  </p>
                </div>
                <button type="button"
                  onClick={() => copyToClipboard(scriptCode, 'script')}
                  className="px-3 py-1 rounded-md bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer"
                >
                  {copied === 'script' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3.5 rounded-lg bg-zinc-900 text-zinc-200 text-xs font-mono overflow-x-auto leading-relaxed border border-zinc-800">
                {scriptCode}
              </pre>

              <div className="p-3 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-between">
                <span className="text-xs text-zinc-600">Want to test live form?</span>
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-semibold text-zinc-900 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Open Standalone Form</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          )}

          {activeTab === 'link' && (
            <div className="space-y-3">
              <div>
                <div className="text-xs font-semibold text-zinc-900">Direct Public Link</div>
                <p className="text-[11px] text-zinc-500">
                  Send this hosted URL directly to respondents.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={publicUrl}
                  className="flex-1 text-xs text-zinc-800 bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 font-mono select-all focus:outline-none"
                />
                <button type="button"
                  onClick={() => copyToClipboard(publicUrl, 'link')}
                  className="px-3.5 py-2 rounded-lg bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer shrink-0"
                >
                  {copied === 'link' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied === 'link' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="pt-1">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-medium text-zinc-700 hover:text-zinc-950 flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Open Public Page
                </a>
              </div>
            </div>
          )}

          {activeTab === 'iframe' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-zinc-900">Iframe Code</div>
                  <p className="text-[11px] text-zinc-500">
                    Embed directly within internal documentation or blog posts.
                  </p>
                </div>
                <button type="button"
                  onClick={() => copyToClipboard(iframeCode, 'iframe')}
                  className="px-3 py-1 rounded-md bg-zinc-900 text-white text-xs font-medium hover:bg-zinc-800 transition flex items-center gap-1 cursor-pointer"
                >
                  {copied === 'iframe' ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy
                    </>
                  )}
                </button>
              </div>

              <pre className="p-3.5 rounded-lg bg-zinc-900 text-zinc-200 text-xs font-mono overflow-x-auto leading-relaxed border border-zinc-800">
                {iframeCode}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between text-xs text-zinc-500">
          <span className="font-mono tabular-nums text-zinc-600">
            Status: {form.status}
          </span>
          <button type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-md bg-white border border-zinc-200 text-zinc-700 font-medium hover:bg-zinc-100 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
