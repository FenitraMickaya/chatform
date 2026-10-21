'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type Language = 'en' | 'fr';

export interface Translations {
  [key: string]: {
    en: string;
    fr: string;
  };
}

export const TRANSLATIONS: Record<string, { en: string; fr: string }> = {
  /* ----------------------------- Brand ----------------------------- */
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

  /* ------------------------- Dashboard KPIs ------------------------ */
  kpiTotalForms: { en: 'Total Forms', fr: 'Total formulaires' },
  kpiTotalFormsSub: { en: 'configured in workspace', fr: 'configurés dans l’espace' },
  kpiTotalSubmissions: { en: 'Total Submissions', fr: 'Total réponses' },
  kpiTotalSubmissionsSub: { en: 'recorded in database', fr: 'enregistrées en base' },
  kpiRecommendRate: { en: 'Recommendation Rate', fr: 'Taux de recommandation' },
  kpiRecommendRateSub: { en: 'of answered recommenders', fr: 'des répondants interrogés' },
  kpiAvgQuestions: { en: 'Avg. Question Count', fr: 'Questions par formulaire' },
  kpiAvgQuestionsSub: { en: 'per conversational flow', fr: 'par flux conversationnel' },
  published: { en: 'Published', fr: 'Publié' },
  draft: { en: 'Draft', fr: 'Brouillon' },
  formDeleted: { en: 'Form "{title}" deleted.', fr: 'Formulaire « {title} » supprimé.' },
  responseRecordedFor: {
    en: 'Response recorded for "{title}"!',
    fr: 'Réponse enregistrée avec succès pour « {title} » !',
  },
  dashboardLoadError: {
    en: 'The workspace could not be loaded. Please try again.',
    fr: 'L’espace de travail n’a pas pu être chargé. Veuillez réessayer.',
  },
  actions: { en: 'Actions', fr: 'Actions' },
  noDataYet: { en: 'No data yet', fr: 'Aucune donnée' },

  /* ----------------------- Search & filter ------------------------- */
  searchForms: { en: 'Search forms by keyword...', fr: 'Rechercher un formulaire...' },
  allForms: { en: 'All Forms', fr: 'Tous les formulaires' },
  publishedFilter: { en: 'Published', fr: 'Publiés' },
  draftFilter: { en: 'Drafts', fr: 'Brouillons' },
  noFormsFound: { en: 'No forms found matching your query.', fr: 'Aucun formulaire trouvé pour votre recherche.' },

  /* ------------------------ Form card actions ---------------------- */
  testForm: { en: 'Test', fr: 'Tester' },
  editForm: { en: 'Edit', fr: 'Modifier' },
  embedForm: { en: 'Embed', fr: 'Intégrer' },
  duplicateForm: { en: 'Duplicate', fr: 'Dupliquer' },
  deleteForm: { en: 'Delete', fr: 'Supprimer' },
  submissionsSheet: { en: 'Submissions sheet', fr: 'Feuille des réponses' },
  entries: { en: 'entries', fr: 'entrées' },
  recommendationScore: { en: 'Recommended by', fr: 'Recommandé par' },
  recommendationRate: { en: 'Recommendation', fr: 'Recommandation' },

  /* --------------------- Recommendation feature --------------------- */
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
    en: 'of responders recommend this tool to their colleagues',
    fr: 'des répondants recommandent cet outil à leurs collègues',
  },
  recommendScoreTitle: {
    en: 'Would you recommend this tool?',
    fr: 'Recommanderiez-vous cet outil ?',
  },
  recommendSampleSize: {
    en: 'based on {count} answer(s)',
    fr: 'd’après {count} réponse(s)',
  },
  recommendSpotlightDesc: {
    en: 'Direct recommendation outcome tracking how likely your active users are to advocate for this tool.',
    fr: 'Résultat direct de la question de recommandation pour mesurer la satisfaction et l’adoption de vos utilisateurs.',
  },
  ratingAverageNote: {
    en: 'Average out of 5 stars across {count} answers',
    fr: 'Note moyenne sur 5 étoiles ({count} réponses)',
  },
  recommendNoAnswer: {
    en: 'No recommendation question in this workspace',
    fr: 'Aucune question de recommandation dans cet espace',
  },

  /* ------------------------- Delete modals ------------------------- */
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
  confirmDeleteBtn: { en: 'Permanently Delete', fr: 'Supprimer définitivement' },

  /* ------------------------ Create form modal ----------------------- */
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
  tplBlank: { en: 'Blank form', fr: 'Formulaire vierge' },
  tplBlankDesc: { en: 'Start from scratch with a single question.', fr: 'Partez de zéro avec une seule question.' },
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

  /* ---------------------- Interactive test & chat ------------------- */
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
  ratingOfMax: { en: 'out of {max} stars', fr: 'sur {max} étoiles' },
  ratingOf: { en: '{value} out of {max}', fr: '{value} sur {max}' },

  /* ------------------------- Chat widget --------------------------- */
  widgetOnline: { en: 'Online', fr: 'En ligne' },
  widgetPoweredBy: { en: 'FormPulse Chat', fr: 'FormPulse Chat' },
  widgetRestart: { en: 'Restart', fr: 'Recommencer' },
  widgetClose: { en: 'Close', fr: 'Fermer' },
  widgetRequired: { en: 'This field is required.', fr: 'Ce champ est obligatoire.' },
  widgetInvalidEmail: { en: 'Please enter a valid email address.', fr: 'Veuillez saisir une adresse email valide.' },
  widgetSubmitFailed: {
    en: 'Your response could not be saved. Please try again.',
    fr: 'Votre réponse n’a pas pu être enregistrée. Veuillez réessayer.',
  },
  widgetSubmitFailedMessage: {
    en: 'Oops, the submission failed. Your answers are kept — please try again.',
    fr: 'Oups, l’envoi a échoué. Vos réponses sont conservées — réessayez.',
  },
  widgetDefaultWelcome: {
    en: 'Hello! Let us get started with a few questions.',
    fr: 'Bonjour ! Commençons par quelques questions.',
  },
  widgetDefaultThanks: {
    en: 'Thank you! Your response has been securely saved.',
    fr: 'Merci beaucoup ! Vos réponses ont été enregistrées avec succès.',
  },
  widgetDefaultLauncher: { en: 'Chat with Us', fr: 'Discuter avec nous' },
  widgetDefaultBotName: { en: 'Assistant', fr: 'Assistant' },

  /* ---------------------- Submissions view ------------------------- */
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
  submissionIdCol: { en: 'Submission ID', fr: 'ID Réponse' },
  submittedAtCol: { en: 'Submitted At', fr: 'Date de soumission' },
  durationCol: { en: 'Completion Time (sec)', fr: 'Durée (sec)' },
  notAvailable: { en: 'N/A', fr: 'N/A' },
  advocacyScore: { en: 'Advocacy Score', fr: 'Taux de recommandation' },
  searchValues: { en: 'Search values...', fr: 'Rechercher des valeurs...' },
  noAnswer: { en: 'No answer', fr: 'Sans réponse' },
  deleteSubmission: { en: 'Delete Submission', fr: 'Supprimer la réponse' },
  clientDetails: { en: 'Client details', fr: 'Détails du client' },
  userAgent: { en: 'User agent', fr: 'Agent utilisateur' },
  responseCount: { en: 'Responses', fr: 'Réponses' },

  /* ------------------------- Form builder -------------------------- */
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
  builderFormDescription: { en: 'Form Description', fr: 'Description du formulaire' },
  builderPlaceholderName: { en: 'e.g. What is your full name?', fr: 'ex. Quel est votre nom complet ?' },
  builderPlaceholderHelper: {
    en: 'e.g. First and last name so we know how to address you',
    fr: 'ex. Prénom et nom pour pouvoir vous appeler',
  },
  builderRemoveOption: { en: 'Remove', fr: 'Retirer' },
  builderResetFlow: { en: 'Reset flow', fr: 'Réinitialiser le flux' },
  dashboardToggleStatus: { en: 'Click to toggle status', fr: 'Cliquez pour changer le statut' },
  refresh: { en: 'Refresh', fr: 'Actualiser' },
  simReloadFrame: { en: 'Reload the frame', fr: 'Recharger le cadre' },
  builderSequentialFlow: { en: 'Sequential Flow', fr: 'Flux séquentiel' },
  builderDescriptionPlaceholder: {
    en: 'Briefly state what this form captures...',
    fr: 'Décrivez brièvement ce que ce formulaire collecte...',
  },
  builderAnsweredOneByOne: { en: 'Answered one by one', fr: 'Répondu une question à la fois' },
  builderPromptQuestion: { en: 'Prompt Question', fr: 'Question affichée' },
  builderHelperText: { en: 'Helper Text (Optional)', fr: 'Texte d’aide (Optionnel)' },
  builderResponseType: { en: 'Response Type', fr: 'Type de réponse' },
  builderTypeText: { en: 'Short Text', fr: 'Texte court' },
  builderTypeEmail: { en: 'Email Address (Validated)', fr: 'Adresse email (validée)' },
  builderTypeMultiple: { en: 'Multiple Choice', fr: 'Choix multiple' },
  builderTypeYesNo: { en: 'Yes / No Toggle', fr: 'Bouton Oui / Non' },
  builderRequiredQuestion: { en: 'Required Question', fr: 'Question obligatoire' },
  builderChoiceOptions: { en: 'Choice Options', fr: 'Options de réponse' },
  builderAddChoice: { en: 'Add Choice', fr: 'Ajouter une option' },
  builderAppendQuestion: { en: 'Append Question', fr: 'Ajouter une question' },
  builderShortText: { en: 'Text', fr: 'Texte' },
  builderEmail: { en: 'Email', fr: 'Email' },
  builderChoices: { en: 'Choices', fr: 'Choix' },
  builderYesNo: { en: 'Yes / No', fr: 'Oui / Non' },
  builderRating: { en: 'Rating', fr: 'Étoiles' },
  builderPrimaryColor: { en: 'Primary Accent Color', fr: 'Couleur principale' },
  builderColorHint: {
    en: 'Defines user chat bubbles, launcher button, and active focus boundaries.',
    fr: 'Définit les bulles de conversation, le bouton de lancement et les couleurs actives.',
  },
  builderAssistantIdentity: { en: 'Assistant Identity', fr: 'Identité de l’assistant' },
  builderBotDisplayName: { en: 'Bot Display Name', fr: 'Nom affiché du bot' },
  builderLauncherLabel: { en: 'Launcher Label', fr: 'Libellé du bouton' },
  builderConversationalCopy: { en: 'Conversational Copy', fr: 'Textes de la conversation' },
  builderWelcomeGreeting: { en: 'Welcome Greeting', fr: 'Message de bienvenue' },
  builderCompletionMessage: { en: 'Completion Message', fr: 'Message de fin' },
  builderCornerPlacement: { en: 'Corner Placement', fr: 'Position du widget' },
  builderBottomRight: { en: 'Bottom Right', fr: 'En bas à droite' },
  builderBottomLeft: { en: 'Bottom Left', fr: 'En bas à gauche' },
  builderLivePreview: { en: 'Live Preview', fr: 'Aperçu en direct' },
  builderPreviewHint: {
    en: 'Interactive test session: submissions made in preview are not recorded.',
    fr: 'Session de test interactive : les réponses envoyées dans l’aperçu ne sont pas enregistrées.',
  },
  builderMinOneQuestion: {
    en: 'A form must contain at least one question.',
    fr: 'Un formulaire doit comporter au moins une question.',
  },
  builderMinTwoOptions: {
    en: 'Multiple choice questions require at least 2 options.',
    fr: 'Les questions à choix multiples requièrent au moins 2 options.',
  },
  builderUntitledForm: { en: 'Untitled Form', fr: 'Formulaire sans titre' },
  builderSaved: { en: 'Saved', fr: 'Enregistré' },
  builderUnpublish: { en: 'Unpublish', fr: 'Dépublier' },
  builderPublish: { en: 'Publish', fr: 'Publier' },
  builderBotAvatar: { en: 'Bot Avatar', fr: 'Avatar du bot' },
  builderMoveUp: { en: 'Move up', fr: 'Monter' },
  builderMoveDown: { en: 'Move down', fr: 'Descendre' },
  builderDuplicateQuestion: { en: 'Duplicate question', fr: 'Dupliquer la question' },
  builderDeleteQuestion: { en: 'Delete question', fr: 'Supprimer la question' },
  builderDesktop: { en: 'Desktop', fr: 'Bureau' },
  builderMobile: { en: 'Mobile', fr: 'Mobile' },

  /* --------------------------- Auth page --------------------------- */
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
  authBackHome: { en: 'Back to FormPulse', fr: 'Retour à l’accueil' },
  authWelcomeBackTitle: { en: 'Welcome back', fr: 'Bon retour parmi nous' },
  authCreateTitle: { en: 'Create your account', fr: 'Créer un compte' },
  authSignInSubtitle: {
    en: 'Sign in to access your forms and response analytics',
    fr: 'Connectez-vous pour accéder à vos formulaires et analyses',
  },
  authSignUpSubtitle: {
    en: 'Start building conversational chatbot forms in seconds',
    fr: 'Créez des formulaires conversationnels en quelques secondes',
  },
  authDemoAccess: { en: 'Instant Reviewer Access', fr: 'Accès rapide direct' },
  authDemoBadge: { en: 'Demo', fr: 'Démo' },
  authForgotPassword: { en: 'Forgot password?', fr: 'Mot de passe oublié ?' },
  authPasswordPlaceholderSignup: { en: 'At least 6 characters', fr: 'Au moins 6 caractères' },
  authPasswordPlaceholderSignin: { en: 'Enter password', fr: 'Entrez votre mot de passe' },
  authRememberMe: { en: 'Keep me signed in for 30 days', fr: 'Rester connecté pendant 30 jours' },
  authSecureSession: {
    en: 'Secure server-side session (httpOnly cookie)',
    fr: 'Session serveur sécurisée (cookie httpOnly)',
  },
  authLegal: {
    en: 'By continuing, you agree to FormPulse’s Terms of Service and Privacy Policy.',
    fr: 'En continuant, vous acceptez les Conditions de Service et la Politique de Confidentialité de FormPulse.',
  },
  authUnexpectedError: {
    en: 'An unexpected error occurred. Please try again.',
    fr: 'Une erreur inattendue est survenue. Veuillez réessayer.',
  },
  authDemoUnavailable: {
    en: 'The demo account is unavailable. Please sign in with your own credentials.',
    fr: 'Le compte démo est indisponible. Connectez-vous avec vos propres identifiants.',
  },
  authEmailForReset: {
    en: 'Please enter your email address to reset password.',
    fr: 'Veuillez saisir votre adresse email pour réinitialiser le mot de passe.',
  },
  authResetDisabled: {
    en: 'Email password reset is not enabled in this environment. Use the demo account or create an account.',
    fr: 'La réinitialisation par email n’est pas activée dans cet environnement. Utilisez le compte Démo ou créez un compte.',
  },

  /* ------------------------- Landing page -------------------------- */
  heroTitle: {
    en: 'Interactive forms that people actually finish.',
    fr: 'Des formulaires interactifs que vos utilisateurs complètent vraiment.',
  },
  heroSubtitle: {
    en: 'Replace rigid web forms with responsive, stepped chatbot conversations. Embed a floating widget on any site with a single script tag and manage submissions in a real-time analytics workspace.',
    fr: 'Remplacez les formulaires austères par des conversations fluides et engageantes. Intégrez une bulle interactive ou un widget avec une seule ligne de code et suivez vos métriques de recommandation en direct.',
  },
  heroEyebrow: {
    en: 'Conversational Form Engine',
    fr: 'Moteur de formulaires conversationnels',
  },
  heroCtaStart: { en: 'Get Started Free', fr: 'Accéder au Studio' },
  heroCtaDemo: { en: 'Try Live Playground', fr: 'Tester la démo en direct' },
  heroMetaNoCode: { en: 'Zero-code setup', fr: 'Sans code' },
  heroMetaOneLine: { en: '1-line JavaScript embed', fr: '1 ligne de script' },
  heroMetaExports: { en: 'CSV & JSON data exports', fr: 'Exports CSV & JSON' },
  heroMetaNps: { en: 'NPS Recommendation Pulse', fr: 'Métrique de recommandation' },
  navDemo: { en: 'Interactive Demo', fr: 'Démo interactive' },
  navCapabilities: { en: 'Capabilities', fr: 'Fonctionnalités' },
  navWorkflow: { en: 'Workflow', fr: 'Fonctionnement' },
  navEmbed: { en: 'Embed Script', fr: 'Script d’intégration' },
  navGetStarted: { en: 'Get Started', fr: 'Démarrer' },
  demoEyebrow: { en: 'Interactive Showcase', fr: 'Vitrine interactive' },
  demoTitle: { en: 'Test the chatbot flow in real-time', fr: 'Testez le parcours conversationnel en direct' },
  demoDesc: {
    en: 'Select a form preset to inspect how inputs adapt per question type (text, email validation, multiple choice, yes/no, and star ratings).',
    fr: 'Choisissez un formulaire pour découvrir comment les champs s’adaptent à chaque type de question (texte, email validé, choix multiple, oui/non et notes étoilées).',
  },
  demoSelectPreset: { en: 'Select Form Preset', fr: 'Choisir un formulaire' },
  demoQuestions: { en: 'questions', fr: 'questions' },
  demoTestSubmissions: { en: 'Test submissions:', fr: 'Réponses de test :' },
  demoEmbed: { en: 'Embed', fr: 'Intégrer' },
  demoResetChat: { en: 'Reset Chat', fr: 'Réinitialiser' },
  demoEngineTitle: { en: 'Conversational Step Engine', fr: 'Moteur conversationnel par étapes' },
  demoEngineDesc: {
    en: 'Respondents answer one prompt at a time with instant validation, keyboard submit, and zero overwhelm.',
    fr: 'Les répondants répondent une question à la fois, avec validation instantanée, envoi au clavier et aucune surcharge.',
  },
  demoLiveCapture: { en: 'Interactive responses captured live', fr: 'Réponses interactives enregistrées en direct' },
  demoLoading: { en: 'Loading the live demo…', fr: 'Chargement de la démo en direct…' },
  demoNoForm: { en: 'No published form yet', fr: 'Aucun formulaire publié' },
  demoLoadingDesc: {
    en: 'Fetching the conversational forms published on this workspace.',
    fr: 'Récupération des formulaires publiés sur cet espace.',
  },
  demoNoFormDesc: {
    en: 'Publish a form from the dashboard to see it live here.',
    fr: 'Publiez un formulaire depuis le tableau de bord pour le voir apparaître ici.',
  },
  capEyebrow: { en: 'Core Capabilities', fr: 'Fonctionnalités clés' },
  capTitle: { en: 'Engineered for response completion', fr: 'Conçu pour maximiser le taux de complétion' },
  capDesc: {
    en: 'Every detail is calibrated to eliminate friction and maintain engagement.',
    fr: 'Chaque détail est calibré pour supprimer les frictions et maintenir l’engagement.',
  },
  cap1Title: { en: 'Sequential Step Flow', fr: 'Flux séquentiel par étapes' },
  cap1Desc: {
    en: 'Presents one prompt at a time. Respondents focus on immediate answers without feeling overwhelmed by towering questionnaire columns.',
    fr: 'Une question à la fois. Les répondants se concentrent sur la réponse immédiate sans être submergés par de longues colonnes.',
  },
  cap2Title: { en: '5 Input Archetypes', fr: '5 types de réponses' },
  cap2Desc: {
    en: 'Includes text fields, validated email addresses, multiple-choice buttons, instant Yes/No toggles, and 1–5 star ratings.',
    fr: 'Champs texte, adresses email validées, boutons à choix multiple, boutons Oui/Non instantanés et notes de 1 à 5 étoiles.',
  },
  cap3Title: { en: '1-Line Embed Snippet', fr: 'Intégration en une ligne' },
  cap3Desc: {
    en: 'Add a lightweight <script> tag to any page. Works instantly on Shopify, Webflow, WordPress, React, or static HTML.',
    fr: 'Ajoutez une balise <script> légère sur n’importe quelle page. Fonctionne sur Shopify, Webflow, WordPress, React ou HTML statique.',
  },
  cap4Title: { en: 'Real-Time Data Sheets', fr: 'Données en temps réel' },
  cap4Desc: {
    en: 'Submissions land in your database instantaneously. View individual records, breakdown charts, and export to CSV or JSON with one click.',
    fr: 'Les réponses arrivent instantanément en base. Consultez les fiches, les synthèses et exportez en CSV ou JSON en un clic.',
  },
  cap5Title: { en: 'Direct Public Links', fr: 'Liens publics directs' },
  cap5Desc: {
    en: 'Each published form generates an unbranded, distraction-free public URL tailored for direct sharing via email, social posts, or QR codes.',
    fr: 'Chaque formulaire publié génère une URL publique épurée, prête à être partagée par email, réseaux sociaux ou QR code.',
  },
  cap6Title: { en: 'Theme & Tone Control', fr: 'Contrôle du thème et du ton' },
  cap6Desc: {
    en: 'Set accent colors, custom bot avatars, personalized greetings, and widget corner placement without touching frontend code.',
    fr: 'Réglez les couleurs, l’avatar du bot, les messages d’accueil et la position du widget sans toucher au code frontend.',
  },
  flowEyebrow: { en: 'Architecture', fr: 'Architecture' },
  flowTitle: { en: 'From draft to live collection in three steps', fr: 'Du brouillon à la collecte en trois étapes' },
  flow1Title: { en: 'Assemble questions', fr: 'Composez les questions' },
  flow1Desc: {
    en: 'Compose questions, reorder steps, mark fields required, and test the conversational cadence inside the live studio builder.',
    fr: 'Composez vos questions, réordonnez les étapes, marquez les champs obligatoires et testez le rythme dans l’éditeur.',
  },
  flow2Title: { en: 'Publish & copy snippet', fr: 'Publiez et copiez le snippet' },
  flow2Desc: {
    en: 'Toggle form status to Published. Copy your unique embed script or grab the standalone hosted link.',
    fr: 'Passez le formulaire en « Publié ». Copiez votre script d’intégration ou récupérez le lien public.',
  },
  flow3Title: { en: 'Analyze submissions', fr: 'Analysez les réponses' },
  flow3Desc: {
    en: 'Monitor incoming responses in real time. Review submission speed, check answer breakdowns, and export raw data.',
    fr: 'Suivez les réponses en temps réel, consultez les synthèses et exportez les données brutes.',
  },
  embedEyebrow: { en: 'Developer Embed Snippet', fr: 'Snippet d’intégration' },
  embedTitle: { en: 'One script tag, zero external dependencies', fr: 'Une balise script, zéro dépendance' },
  embedDesc: {
    en: 'Paste this snippet right before </body> on any website to mount the floating conversational widget.',
    fr: 'Collez ce snippet juste avant </body> sur n’importe quel site pour afficher le widget conversationnel flottant.',
  },
  embedCta: { en: 'Test Interactive Demo', fr: 'Tester la démo interactive' },
  footerTagline: { en: 'Interactive Form & Chatbot Platform', fr: 'Plateforme de formulaires conversationnels' },
  footerBuilder: { en: 'Form Builder', fr: 'Éditeur de formulaires' },
  footerLiveDemo: { en: 'Live Demo', fr: 'Démo en direct' },
  footerCapabilities: { en: 'Capabilities', fr: 'Fonctionnalités' },
  footerContact: { en: 'Contact', fr: 'Contact' },
  footerRights: { en: '© 2026 FormPulse. Built with precision.', fr: '© 2026 FormPulse. Conçu avec précision.' },

  /* ------------------------ Embed modal ----------------------------- */
  embedModalTitle: { en: 'Embed & Share Form', fr: 'Intégrer & Partager le formulaire' },
  embedModalDesc: { en: 'Deploy conversational widget for', fr: 'Déployer le widget conversationnel pour' },
  embedTabScript: { en: 'Script Tag', fr: 'Balise Script' },
  embedTabLink: { en: 'Public URL', fr: 'Lien Public' },
  embedTabIframe: { en: 'Iframe', fr: 'Iframe' },
  embedSnippetTitle: { en: 'JavaScript Snippet', fr: 'Snippet JavaScript' },
  embedSnippetHint: {
    en: 'Paste this snippet before the closing </body> tag on any website.',
    fr: 'Collez ce snippet avant la balise </body> sur n’importe quel site.',
  },
  embedCopied: { en: 'Copied', fr: 'Copié' },
  embedCopy: { en: 'Copy', fr: 'Copier' },
  embedTestTitle: { en: 'Want to test live form?', fr: 'Tester le formulaire en direct ?' },
  embedTestCta: { en: 'Open Standalone Form', fr: 'Ouvrir le formulaire public' },
  embedLinkTitle: { en: 'Direct Public Link', fr: 'Lien public direct' },
  embedLinkHint: {
    en: 'Send this hosted URL directly to respondents.',
    fr: 'Envoyez cette URL hébergée directement aux répondants.',
  },
  embedLinkCta: { en: 'Open Public Page', fr: 'Ouvrir la page publique' },
  embedIframeTitle: { en: 'Iframe Code', fr: 'Code Iframe' },
  embedIframeHint: {
    en: 'Embed directly within internal documentation or blog posts.',
    fr: 'Intégrez directement dans une documentation interne ou un article de blog.',
  },

  /* ---------------------- Standalone chat view ---------------------- */
  standaloneNotFoundTitle: { en: 'Form Not Found', fr: 'Formulaire introuvable' },
  standaloneNotFoundDesc: {
    en: 'The conversational form you requested could not be located.',
    fr: 'Le formulaire conversationnel demandé est introuvable.',
  },
  standaloneGoHome: { en: 'Go to FormPulse', fr: 'Aller sur FormPulse' },
  standaloneUnpublishedTitle: { en: 'Form Unpublished', fr: 'Formulaire non publié' },
  standaloneUnpublishedDesc: {
    en: 'is currently in draft mode and not accepting public submissions.',
    fr: 'est actuellement en mode brouillon et n’accepte pas de réponses publiques.',
  },
  standaloneResponseRecorded: { en: 'Response recorded', fr: 'Réponse enregistrée' },
  standalonePlatform: { en: 'FormPulse Conversational Platform', fr: 'Plateforme conversationnelle FormPulse' },

  /* ---------------------- Website simulator ------------------------- */
  simTitle: { en: 'Host Site Embed Simulation', fr: 'Simulation d’intégration sur un site' },
  simSimulating: { en: 'Simulating script mount on:', fr: 'Simulation du montage du script sur :' },
  simActiveForm: { en: 'Active Form:', fr: 'Formulaire actif :' },
  simDesktop: { en: 'Desktop', fr: 'Bureau' },
  simMobile: { en: 'Mobile', fr: 'Mobile' },
  simSaved: { en: 'Saved to Database', fr: 'Enregistré en base' },
  simViewSubmissions: { en: 'View Submissions', fr: 'Voir les réponses' },
  simWidgetActive: { en: 'Widget Active', fr: 'Widget actif' },
  simProductTagline: {
    en: 'Cloud Computing Infrastructure',
    fr: 'Infrastructure cloud',
  },
  simProductHero: {
    en: 'High-performance edge systems for engineering teams',
    fr: 'Des systèmes edge performants pour les équipes d’ingénierie',
  },
  simStartTrial: { en: 'Start Trial', fr: 'Essai gratuit' },
  simNavPlatform: { en: 'Platform', fr: 'Plateforme' },
  simNavSolutions: { en: 'Solutions', fr: 'Solutions' },
  simNavPricing: { en: 'Pricing', fr: 'Tarifs' },
  simNavPortal: { en: 'Client Portal', fr: 'Espace client' },
  simDoc: { en: 'Documentation', fr: 'Documentation' },
  simFeatureLatency: { en: 'Low Latency', fr: 'Faible latence' },
  simFeatureLatencyDesc: {
    en: 'Sub-20ms TTFB across regional edge points of presence.',
    fr: 'TTFB sous les 20 ms sur les points de présence edge régionaux.',
  },
  simFeatureSecurity: { en: 'Data Security', fr: 'Sécurité des données' },
  simFeatureSecurityDesc: {
    en: 'SOC2 certified, GDPR compliant, automated DDoS scrubbing.',
    fr: 'Certifié SOC2, conforme RGPD, protection DDoS automatisée.',
  },
  simFeaturePermissions: { en: 'Team Permissions', fr: 'Permissions d’équipe' },
  simFeaturePermissionsDesc: {
    en: 'Role-based access control with audit trails and webhooks.',
    fr: 'Contrôle d’accès par rôle avec pistes d’audit et webhooks.',
  },

  /* ------------------------- Dashboard ----------------------------- */
  dashNps: { en: 'NPS Pulse', fr: 'NPS Pulse' },
  dashQName: { en: "What's your name?", fr: 'Quel est votre nom ?' },
  dashQEmail: { en: "What's your email address?", fr: 'Quelle est votre adresse email ?' },
  dashQRating: {
    en: 'How would you rate your overall experience?',
    fr: 'Comment évaluez-vous votre expérience globale ?',
  },
  dashQFavorite: { en: 'What was your favorite aspect?', fr: 'Quelle fonctionnalité avez-vous préférée ?' },
  dashQRecommend: {
    en: 'Would you recommend this tool to a teammate?',
    fr: 'Recommanderiez-vous cet outil à un collègue ?',
  },
  dashQBadgeName: { en: 'Full Name for badge check-in', fr: 'Nom pour le badge' },
  dashQWorkEmail: { en: 'Work email address for confirmation', fr: 'Email professionnel' },
  dashQNetworking: { en: 'Will you join the networking dinner?', fr: 'Participerez-vous au cocktail de networking ?' },
  dashDescConversational: {
    en: 'Conversational interaction form',
    fr: 'Formulaire conversationnel interactif',
  },
  dashDescSupport: { en: 'Customer Support', fr: 'Support réactif' },
  dashDescSpeed: { en: 'Interface Speed', fr: 'Vitesse d’affichage' },
  dashDescDesign: { en: 'Widget Styling', fr: 'Design du widget' },
  dashDescFlow: { en: 'Conversational Flow', fr: 'Flux conversationnel' },
  dashWelcome: {
    en: 'Hello! Let us get started with a few quick questions.',
    fr: 'Bonjour ! Commençons par quelques questions rapides.',
  },
  dashThanks: {
    en: 'Thank you! Your response has been securely saved.',
    fr: 'Merci beaucoup ! Vos réponses ont été enregistrées avec succès.',
  },
  dashLauncher: { en: 'Chat with Us', fr: 'Discuter avec nous' },
  dashFormCreated: { en: 'Form created successfully!', fr: 'Formulaire créé avec succès !' },
  dashTestTitle: { en: 'Live Interactive Test', fr: 'Session interactive' },
  dashTestHint: { en: 'Test and fill form in chat', fr: 'Tester et répondre au formulaire' },
  dashOptionsFlow: { en: 'Conversational Flow', fr: 'Flux conversationnel' },
  dashOptionsSpeed: { en: 'Interface Speed', fr: 'Vitesse d’affichage' },
  dashOptionsSupport: { en: 'Customer Support', fr: 'Support réactif' },
  dashOptionsDesign: { en: 'Widget Styling', fr: 'Design du widget' },

  /* ----------------------- Builder presets ------------------------- */
  colorObsidian: { en: 'Obsidian', fr: 'Obsidienne' },
  colorIndigo: { en: 'Indigo', fr: 'Indigo' },
  colorCobalt: { en: 'Cobalt', fr: 'Cobalt' },
  colorEmerald: { en: 'Emerald', fr: 'Émeraude' },
  colorRose: { en: 'Rose', fr: 'Rose' },
  colorAmber: { en: 'Amber', fr: 'Ambre' },
  colorSlate: { en: 'Slate', fr: 'Ardoise' },

  presetQuestionTitle: { en: 'How would you rate your experience?', fr: 'Comment évaluez-vous votre expérience ?' },
  presetPlaceholder: { en: 'Your answer...', fr: 'Votre réponse...' },
  presetOption: { en: 'Option {n}', fr: 'Option {n}' },
  presetNewQuestion: { en: 'New Question Title', fr: 'Nouvel intitulé de question' },
  presetNamePlaceholder: { en: 'Demo', fr: 'Démo' },
  presetEmailPlaceholder: { en: 'demo@example.com', fr: 'demo@example.com' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, defaultText?: string, vars?: Record<string, string | number>) => string;
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
      const navLang = navigator.language.toLowerCase();
      if (navLang.startsWith('en')) return 'en';
      return 'fr';
    }
    return 'fr';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('formpulse_language', lang);
    }
  };

  const t = useCallback(
    (key: string, defaultText?: string, vars?: Record<string, string | number>): string => {
      const entry = TRANSLATIONS[key];
      let value: string | undefined;
      if (entry && entry[language]) {
        value = entry[language];
      } else if (entry && entry.en) {
        value = entry.en;
      } else {
        value = defaultText;
      }
      if (!value) return key;
      if (!vars) return value;
      return value.replace(/\{(\w+)\}/g, (match, name: string) =>
        vars[name] !== undefined ? String(vars[name]) : match
      );
    },
    [language]
  );

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
      aria-label={language === 'fr' ? 'Sélecteur de langue' : 'Language selector'}
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
        aria-pressed={language === 'fr'}
      >
        <span aria-hidden="true" className="hidden sm:inline">
          🇫🇷
        </span>
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
        aria-pressed={language === 'en'}
      >
        <span aria-hidden="true" className="hidden sm:inline">
          🇬🇧
        </span>
        <span>EN</span>
      </button>
    </div>
  );
};
