import re, sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE = r'C:\Users\SWERVO\Desktop\ihp-greenville-website-main\ihp-greenville-website-main\dist\services'

checks = [
    'back-pain-treatment',
    'acupuncture-for-anxiety',
    'thyroid-disorder-treatment',
    'ozone-steam-sauna',
    'cupping-therapy',
    'infrared-sauna-therapy',
    'menopause-treatment',
    'brain-fog-treatment',
]

for slug in checks:
    path = os.path.join(BASE, slug, 'index.html')
    with open(path, encoding='utf-8') as f:
        html = f.read()
    res_head = re.search(r'<h2[^>]*>[^<]*[Rr]esearch[^<]*</h2>', html)
    comp_head = re.search(r'<h2[^>]*>[^<]*(vs\.|Comparison|[Cc]ompar)[^<]*</h2>', html)
    print(f'{slug}:')
    print(f'  research heading : {res_head.group(0)[:90] if res_head else "NOT FOUND"}')
    print(f'  comparison heading: {comp_head.group(0)[:90] if comp_head else "NOT FOUND"}')
    print()
