# RUNR App Icons

Wordless **Porter rider mark** (`porter-icon-mark.png`) — no text on launcher icons.

| App | Background | Mark color |
|-----|------------|------------|
| **PORTER** | White `#FFFFFF` | Porter blue `#0066FF` |
| **RUNR** | White `#FFFFFF` | Black `#000000` |
| **VENDR** | Porter blue `#0066FF` | White |
| **STAFF** | Dark zinc `#18181B` | Porter blue `#0066FF` |

## Regenerate all launcher + in-app icons

```bash
npm run icons:generate
```

Updates Android mipmaps, `apps/*/public/icons/app-icon.png`, and `apps/website/public/icons/apps/*.png`.
