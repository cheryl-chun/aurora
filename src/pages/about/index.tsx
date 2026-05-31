import { Code2, ExternalLink, Sparkles } from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { toast } from '../../utils/toast';
import auroraIcon from '../../assets/aurora-icon.png';
import { useTranslation } from 'react-i18next';
import { PROJECT } from '../../constants/project';

function AboutPage() {
  const { t } = useTranslation();
  async function openGithub() {
    try {
      await openUrl(PROJECT.github.url);
    } catch (error) {
      toast.error(t('about.openFailed', { message: String(error) }));
    }
  }

  return (
    <div className="flex min-h-full flex-col px-8 py-7">
      <header className="mb-7">
        <img src={auroraIcon} alt="Aurora" className="mb-4 h-14 w-14 rounded-lg shadow-sm" />

        <h1 className="text-2xl font-semibold text-slate-950">{PROJECT.name}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{t('about.description')}</p>
      </header>

      <section className="grid max-w-3xl gap-4">
        <div className="grid grid-cols-2 gap-4">
          <InfoItem label={t('about.version')} value={PROJECT.version} />
          <InfoItem label={t('about.platform')} value="macOS / Windows / Linux" />
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
            <Sparkles size={17} />
            <span>{t('about.features')}</span>
          </div>

          <div className="grid gap-2 text-sm leading-6 text-slate-500">
            <p>{t('about.featureSelection')}</p>
            <p>{t('about.featureAppend')}</p>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-800">
            <Code2 size={17} />
            <span>{t('about.repository')}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="min-w-0 truncate text-sm text-slate-500">{PROJECT.github.url}</p>

            <button
              type="button"
              onClick={openGithub}
              className="flex h-9 shrink-0 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              <ExternalLink size={15} />
              {t('common.open')}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

export default AboutPage;
