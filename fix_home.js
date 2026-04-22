const fs = require('fs');

let content = fs.readFileSync('client/src/pages/home.tsx', 'utf8');

// 1. Remove Academy card
content = content.replace(/\{\/\* Vaulty Academy \(Teaser\) \*\/\}[\s\S]*?<\/Link>/, '');

// 2. Remove bottom cards (Reach your goal, Vaulty Coin, Invite Friends)
const bottomCardsPattern = /<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">[\s\S]*?<div className="space-y-8">\s*\{\/\* Finance News Card \*\/\}/;
content = content.replace(bottomCardsPattern, '<div className="mt-8">\n          <div className="space-y-8">\n            {/* Finance News Card */}');

// 3. Merge Financial Health and Freedom Map
const topRowPattern = /\{\/\* TOP ROW: 50\/50 Split for Financial Health and Freedom Map \*\/\}[\s\S]*?\{\/\* MAIN GRID: Left Content and Right Sidebar \*\/\}/;
const topRowMatch = content.match(topRowPattern);

if (topRowMatch) {
  let topRowContent = topRowMatch[0];
  
  // Extract Net Worth / Chart / Budget inner content
  const netWorthMatch = topRowContent.match(/<div className="flex justify-between items-start relative z-10 shrink-0">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Freedom Map/);
  
  // Extract Freedom map inner content
  const freedomMapMatch = topRowContent.match(/\{\/\* Invisible header to align with left side \*\/\}\s*<\/div>\s*<div className="relative overflow-hidden rounded-\[32px\].*?">\s*<div className="absolute inset-0.*?><\/div>\s*<div className="relative z-10 flex flex-col h-full">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/);

  if (netWorthMatch && freedomMapMatch) {
    let netWorthInner = netWorthMatch[1];
    let freedomMapInner = freedomMapMatch[1];
    
    // Clean up extra padding/spacing in freedom map inner
    freedomMapInner = freedomMapInner.replace('space-y-4 flex-1 flex flex-col justify-center', 'space-y-2 flex flex-col pt-2');
    // Remove the mb-6 from the header to tighten it
    freedomMapInner = freedomMapInner.replace('mb-6 shrink-0', 'mb-4 shrink-0');

    const mergedContent = `{/* TOP ROW: Merged Financial Health and Freedom Map */}
        <div className="mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-bold tracking-tight text-vaulty-gradient">
                Financial Health & Freedom Map
              </h2>
            </div>
            
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col md:flex-row gap-8">
              
              {/* LEFT SIDE: Net Worth & Budget */}
              <div className="flex-1 flex flex-col h-full justify-between">
                <div className="flex justify-between items-start relative z-10 shrink-0">
${netWorthInner}
              </div>

              {/* DIVIDER for desktop / mobile */}
              <div className="w-full h-px md:w-px md:h-auto bg-gradient-to-b md:bg-gradient-to-r from-transparent via-white/10 to-transparent shrink-0" />

              {/* RIGHT SIDE: Freedom Map */}
              <div className="flex-1 relative z-10 flex flex-col group cursor-pointer" onClick={() => setLocation('/freedom-map')}>
${freedomMapInner}
              </div>
              
            </div>
          </div>
        </div>

        {/* MAIN GRID: Left Content and Right Sidebar */}`;

    content = content.replace(topRowPattern, mergedContent);
  }
}

fs.writeFileSync('client/src/pages/home.tsx', content);
console.log("Refactoring applied via JS script.");
