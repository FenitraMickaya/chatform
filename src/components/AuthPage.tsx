import React, { useState } from 'react';
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  Lock,
  Mail,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { User } from '../types/index.ts';
import { authService } from '../services/auth.ts';
import { ApiError } from '../services/api.ts';
import { useLanguage, LanguageSwitcher } from '../i18n/index.tsx';

interface AuthPageProps {
  onSuccess: (user: User) => void;
  onGoHome: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({
  onSuccess,
  onGoHome,
  initialMode = 'signin',
}) => {
  const { language, t } = useLanguage();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      if (mode === 'signin') {
        const user = await authService.signIn(email, password);
        onSuccess(user);
      } else {
        const user = await authService.signUp(name, email, password);
        onSuccess(user);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  /** Signs in with the seeded demo account (a real account on the server). */
  const handleDemoSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const user = await authService.signIn('demo@formpulse.dev', 'demo1234');
      onSuccess(user);
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : 'The demo account is unavailable. Please sign in with your own credentials.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (!email) {
      setErrorMessage('Please enter your email address to reset password.');
      return;
    }
    setResetSent(true);
    setErrorMessage(null);
    setTimeout(() => setResetSent(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col justify-between p-4 sm:p-6 text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Top Header Bar */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between py-2 text-xs">
        <button type="button"
          onClick={onGoHome}
          className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-950 transition cursor-pointer font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{language === 'fr' ? 'Retour à l’accueil' : 'Back to FormPulse'}</span>
        </button>

        <LanguageSwitcher />
      </header>

      {/* Main Auth Container */}
      <main className="flex-1 flex items-center justify-center py-6">
        <div className="w-full max-w-md bg-white rounded-2xl border border-zinc-200/90 shadow-xs p-6 sm:p-8 space-y-6">
          {/* Logo & Headline */}
          <div className="space-y-1.5 text-center">
            <div
              onClick={onGoHome}
              className="inline-block text-xl font-bold tracking-tight text-zinc-950 cursor-pointer hover:opacity-80 transition"
            >
              FormPulse
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-950">
              {mode === 'signin'
                ? (language === 'fr' ? 'Bon retour parmi nous' : 'Welcome back')
                : (language === 'fr' ? 'Créer un compte' : 'Create your account')}
            </h1>
            <p className="text-xs text-zinc-500">
              {mode === 'signin'
                ? (language === 'fr'
                    ? 'Connectez-vous pour accéder à vos formulaires et analyses'
                    : 'Sign in to access your forms and response analytics')
                : (language === 'fr'
                    ? 'Créez des formulaires conversationnels en quelques secondes'
                    : 'Start building conversational chatbot forms in seconds')}
            </p>
          </div>

          {/* Segmented Mode Selector */}
          <div className="p-1 bg-zinc-100 rounded-lg flex border border-zinc-200/60 text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-md font-medium transition cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {t('signIn')}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 rounded-md font-medium transition cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-zinc-950 shadow-2xs font-semibold'
                  : 'text-zinc-600 hover:text-zinc-950'
              }`}
            >
              {t('createAccount')}
            </button>
          </div>

          {/* Quick 1-Click Access */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleDemoSignIn}
              disabled={isLoading}
              className="w-full py-2 px-3 rounded-lg border border-dashed border-zinc-300 hover:border-zinc-400 bg-zinc-50/50 hover:bg-zinc-100/60 text-zinc-700 text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>{language === 'fr' ? 'Accès rapide direct' : 'Instant Reviewer Access'}</span>
              <span className="text-zinc-500 font-mono font-semibold">(Demo)</span>
            </button>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-zinc-200" />
            <span className="absolute bg-white px-3 text-[11px] text-zinc-400 uppercase tracking-wider">
              {t('orWithEmail')}
            </span>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* Password Reset Notice */}
          {resetSent && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium flex items-center gap-2">
              <Check className="w-4 h-4 text-amber-600" />
              <span>
                {language === 'fr'
                  ? 'La réinitialisation par email n’est pas activée dans cet environnement. Utilisez le compte Démo ou créez un compte.'
                  : 'Email password reset is not enabled in this environment. Use the demo account or create an account.'}
              </span>
            </div>
          )}

          {/* Email / Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  {t('nameLabel')}
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Demo"
                    className="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">
                {t('emailAddress')}
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@example.com"
                  className="w-full pl-9 pr-3 py-2 bg-white rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-medium text-zinc-700">
                  {t('password')}
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-[11px] text-zinc-500 hover:text-zinc-950 transition cursor-pointer"
                  >
                    {language === 'fr' ? 'Mot de passe oublié ?' : 'Forgot password?'}
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={
                    mode === 'signup'
                      ? (language === 'fr' ? 'Au moins 6 caractères' : 'At least 6 characters')
                      : (language === 'fr' ? 'Entrez votre mot de passe' : 'Enter password')
                  }
                  className="w-full pl-9 pr-10 py-2 bg-white rounded-lg border border-zinc-200 text-xs text-zinc-900 focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signin' && (
              <div className="flex items-center">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-zinc-900 focus:ring-zinc-900 border-zinc-300"
                  />
                  <span>
                    {language === 'fr' ? 'Rester connecté pendant 30 jours' : 'Keep me signed in for 30 days'}
                  </span>
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold transition cursor-pointer shadow-xs active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? t('signInButton') : t('signUpButton')}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer Legal & Security */}
      <footer className="text-center py-2 text-[11px] text-zinc-400 space-y-1">
        <div className="flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-zinc-500" />
          <span>
            {language === 'fr'
              ? 'Session serveur sécurisée (cookie httpOnly)'
              : 'Secure server-side session (httpOnly cookie)'}
          </span>
        </div>
        <div>
          {language === 'fr'
            ? 'En continuant, vous acceptez les Conditions de Service et la Politique de Confidentialité de FormPulse.'
            : 'By continuing, you agree to FormPulse’s Terms of Service and Privacy Policy.'}
        </div>
      </footer>
    </div>
  );
};
