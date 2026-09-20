import React, { useState } from 'react';
import { AppState } from '../types';
import { INITIAL_STATE } from '../data';
import { Download, Upload, AlertTriangle, CheckCircle2, Archive, FileCode, FolderArchive, Smartphone } from 'lucide-react';
import JSZip from 'jszip';

interface DataViewProps {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

export function DataView({ state, setState }: DataViewProps) {
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isZipping, setIsZipping] = useState(false);

  const handleDownloadStandaloneZip = async () => {
    try {
      setIsZipping(true);
      const zip = new JSZip();
      const folder = zip.folder('metamorphosis') || zip;

      // Fetch the standalone static files
      const [htmlRes, manifestRes, swRes] = await Promise.all([
        fetch('/metamorphosis/index.html'),
        fetch('/metamorphosis/manifest.json'),
        fetch('/metamorphosis/sw.js')
      ]);

      const [htmlText, manifestText, swText] = await Promise.all([
        htmlRes.text(),
        manifestRes.text(),
        swRes.text()
      ]);

      folder.file('index.html', htmlText);
      folder.file('manifest.json', manifestText);
      folder.file('sw.js', swText);
      folder.file(
        'README.txt',
        'PROJECT METAMORPHOSIS - OFFLINE PWA\n\n' +
        'How to run:\n' +
        '1. Double-click index.html or host this folder with any static web server (e.g. `npx serve`, `python -m http.server 8000`, or GitHub Pages / Vercel / Netlify).\n' +
        '2. On iPhone: Open in Safari, tap Share -> "Add to Home Screen" to install it as an offline fullscreen app.\n'
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'metamorphosis.zip';
      a.click();
      URL.revokeObjectURL(url);
      setImportStatus('metamorphosis.zip downloaded successfully!');
      setTimeout(() => setImportStatus(null), 4000);
    } catch (err) {
      console.error('Failed to create zip', err);
      // Fallback: direct download link
      const a = document.createElement('a');
      a.href = '/metamorphosis/index.html';
      a.download = 'index.html';
      a.click();
    } finally {
      setIsZipping(false);
    }
  };

  const handleDownloadSingleHtml = async () => {
    try {
      const res = await fetch('/metamorphosis/index.html');
      const text = await res.text();
      const blob = new Blob([text], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'metamorphosis.html';
      a.click();
      URL.revokeObjectURL(url);
      setImportStatus('metamorphosis.html downloaded successfully!');
      setTimeout(() => setImportStatus(null), 3500);
    } catch (e) {
      console.error(e);
      window.open('/metamorphosis/index.html', '_blank');
    }
  };

  const handleExport = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `metamorphosis_backup_${new Date().toISOString().split('T')[0]}.json`);
    dlAnchorElem.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const importedState = JSON.parse(event.target?.result as string);
        if (
          importedState &&
          importedState.cycles &&
          window.confirm('WARNING: This will overwrite all current progress and configurations. Proceed?')
        ) {
          setState(importedState);
          setImportStatus('Data restored successfully!');
          setTimeout(() => setImportStatus(null), 3500);
        } else {
          alert('Import aborted or invalid cycle structure.');
        }
      } catch (err) {
        alert('Invalid backup file. Ensure it is a valid JSON export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data back to the default Metamorphosis program? This cannot be undone.')) {
      setState(INITIAL_STATE);
      setImportStatus('Reset to factory defaults.');
      setTimeout(() => setImportStatus(null), 3000);
    }
  };

  // Stats calculation
  const totalCompleted = Object.values(state.cycles).reduce(
    (acc, cycle) => acc + (cycle.completedDays?.length || 0),
    0
  );
  const cycleCount = Object.keys(state.cycles).length;
  const rawSize = JSON.stringify(state).length;

  return (
    <div id="data-management-view" className="p-4 sm:p-6 max-w-lg mx-auto pb-24">
      <div className="mb-6 text-center">
        <span className="text-zinc-500 font-mono text-xs uppercase tracking-widest block">
          Download & Persistence
        </span>
        <h2 className="text-2xl font-black text-white uppercase tracking-tight mt-1">
          App & Data Management
        </h2>
      </div>

      {importStatus && (
        <div className="mb-5 bg-emerald-950/70 border border-emerald-800 text-emerald-300 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{importStatus}</span>
        </div>
      )}

      {/* Storage Metrics */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 mb-5 grid grid-cols-3 gap-2 text-center">
        <div className="p-2">
          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block">
            Cycles
          </span>
          <span className="text-xl font-black text-white">{cycleCount}</span>
        </div>
        <div className="p-2 border-x border-zinc-900">
          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block">
            Workouts Logged
          </span>
          <span className="text-xl font-black text-emerald-400">{totalCompleted}</span>
        </div>
        <div className="p-2">
          <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider block">
            Payload Size
          </span>
          <span className="text-xl font-black text-white">{(rawSize / 1024).toFixed(1)} KB</span>
        </div>
      </div>

      {/* Download App Files Section */}
      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl mb-5 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-950/70 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
            <Archive className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Download App Files</h3>
            <p className="text-xs text-zinc-400">Ready-to-run offline PWA bundle</p>
          </div>
        </div>

        <p className="text-xs text-zinc-400 my-3 leading-relaxed">
          Download the standalone 3-file bundle (<code className="text-zinc-300">index.html</code>, <code className="text-zinc-300">manifest.json</code>, <code className="text-zinc-300">sw.js</code>) to run locally or deploy to GitHub Pages / Vercel / Netlify.
        </p>

        <div className="space-y-2.5 pt-1">
          <button
            id="download-pwa-zip-btn"
            onClick={handleDownloadStandaloneZip}
            disabled={isZipping}
            className="w-full bg-white hover:bg-zinc-200 active:scale-[0.99] text-black font-black py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer disabled:opacity-60"
          >
            <Download className="w-4 h-4" />
            <span>{isZipping ? 'CREATING ZIP...' : 'DOWNLOAD STANDALONE ZIP (.ZIP)'}</span>
          </button>

          <button
            id="download-single-html-btn"
            onClick={handleDownloadSingleHtml}
            className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
          >
            <FileCode className="w-4 h-4 text-zinc-400" />
            <span>DOWNLOAD SINGLE HTML FILE</span>
          </button>
        </div>
      </div>

      {/* How to Install / Export Guide */}
      <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl mb-5">
        <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-3 flex items-center gap-2 text-zinc-300">
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>Install Directly to iPhone / Phone</span>
        </h3>
        <ol className="text-xs text-zinc-400 space-y-2 list-decimal list-inside leading-relaxed">
          <li>
            Open this web app URL in <strong className="text-white">Safari</strong> on your iPhone.
          </li>
          <li>
            Tap the <strong className="text-white">Share button</strong> (square with up arrow) at the bottom toolbar.
          </li>
          <li>
            Tap <strong className="text-white">"Add to Home Screen"</strong>.
          </li>
          <li>
            It will appear on your home screen and run fullscreen with 100% offline capability!
          </li>
        </ol>

        <div className="mt-4 pt-3 border-t border-zinc-900">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2 flex items-center gap-2 text-zinc-300">
            <FolderArchive className="w-4 h-4 text-sky-400" />
            <span>Export Full Source Repository</span>
          </h4>
          <p className="text-xs text-zinc-400 leading-relaxed">
            In the Google AI Studio top-right navigation menu, click the <strong className="text-zinc-200">Settings / 3-dot menu</strong> and select <strong className="text-white">"Export to ZIP"</strong> or <strong className="text-white">"Export to GitHub"</strong> to download the full React, Vite, and TypeScript source code.
          </p>
        </div>
      </div>

      {/* Export Training Data Backup */}
      <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-blue-950/60 border border-blue-900/40 flex items-center justify-center text-blue-400">
            <Download className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Export Training Data</h3>
            <p className="text-xs text-zinc-400">Save your logged cycles & benchmarks</p>
          </div>
        </div>
        <p className="text-xs text-zinc-500 my-3 leading-relaxed">
          Download your complete program history, personal exercise configurations, custom notes, and benchmark test results to a JSON backup file.
        </p>
        <button
          id="export-backup-btn"
          onClick={handleExport}
          className="w-full bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-black py-3.5 rounded-xl transition flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>DOWNLOAD DATA BACKUP (JSON)</span>
        </button>
      </div>

      {/* Import Backup */}
      <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl mb-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-amber-950/60 border border-amber-900/40 flex items-center justify-center text-amber-400">
            <Upload className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Import Training Data</h3>
            <p className="text-xs text-zinc-400">Restore from JSON file</p>
          </div>
        </div>
        <p className="text-xs text-zinc-500 my-3 leading-relaxed">
          Restore data from a previous JSON backup file. This will replace the active program and logs on this device.
        </p>
        <input
          type="file"
          id="file-upload-input"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
        <label
          htmlFor="file-upload-input"
          id="import-backup-label"
          className="block w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white text-center font-black py-3.5 rounded-xl active:scale-[0.99] cursor-pointer transition text-xs uppercase tracking-wider flex items-center justify-center gap-2"
        >
          <Upload className="w-4 h-4" />
          <span>SELECT BACKUP FILE</span>
        </label>
      </div>

      {/* Factory Reset */}
      <div className="bg-zinc-950 border border-red-950/40 p-4 rounded-2xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
          <div>
            <span className="text-xs font-bold text-zinc-300 block">Reset All Data</span>
            <span className="text-[11px] text-zinc-500">Restore default 30-day template</span>
          </div>
        </div>
        <button
          id="reset-factory-data-btn"
          onClick={handleReset}
          className="bg-red-950/60 hover:bg-red-900/60 border border-red-900/60 text-red-300 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
