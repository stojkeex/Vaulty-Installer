const fs = require('fs');

let content = fs.readFileSync('client/src/pages/home.tsx', 'utf8');

// There are duplicates from the right column left over
content = content.replace(/\{\/\* Compound Interest Simulator \(Teaser\) \*\/\}[\s\S]*?<\/Link>/, '');
content = content.replace(/\{\/\* Vaulty Academy \(Teaser\) \*\/\}[\s\S]*?<\/Link>/, '');

// Also reach your goal from bottom section
content = content.replace(/\{\/\* BOTTOM FULL-WIDTH SECTION \*\/\}[\s\S]*?\{\/\* MAIN GRID: Left Content and Right Sidebar \*\/\}/, '{/* MAIN GRID: Left Content and Right Sidebar */}');

// The bottom full width section might not have that exact comment, let's look for "Reach your goal" directly
const reachGoalIndex = content.indexOf('Reach your goal');
if (reachGoalIndex !== -1) {
  // Let's find the start of that grid
  const gridStart = content.lastIndexOf('<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">', reachGoalIndex);
  if (gridStart !== -1) {
    const nextSection = content.indexOf('<div className="space-y-8">', reachGoalIndex);
    if (nextSection !== -1) {
      content = content.substring(0, gridStart) + '<div className="mt-8">\n          <div className="space-y-8">\n            {/* Finance News Card */}\n' + content.substring(content.indexOf('<div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-6', nextSection));
    }
  }
}

fs.writeFileSync('client/src/pages/home.tsx', content);
console.log("Cleanup 3 applied via JS script.");
