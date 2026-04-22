const fs = require('fs');

let content = fs.readFileSync('client/src/pages/home.tsx', 'utf8');

// 1. Remove Investment simulator and Academy
content = content.replace(/\{\/\* Compound Interest Simulator \(Teaser\) \*\/\}[\s\S]*?<\/Link>/, '');
content = content.replace(/\{\/\* Vaulty Academy \(Teaser\) \*\/\}[\s\S]*?<\/Link>/, '');

// Clean up the styling of Freedom Map inside the merged card
const mapContentStart = content.indexOf('<div className="relative z-10 flex flex-col h-full">');
if (mapContentStart !== -1) {
  // It has a flex-1 flex flex-col justify-center we need to clean up so it takes up less space
  content = content.replace('className="space-y-4 flex-1 flex flex-col justify-center"', 'className="space-y-3 flex flex-col mt-4"');
  // Hide the Freedom Map header since it's now merged
  content = content.replace('<div className="flex items-center justify-between mb-6 shrink-0">', '<div className="flex items-center justify-between mb-2 shrink-0 hidden">');
}

fs.writeFileSync('client/src/pages/home.tsx', content);
console.log("Cleanup applied via JS script.");
