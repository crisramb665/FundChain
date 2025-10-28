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
      <div className="flex justify-between text-sm text-gray-600">
        <span>{currentNum.toFixed(4)} raised</span>
        <span>{percentage.toFixed(1)}%</span>
      </div>
      <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-gray-500">
        Goal: {goalNum.toFixed(4)}
      </div>
    </div>
  );
}
