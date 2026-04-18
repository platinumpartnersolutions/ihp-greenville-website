import re, sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE = r'C:\Users\SWERVO\Desktop\ihp-greenville-website-main\ihp-greenville-website-main\dist\services'

checks = ['back-pain-treatment', 'thyroid-disorder-treatment', 'infrared-sauna-therapy']

for slug in checks:
    path = os.path.join(BASE, slug, 'index.html')
    with open(path, encoding='utf-8') as f:
        html = f.read()
    # Find "Research & Evidence" heading then grab next 600 chars
    m = re.search(r'Research &amp; Evidence</h2>(.{0,600})', html, re.DOTALL)
    if m:
        text = re.sub(r'<[^>]+>', '', m.group(1)).strip()[:300]
        print(f'=== {slug} RESEARCH ===')
        print(text)
        print()
