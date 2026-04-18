import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
with open('server/services-content.ts', encoding='utf-8') as f:
    src = f.read()

slugs_with_both = ['prolotherapy', 'neural-therapy', 'ozone-therapy', 'functional-medicine-consultation', 'chinese-herbal-medicine']
for slug in slugs_with_both:
    pattern = r'\{\s*\n\s*slug:\s*"' + slug + r'".*?\}(?=\s*,\s*\n\s*\{|\s*\n\s*\])'
    m = re.search(pattern, src, re.DOTALL)
    if m:
        entry = m.group(0)
        res_m = re.search(r'research:\s*`(.*?)`', entry, re.DOTALL)
        comp_m = re.search(r'comparison:\s*\{(.*?)\}', entry, re.DOTALL)
        if res_m:
            print(f'=== RESEARCH: {slug} ===')
            print(res_m.group(1).strip()[:800])
            print()
        if comp_m:
            print(f'=== COMPARISON: {slug} ===')
            print(comp_m.group(1).strip()[:800])
            print()
    else:
        print(f'NOT FOUND: {slug}')
