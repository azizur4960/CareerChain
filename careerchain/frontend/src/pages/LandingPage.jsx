import { Link } from 'react-router-dom';
import {
  Sparkles,
  Users,
  Bot,
  ArrowRight,
  Briefcase,
  BookOpen,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const LandingPage = () => {
  const { isAuthenticated, role } = useAuth();

  const getDashboardLink = () => {
    if (role === 'STUDENT') return '/student/feed';
    if (role === 'ALUMNI') return '/alumni/feed';
    if (role === 'ADMIN') return '/admin/feed';
    return '/register';
  };

  return (
    <div className="pb-16">
      <section className="relative isolate flex min-h-[320px] items-center overflow-hidden bg-slate-900 sm:min-h-[400px] lg:min-h-[460px]">
        <img
          src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=2000&q=85"
          alt="University graduates collaborating around a table"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-slate-950/65" />
        <div className="mx-auto w-full max-w-[1440px] px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-14">
          <div className="max-w-3xl text-white">
            <p className="text-sm font-semibold text-emerald-200">Daffodil International University · Career community</p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-tight text-white sm:mt-4 sm:text-5xl">CareerChain</h1>
            <p className="mt-2 max-w-2xl text-lg font-semibold leading-snug text-white sm:mt-3 sm:text-2xl">Build your next step with people who have been there.</p>
            <p className="mt-3 max-w-xl text-xs leading-5 text-white/85 sm:mt-4 sm:text-base sm:leading-6">
              Find alumni mentors, explore jobs and referrals, and get practical career guidance in one DIU network.
            </p>
            <div className="mt-5 flex flex-col items-start gap-2 sm:mt-7 sm:flex-row sm:gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardLink()}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                Open News Feed
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                >
                  Join the community
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex min-h-11 items-center justify-center rounded-lg border border-white/70 px-5 text-sm font-semibold text-white hover:bg-white/10"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-5 py-10 sm:px-8 lg:px-12">
        <div className="mb-5 max-w-2xl">
          <p className="text-xs font-semibold text-indigo-700">The DIU career network</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900">A practical place to move forward</h2>
        </div>
        <div className="grid gap-x-10 sm:grid-cols-2">
          {[
            { icon: Users, title: 'Find people who understand your path', text: 'Search alumni by graduation batch, department, company, and professional skills.', href: '/login', action: 'Explore alumni' },
            { icon: Briefcase, title: 'Explore jobs and referrals', text: 'Review role requirements, application details, and alumni referral links.', href: '/login', action: 'Browse opportunities' },
            { icon: Sparkles, title: 'See how your skills align', text: 'Compare your profile or resume with a job and review matching or missing skills.', href: '/login', action: 'Open job matching' },
            { icon: Bot, title: 'Get focused career guidance', text: 'Ask about resumes, interviews, learning plans, job search, and alumni networking.', href: '/login', action: 'Meet the career assistant' },
          ].map(({ icon: Icon, title, text, href, action }) => (
            <article key={title} className="border-t border-slate-200 py-5">
              <div className="flex items-start gap-3">
                <Icon className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-700" aria-hidden="true" />
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
                  <p className="mt-1 text-sm leading-5 text-slate-600">{text}</p>
                  <Link to={isAuthenticated ? getDashboardLink() : href} className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900">
                    {isAuthenticated ? 'Open your workspace' : action}<ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-200 pt-5 text-xs text-slate-600">
          <span className="inline-flex items-center gap-2"><BookOpen className="h-4 w-4 text-slate-500" />Career articles</span>
          <span className="inline-flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-500" />Events and webinars</span>
          <span className="inline-flex items-center gap-2"><Users className="h-4 w-4 text-slate-500" />Direct alumni messaging</span>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
