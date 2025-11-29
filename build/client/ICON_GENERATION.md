PWA Icon Generation Instructions
================================

StreamFlix needs PWA icons in the following sizes:
- pwa-192x192.png
- pwa-512x512.png
- apple-touch-icon.png (180x180)
- favicon.ico

You can generate these using the icon.svg file:

OPTION 1: Use Online Tools
---------------------------
1. Visit https://realfavicongenerator.net/
2. Upload public/icon.svg
3. Configure for PWA support
4. Download and extract to public/ folder

OPTION 2: Use npm package
--------------------------
npm install -g pwa-asset-generator
pwa-asset-generator public/icon.svg public/ --icon-only --favicon

OPTION 3: Manual Creation
--------------------------
Use any image editor (Photoshop, Figma, etc.) to create:
- 512x512 PNG for pwa-512x512.png
- 192x192 PNG for pwa-192x192.png  
- 180x180 PNG for apple-touch-icon.png
- Convert to .ico for favicon.ico

Design Guidelines:
- Background: #141414 (dark)
- Primary Color: #E50914 (Netflix red)
- Simple play button or "SF" monogram
- High contrast for visibility
- No text (icons should work at small sizes)

Once generated, place in public/ folder:
public/
  ├── pwa-192x192.png
  ├── pwa-512x512.png
  ├── apple-touch-icon.png
  └── favicon.ico
