import React, { useRef, useEffect, useState } from 'react';
import { LineChart, Download, RefreshCw, Layers } from 'lucide-react';
import { GraphDataPoint } from '../types/physics';

interface GraphEngineProps {
  supportedKeys: { key: string; label: string; unit: string; color: string }[];
  dataHistory: GraphDataPoint[];
  onClearHistory: () => void;
}

export const GraphEngine: React.FC<GraphEngineProps> = ({
  supportedKeys,
  dataHistory,
  onClearHistory,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeKeyIndex, setActiveKeyIndex] = useState(0);

  const activeKeyConfig = supportedKeys[activeKeyIndex] || supportedKeys[0];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, height);

    // Grid lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 30) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
    }
    for (let y = 0; y < height; y += 20) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
    }

    if (!activeKeyConfig || dataHistory.length < 2) {
      ctx.fillStyle = '#64748b';
      ctx.font = '11px sans-serif';
      ctx.fillText('Collecting real-time graph telemetry...', 15, 25);
      return;
    }

    const key = activeKeyConfig.key;
    const values = dataHistory.map((d) => d[key] ?? 0);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = Math.max(0.001, maxVal - minVal);

    // Plot line
    ctx.strokeStyle = activeKeyConfig.color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    const maxPts = 150;
    const sliceData = dataHistory.slice(-maxPts);

    sliceData.forEach((pt, idx) => {
      const val = pt[key] ?? 0;
      const px = (idx / (maxPts - 1)) * width;
      const py = height - 10 - ((val - minVal) / range) * (height - 20);

      if (idx === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Min / Max labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px monospace';
    ctx.fillText(`Max: ${maxVal.toFixed(2)} ${activeKeyConfig.unit}`, 10, 15);
    ctx.fillText(`Min: ${minVal.toFixed(2)} ${activeKeyConfig.unit}`, 10, height - 5);
  }, [dataHistory, activeKeyConfig]);

  const exportCSV = () => {
    if (dataHistory.length === 0) return;
    const headers = ['Time (s)', ...supportedKeys.map((k) => `${k.label} (${k.unit})`)].join(',');
    const rows = dataHistory.map((pt) => {
      return [pt.t.toFixed(3), ...supportedKeys.map((k) => pt[k.key] ?? 0)].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `jee_sandbox_graph_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-slate-900 border-t border-slate-800 p-4 select-none">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <LineChart className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold tracking-tight text-slate-200 uppercase">
            Real-Time Graph Plotter
          </h3>

          {/* Metric Selector Pills */}
          <div className="flex items-center gap-1.5 ml-4">
            {supportedKeys.map((k, idx) => (
              <button
                key={k.key}
                onClick={() => setActiveKeyIndex(idx)}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  activeKeyIndex === idx
                    ? 'bg-slate-800 text-cyan-400 border border-cyan-500/50'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClearHistory}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
            title="Clear Graph History"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={exportCSV}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="bg-slate-950 rounded-xl border border-slate-800 p-2 overflow-hidden">
        <canvas ref={canvasRef} width={600} height={120} className="w-full h-28 block" />
      </div>
    </div>
  );
};
