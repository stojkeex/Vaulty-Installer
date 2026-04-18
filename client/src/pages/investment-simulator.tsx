import { useState } from "react";
import { ChevronLeft, AreaChart as AreaChartIcon, Info, Calculator } from "lucide-react";
import { Link } from "wouter";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

export default function InvestmentSimulator() {
  const [monthlyContribution, setMonthlyContribution] = useState(250);
  const [years, setYears] = useState(15);
  const [expectedReturn, setExpectedReturn] = useState(8);

  // Calculate compound interest
  const calculateData = () => {
    let currentBalance = 0;
    const data = [];
    
    for (let i = 0; i <= years; i++) {
      if (i > 0) {
        currentBalance = (currentBalance + (monthlyContribution * 12)) * (1 + (expectedReturn / 100));
      }
      data.push({
        year: i,
        balance: Math.round(currentBalance),
        invested: monthlyContribution * 12 * i
      });
    }
    return data;
  };

  const chartData = calculateData();
  const finalBalance = chartData[chartData.length - 1]?.balance || 0;
  const totalInvested = monthlyContribution * 12 * years;
  const totalInterest = finalBalance - totalInvested;

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-4">
          <Link href="/home">
            <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 hover:bg-white/10 transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Investment Simulator</h1>
            <p className="text-xs text-white font-medium">Compound Interest Magic</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-6">
        
        <div className="text-center py-6">
          <p className="text-sm font-medium text-white/60 uppercase tracking-widest mb-2">Projected Wealth</p>
          <h2 className="text-5xl font-black text-white tracking-tighter">
            €{finalBalance.toLocaleString()}
          </h2>
          <div className="flex items-center justify-center gap-4 mt-4">
             <div className="flex items-center gap-1.5 text-xs font-medium text-white/60">
                <div className="w-2.5 h-2.5 rounded-full bg-white/20"></div>
                Invested: €{totalInvested.toLocaleString()}
             </div>
             <div className="flex items-center gap-1.5 text-xs font-medium text-white">
                <div className="w-2.5 h-2.5 rounded-full bg-white"></div>
                Interest: €{totalInterest.toLocaleString()}
             </div>
          </div>
        </div>

        <div className="h-[250px] w-full -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#a855f7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                formatter={(value: number) => [`€${value.toLocaleString()}`, 'Balance']}
                labelFormatter={(label) => `Year ${label}`}
              />
              <Area 
                type="monotone" 
                dataKey="balance" 
                stroke="#a855f7" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorBalance)" 
              />
              <Area 
                type="monotone" 
                dataKey="invested" 
                stroke="rgba(255,255,255,0.2)" 
                strokeWidth={2} 
                strokeDasharray="4 4"
                fill="transparent" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[32px] p-6 space-y-6">
          <div className="flex items-center gap-3 mb-2">
             <Calculator className="text-white" />
             <h3 className="text-lg font-bold">Adjust Your Future</h3>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-white/80">Monthly Contribution</label>
                <span className="text-sm font-bold text-white">€{monthlyContribution}</span>
              </div>
              <input 
                type="range" 
                min="50" max="2000" step="50"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                className="w-full accent-white"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-white/80">Time Horizon</label>
                <span className="text-sm font-bold text-white">{years} Years</span>
              </div>
              <input 
                type="range" 
                min="1" max="40" step="1"
                value={years}
                onChange={(e) => setYears(Number(e.target.value))}
                className="w-full accent-white"
              />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium text-white/80">Expected Annual Return</label>
                <span className="text-sm font-bold text-white">{expectedReturn}%</span>
              </div>
              <input 
                type="range" 
                min="1" max="15" step="0.5"
                value={expectedReturn}
                onChange={(e) => setExpectedReturn(Number(e.target.value))}
                className="w-full accent-white"
              />
            </div>
          </div>

          <div className="bg-white/10 border border-white/20 rounded-xl p-4 flex gap-3 mt-4">
             <Info className="text-white shrink-0 mt-0.5" size={18} />
             <p className="text-xs text-white/80 leading-relaxed">
               Historically, the S&P 500 returns about 8-10% annually on average. By consistently investing the €{monthlyContribution} you save from budgeting, your money makes money for you.
             </p>
          </div>
        </div>

      </div>
    </div>
  );
}