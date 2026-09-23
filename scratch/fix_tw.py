import re

path = r'c:\laragon\www\testingroastery\apps\web\tailwind.config.ts'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Replace the ocha block
text = re.sub(
    r'// Ocha Brutalist Color Tokens[\s\S]*?ocha:\s*\{[\s\S]*?\},\s*\},',
    '''// 52 Coffee Canva Palette Tokens (page-15.png)
        ocha: {
          paper: "#F8FAFC",
          cream: "#F0F5F7",
          mist: "#CFE8EA",
          teal: "#8FB9BC",
          slate: "#617281",
          navy: "#465C70",
          charcoal: "#2C3136",
          crimson: "#A52136",
          maroon: "#5D1823",
          black: "#2C3136",
        },
      },''',
    text
)

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print("tailwind.config.ts fixed successfully!")

