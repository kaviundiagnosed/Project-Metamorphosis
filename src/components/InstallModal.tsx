import { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { Share, PlusSquare, Smartphone, X, Check, Download } from 'lucide-react';

export function InstallModal() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [isOpen, setIsOpen] = useState(false);

  // If already installed in standalone mode, show subtle checkmark or nothing
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setIsOpen(true);
    }
  };

  return (
    <>
      <button
        id="pwa-install-header-btn"
        onClick={handleInstallClick}
        className="text-[11px] font-bold text-zinc-300 hover:text-white bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition cursor-pointer"
        title="Install Project Metamorphosis as PWA"
      >
        <Download className="w-3 h-3 text-zinc-400" />
        <span>Install App</span>
      </button>

      {isOpen && (
        <div
          id="pwa-install-dialog-backdrop"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-end sm:items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            id="pwa-install-dialog"
            className="bg-zinc-950 border border-zinc-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative animate-in fade-in slide-in-from-bottom-6"
            onClick={e => e.stopPropagation()}
          >
            <button
              id="close-install-modal-btn"
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-1 text-zinc-400 hover:text-white rounded-full bg-zinc-900 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-black border border-zinc-700 rounded-2xl flex items-center justify-center font-black text-xl text-white">
                M
              </div>
              <div>
                <h3 className="font-black text-base text-white">Project Metamorphosis</h3>
                <p className="text-xs text-zinc-400">Offline iPhone & Web PWA</p>
              </div>
            </div>

            {isIOS ? (
              <div className="space-y-3 my-4 text-xs text-zinc-300">
                <p className="text-zinc-400 font-semibold mb-2">
                  Follow these 2 steps in Safari on your iPhone:
                </p>
                <div className="flex items-center gap-3 bg-zinc-900/90 p-3 rounded-xl border border-zinc-800/80">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-white shrink-0">
                    <Share className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">1. Tap Share</span>
                    <span className="text-zinc-400 text-[11px]">Located in the bottom Safari toolbar</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-zinc-900/90 p-3 rounded-xl border border-zinc-800/80">
                  <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-white shrink-0">
                    <PlusSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">2. Add to Home Screen</span>
                    <span className="text-zinc-400 text-[11px]">Scroll down the sheet and select it</span>
                  </div>
                </div>

                <p className="text-[11px] text-zinc-500 italic pt-1">
                  Once added, the app will launch fullscreen with zero browser chrome and work completely offline.
                </p>
              </div>
            ) : (
              <div className="space-y-3 my-4 text-xs text-zinc-300">
                <p className="text-zinc-400">
                  You can install this app to your home screen or desktop for fast fullscreen access and offline execution.
                </p>
                {isInstallable ? (
                  <button
                    onClick={async () => {
                      await install();
                      setIsOpen(false);
                    }}
                    className="w-full bg-white hover:bg-zinc-200 text-black font-black py-3 rounded-xl transition uppercase text-xs tracking-wider"
                  >
                    Install Now
                  </button>
                ) : (
                  <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-[11px] text-zinc-400">
                    In your browser menu, select <strong className="text-white">"Install Project Metamorphosis"</strong> or <strong className="text-white">"Add to Home Screen"</strong>.
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold py-3 rounded-xl transition mt-2 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
