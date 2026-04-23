const fs = require('fs');

let content = fs.readFileSync('client/src/pages/home.tsx', 'utf8');

// The previous attempt failed to apply because of a regex mismatch.
// Let's do a strict string replacement.
const topRowStart = content.indexOf('{/* TOP ROW: 50/50 Split for Financial Health and Freedom Map */}');
const topRowEnd = content.indexOf('{/* MAIN GRID: Left Content and Right Sidebar */}');

if (topRowStart !== -1 && topRowEnd !== -1) {
  const topRowSection = content.substring(topRowStart, topRowEnd);
  
  // Extract Net Worth inner content
  const netWorthStart = topRowSection.indexOf('<div className="flex justify-between items-start relative z-10 shrink-0">');
  const netWorthEnd = topRowSection.indexOf('{/* Freedom Map - New Section replacing quick actions */}');
  
  // Extract Freedom Map inner content
  const freedomMapStart = topRowSection.indexOf('<div className="relative z-10 flex flex-col h-full">', netWorthEnd);
  
  if (netWorthStart !== -1 && netWorthEnd !== -1 && freedomMapStart !== -1) {
    let netWorthContent = topRowSection.substring(netWorthStart, netWorthEnd);
    // Remove the trailing </div></div></div>
    netWorthContent = netWorthContent.substring(0, netWorthContent.lastIndexOf('</div>', netWorthContent.lastIndexOf('</div>') - 1) - 6);
    
    let freedomMapContent = topRowSection.substring(freedomMapStart);
    // Remove the trailing </div></div></div></div>
    freedomMapContent = freedomMapContent.substring(0, freedomMapContent.lastIndexOf('</div>', freedomMapContent.lastIndexOf('</div>') - 1) - 6);
    
    // Clean up freedom map styling to remove extra spacing
    freedomMapContent = freedomMapContent.replace('space-y-4 flex-1 flex flex-col justify-center', 'space-y-3 flex flex-col pt-2');
    freedomMapContent = freedomMapContent.replace('<div className="flex items-center justify-between mb-6 shrink-0">', '<div className="flex items-center justify-between mb-4 shrink-0 hidden">'); // Hide the header
    
    const newTopRow = `{/* TOP ROW: Merged Financial Health and Freedom Map */}
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
                ${netWorthContent}
              </div>

              {/* DIVIDER for desktop / mobile */}
              <div className="w-full h-px md:w-px md:h-auto bg-gradient-to-b md:bg-gradient-to-r from-transparent via-white/10 to-transparent shrink-0" />

              {/* RIGHT SIDE: Freedom Map */}
              <div className="flex-1 relative z-10 flex flex-col group cursor-pointer" onClick={() => setLocation('/freedom-map')}>
                ${freedomMapContent}
              </div>
              
            </div>
          </div>
        </div>

        `;
        
    content = content.substring(0, topRowStart) + newTopRow + content.substring(topRowEnd);
  }
}

fs.writeFileSync('client/src/pages/home.tsx', content);
console.log("Force merged applied via JS script.");
