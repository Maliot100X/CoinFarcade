import { BarChart2, Settings, HelpCircle, ChevronRight } from 'lucide-react';

export function More() {
  const menuItems = [
    { icon: <BarChart2 size={20} />, label: 'Analytics' },
    { icon: <Settings size={20} />, label: 'Settings' },
    { icon: <HelpCircle size={20} />, label: 'Help & Support' },
  ];

  return (
    <div className="space-y-6 pb-20">
      <header className="p-4">
        <h1 className="text-2xl font-bold">More</h1>
      </header>
      
      <div className="px-4">
        <ul className="space-y-3">
          {menuItems.map((item, index) => (
            <li key={index} className="flex items-center justify-between p-4 bg-gray-900 rounded-xl hover:bg-gray-800 cursor-pointer transition-colors border border-gray-800 hover:border-gray-700">
                <div className="flex items-center gap-3 text-gray-200">
                    <div className="p-2 bg-gray-800 rounded-lg text-purple-400">
                        {item.icon}
                    </div>
                    <span className="font-medium">{item.label}</span>
                </div>
                <ChevronRight size={16} className="text-gray-500" />
            </li>
          ))}
        </ul>
      </div>

      <div className="px-4 text-center">
          <p className="text-xs text-gray-600">CoinFarcade v1.0.0 (Phase 1)</p>
      </div>
    </div>
  );
}
