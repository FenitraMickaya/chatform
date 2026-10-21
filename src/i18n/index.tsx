'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fr';

export interface Translations {
  [key: string]: {
    en: string;
    fr: string;
  };
}

export const TRANSLATIONS: Record<string, { en: string; fr: string }> = {
  // Navigation & Branding
  brandName: { en: 'FormPulse', fr: 'FormPulse' },
  brandTagline: {
    en: 'Conversational forms & real-time analytics',
    fr: 'Formulaires conversationnels & analyses en temps réel',
  },
  dashboard: { en: 'Dashboard', fr: 'Tableau de bord' },
  submissions: { en: 'Submissions', fr: 'Réponses' },
  newForm: { en: 'New Form', fr: 'Nouveau formulaire' },
  signIn: { en: 'Sign In', fr: 'Connexion' },
  signOut: { en: 'Sign Out', fr: 'Déconnexion' },
  createAccount: { en: 'Create Account', fr: 'Créer un compte' },
  demoUser: { en: 'Demo', fr: 'Démo' },
  online: { en: 'Online', fr: 'En ligne' },

  // Dashboard Stats & KPIs
  kpiTotalForms: { en: 'Total Forms', fr: 'Total formulaires' },
  kpiTotalFormsSub: { en: 'configured in workspace', fr: 'configurés dans l’espace' },
  kpiTotalSubmissions: { en: 'Total Submissions', fr: 'Total réponses' },
  kpiTotalSubmissionsSub: { en: 'recorded in database', fr: 'enregistrées en base' },
  kpiRecommendRate: { en: 'Recommendation Rate', fr: 'Taux de recommandation' },
  kpiRecommendRateSub: { en: 'would recommend this tool', fr: 'recommandent cet outil' },
  kpiAvgQuestions: { en: 'Avg. Question Count', fr: 'Questions par formulaire' },
  kpiAvgQuestionsSub: { en: 'per conversational flow', fr: 'par flux conversationnel' },
  published: { en: 'Published', fr: 'Publié' },
  draft: { en: 'Draft', fr: 'Brouillon' },

  // Search & Filter
  searchForms: { en: 'Search forms by keyword...', fr: 'Rechercher un formulaire...' },
  allForms: { en: 'All Forms', fr: 'Tous les formulaires' },
  publishedFilter: { en: 'Published', fr: 'Publiés' },
  draftFilter: { en: 'Drafts', fr: 'Brouillons' },
  noFormsFound: { en: 'No forms found matching your query.', fr: 'Aucun formulaire trouvé pour votre recherche.' },

  // Form Card Actions
  testForm: { en: 'Test / Fill Form', fr: 'Tester le formulaire' },
  editForm: { en: 'Edit', fr: 'Modifier' },
  embedForm: { en: 'Embed', fr: 'Intégrer' },
  duplicateForm: { en: 'Duplicate', fr: 'Dupliquer' },
  deleteForm: { en: 'Delete', fr: 'Supprimer' },
  submissionsSheet: { en: 'Submissions sheet', fr: 'Feuille des réponses' },
  entries: { en: 'entries', fr: 'entrées' },
  recommendationScore: { en: 'Recommended by', fr: 'Recommandé par' },
  recommendationRate: { en: 'Recommendation', fr: 'Recommandation' },

  // Recommendation feature specific ("Would you recommend this tool")
  wouldYouRecommend: {
    en: 'Would you recommend this tool to a teammate or colleague?',
    fr: 'Recommanderiez-vous cet outil à un collègue ou collaborateur ?',
  },
  recommendYes: { en: '👍 Yes, absolutely!', fr: '👍 Oui, absolument !' },
  recommendNo: { en: '👎 Not really', fr: '👎 Pas vraiment' },
  recommendBadgeYes: { en: 'Recommends tool', fr: 'Recommande l’outil' },
  recommendBadgeNo: { en: 'Does not recommend', fr: 'Ne recommande pas' },
  recommendStatsHeader: {
    en: 'Tool Recommendation & Satisfaction Metric',
    fr: 'Métrique de recommandation et satisfaction',
  },
  recommendRateLabel: {
    en: 'of responders recommend this tool to colleagues',
    fr: 'des répondants recommandent cet outil à leurs collègues',
  },
  recommendScoreTitle: {
    en: 'Would you recommend this tool?',
    fr: 'Recommanderiez-vous cet outil ?',
  },

  // Delete modal
  confirmDeleteTitle: { en: 'Delete Form Permanently?', fr: 'Supprimer définitivement le formulaire ?' },
  confirmDeleteDesc: {
    en: 'This action is immediate and cannot be undone. All associated questions and inbound responses will be removed.',
    fr: 'Cette action est immédiate et irréversible. Toutes les questions et les réponses associées seront supprimées.',
  },
  confirmDeleteSubTitle: { en: 'Delete Submission?', fr: 'Supprimer cette réponse ?' },
  confirmDeleteSubDesc: {
    en: 'Are you sure you want to delete this submission entry? This cannot be undone.',
    fr: 'Êtes-vous sûr de vouloir supprimer cette entrée ? Cette action est irréversible.',
  },
  cancel: { en: 'Cancel', fr: 'Annuler' },
  deleteConfirmBtn: { en: 'Permanently Delete', fr: 'Supprimer définitivement' },

  // Create Form Modal
  createModalTitle: { en: 'Create Conversational Form', fr: 'Créer un formulaire conversationnel' },
  createModalDesc: {
    en: 'Configure title and select an initial template',
    fr: 'Définissez le titre et choisissez un modèle de départ',
  },
  formTitleLabel: { en: 'Form Title *', fr: 'Titre du formulaire *' },
  formTitlePlaceholder: { en: 'e.g. Website Lead Qualification', fr: 'ex. Qualification de prospects web' },
  descriptionLabel: { en: 'Description (Optional)', fr: 'Description (Optionnel)' },
  descriptionPlaceholder: {
    en: 'Brief summary of what this conversational flow captures...',
    fr: 'Court résumé des informations collectées...',
  },
  startingTemplate: { en: 'Starting Template', fr: 'Modèle de départ' },
  tplFeedback: { en: 'Customer Feedback & Recommendation', fr: 'Avis client & Recommandation' },
  tplFeedbackDesc: {
    en: 'Rating stars, favorite feature, and "Would you recommend this tool?" question',
    fr: 'Étoiles de satisfaction, fonctionnalité préférée et question "Recommanderiez-vous cet outil ?"',
  },
  tplLeadGen: { en: 'Lead Qualification', fr: 'Qualification de prospects' },
  tplLeadGenDesc: {
    en: 'Name, company email, and conversational qualification steps',
    fr: 'Nom, email professionnel et qualification conversationnelle',
  },
  tplRsvp: { en: 'Event RSVP & Pass', fr: 'Inscription à un événement' },
  tplRsvpDesc: {
    en: 'Attendee name, badge email, and networking session confirmation',
    fr: 'Nom du participant, email pour le badge et confirmation pour le dîner',
  },
  createFormBtn: { en: 'Create Form & Open Editor', fr: 'Créer le formulaire et ouvrir l’éditeur' },

  // Interactive Test & Chat
  testModalTitle: { en: 'Interactive Form Session', fr: 'Session interactive du formulaire' },
  testModalDesc: {
    en: 'Test the live conversational experience and submit real responses',
    fr: 'Testez l’expérience conversationnelle en direct et enregistrez de vraies réponses',
  },
  restartChat: { en: 'Restart', fr: 'Recommencer' },
  responseSaved: { en: 'Response Saved', fr: 'Réponse enregistrée' },
  responseSavedDesc: {
    en: 'Your response has been securely recorded into the database.',
    fr: 'Votre réponse a été enregistrée avec succès dans la base de données.',
  },
  fillAgain: { en: 'Fill Out Again', fr: 'Remplir à nouveau' },
  typeYourAnswer: { en: 'Type your answer...', fr: 'Tapez votre réponse...' },
  pressEnter: { en: 'Press Enter', fr: 'Appuyez sur Entrée' },
  skipOptional: { en: 'Skip this optional question', fr: 'Passer cette question optionnelle' },
  skip: { en: 'Skip', fr: 'Passer' },
  yes: { en: 'Yes', fr: 'Oui' },
  no: { en: 'No', fr: 'Non' },
  starsOutOfFive: { en: 'out of 5 stars', fr: 'sur 5 étoiles' },

  // Submissions View
  submissionsLedger: { en: 'Submissions Ledger', fr: 'Registre des réponses' },
  totalEntries: { en: 'total entries', fr: 'entrées au total' },
  targetWorkflow: { en: 'Target workflow:', fr: 'Formulaire cible :' },
  exportCsv: { en: 'CSV', fr: 'CSV' },
  exportJson: { en: 'JSON', fr: 'JSON' },
  shareAndEmbed: { en: 'Share & Embed', fr: 'Partager & Intégrer' },
  collectedResponses: { en: 'Collected Responses', fr: 'Réponses collectées' },
  averageSpeed: { en: 'Average Speed', fr: 'Temps moyen' },
  speedSub: { en: 'Time to finish conversational flow', fr: 'Temps pour compléter le flux' },
  fieldCoverage: { en: 'Field Coverage', fr: 'Complétude des champs' },
  fieldCoverageSub: { en: 'Required fields validated', fr: 'Champs obligatoires validés' },
  aggregatedBreakdown: { en: 'Aggregated Answer Breakdown', fr: 'Synthèse agrégée des réponses' },
  noSubmissionsYet: { en: 'No submissions yet for this form.', fr: 'Aucune réponse enregistrée pour ce formulaire pour le moment.' },
  submissionDetails: { en: 'Submission Details', fr: 'Détails de la réponse' },
  submissionId: { en: 'Submission ID', fr: 'ID de la réponse' },
  submittedAt: { en: 'Submitted at', fr: 'Envoyé le' },
  completionTime: { en: 'Completion Time', fr: 'Temps de complétion' },
  answers: { en: 'Answers', fr: 'Réponses' },
  close: { en: 'Close', fr: 'Fermer' },
  backToDashboard: { en: 'Back to Dashboard', fr: 'Retour au tableau de bord' },

  // Form Builder
  formEditor: { en: 'Form Editor', fr: 'Éditeur de formulaire' },
  questionsTab: { en: 'Questions Flow', fr: 'Flux des questions' },
  designTab: { en: 'Chat Styling & Theme', fr: 'Apparence & Thème' },
  previewTab: { en: 'Live Preview', fr: 'Aperçu en direct' },
  addQuestion: { en: 'Add Question', fr: 'Ajouter une question' },
  saveChanges: { en: 'Save Changes', fr: 'Enregistrer les modifications' },
  savedSuccessfully: { en: 'Saved successfully!', fr: 'Enregistré avec succès !' },
  formStatus: { en: 'Status', fr: 'Statut' },
  questionTitle: { en: 'Question Title', fr: 'Intitulé de la question' },
  questionDesc: { en: 'Help text / Description', fr: 'Texte d’aide / Description' },
  questionType: { en: 'Question Type', fr: 'Type de question' },
  requiredField: { en: 'Required', fr: 'Obligatoire' },
  botName: { en: 'Bot Name', fr: 'Nom du bot' },
  primaryColor: { en: 'Primary Accent Color', fr: 'Couleur principale' },
  welcomeMsg: { en: 'Welcome Message', fr: 'Message de bienvenue' },
  thankYouMsg: { en: 'Thank You Message', fr: 'Message de remerciement' },

  // Auth Page
  welcomeBack: { en: 'Welcome back to FormPulse', fr: 'Bienvenue sur FormPulse' },
  signInDesc: {
    en: 'Sign in to access your conversational forms and responses',
    fr: 'Connectez-vous pour accéder à vos formulaires et réponses',
  },
  quickDemoAccess: { en: 'Quick Demo Access (Demo Account)', fr: 'Accès rapide Démo (Compte Démo)' },
  demoCredentialsNote: {
    en: 'Instant login with Demo credentials',
    fr: 'Connexion instantanée avec les identifiants Démo',
  },
  emailAddress: { en: 'Email address', fr: 'Adresse email' },
  password: { en: 'Password', fr: 'Mot de passe' },
  orWithEmail: { en: 'Or sign in with email', fr: 'Ou connectez-vous par email' },
  dontHaveAccount: { en: "Don't have an account?", fr: "Vous n'avez pas de compte ?" },
  alreadyHaveAccount: { en: 'Already have an account?', fr: 'Vous avez déjà un compte ?' },
  signUp: { en: 'Sign Up', fr: 'Créer un compte' },
  nameLabel: { en: 'Your Name', fr: 'Votre nom' },
  signInButton: { en: 'Sign In', fr: 'Se connecter' },
  signUpButton: { en: 'Create Account', fr: 'Créer mon compte' },

  // Landing Page
  heroTitle: {
    en: 'Turn Static Forms into Conversational Engines',
    fr: 'Transformez vos formulaires statiques en conversations engageantes',
  },
  heroSubtitle: {
    en: 'Create sleek chatbot forms in seconds. Embed anywhere, collect real-time data, and boost response completion by up to 3x.',
    fr: 'Créez des formulaires conversationnels en quelques secondes. Intégrez-les partout et obtenez jusqu’à 3x plus de réponses.',
  },
  startFree: { en: 'Open Dashboard', fr: 'Accéder au tableau de bord' },
  tryInteractiveDemo: { en: 'Try Live Chat Widget', fr: 'Tester le widget interactif' },
  feature1Title: { en: 'Conversational UX', fr: 'Expérience conversationnelle' },
  feature1Desc: {
    en: 'Engage visitors step-by-step with clean chat prompts that feel natural and friendly.',
    fr: 'Guidez vos visiteurs étape par étape avec des messages fluides et conviviaux.',
  },
  feature2Title: { en: 'Instant Embed & Share', fr: 'Intégration & Partage instantanés' },
  feature2Desc: {
    en: 'Embed as a floating widget or inline container with a single clean script tag.',
    fr: 'Intégrez sous forme de bulle flottante ou de widget plein écran avec une simple balise script.',
  },
  feature3Title: { en: 'Recommendation & Analytics', fr: 'Métrique de recommandation & Données' },
  feature3Desc: {
    en: 'Track completion times, response volume, and "Would you recommend this tool?" rates.',
    fr: 'Suivez le temps de réponse, le volume et le taux "Recommanderiez-vous cet outil ?".',
  },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'fr',
  setLanguage: () => {},
  t: (key, defaultText) => defaultText || key,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('formpulse_language');
      if (saved === 'en' || saved === 'fr') return saved;
      // Default to French if user prompt is in French or browser prefers French
      const navLang = navigator.language.toLowerCase();
      if (navLang.startsWith('fr')) return 'fr';
      return 'fr'; // default to French since user requested French & English SaaS!
    }
    return 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('formpulse_language', lang);
    }
  };

  const t = (key: string, defaultText?: string): string => {
    const entry = TRANSLATIONS[key];
    if (entry && entry[language]) {
      return entry[language];
    }
    return defaultText || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

/**
 * Reusable Language Switcher Component
 */
export const LanguageSwitcher: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      className={`inline-flex items-center p-0.5 rounded-lg border border-zinc-200 bg-zinc-50 shadow-2xs text-xs font-semibold select-none ${className}`}
      role="group"
      aria-label="Language selector"
    >
      <button
        type="button"
        onClick={() => setLanguage('fr')}
        className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
          language === 'fr'
            ? 'bg-white text-zinc-950 shadow-xs font-bold'
            : 'text-zinc-500 hover:text-zinc-900'
        }`}
        title="Passer en Français"
      >
        <span>🇫🇷</span>
        <span>FR</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 cursor-pointer ${
          language === 'en'
            ? 'bg-white text-zinc-950 shadow-xs font-bold'
            : 'text-zinc-500 hover:text-zinc-900'
        }`}
        title="Switch to English"
      >
        <span>🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
};
