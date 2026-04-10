import { useEffect, useState } from 'react';

export function DebugLog() {
  const [logs, setLogs] = useState<string[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    const addLog = (msg: string) => {
      setLogs(prev => [...prev.slice(-49), `${new Date().toLocaleTimeString()}: ${msg}`]);
    };

    console.log = (...args: any[]) => {
      originalLog(...args);
      addLog(`LOG: ${args.join(' ')}`);
    };

    console.error = (...args: any[]) => {
      originalError(...args);
      addLog(`ERROR: ${args.join(' ')}`);
    };

    console.warn = (...args: any[]) => {
      originalWarn(...args);
      addLog(`WARN: ${args.join(' ')}`);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 z-50 bg-primary text-white p-2 rounded text-xs font-mono hover:bg-primary/90"
      >
        🐛 Debug
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-dark border border-primary rounded w-96 h-96 flex flex-col">
      <div className="bg-primary text-white p-2 flex justify-between items-center">
        <span className="font-mono text-xs font-bold">Debug Console</span>
        <button
          onClick={() => setShowDebug(false)}
          className="hover:bg-primary/90 px-2 py-1 rounded"
        >
          ✕
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-darker p-2 border-t border-primary/20">
        {logs.map((log, i) => (
          <div
            key={i}
            className={`text-xs font-mono mb-1 ${
              log.includes('ERROR') ? 'text-red-400' :
              log.includes('WARN') ? 'text-yellow-400' :
              'text-green-400'
            }`}
          >
            {log}
          </div>
        ))}
      </div>
    </div>
  );
}
