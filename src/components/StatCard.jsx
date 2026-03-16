import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatCard({ label, value, icon: Icon, trend, trendValue, color = 'civic', suffix = '' }) {
  const colorMap = {
    civic: { bg: 'bg-civic-50', icon: 'bg-civic-500', text: 'text-civic-600' },
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-500', text: 'text-blue-600' },
    amber: { bg: 'bg-amber-50', icon: 'bg-amber-500', text: 'text-amber-600' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-500', text: 'text-purple-600' },
    red: { bg: 'bg-red-50', icon: 'bg-red-500', text: 'text-red-600' },
  };
  const c = colorMap[color] || colorMap.civic;

  return (
    <div className="card p-6 hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-11 h-11 ${c.icon} rounded-xl flex items-center justify-center shadow-sm`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trendValue !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
            {trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            {trendValue}%
          </div>
        )}
      </div>
      <div className="text-2xl font-syne font-bold text-gray-900 mb-1">
        {value}{suffix}
      </div>
      <div className="text-sm text-gray-500">{label}</div>
    </div>
  );
}