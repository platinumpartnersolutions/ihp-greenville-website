"""
insert_content.py
Reads batch1..5_content.py output files, then inserts research + comparison
fields into the matching entries in server/services-content.ts.
"""

import re, sys, io, os, importlib.util

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BATCH_FILES = [
    'batch1_content.py',
    'batch2_content.py',
    'batch3_content.py',
    'batch4_content.py',
    'batch5_content.py',
]

def load_batch(filename):
    spec = importlib.util.spec_from_file_location("batch", filename)
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod.CONTENT

# Merge all batches
all_content = {}
for bf in BATCH_FILES:
    if not os.path.exists(bf):
        print(f'WARNING: {bf} not found — skipping')
        continue
    try:
        data = load_batch(bf)
        all_content.update(data)
        print(f'Loaded {len(data)} entries from {bf}')
    except Exception as e:
        print(f'ERROR loading {bf}: {e}')

print(f'\nTotal entries loaded: {len(all_content)}')

# Read services-content.ts
with open('server/services-content.ts', encoding='utf-8') as f:
    src = f.read()

original_src = src
inserted = 0
skipped_already = 0
skipped_not_found = 0

for slug, data in all_content.items():
    research = data.get('research', '').strip()
    comp_title = data.get('comparison_title', '').strip()
    comp_text = data.get('comparison_text', '').strip()

    if not research or not comp_title or not comp_text:
        print(f'  SKIP (empty data): {slug}')
        continue

    # Find the entry for this slug
    # Pattern: looks for slug: "slug-name" and then finds the closing brace
    # We'll insert before the last closing brace (before relatedServiceSlugs if present,
    # otherwise before the last field)

    # Find the slug's entry boundaries
    slug_pattern = r'(\{[\s\n]*slug:\s*"' + re.escape(slug) + r'")'
    slug_match = re.search(slug_pattern, src)
    if not slug_match:
        print(f'  NOT FOUND: {slug}')
        skipped_not_found += 1
        continue

    # Check if already has research or comparison
    entry_start = slug_match.start()
    # Find where this entry ends (next top-level { for next entry, or end of array)
    # Simple heuristic: find the next "\n  {" or "\n]" after entry_start
    rest = src[entry_start:]
    # Find the end of this object — look for the next slug: or the end of array
    next_entry = re.search(r'\n\s{2,4}\{[\s\n]*slug:', rest[50:])
    if next_entry:
        entry_end = entry_start + 50 + next_entry.start()
        entry_text = src[entry_start:entry_end]
    else:
        # Last entry — find the closing of the array
        end_m = re.search(r'\n\];', rest[50:])
        if end_m:
            entry_end = entry_start + 50 + end_m.start()
            entry_text = src[entry_start:entry_end]
        else:
            print(f'  CANT FIND END: {slug}')
            skipped_not_found += 1
            continue

    if 'research:' in entry_text:
        print(f'  SKIP (already has research): {slug}')
        skipped_already += 1
        continue

    # Escape backticks in the content (shouldn't be any, but just in case)
    research = research.replace('`', "'")
    comp_text = comp_text.replace('`', "'")

    # Build insertion string (goes before relatedServiceSlugs or before the closing brace)
    insertion = f"""    research: `{research}`,
    comparison: {{
      title: "{comp_title}",
      text: `{comp_text}`,
    }},
"""

    # Find the insertion point: before relatedServiceSlugs if present, otherwise before photos or closing }
    insert_before_patterns = [
        r'(\s+relatedServiceSlugs:)',
        r'(\s+photos:)',
        r'(\s+\},\s*\n\s*\{[\s\n]*slug:)',  # closing brace + next entry
        r'(\s+\},\s*\n\];)',  # closing brace + end of array
    ]

    inserted_this = False
    for pat in insert_before_patterns:
        m = re.search(pat, entry_text)
        if m:
            # Find absolute position
            abs_pos = entry_start + m.start()
            src = src[:abs_pos] + '\n' + insertion + src[abs_pos:]
            inserted += 1
            inserted_this = True
            print(f'  INSERTED: {slug}')
            break

    if not inserted_this:
        print(f'  SKIP (could not find insertion point): {slug}')
        skipped_not_found += 1

print(f'\n=== SUMMARY ===')
print(f'Inserted: {inserted}')
print(f'Already had research: {skipped_already}')
print(f'Not found / error: {skipped_not_found}')

if inserted > 0:
    with open('server/services-content.ts', 'w', encoding='utf-8') as f:
        f.write(src)
    print('\nservices-content.ts updated.')
else:
    print('\nNo changes made.')
