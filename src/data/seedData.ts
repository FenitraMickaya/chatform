import type { Form, FormLocales, FormSubmission } from '../types/index.ts';

/**
 * Demo workspace used by `npm run db:seed`.
 *
 * Each form stores its default content in English and a French override.
 * The API resolves the content for the language requested by the client, so
 * the whole demo switches with the language switcher.
 */

interface SeedLocale {
  title: string;
  description: string;
  botName: string;
  welcomeMessage: string;
  thankYouMessage: string;
  launcherText: string;
  questions: Record<string, { title: string; description: string }>;
}

interface SeedForm {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  responseCount: number;
  theme: {
    primaryColor: string;
    accentColor: string;
    position: 'bottom-right' | 'bottom-left';
    botName: string;
    botAvatar: 'bot' | 'sparkles' | 'message' | 'help' | 'user' | 'zap';
    welcomeMessage: string;
    thankYouMessage: string;
    launcherText: string;
    showProgressBar: boolean;
  };
  questions: {
    id: string;
    type: 'text' | 'email' | 'multiple_choice' | 'yes_no' | 'rating';
    title: string;
    description: string;
    required: boolean;
    placeholder?: string;
    options?: string[];
    minRating?: number;
    maxRating?: number;
  }[];
  fr: SeedLocale;
}

const SEED_FORMS: SeedForm[] = [
  {
    id: 'form-lead-gen',
    title: 'Website Lead Qualification',
    description:
      'Capture inbound prospective client details and project requirements automatically.',
    status: 'published',
    createdAt: '2026-10-15T09:30:00.000Z',
    updatedAt: '2026-10-18T14:20:00.000Z',
    responseCount: 5,
    theme: {
      primaryColor: '#4F46E5',
      accentColor: '#EEF2FF',
      position: 'bottom-right',
      botName: 'Aero Assistant',
      botAvatar: 'bot',
      welcomeMessage:
        'Hello there! 👋 Welcome to Aero Solutions. We would love to learn more about your project.',
      thankYouMessage:
        'Thanks so much! 🎉 Your details have been received. An engineer will follow up within 24 hours.',
      launcherText: 'Chat with Us',
      showProgressBar: true,
    },
    questions: [
      {
        id: 'q1_name',
        type: 'text',
        title: "What's your full name?",
        description: 'First and last name so we know how to address you.',
        required: true,
        placeholder: 'e.g. Alex Morgan',
      },
      {
        id: 'q2_email',
        type: 'email',
        title: 'What is your work email address?',
        description: 'We will send our technical spec and calendar invitation here.',
        required: true,
        placeholder: 'you@company.com',
      },
      {
        id: 'q3_project_type',
        type: 'multiple_choice',
        title: 'What kind of project is it?',
        description: 'Pick the option that best describes your project.',
        required: true,
        options: [
          'Full-Stack Web App',
          'Cloud Migration & APIs',
          'Design & UX Redesign',
          'Data & Analytics',
        ],
      },
      {
        id: 'q4_timeline',
        type: 'yes_no',
        title: 'Is the project urgent (less than a month)?',
        description: '',
        required: true,
      },
      {
        id: 'q5_notes',
        type: 'text',
        title: 'Anything else we should know?',
        description: 'Budget, constraints, deadlines… optional.',
        required: false,
        placeholder: 'Short answer…',
      },
    ],
    fr: {
      title: 'Qualification de prospects',
      description:
        'Collectez automatiquement les coordonnées et les besoins des prospects entrants.',
      botName: 'Assistant Aero',
      welcomeMessage:
        'Bonjour ! 👋 Bienvenue chez Aero Solutions. Nous aimerions en savoir plus sur votre projet.',
      thankYouMessage:
        'Merci beaucoup ! 🎉 Vos informations ont été reçues. Un ingénieur vous répondra sous 24 heures.',
      launcherText: 'Discuter avec nous',
      questions: {
        q1_name: {
          title: 'Quel est votre nom complet ?',
          description: 'Prénom et nom pour pouvoir vous appeler.',
        },
        q2_email: {
          title: 'Quelle est votre adresse email professionnelle ?',
          description: 'Nous enverrons le cahier des charges et l’invitation calendrier ici.',
        },
        q3_project_type: {
          title: 'De quel type de projet s’agit-il ?',
          description: 'Choisissez l’option qui décrit le mieux votre projet.',
        },
        q4_timeline: { title: 'Le projet est-il urgent (moins d’un mois) ?', description: '' },
        q5_notes: {
          title: 'Autre chose à nous signaler ?',
          description: 'Budget, contraintes, échéances… facultatif.',
        },
      },
    },
  },
  {
    id: 'form-feedback',
    title: 'Customer Feedback & Recommendation',
    description: 'Measure satisfaction and collect the Net Promoter style signal.',
    status: 'published',
    createdAt: '2026-10-16T11:00:00.000Z',
    updatedAt: '2026-10-19T09:45:00.000Z',
    responseCount: 6,
    theme: {
      primaryColor: '#047857',
      accentColor: '#ECFDF5',
      position: 'bottom-left',
      botName: 'Pulse',
      botAvatar: 'sparkles',
      welcomeMessage: 'Hi! 👋 Two minutes of feedback and you are done. Thank you!',
      thankYouMessage: 'Thank you! 🎉 Your feedback was recorded.',
      launcherText: 'Give feedback',
      showProgressBar: true,
    },
    questions: [
      {
        id: 'q1_rating',
        type: 'rating',
        title: 'How would you rate your overall experience?',
        description: '',
        required: true,
        minRating: 1,
        maxRating: 5,
      },
      {
        id: 'q2_favorite',
        type: 'multiple_choice',
        title: 'What was your favorite aspect?',
        description: '',
        required: true,
        options: ['Ease of use', 'Speed', 'Design', 'Support quality'],
      },
      {
        id: 'q3_recommend',
        type: 'yes_no',
        title: 'Would you recommend this tool to a teammate or colleague?',
        description: '',
        required: true,
      },
      {
        id: 'q4_comment',
        type: 'text',
        title: 'What could we improve?',
        description: '',
        required: false,
        placeholder: 'Your feedback…',
      },
    ],
    fr: {
      title: 'Avis client & Recommandation',
      description: 'Mesurez la satisfaction et/le signal de recommandation.',
      botName: 'Pulse',
      welcomeMessage: 'Bonjour ! 👋 Deux minutes de retour et c’est terminé. Merci !',
      thankYouMessage: 'Merci ! 🎉 Votre avis a été enregistré.',
      launcherText: 'Donner un avis',
      questions: {
        q1_rating: { title: 'Comment évaluez-vous votre expérience globale ?', description: '' },
        q2_favorite: { title: 'Quel élément avez-vous le plus apprécié ?', description: '' },
        q3_recommend: {
          title: 'Recommanderiez-vous cet outil à un collègue ou un collaborateur ?',
          description: '',
        },
        q4_comment: { title: 'Que pourrions-nous améliorer ?', description: '' },
      },
    },
  },
  {
    id: 'form-event-rsvp',
    title: 'Event RSVP & Pass',
    description: 'Collect attendee details and session preferences for the meetup.',
    status: 'draft',
    createdAt: '2026-10-17T16:20:00.000Z',
    updatedAt: '2026-10-19T10:10:00.000Z',
    responseCount: 2,
    theme: {
      primaryColor: '#B45309',
      accentColor: '#FFFBEB',
      position: 'bottom-right',
      botName: 'Meetup Host',
      botAvatar: 'zap',
      welcomeMessage: 'Welcome! Let us save you a seat. 🎟️',
      thankYouMessage: 'You are registered! Your pass is on its way.',
      launcherText: 'RSVP',
      showProgressBar: true,
    },
    questions: [
      {
        id: 'q1_attendee',
        type: 'text',
        title: 'Full name for the badge?',
        description: '',
        required: true,
        placeholder: 'e.g. Sam Lee',
      },
      {
        id: 'q2_badge_email',
        type: 'email',
        title: 'Email for the badge?',
        description: '',
        required: true,
        placeholder: 'you@example.com',
      },
      {
        id: 'q3_session',
        type: 'multiple_choice',
        title: 'Which session are you joining?',
        description: '',
        required: true,
        options: ['Keynote', 'Product deep dive', 'Networking dinner'],
      },
      {
        id: 'q4_vegetarian',
        type: 'yes_no',
        title: 'Do you need a vegetarian meal?',
        description: '',
        required: false,
      },
    ],
    fr: {
      title: 'Inscription à un événement',
      description: 'Collectez les coordonnées des participants et leurs préférences de session.',
      botName: 'Hôte du meetup',
      welcomeMessage: 'Bienvenue ! Nous vous réservons une place. 🎟️',
      thankYouMessage: 'C’est noté ! Votre pass est en route.',
      launcherText: 'S’inscrire',
      questions: {
        q1_attendee: { title: 'Nom complet pour le badge ?', description: '' },
        q2_badge_email: { title: 'Email pour le badge ?', description: '' },
        q3_session: { title: 'Quelle session rejoignez-vous ?', description: '' },
        q4_vegetarian: { title: 'Besoin d’un repas végétarien ?', description: '' },
      },
    },
  },
];

/**
 * Builds the final form objects: the English content is the default (stored in
 * the columns) and both languages are mirrored in the locale map so the
 * server can always restore the default content.
 */
function buildForms(): Form[] {
  return SEED_FORMS.map((seed) => {
    const en: FormLocales['en'] = {
      title: seed.title,
      description: seed.description,
      theme: {
        botName: seed.theme.botName,
        welcomeMessage: seed.theme.welcomeMessage,
        thankYouMessage: seed.theme.thankYouMessage,
        launcherText: seed.theme.launcherText,
      },
      questions: Object.fromEntries(
        seed.questions.map((q) => [q.id, { title: q.title, description: q.description }])
      ),
    };

    const fr: FormLocales['fr'] = {
      title: seed.fr.title,
      description: seed.fr.description,
      theme: {
        botName: seed.fr.botName,
        welcomeMessage: seed.fr.welcomeMessage,
        thankYouMessage: seed.fr.thankYouMessage,
        launcherText: seed.fr.launcherText,
      },
      questions: Object.fromEntries(
        Object.entries(seed.fr.questions).map(([qid, entry]) => [qid, { ...entry }])
      ),
    };

    return {
      id: seed.id,
      title: seed.title,
      description: seed.description,
      status: seed.status,
      createdAt: seed.createdAt,
      updatedAt: seed.updatedAt,
      responseCount: seed.responseCount,
      theme: seed.theme,
      questions: seed.questions.map((q) => ({ ...q, placeholder: q.placeholder ?? '' })),
      defaultLang: 'en',
      locales: { en, fr },
    } satisfies Form;
  });
}

export const INITIAL_FORMS: Form[] = buildForms();

export const INITIAL_SUBMISSIONS: FormSubmission[] = [
  {
    id: 'sub-lead-1',
    formId: 'form-lead-gen',
    submittedAt: '2026-10-18T15:22:10.000Z',
    completionTimeSeconds: 42,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/128.0',
    answers: {
      q1_name: 'Utilisateur 1',
      q2_email: 'utilisateur1@example.com',
      q3_project_type: 'Full-Stack Web App',
      q4_timeline: 'Yes',
      q5_notes: 'Tableau de bord avec authentification et métriques.',
    },
  },
  {
    id: 'sub-lead-2',
    formId: 'form-lead-gen',
    submittedAt: '2026-10-18T18:40:00.000Z',
    completionTimeSeconds: 58,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/128.0',
    answers: {
      q1_name: 'Utilisateur 2',
      q2_email: 'utilisateur2@example.com',
      q3_project_type: 'Cloud Migration & APIs',
      q4_timeline: 'Yes',
      q5_notes: 'Migration de microservices et APIs cloud.',
    },
  },
  {
    id: 'sub-lead-3',
    formId: 'form-lead-gen',
    submittedAt: '2026-10-19T02:14:35.000Z',
    completionTimeSeconds: 31,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) Safari/604.1',
    answers: {
      q1_name: 'Utilisateur 3',
      q2_email: 'utilisateur3@example.com',
      q3_project_type: 'Design & UX Redesign',
      q4_timeline: 'No',
      q5_notes: 'Refonte du parcours de commande.',
    },
  },
  {
    id: 'sub-lead-4',
    formId: 'form-lead-gen',
    submittedAt: '2026-10-19T09:05:12.000Z',
    completionTimeSeconds: 76,
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/132.0',
    answers: {
      q1_name: 'Utilisateur 4',
      q2_email: 'utilisateur4@example.com',
      q3_project_type: 'Data & Analytics',
      q4_timeline: 'No',
      q5_notes: 'Reporting temps réel et export CSV.',
    },
  },
  {
    id: 'sub-lead-5',
    formId: 'form-lead-gen',
    submittedAt: '2026-10-20T08:44:00.000Z',
    completionTimeSeconds: 25,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/17.6',
    answers: {
      q1_name: 'Utilisateur 5',
      q2_email: 'utilisateur5@example.com',
      q3_project_type: 'Full-Stack Web App',
      q4_timeline: 'Yes',
      q5_notes: 'MVP urgent, budget limité.',
    },
  },
  {
    id: 'sub-feedback-1',
    formId: 'form-feedback',
    submittedAt: '2026-10-18T12:10:00.000Z',
    completionTimeSeconds: 19,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
    answers: {
      q1_rating: 5,
      q2_favorite: 'Ease of use',
      q3_recommend: 'Yes',
      q4_comment: 'Le builder est très rapide.',
    },
  },
  {
    id: 'sub-feedback-2',
    formId: 'form-feedback',
    submittedAt: '2026-10-18T17:35:42.000Z',
    completionTimeSeconds: 24,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4) Safari/604.1',
    answers: {
      q1_rating: 4,
      q2_favorite: 'Design',
      q3_recommend: 'Yes',
      q4_comment: 'Le widget est élégant sur mobile.',
    },
  },
  {
    id: 'sub-feedback-3',
    formId: 'form-feedback',
    submittedAt: '2026-10-19T07:20:00.000Z',
    completionTimeSeconds: 15,
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Chrome/129.0',
    answers: {
      q1_rating: 3,
      q2_favorite: 'Speed',
      q3_recommend: 'No',
      q4_comment: 'Le temps de chargement pourrait être amélioré.',
    },
  },
  {
    id: 'sub-feedback-4',
    formId: 'form-feedback',
    submittedAt: '2026-10-19T14:02:11.000Z',
    completionTimeSeconds: 22,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Chrome/128.0',
    answers: {
      q1_rating: 5,
      q2_favorite: 'Support quality',
      q3_recommend: 'Yes',
      q4_comment: 'Réponse très rapide de l’équipe support.',
    },
  },
  {
    id: 'sub-feedback-5',
    formId: 'form-feedback',
    submittedAt: '2026-10-20T06:41:09.000Z',
    completionTimeSeconds: 17,
    userAgent: 'Mozilla/5.0 (Linux; Android 14) Chrome/128.0',
    answers: {
      q1_rating: 4,
      q2_favorite: 'Ease of use',
      q3_recommend: 'Yes',
      q4_comment: '',
    },
  },
  {
    id: 'sub-feedback-6',
    formId: 'form-feedback',
    submittedAt: '2026-10-20T11:15:30.000Z',
    completionTimeSeconds: 28,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Edge/128.0',
    answers: {
      q1_rating: 2,
      q2_favorite: 'Speed',
      q3_recommend: 'No',
      q4_comment: 'L’export CSV était vide la première fois.',
    },
  },
  {
    id: 'sub-rsvp-1',
    formId: 'form-event-rsvp',
    submittedAt: '2026-10-19T10:30:00.000Z',
    completionTimeSeconds: 21,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/17.6',
    answers: {
      q1_attendee: 'Invité 1',
      q2_badge_email: 'invite1@example.com',
      q3_session: 'Keynote',
      q4_vegetarian: 'Yes',
    },
  },
  {
    id: 'sub-rsvp-2',
    formId: 'form-event-rsvp',
    submittedAt: '2026-10-20T09:12:45.000Z',
    completionTimeSeconds: 18,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/128.0',
    answers: {
      q1_attendee: 'Invité 2',
      q2_badge_email: 'invite2@example.com',
      q3_session: 'Networking dinner',
      q4_vegetarian: 'No',
    },
  },
];
