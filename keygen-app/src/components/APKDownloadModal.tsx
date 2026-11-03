import React, { useState } from 'react';
import { Language } from '../types/tv';
import { translations } from '../constants/translations';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { NewTechLogo } from './NewTechLogo';
import {
  Download,
  Smartphone,
  Check,
  Copy,
  ExternalLink,
  X,
  Share2,
  Sparkles,
  ShieldCheck,
  Usb,
  ArrowRight,
  Terminal,
} from 'lucide-react';

interface APKDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const APKDownloadModal: React.FC<APKDownloadModalProps> = ({
  isOpen,
  onClose,
  lang,
}) => {
  const { isInstallable, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const t = translations[lang];

  // App URL for the user to open on mobile
  const appUrl =
    typeof window !== 'undefined'
      ? window.location.href
      : 'https://ais-pre-eujgkebi55zalgaggbxekw-116513744057.europe-west2.run.app';

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleDirectInstall = async () => {
    if (isInstallable) {
      await install();
      onClose();
    } else {
      // Fallback instruction
      alert(
        lang === 'am'
          ? 'በስልክዎ Chrome ብሮውዘር ላይ ከላይ በስተቀኝ ያሉትን 3 ነጥቦች (⋮) ነክተው "Install app" ወይም "Add to Home screen" የሚለውን ይጫኑ!'
          : 'Open in Android Chrome, tap menu (⋮) -> "Install app" or "Add to Home screen"!'
      );
    }
  };

  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(
    appUrl
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-4 backdrop-blur-xs">
      <div className="bg-[#0f131e] border-2 border-amber-500/80 rounded-2xl max-w-xl w-full p-4 sm:p-6 shadow-2xl text-slate-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <NewTechLogo size={36} glow={true} />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-amber-400">
                {lang === 'am'
                  ? 'የቲቪ ሪከቨሪ አፕሊኬሽን (APK) አወራረድና መጫኛ'
                  : 'Download & Install TV Recovery Tool (APK)'}
              </h3>
              <p className="text-[11px] text-slate-400 font-mono">
                New-Tech Institute TV Tool • Android APK / PWA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-4 py-3 text-xs text-slate-300 pr-1 custom-scrollbar">
          {/* Direct APK File Download Card (Primary) */}
          <div className="bg-gradient-to-br from-amber-950/70 via-[#181d29] to-[#0d1017] border-2 border-amber-400 rounded-xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/25 text-amber-300 border border-amber-400 text-[11px] font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                {lang === 'am' ? 'የተዘጋጀ የ APK ፋይል (READY)' : 'STANDALONE APK FILE'}
              </span>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>12.8 MB • Signed v2/v3</span>
              </span>
            </div>

            <div>
              <h4 className="font-black text-base text-white flex items-center gap-2">
                <span>NewTech_TV_Recovery.apk</span>
              </h4>
              <p className="text-[11.5px] text-slate-300 leading-relaxed mt-1">
                {lang === 'am'
                  ? 'የተሟላው አንድሮይድ አፕሊኬሽን (APK) ተገንብቶ ተዘጋጅቷል! ቀጥታ አውርደው በስልክዎ ላይ መጫን ይችላሉ። የኒው-ቴክ አርማ፣ ኦፍላይን አሰራር፣ እና የ OTG/ዋይርለስ ቲቪ መጠገኛን ያካትታል።'
                  : 'The standalone Android APK has been built and signed! Download it directly to your phone. Includes New-Tech branding, full offline mode, and OTG/WiFi TV UART tools.'}
              </p>
            </div>

            <div className="pt-1">
              <a
                href="/NewTech_TV_Recovery.apk"
                download="NewTech_TV_Recovery.apk"
                className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-black font-black text-sm flex items-center justify-center gap-2.5 shadow-xl shadow-amber-500/30 active:scale-[0.98] transition cursor-pointer text-center"
              >
                <Download className="w-5 h-5 text-black stroke-[2.5]" />
                <span>
                  {lang === 'am'
                    ? 'የ .APK ፋይል አውርድ (Download APK - 12.8 MB)'
                    : 'Download .APK File (12.8 MB)'}
                </span>
              </a>
            </div>
          </div>

          {/* Method 1: Instant 1-Click Install to Phone (WebAPK) */}
          <div className="bg-[#121622] border border-slate-800 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-bold text-xs">
                {lang === 'am' ? 'አማራጭ 2፡ በ Chrome በቀጥታ ስልክ ላይ መጫን' : 'Option 2: Direct Install via Chrome'}
              </span>
            </div>

            <p className="text-[11px] text-slate-300">
              {lang === 'am'
                ? 'ፋይል ሳያወርዱ በቀጥታ በ Chrome አፑን ወደ ስልክዎ Home screen መጨመር ከፈለጉ፦'
                : 'Or install directly as WebAPK without downloading file:'}
            </p>

            <button
              onClick={handleDirectInstall}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>
                {lang === 'am'
                  ? 'በቀጥታ ስልክ ላይ ጫን (Chrome WebAPK)'
                  : 'Install directly to Home Screen'}
              </span>
            </button>
          </div>

          {/* Step-by-Step Chrome Instructions if button doesn't trigger */}
          <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 space-y-2">
            <h5 className="font-bold text-xs text-amber-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              {lang === 'am'
                ? 'በአንድሮይድ ስልክ ላይ የመጫኛ ቅደም ተከተል (Chrome)'
                : 'Android Chrome Installation Steps'}
            </h5>
            <ol className="list-decimal list-inside space-y-1.5 text-[11px] text-slate-300 leading-relaxed">
              <li>
                {lang === 'am'
                  ? 'ይህን ሊንክ በስልክዎ Google Chrome ብሮውዘር ላይ ይክፈቱት።'
                  : 'Open this link in Google Chrome on your Android phone.'}
              </li>
              <li>
                {lang === 'am'
                  ? 'በ Chrome ከላይ በስተቀኝ በኩል ያሉትን '
                  : 'Tap the '}
                <b className="text-amber-400">3 ነጥቦች (⋮ Menu)</b>
                {lang === 'am' ? ' ይጫኑ።' : ' in the top-right corner of Chrome.'}
              </li>
              <li>
                {lang === 'am'
                  ? 'ከሚመጡት አማራጮች ውስጥ '
                  : 'Select '}
                <b className="text-emerald-400">"Install app"</b>
                {lang === 'am'
                  ? ' ወይም '
                  : ' or '}
                <b className="text-emerald-400">"Add to Home screen (ወደ መነሻ ገጽ ጨምር)"</b>
                {lang === 'am' ? ' የሚለውን ይምረጡ።' : '.'}
              </li>
              <li>
                {lang === 'am'
                  ? 'ስልክዎ አፑን በ 10 ሰከንድ ውስጥ የኒው-ቴክ ሎጎ ሰጥቶ ይጭነዋል!'
                  : 'Your phone will install the app with the New-Tech icon on your home screen in seconds!'}
              </li>
            </ol>
          </div>

          {/* Method 3: Termux Local Offline Build & Runner */}
          <div className="bg-[#0a0d14] border-2 border-emerald-500/70 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold uppercase">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                {lang === 'am' ? 'ዘዴ 3 (በ Termux መገንባትና በስልክ ማሮጥ)' : 'Method 3 (Termux Build & Run)'}
              </span>
              <span className="text-[10px] font-mono text-amber-400 font-bold">Android Termux</span>
            </div>

            <h5 className="font-bold text-xs text-white">
              {lang === 'am'
                ? 'በ Termux አፑን መገንባትና በስልክዎ ላይ በነፃ ኦፍላይን ማሮጥ'
                : 'Build & Run locally in Android Termux'}
            </h5>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {lang === 'am'
                ? 'በስልክዎ Termux አፕሊኬሽን ላይ የሚከተሉትን ትዕዛዞች በመጻፍ አፑን ሙሉ በሙሉ በስልክዎ ውስጥ ገንብተው ያለ ኢንተርኔት በ localhost:3000 ማሮጥ ይችላሉ።'
                : 'Run these commands inside Termux on your Android phone to build and serve the TV tool completely offline on localhost:3000.'}
            </p>

            {/* Termux Terminal Code Box */}
            <div className="bg-black/80 rounded-lg p-2.5 border border-slate-800 font-mono text-[10.5px] text-emerald-300 space-y-1">
              <div className="text-slate-500"># 1. Update Termux & install Node.js + Git</div>
              <div className="text-amber-300">pkg update -y &amp;&amp; pkg install -y nodejs-lts git</div>
              <div className="text-slate-500 mt-1"># 2. Clone / download project</div>
              <div className="text-cyan-300">git clone https://github.com/zenamarkos/newtech-tv-recovery.git tv-tool &amp;&amp; cd tv-tool</div>
              <div className="text-slate-500 mt-1"># 3. Install packages &amp; build</div>
              <div className="text-emerald-400">npm install &amp;&amp; npm run build</div>
              <div className="text-slate-500 mt-1"># 4. Run local offline server on phone (Port 3000)</div>
              <div className="text-yellow-300">npx vite preview --port 3000 --host</div>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1">
              <span className="text-[10px] text-slate-400">
                {lang === 'am'
                  ? 'ከዚያ በ Chrome ላይ http://localhost:3000 ብለው ይክፈቱት!'
                  : 'Then open http://localhost:3000 in phone browser!'}
              </span>
              <button
                onClick={() => {
                  const termuxCmds = `pkg update -y && pkg install -y nodejs-lts git\ngit clone https://github.com/zenamarkos/newtech-tv-recovery.git tv-tool && cd tv-tool\nnpm install && npm run build\nnpx vite preview --port 3000 --host`;
                  navigator.clipboard.writeText(termuxCmds);
                  alert(lang === 'am' ? 'የ Termux ኮዶች ኮፒ ሆነዋል! Termux ላይ paste ያድርጉ።' : 'Termux commands copied to clipboard!');
                }}
                className="px-2.5 py-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 transition flex-shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{lang === 'am' ? 'ኮዶቹን ኮፒ አድርግ' : 'Copy Commands'}</span>
              </button>
            </div>
          </div>

          {/* Method 2: Generate Standalone .APK File via PWABuilder */}
          <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold uppercase">
                {lang === 'am' ? 'ዘዴ 2 (ራሱን የቻለ .apk ፋይል ማውረጃ)' : 'Method 2 (Standalone .APK File)'}
              </span>
            </div>

            <h5 className="font-bold text-xs text-white">
              {lang === 'am'
                ? 'የተሟላ የ .apk ፋይል ማውረድ ከፈለጉ (PWABuilder / Bubblewrap)'
                : 'Download Standalone .APK file (via PWABuilder)'}
            </h5>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              {lang === 'am'
                ? 'ይህን አፕሊኬሽን በ PWABuilder አማካኝነት ወደ ራሱ የቻለ .apk ፋይል (Signed APK Package) ቀይረው በማውረድ በ ShareIt ወይም በ Telegram ለማንኛውም ሰው ማጋራት ይችላሉ።'
                : 'Package this tool into a standalone signed .apk file that you can share via Telegram, WhatsApp, or Bluetooth to any technician phone.'}
            </p>

            <a
              href={pwaBuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition"
            >
              <span>{lang === 'am' ? 'የ .APK ፋይል ማዘጋጃን ክፈት' : 'Build Standalone .APK File'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Share / Copy App Link */}
          <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 space-y-2">
            <span className="font-bold text-xs text-slate-300 flex items-center gap-1.5">
              <Share2 className="w-4 h-4 text-amber-400" />
              {lang === 'am' ? 'የአፑ ሊንክ (በስልክዎ ለመክፈት)' : 'App Direct Link'}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="flex-1 bg-black/60 border border-slate-800 rounded px-2.5 py-1.5 text-[11px] font-mono text-slate-300 select-all"
              />
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs flex items-center gap-1.5 transition flex-shrink-0"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">{lang === 'am' ? 'ኮፒ ሆነ' : 'Copied'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>{lang === 'am' ? 'ሊንኩን ኮፒ አድርግ' : 'Copy'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* OTG Permission Reminder */}
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Usb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>
              {lang === 'am'
                ? 'ማስታወሻ፡ አፑን በስልክዎ ላይ ከጫኑ በኋላ፣ ስልክዎን በ OTG ኬብል ከቲቪው ጋር ሲያገናኙ በሚመጣው "Open with New-Tech TV Tool" መጠይቅ ላይ "Always / OK" የሚለውን ይምረጡ።'
                : 'Note: After installing the APK, when you plug your OTG cable to the TV, tap "Always / OK" on the Android USB permission dialog.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            {lang === 'am' ? 'ዝጋ (Close)' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
