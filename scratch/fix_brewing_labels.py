path = r'c:\laragon\www\testingroastery\apps\web\components\brewing-guidance-experience.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

text = text.replace('<span>Metode Seduh</span>', '<span>Brewing Methods</span>')
text = text.replace('<span>Resep Barista</span>', '<span>Recipes</span>')
text = text.replace('<span>Panduan Gilingan</span>', '<span>Grind Size</span>')
text = text.replace('<span>Rasio &amp; Ekstraksi</span>', '<span>Ratio &amp; Extraction</span>')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("Updated brewing guidance nav labels!")

