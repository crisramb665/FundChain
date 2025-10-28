interface ProgressBarProps {
  current: string;
  goal: string;
  decimals: number;
}

export function ProgressBar({ current, goal, decimals }: ProgressBarProps) {
  const currentNum = parseFloat(current) / Math.pow(10, decimals);
  const goalNum = parseFloat(goal) / Math.pow(10, decimals);
  const percentage = Math.min((currentNum / goalNum) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-400">
        <span className="font-medium text-white">{currentNum.toFixed(4)}</span>
        <span className="text-cyan-400 font-bold">{percentage.toFixed(1)}%</span>
      </div>
      <div className="relative h-3 bg-white/5 backdrop-blur-sm rounded-full overflow-hidden border border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20" />
        <div
          className="relative h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 transition-all duration-700 ease-out shadow-lg shadow-cyan-500/50"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-300 to-purple-300 opacity-0 animate-shimmer" style={{ backgroundSize: '200% auto' }} />
        </div>
      </div>
      <div className="text-xs text-gray-500">
        Meta: <span className="text-gray-400 font-medium">{goalNum.toFixed(4)}</span>
      </div>
    </div>
  );
}
