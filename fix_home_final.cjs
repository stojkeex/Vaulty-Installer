const fs = require('fs');

let content = fs.readFileSync('client/src/pages/home.tsx', 'utf8');

// The first script didn't remove the bottom section properly because the HTML structure was slightly different
// Let's remove the "Reach your goal", "Vaulty Coin", and "Invite Friends" section.
const goalStart = content.indexOf('{/* BOTTOM FULL-WIDTH SECTION */}');
if (goalStart !== -1) {
  const goalEnd = content.indexOf('{/* MAIN GRID: Left Content and Right Sidebar */}');
  if (goalEnd !== -1) {
    content = content.substring(0, goalStart) + content.substring(goalEnd);
  }
}

// Remove the left column versions too if they exist
content = content.replace(/\{\/\* Compound Interest Simulator \(Teaser\) \*\/\}[\s\S]*?<\/Link>/, '');
content = content.replace(/\{\/\* Vaulty Academy \(Teaser\) \*\/\}[\s\S]*?<\/Link>/, '');

fs.writeFileSync('client/src/pages/home.tsx', content);
console.log("Cleanup 2 applied via JS script.");
