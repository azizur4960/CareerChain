import React from 'react';
import { Sparkles, Target, ShieldCheck, HeartHandshake, Code2, Database } from 'lucide-react';

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About CareerChain
        </h1>
        <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          An AI-powered academic capstone innovation bridging Daffodil International University students with verified industry alumni.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
            <Target className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Project Mission</h3>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            To eliminate the traditional friction between undergraduate coursework and competitive corporate hiring standards. CareerChain equips students with instant algorithmic feedback and mentorship from DIU graduates working at companies like Brain Station 23, BJIT, Enosis, and Optimizely.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Verified DIU Identity</h3>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Every alumni profile on CareerChain can be verified by university administrators, guaranteeing students receive genuine mentorship and legitimate job referral channels directly into engineering teams.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
            <Code2 className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Zero-Cost AI Architecture</h3>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Engineered using lightweight Natural Language Processing (Scikit-Learn TF-IDF vectorization and sentence transformers) paired with local knowledge retrieval (RAG). The platform runs self-contained without mandatory cloud API tokens.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 mb-4">
            <HeartHandshake className="h-5 w-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Alumni Community Culture</h3>
          <p className="mt-2 text-xs text-slate-600 leading-relaxed">
            Alumni can easily toggle mentorship availability, post company job vacancies with internal referral flags, publish technical articles, and conduct mock interviews for graduating juniors.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
