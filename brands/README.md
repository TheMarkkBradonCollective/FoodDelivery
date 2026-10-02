# Portr App Icons

Wordless **lime rider** on electric purple (`rider-mark.png`), plus the original wordmark lockup.

Android adaptive icons keep that **same lockup** inside the **center 66dp safe zone** so circle / squircle / Samsung masks do not crop the helmet, wheels, box, or name.

| Token | Hex |
|-------|-----|
| Purple | `#7048F8` |
| Lime | `#A0F878` |
| Red (FastFood) | `#E31837` |
| Yellow (FastFood) | `#FFC72C` |

| App | Treatment |
|-----|-----------|
| **Portr** | Lime rider on purple + **Portr** |
| **Portr Runner** | Lime rider on purple + **Runr** |
| **Portr Vendor** | Lime rider on purple + **Vendr** |
| **Portr Command** | Purple rider on lime (wordless) |
| **FastFood** | Yellow rider on red + **FastFood** |

## Regenerate all launcher + in-app icons

```bash
npm run icons:generate
```

Updates Android mipmaps (108dp adaptive foreground + 48dp legacy), `apps/*/public/icons/app-icon.png`, `apps/website/public/icons/apps/*.png`, and `brands/store/*-512.png`.

Preview masks: `brands/icon-safe-preview.png` (square / circle / squircle).
