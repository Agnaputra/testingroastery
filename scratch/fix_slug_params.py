path = r'c:\laragon\www\testingroastery\apps\web\app\coffee-lab\[...slug]\page.tsx'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

old_func = '''export function generateStaticParams() {
  return COFFEE_LAB_CONTENT.map((entry) => ({ slug: entry.path.split('/') }));
}'''

new_func = '''export function generateStaticParams() {
  return Object.keys(LEGACY_ROUTES).map((route) => ({ slug: route.split('/') }));
}'''

if old_func in text:
    text = text.replace(old_func, new_func)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print("Updated [...slug] generateStaticParams successfully!")
else:
    print("old_func not found")

