import React, { useState } from 'react';
import {
  ArrowLeft,
  Download,
  Trash2,
  Search,
  ExternalLink,
  Eye,
  Star,
  RefreshCw,
  X,
  FileSpreadsheet,
  ThumbsUp,
  AlertTriangle,
} from 'lucide-react';
import { Form, FormSubmission } from '../types/index.ts';
import { useLanguage, LanguageSwitcher } from '../i18n/index.tsx';

interface SubmissionsViewProps {
  form: Form;
  submissions: FormSubmission[];
  allForms: Form[];
  onSelectForm: (formId: string) => void;
  onBack: () => void;
  onDeleteSubmission: (subId: string) => void;
  onRefresh: () => void;
  onOpenEmbed: (form: Form) => void;
}

export const SubmissionsView: React.FC<SubmissionsViewProps> = ({
  form: propForm,
  submissions,
  allForms,
  onSelectForm,
  onBack,
  onDeleteSubmission,
  onRefresh,
  onOpenEmbed,
}) => {
  const { language, t } = useLanguage();
  const effectiveForms = allForms ?? [];
  const form = propForm || effectiveForms[0] || null;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<FormSubmission | null>(null);
  const [subToDelete, setSubToDelete] = useState<string | null>(null);

  // Filter submissions by search term
  const filteredSubmissions = submissions.filter((sub) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const matchesId = sub.id.toLowerCase().includes(term);
    const matchesAnswers = Object.values(sub.answers).some((val) =>
      String(val).toLowerCase().includes(term)
    );
    return matchesId || matchesAnswers;
  });

  // Export to CSV
  const exportToCSV = () => {
    if (submissions.length === 0) return;

    const headers = [
      language === 'fr' ? 'ID Réponse' : 'Submission ID',
      language === 'fr' ? 'Date de soumission' : 'Submitted At',
      language === 'fr' ? 'Durée (sec)' : 'Completion Time (sec)',
    ];
    form.questions.forEach((q) => {
      headers.push(`"${q.title.replace(/"/g, '""')}"`);
    });

    const rows = submissions.map((sub) => {
      const row = [
        sub.id,
        new Date(sub.submittedAt).toLocaleString(),
        sub.completionTimeSeconds || 'N/A',
      ];
      form.questions.forEach((q) => {
        const val = sub.answers[q.id];
        const formatted =
          val !== undefined && val !== null ? `"${String(val).replace(/"/g, '""')}"` : '""';
        row.push(formatted);
      });
      return row.join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_submissions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const exportToJSON = () => {
    if (submissions.length === 0) return;
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(submissions, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `${form.title.replace(/\s+/g, '_')}_submissions.json`);
    dlAnchorElem.click();
  };

  const avgCompletionTime =
    submissions.length > 0
      ? Math.round(
          submissions.reduce((acc, curr) => acc + (curr.completionTimeSeconds || 30), 0) /
            submissions.length
        )
      : 0;

  // Find if this form has a "Would you recommend this tool?" question
  const recommendQuestion = form.questions.find(
    (q) =>
      q.id.toLowerCase().includes('recommend') ||
      q.title.toLowerCase().includes('recommend') ||
      q.title.toLowerCase().includes('recommand')
  );

  let recommendYesCount = 0;
  let recommendNoCount = 0;
  let recommendTotal = 0;
  let recommendRate = 0;

  if (recommendQuestion) {
    submissions.forEach((s) => {
      const val = s.answers[recommendQuestion.id];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        const str = String(val).toLowerCase();
        if (str === 'yes' || str.includes('oui') || str.includes('absolument')) {
          recommendYesCount++;
          recommendTotal++;
        } else if (str === 'no' || str.includes('non') || str.includes('vraiment')) {
          recommendNoCount++;
          recommendTotal++;
        }
      }
    });
    recommendRate = recommendTotal > 0 ? Math.round((recommendYesCount / recommendTotal) * 100) : 100;
  }

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#fafafa]/90 backdrop-blur-md border-b border-zinc-200/80 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button type="button"
            onClick={onBack}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition cursor-pointer"
            title={t('backToDashboard')}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-zinc-950 tracking-tight">
                {t('submissionsLedger')}
              </h1>
              <span className="text-xs text-zinc-400 font-mono tabular-nums">
                · {submissions.length} {t('totalEntries')}
              </span>
            </div>
            {/* Form switcher */}
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-zinc-400">{t('targetWorkflow')}</span>
              <select
                value={form.id}
                onChange={(e) => onSelectForm(e.target.value)}
                className="text-xs font-semibold text-zinc-800 bg-white border border-zinc-200 rounded-md px-2 py-0.5 cursor-pointer focus:ring-1 focus:ring-zinc-900 focus:outline-none"
              >
                {effectiveForms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title} ({f.responseCount} {t('entries')})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <LanguageSwitcher />

          <button type="button"
            onClick={onRefresh}
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-white transition cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button type="button"
            onClick={exportToCSV}
            className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-zinc-500" />
            <span>{t('exportCsv')}</span>
          </button>
          <button type="button"
            onClick={exportToJSON}
            className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-700 text-xs font-medium transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>{t('exportJson')}</span>
          </button>
          <button type="button"
            onClick={() => onOpenEmbed(form)}
            className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>{t('shareAndEmbed')}</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        {/* Metric Overview Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-zinc-200/90 shadow-2xs space-y-1">
            <div className="text-xs font-medium text-zinc-500">{t('collectedResponses')}</div>
            <div className="text-2xl font-bold tracking-tight text-zinc-950 font-mono tabular-nums">
              {submissions.length}
            </div>
            <div className="text-[11px] text-zinc-400">{t('kpiTotalSubmissionsSub')}</div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-zinc-200/90 shadow-2xs space-y-1">
            <div className="text-xs font-medium text-zinc-500">{t('averageSpeed')}</div>
            <div className="text-2xl font-bold tracking-tight text-zinc-950 font-mono tabular-nums">
              {avgCompletionTime}s
            </div>
            <div className="text-[11px] text-zinc-400">{t('speedSub')}</div>
          </div>

          {/* Prominent Recommendation Metric KPI Card */}
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 shadow-2xs space-y-1 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                {t('recommendScoreTitle')}
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                Pulse NPS
              </span>
            </div>
            <div className="text-2xl font-bold tracking-tight text-emerald-950 font-mono tabular-nums">
              {recommendQuestion ? `${recommendRate}%` : '100%'}
            </div>
            <div className="text-[11px] text-emerald-700 font-medium">
              {recommendQuestion
                ? `${recommendYesCount}/${recommendTotal || submissions.length} ${t('recommendRateLabel')}`
                : t('fieldCoverageSub')}
            </div>
          </div>
        </div>

        {/* Dedicated "Would you recommend this tool?" Spotlight Section */}
        {recommendQuestion && submissions.length > 0 && (
          <div className="p-5 rounded-xl bg-linear-to-r from-emerald-50 via-white to-emerald-50/30 border border-emerald-200 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <ThumbsUp className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold text-emerald-950">
                    {recommendQuestion.title}
                  </h3>
                </div>
                <p className="text-xs text-emerald-800 mt-1">
                  {language === 'fr'
                    ? 'Résultat direct de la question de recommandation pour mesurer la satisfaction et l’adoption de vos utilisateurs.'
                    : 'Direct recommendation outcome tracking how likely your active users are to advocate for this tool.'}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-emerald-950 tabular-nums">
                    {recommendRate}%
                  </div>
                  <div className="text-[10px] uppercase tracking-wider font-semibold text-emerald-700">
                    {language === 'fr' ? 'Taux de recommandation' : 'Advocacy Score'}
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Progress Satisfaction Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="w-full h-3 rounded-full bg-emerald-100 overflow-hidden flex">
                <div
                  className="bg-emerald-600 transition-all duration-500 rounded-l-full"
                  style={{ width: `${recommendRate}%` }}
                  title={`${recommendYesCount} Yes`}
                />
                <div
                  className="bg-rose-400 transition-all duration-500 rounded-r-full"
                  style={{ width: `${100 - recommendRate}%` }}
                  title={`${recommendNoCount} No`}
                />
              </div>
              <div className="flex justify-between text-xs font-mono font-medium text-zinc-600">
                <span className="flex items-center gap-1 text-emerald-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  {t('recommendYes')}: {recommendYesCount} ({recommendRate}%)
                </span>
                <span className="flex items-center gap-1 text-zinc-500">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  {t('recommendNo')}: {recommendNoCount} ({100 - recommendRate}%)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Visual Question Summaries */}
        {submissions.length > 0 && (
          <div className="p-5 rounded-xl bg-white border border-zinc-200/90 space-y-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {t('aggregatedBreakdown')}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {form.questions.map((q) => {
                if (q.type === 'multiple_choice' && q.options) {
                  const counts: Record<string, number> = {};
                  q.options.forEach((opt) => (counts[opt] = 0));
                  submissions.forEach((s) => {
                    const ans = s.answers[q.id];
                    if (ans && counts[String(ans)] !== undefined) {
                      counts[String(ans)] += 1;
                    }
                  });

                  return (
                    <div key={q.id} className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2.5">
                      <div className="text-xs font-semibold text-zinc-900 truncate">
                        {q.title}
                      </div>
                      <div className="space-y-1.5">
                        {q.options.map((opt) => {
                          const count = counts[opt] || 0;
                          const pct =
                            submissions.length > 0 ? Math.round((count / submissions.length) * 100) : 0;
                          return (
                            <div key={opt} className="space-y-1 text-xs">
                              <div className="flex justify-between text-zinc-600">
                                <span className="truncate pr-2">{opt}</span>
                                <span className="font-mono tabular-nums font-medium text-zinc-900">
                                  {count} ({pct}%)
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-zinc-200 overflow-hidden">
                                <div
                                  className="h-full bg-zinc-900 rounded-full transition-all duration-300"
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                if (q.type === 'yes_no') {
                  const yesCount = submissions.filter((s) => {
                    const val = String(s.answers[q.id] || '').toLowerCase();
                    return val === 'yes' || val.includes('oui') || val.includes('absolument');
                  }).length;
                  const noCount = submissions.filter((s) => {
                    const val = String(s.answers[q.id] || '').toLowerCase();
                    return val === 'no' || val.includes('non') || val.includes('vraiment');
                  }).length;
                  const total = yesCount + noCount;
                  const yesPct = total > 0 ? Math.round((yesCount / total) * 100) : 0;
                  const noPct = total > 0 ? 100 - yesPct : 0;

                  return (
                    <div key={q.id} className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-2">
                      <div className="text-xs font-semibold text-zinc-900 truncate">
                        {q.title}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-center pt-1 font-mono tabular-nums">
                        <div className="p-2 rounded-lg bg-white border border-zinc-200">
                          <div className="text-base font-bold text-zinc-950">{yesPct}%</div>
                          <div className="text-[10px] text-zinc-500 font-sans">
                            {t('yes')} ({yesCount})
                          </div>
                        </div>
                        <div className="p-2 rounded-lg bg-white border border-zinc-200">
                          <div className="text-base font-bold text-zinc-950">{noPct}%</div>
                          <div className="text-[10px] text-zinc-500 font-sans">
                            {t('no')} ({noCount})
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (q.type === 'rating') {
                  const ratings = submissions
                    .map((s) => Number(s.answers[q.id]))
                    .filter((n) => !isNaN(n) && n > 0);
                  const avg =
                    ratings.length > 0
                      ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
                      : '0.0';

                  return (
                    <div key={q.id} className="p-3.5 rounded-lg bg-zinc-50 border border-zinc-200 space-y-1.5">
                      <div className="text-xs font-semibold text-zinc-900 truncate">
                        {q.title}
                      </div>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-2xl font-bold font-mono tabular-nums text-zinc-950 flex items-center gap-1">
                          {avg} <Star className="w-5 h-5 fill-amber-400 text-amber-400 inline" />
                        </span>
                        <span className="text-xs text-zinc-500">
                          {language === 'fr'
                            ? `Note moyenne sur 5 étoiles (${ratings.length} réponses)`
                            : `Average out of 5 stars across ${ratings.length} answers`}
                        </span>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>
        )}

        {/* Detailed High-Density Submissions Table */}
        <div className="p-5 rounded-xl bg-white border border-zinc-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              {t('submissionsLedger')} ({filteredSubmissions.length})
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={language === 'fr' ? 'Rechercher des valeurs...' : 'Search values...'}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-zinc-200 text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-none"
              />
            </div>
          </div>

          {filteredSubmissions.length === 0 ? (
            <div className="py-12 text-center text-zinc-400 text-xs italic">
              {t('noSubmissionsYet')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-500 font-medium">
                    <th className="py-2.5 px-3 whitespace-nowrap">ID</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{t('submittedAt')}</th>
                    <th className="py-2.5 px-3 whitespace-nowrap">{t('completionTime')}</th>
                    {form.questions.slice(0, 3).map((q) => (
                      <th key={q.id} className="py-2.5 px-3 max-w-[200px] truncate">
                        {q.title}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {filteredSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      onClick={() => setSelectedSubmission(sub)}
                      className="hover:bg-zinc-50/80 cursor-pointer transition"
                    >
                      <td className="py-2.5 px-3 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                        {sub.id.slice(0, 12)}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap text-zinc-600">
                        {new Date(sub.submittedAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono tabular-nums text-zinc-500">
                        {sub.completionTimeSeconds ? `${sub.completionTimeSeconds}s` : '—'}
                      </td>

                      {form.questions.slice(0, 3).map((q) => {
                        const val = sub.answers[q.id];
                        const isRec =
                          q.id.toLowerCase().includes('recommend') ||
                          q.title.toLowerCase().includes('recommend') ||
                          q.title.toLowerCase().includes('recommand');

                        if (isRec && val) {
                          const isYes =
                            String(val).toLowerCase() === 'yes' ||
                            String(val).toLowerCase().includes('oui') ||
                            String(val).toLowerCase().includes('absolument');
                          return (
                            <td key={q.id} className="py-2.5 px-3 max-w-[200px]">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  isYes
                                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                                    : 'bg-zinc-100 text-zinc-700 border border-zinc-200'
                                }`}
                              >
                                {isYes ? '👍 ' + t('yes') : '👎 ' + t('no')}
                              </span>
                            </td>
                          );
                        }

                        return (
                          <td key={q.id} className="py-2.5 px-3 max-w-[200px] truncate">
                            {val !== undefined && val !== null && String(val).trim() !== '' ? (
                              <span className="text-zinc-900">{String(val)}</span>
                            ) : (
                              <span className="text-zinc-300 italic">—</span>
                            )}
                          </td>
                        );
                      })}

                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button type="button"
                            onClick={() => setSelectedSubmission(sub)}
                            className="p-1 rounded text-zinc-400 hover:text-zinc-700 transition cursor-pointer"
                            title={t('submissionDetails')}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button type="button"
                            onClick={() => setSubToDelete(sub.id)}
                            className="p-1 rounded text-zinc-400 hover:text-rose-600 transition cursor-pointer"
                            title={t('deleteForm')}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-zinc-950 text-sm">{t('submissionDetails')}</h3>
                <p className="text-xs text-zinc-500 font-mono tabular-nums">
                  {new Date(selectedSubmission.submittedAt).toLocaleString()}
                </p>
              </div>
              <button type="button"
                onClick={() => setSelectedSubmission(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
              {form.questions.map((q, idx) => {
                const answer = selectedSubmission.answers[q.id];
                const isRec =
                  q.id.toLowerCase().includes('recommend') ||
                  q.title.toLowerCase().includes('recommend') ||
                  q.title.toLowerCase().includes('recommand');

                return (
                  <div
                    key={q.id}
                    className={`p-3 rounded-lg border space-y-1 ${
                      isRec
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-zinc-50 border-zinc-200'
                    }`}
                  >
                    <div className="text-[11px] font-medium text-zinc-500 flex items-center justify-between">
                      <span>{idx + 1}. {q.title}</span>
                      {isRec && (
                        <span className="text-[10px] font-semibold text-emerald-700 flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3" /> {t('recommendationRate')}
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-semibold text-zinc-950 whitespace-pre-wrap">
                      {answer !== undefined && answer !== null && String(answer).trim() !== '' ? (
                        String(answer)
                      ) : (
                        <span className="text-zinc-400 italic">
                          {language === 'fr' ? 'Sans réponse' : 'No answer'}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 text-[11px] font-mono text-zinc-400 space-y-0.5 border-t border-zinc-100">
                <div>ID: {selectedSubmission.id}</div>
                {selectedSubmission.completionTimeSeconds && (
                  <div>{t('completionTime')}: {selectedSubmission.completionTimeSeconds}s</div>
                )}
              </div>
            </div>

            <div className="px-6 py-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <button type="button"
                onClick={() => setSubToDelete(selectedSubmission.id)}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 cursor-pointer flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> {language === 'fr' ? 'Supprimer la réponse' : 'Delete Submission'}
              </button>
              <button type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-3.5 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition cursor-pointer"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App Submission Delete Modal (NO window.confirm) */}
      {subToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden animate-in zoom-in-95 duration-150 p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-950 text-sm">
                  {t('confirmDeleteSubTitle')}
                </h3>
                <p className="text-xs text-zinc-500 font-mono mt-0.5">
                  ID: {subToDelete.slice(0, 16)}...
                </p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 leading-relaxed">
              {t('confirmDeleteSubDesc')}
            </p>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-zinc-100">
              <button
                type="button"
                onClick={() => setSubToDelete(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteSubmission(subToDelete);
                  setSubToDelete(null);
                  if (selectedSubmission?.id === subToDelete) {
                    setSelectedSubmission(null);
                  }
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition cursor-pointer shadow-xs"
              >
                {t('deleteConfirmBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
