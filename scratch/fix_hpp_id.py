path = r'c:\laragon\www\testingroastery\apps\web\components\blend-builder-experience.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

target = '<section id="hpp-racikan" aria-labelledby="hpp-heading" className="rounded-xl border border-border-subtle bg-white p-5 sm:p-6">'
replacement = '<section id="pricing-calculator" aria-labelledby="hpp-heading" className="scroll-mt-28 rounded-xl border border-border-subtle bg-white p-5 sm:p-6"><span id="hpp-racikan" className="sr-only" />'

if target in text:
    text = text.replace(target, replacement)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Replaced successfully!")
else:
    print("Target not found")

