import re, sys, io, os
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE = r'C:\Users\SWERVO\Desktop\ihp-greenville-website-main\ihp-greenville-website-main\dist\services'

missing_research = []
missing_comparison = []
both = 0

for slug in os.listdir(BASE):
    path = os.path.join(BASE, slug, 'index.html')
    if not os.path.exists(path):
        continue
    try:
        html = open(path, encoding='utf-8').read()
    except Exception:
        html = open(path, encoding='latin-1').read()
    has_research = 'Research & Evidence' in html
    has_comparison = 'vs.' in html
    if has_research and has_comparison:
        both += 1
    else:
        if not has_research:
            missing_research.append(slug)
        if not has_comparison:
            missing_comparison.append(slug)

total = len(os.listdir(BASE))
print(f'Total service pages: {total}')
print(f'Has both research + comparison: {both}')
print(f'Missing research: {len(missing_research)}')
print(f'Missing comparison: {len(missing_comparison)}')
if missing_research:
    print('Missing research:', missing_research[:20])
if missing_comparison:
    print('Missing comparison:', missing_comparison[:20])
