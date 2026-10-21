export type QuestionType = 'text' | 'email' | 'multiple_choice' | 'yes_no' | 'rating';

export interface FormQuestion {
  id: string;
  type: QuestionType;
  title: string;
  description?: string;
  required: boolean;
  placeholder?: string;
  options?: string[]; // for multiple_choice
  minRating?: number; // for rating
  maxRating?: number; // for rating
}

export type WidgetPosition = 'bottom-right' | 'bottom-left';
export type BotAvatar = 'bot' | 'sparkles' | 'message' | 'help' | 'user' | 'zap';

export interface FormTheme {
  primaryColor: string;
  accentColor: string;
  position: WidgetPosition;
  botName: string;
  botAvatar: BotAvatar;
  welcomeMessage: string;
  thankYouMessage: string;
  launcherText: string;
  showProgressBar: boolean;
  autoOpenDelay?: number; // in seconds, 0 = off
}

export type FormStatus = 'published' | 'draft';

/** Per-language overrides applied on top of the default form content. */
export interface FormLocaleOverride {
  title?: string;
  description?: string;
  theme?: Partial<Record<string, string>>;
  questions?: Record<string, { title?: string; description?: string }>;
}

export type FormLocales = Record<string, FormLocaleOverride>;

export interface Form {
  id: string;
  title: string;
  description: string;
  status: FormStatus;
  createdAt: string;
  updatedAt: string;
  questions: FormQuestion[];
  theme: FormTheme;
  responseCount: number;
  /** Language of the content stored in the form columns. */
  defaultLang: string;
  /** Overrides for every language, including the default one. */
  locales: FormLocales;
}

export interface FormSubmission {
  id: string;
  formId: string;
  submittedAt: string;
  answers: Record<string, string | number | string[]>;
  completionTimeSeconds?: number;
  userAgent?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  createdAt: string;
}

export type ActiveView = 'landing' | 'dashboard' | 'builder' | 'submissions' | 'simulator' | 'standalone' | 'auth';
