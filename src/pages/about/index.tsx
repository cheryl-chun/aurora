import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Code2,
  Download,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { openUrl } from '@tauri-apps/plugin-opener';
import { check, type DownloadEvent, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { useTranslation } from 'react-i18next';
import { toast } from '../../utils/toast';
import auroraIcon from '../../assets/aurora-icon.png';
import { PROJECT } from '../../constants/project';

type UpdateStatus = 'checking' | 'available' | 'latest' | 'failed';

function AboutPage() {
  const { t } = useTranslation();
  const checkedOnceRef = useRef(false);

  const [updateStatus, setUpdateStatus] = useState<UpdateStatus>('checking');
  const [updateInfo, setUpdateInfo] = useState<Update | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const [installingUpdate, setInstallingUpdate] = useState(false);
  const [downloadedBytes, setDownloadedBytes] = useState(0);
  const [contentLength, setContentLength] = useState<number | null>(null);

  const progressPercent = useMemo(() => {
    if (!contentLength || contentLength <= 0) {
      return null;
    }

    return Math.min(100, Math.round((downloadedBytes / contentLength) * 100));
  }, [contentLength, downloadedBytes]);

  useEffect(() => {
    if (checkedOnceRef.current) {
      return;
    }

    checkedOnceRef.current = true;
    void checkForUpdate({ silent: true });
  }, []);

  async function openGithub() {
    try {
      await openUrl(PROJECT.github.url);
    } catch (error) {
      toast.error(t('about.openFailed', { message: String(error) }));
    }
  }

  async function checkForUpdate(options?: { silent?: boolean }) {
    try {
      setCheckingUpdate(true);
      setUpdateStatus('checking');
      setUpdateInfo(null);
      setDownloadedBytes(0);
      setContentLength(null);

      const update = await check();

      if (!update) {
        setUpdateStatus('latest');

        if (!options?.silent) {
          toast.success(t('about.updateLatest'));
        }

        return;
      }

      setUpdateInfo(update);
      setUpdateStatus('available');

      if (!options?.silent) {
        toast.info(t('about.updateAvailableToast', { version: update.version }));
      }
    } catch (error) {
      setUpdateStatus('failed');

      if (!options?.silent) {
        toast.error(t('about.updateCheckFailed', { message: String(error) }));
      }
    } finally {
      setCheckingUpdate(false);
    }
  }

  async function installUpdate() {
    if (!updateInfo) {
      return;
    }

    try {
      setInstallingUpdate(true);
      setDownloadedBytes(0);
      setContentLength(null);

      await updateInfo.downloadAndInstall(handleDownloadEvent);

      toast.success(t('about.updateInstalled'));
      await relaunch();
    } catch (error) {
      toast.error(t('about.updateInstallFailed', { message: String(error) }));
      setInstallingUpdate(false);
    }
  }

  function handleDownloadEvent(event: DownloadEvent) {
    switch (event.event) {
      case 'Started':
        setDownloadedBytes(0);
        setContentLength(event.data.contentLength ?? null);
        break;

      case 'Progress':
        setDownloadedBytes((current) => current + event.data.chunkLength);
        break;

      case 'Finished':
        if (contentLength) {
          setDownloadedBytes(contentLength);
        }
        break;
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

        <UpdatePanel
          status={updateStatus}
          updateInfo={updateInfo}
          checking={checkingUpdate}
          installing={installingUpdate}
          downloadedBytes={downloadedBytes}
          contentLength={contentLength}
          progressPercent={progressPercent}
          onCheck={() => checkForUpdate()}
          onInstall={installUpdate}
        />

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

function UpdatePanel({
  status,
  updateInfo,
  checking,
  installing,
  downloadedBytes,
  contentLength,
  progressPercent,
  onCheck,
  onInstall,
}: {
  status: UpdateStatus;
  updateInfo: Update | null;
  checking: boolean;
  installing: boolean;
  downloadedBytes: number;
  contentLength: number | null;
  progressPercent: number | null;
  onCheck: () => void;
  onInstall: () => void;
}) {
  const { t } = useTranslation();

  const title =
    status === 'available'
      ? t('about.updateAvailable', { version: updateInfo?.version })
      : status === 'latest'
        ? t('about.updateLatest')
        : status === 'failed'
          ? t('about.updateFailed')
          : t('about.updateChecking');

  const description =
    status === 'available'
      ? t('about.updateAvailableDescription')
      : status === 'latest'
        ? t('about.updateLatestDescription')
        : status === 'failed'
          ? t('about.updateFailedDescription')
          : t('about.updateCheckingDescription');

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-900">
            {status === 'available' ? (
              <Download size={17} className="text-blue-600" />
            ) : status === 'latest' ? (
              <CheckCircle2 size={17} className="text-emerald-600" />
            ) : status === 'failed' ? (
              <AlertCircle size={17} className="text-red-500" />
            ) : (
              <RefreshCw size={17} className="animate-spin text-slate-500" />
            )}

            <span>{title}</span>
          </div>

          <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={onCheck}
            disabled={checking || installing}
            className="flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw size={15} className={checking ? 'animate-spin' : ''} />
            {checking ? t('about.checkingUpdate') : t('about.checkUpdate')}
          </button>

          {updateInfo && (
            <button
              type="button"
              onClick={onInstall}
              disabled={installing}
              className="flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={15} />
              {installing ? t('about.installingUpdate') : t('about.installUpdate')}
            </button>
          )}
        </div>
      </div>

      {updateInfo && (
        <div className="mt-4 rounded-md border border-slate-100 bg-slate-50 p-4">
          <div className="text-sm font-medium text-slate-900">
            {t('about.updateVersionWithNotes', { version: updateInfo.version })}
          </div>

          <div className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {updateInfo.body || t('about.noUpdateNotes')}
          </div>

          {installing && (
            <div className="mt-4">
              <div className="mb-2 flex justify-between text-xs text-slate-500">
                <span>{t('about.downloadingUpdate')}</span>
                <span>
                  {progressPercent === null
                    ? formatBytes(downloadedBytes)
                    : `${progressPercent}% · ${formatBytes(downloadedBytes)} / ${formatBytes(contentLength ?? 0)}`}
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-slate-950 transition-all"
                  style={{ width: `${progressPercent ?? 8}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}
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

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

export default AboutPage;