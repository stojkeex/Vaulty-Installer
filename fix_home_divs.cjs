const fs = require('fs');

let content = fs.readFileSync('client/src/pages/home.tsx', 'utf8');

// Fix missing ending tags for the merged section
const mergedSectionStart = content.indexOf('                {/* Right Side: Freedom Map */}');
if (mergedSectionStart !== -1) {
  const mergedSectionEnd = content.indexOf('{/* MAIN GRID: Left Content and Right Sidebar */}');
  
  if (mergedSectionEnd !== -1) {
    let section = content.substring(mergedSectionStart, mergedSectionEnd);
    
    // Looks like we are missing closing divs for the grid and top wrapper
    const endTags = `              </div>\n            </div>\n          </div>\n        </div>\n\n        `;
    
    if (!section.endsWith(endTags)) {
      // Find the last </div> in that section and append the missing ones
      const lastDiv = section.lastIndexOf('</div>');
      if (lastDiv !== -1) {
         // Replace the whole section to ensure correctness
         content = content.substring(0, mergedSectionEnd) + '          </div>\n        </div>\n\n        ' + content.substring(mergedSectionEnd);
      }
    }
  }
}

fs.writeFileSync('client/src/pages/home.tsx', content);
console.log("Applied missing div tags fix.");
