import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
with open('server/services-content.ts', encoding='utf-8') as f:
    src = f.read()

# Show opening for every thin page (first 300 chars)
slugs_to_show = [
    'biopuncture-therapy', 'body-contour', 'acupuncture-injection-therapy',
    'herb-drug-interaction-consultation', 'electrical-stimulation-acupuncture',
    'non-needle-acupuncture', 'laser-acupuncture', 'ozone-steam-sauna',
    'infrared-sauna-therapy', 'whole-food-nutrition-counseling'
]

entries = src.split('slug:')
for entry in entries[1:]:
    sl = re.match(r'\s*"([^"]+)"', entry)
    if not sl:
        continue
    slug = sl.group(1)
    if slug not in slugs_to_show:
        continue
    op_m = re.search(r'opening:\s*`(.*?)`', entry, re.DOTALL)
    opening = op_m.group(1).strip()[:400] if op_m else 'NO OPENING'
    print(f'=== {slug} ===')
    print(opening)
    print()
