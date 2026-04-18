import re, sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE = r'C:\Users\SWERVO\Desktop\ihp-greenville-website-main\ihp-greenville-website-main\dist\services'

checks = [
    'back-pain-treatment',
    'acupuncture-for-anxiety',
    'thyroid-disorder-treatment',
    'cupping-therapy',
]

for slug in checks:
    path = os.path.join(BASE, slug, 'index.html')
    with open(path, encoding='utf-8') as f:
        html = f.read()
    # Extract comparison heading
    comp = re.search(r'<h3[^>]*>([^<]+)</h3>', html)
    # Find research text snippet
    res_m = re.search(r'Research &amp; Evidence</h2>\s*<p[^>]*>(.*?)</p>', html, re.DOTALL)
    comp_m = re.search(r'<h3[^>]*>[^<]*vs\.[^<]*</h3>\s*<p[^>]*>(.*?)</p>', html, re.DOTALL)
    print(f'=== {slug} ===')
    if res_m:
        snippet = re.sub(r'<[^>]+>', '', res_m.group(1))[:200]
        print(f'RESEARCH: {snippet}...')
    else:
        print('RESEARCH: not found in expected location')
    if comp_m:
        snippet = re.sub(r'<[^>]+>', '', comp_m.group(1))[:200]
        print(f'COMPARISON: {snippet}...')
    else:
        # try finding h3 with vs.
        h3s = re.findall(r'<h3[^>]*>([^<]+)</h3>', html)
        vs_heads = [h for h in h3s if 'vs.' in h]
        print(f'COMPARISON h3 titles: {vs_heads[:3]}')
    print()
