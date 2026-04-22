import re

with open('client/src/pages/home.tsx', 'r') as f:
    content = f.read()

# 1. Remove Vaulty Academy (Teaser)
academy_pattern = r'\{\/\* Vaulty Academy \(Teaser\) \*\/\}[\s\S]*?<\/Link>'
content = re.sub(academy_pattern, '', content)

# 2. Remove Bottom Cards (Goals, Vaulty Coin, Invite Friends)
bottom_cards_pattern = r'<div className="lg:col-span-2 space-y-8 flex flex-col h-full">[\s\S]*?<div className="space-y-8">\s*\{\/\* Finance News Card \*\/\}'
content = re.sub(bottom_cards_pattern, r'<div className="space-y-8">\n            {/* Finance News Card */}', content)

# Also fix the grid container for Bottom section
grid_pattern = r'<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">'
content = content.replace(grid_pattern, '<div className="mt-8">')

# 3. Merge Net Worth and Freedom Map
# Find the start of the Top Row
top_row_start = content.find('{/* TOP ROW: 50/50 Split for Financial Health and Freedom Map */}')
main_grid_start = content.find('{/* MAIN GRID: Left Content and Right Sidebar */}')

top_row_content = content[top_row_start:main_grid_start]

# We need to rewrite the top_row_content
# It currently has:
# <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
#   <div className="flex flex-col space-y-4"> (Financial Health) </div>
#   <div className="flex flex-col space-y-4"> (Freedom Map) </div>
# </div>

# Let's manually reconstruct the new top row using the existing pieces
net_worth_content_match = re.search(r'<div className="flex justify-between items-start relative z-10 shrink-0">([\s\S]*?)</div>\s*</div>\s*</div>\s*\{/\* Freedom Map', top_row_content)
if not net_worth_content_match:
    print("Could not find net worth content")

net_worth_inner = net_worth_content_match.group(1)

freedom_map_content_match = re.search(r'\{/\* Invisible header to align with left side \*/\}\s*</div>\s*<div className="relative overflow-hidden rounded-\[32px\].*?">\s*<div className="absolute inset-0.*?/>\s*<div className="relative z-10 flex flex-col h-full">([\s\S]*?)</div>\s*</div>\s*</div>\s*</div>', top_row_content)
if not freedom_map_content_match:
    print("Could not find freedom map content")

freedom_map_inner = freedom_map_content_match.group(1)

# Remove the extra space classes from Freedom Map
freedom_map_inner = freedom_map_inner.replace('space-y-4 flex-1 flex flex-col justify-center', 'space-y-4 flex flex-col')

new_top_row = f"""{{/* TOP ROW: Merged Financial Health and Freedom Map */}}
        <div className="mb-8">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-xl font-bold tracking-tight text-vaulty-gradient">
                Financial Health
              </h2>
            </div>
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent p-7 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-2xl flex flex-col gap-6">
              
              {{/* TOP PART: Net Worth & Chart & Budget */}}
              <div className="flex flex-col">
                <div className="flex justify-between items-start relative z-10 shrink-0">
{net_worth_inner}

              {{/* DIVIDER */}}
              <div className="h-px bg-white/10 w-full" />

              {{/* BOTTOM PART: Freedom Map */}}
              <div className="relative z-10 flex flex-col group cursor-pointer mt-2">
{freedom_map_inner}
            </div>
          </div>
        </div>

        """

content = content[:top_row_start] + new_top_row + content[main_grid_start:]

with open('client/src/pages/home.tsx', 'w') as f:
    f.write(content)

print("Transformations applied successfully!")
