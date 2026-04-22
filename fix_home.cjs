const fs = require('fs');

let content = fs.readFileSync('client/src/pages/home.tsx', 'utf8');

// 1. Remove Academy card
content = content.replace(/\{\/\* Vaulty Academy \(Teaser\) \*\/\}[\s\S]*?<\/Link>/, '');

// 2. Remove bottom cards (Reach your goal, Vaulty Coin, Invite Friends)
const bottomCardsPattern = /<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">[\s\S]*?<div className="space-y-8">\s*\{\/\* Finance News Card \*\/\}/;
content = content.replace(bottomCardsPattern, '<div className="mt-8">\n          <div className="space-y-8">\n            {/* Finance News Card */}');

// 3. Merge Financial Health and Freedom Map
// First, find the boundaries
const healthStart = content.indexOf('{/* Your Overview */}');
const mapStart = content.indexOf('{/* Freedom Map - New Section replacing quick actions */}');
const wealthStart = content.indexOf('{/* LEFT COLUMN: Wealth Builder */}');

if (healthStart !== -1 && mapStart !== -1 && wealthStart !== -1) {
  // Extract pieces
  const healthSection = content.substring(healthStart, mapStart);
  const mapSection = content.substring(mapStart, wealthStart);
  
  // Extract Net Worth / Budget content
  const healthContentMatch = healthSection.match(/<div className="flex justify-between items-start relative z-10 shrink-0">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/);
  
  // Extract Freedom Map content
  const mapContentMatch = mapSection.match(/<div className="relative z-10 flex flex-col h-full">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/);

  if (healthContentMatch && mapContentMatch) {
    let healthContent = healthContentMatch[1];
    let mapContent = mapContentMatch[1];
    
    // Clean up mapContent styling
    mapContent = mapContent.replace('flex-1 flex flex-col justify-center', 'flex flex-col justify-center');
    
    const mergedContent = `          {/* Merged Net Worth & Freedom Map */}
          <div className="col-span-full">
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))] p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(0,204,255,0.1),transparent_50%)] pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row gap-8">
                {/* Left Side: Net Worth & Chart & Budget */}
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between items-start relative z-10 shrink-0">
${healthContent}
                </div>
                
                {/* Divider */}
                <div className="w-full h-px md:w-px md:h-auto bg-gradient-to-b md:bg-gradient-to-r from-transparent via-white/10 to-transparent shrink-0" />
                
                {/* Right Side: Freedom Map */}
                <div className="flex-1 flex flex-col cursor-pointer group" onClick={() => setLocation('/freedom-map')}>
${mapContent}
              </div>
            </div>
          </div>
`;

    // Replace the entire top row
    const topRowPattern = /\{\/\* TOP ROW: 50\/50 Split for Financial Health and Freedom Map \*\/\}[\s\S]*?(?=\{\/\* MAIN GRID: Left Content and Right Sidebar \*\/})/g;
    content = content.replace(topRowPattern, mergedContent);
  }
}

fs.writeFileSync('client/src/pages/home.tsx', content);
console.log("Refactoring applied via JS script.");
