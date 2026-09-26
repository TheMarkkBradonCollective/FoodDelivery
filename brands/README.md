# Porter App Icons

Wordless **lime rider** on electric purple (`rider-mark.png`).

Android adaptive icons keep the rider and letter badge inside the **center 66dp safe zone** so circle / squircle / Samsung masks do not crop the helmet, wheels, or box.

| Token | Hex |
|-------|-----|
| Purple | `#7048F8` |
| Lime | `#A0F878` |
| Red (FastFood) | `#E31837` |
| Yellow (FastFood) | `#FFC72C` |

| App | Treatment |
|-----|-----------|
| **Porter** | Lime rider on purple + **P** |
| **Porter Runner** | Lime rider on purple + **R** |
| **Porter Vendor** | Lime rider on purple + **V** |
| **Porter Command** | Purple rider on lime + **C** |
| **FastFood** | Yellow rider on red + **F** |

## Regenerate all launcher + in-app icons

```bash
npm run icons:generate
```

Updates Android mipmaps (108dp adaptive foreground + 48dp legacy), `apps/*/public/icons/app-icon.png`, `apps/website/public/icons/apps/*.png`, and `brands/store/*-512.png`.

Preview masks: `brands/icon-safe-preview.png` (square / circle / squircle).
