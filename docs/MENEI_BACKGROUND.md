# MENEI black and gold athletic background

Release: **8.1.1**. The existing MENEI 8.1.0 rebuild remains the functional baseline.

The page background is true black (`#000000`). The owner's exact M and pointed-leaf wreath sit above a gold Greek soldier lifting a stone. Home shows the artwork beside the introduction and date control; other screens retain a quiet background watermark. Workout cards and controls keep their opaque, readable surfaces. Decorative images are excluded from screen-reader navigation and cannot intercept taps.

The original logo in `brand-mark-reference.jpg`, its display containers and the approved app icons are unchanged. A CSS black-point adjustment blends the decorative logo's dark JPEG background into true black while preserving its geometry. The soldier is a separate illustration, not a replacement logo. The artwork is included in the service-worker shell for offline use. There are no storage, account, database or workout-calculation changes.

Verification: all 124 automated tests passed, static checks validated the 38-file offline shell, and Chromium checks at 1440, 430 and 360 px confirmed no horizontal overflow or page errors. The artwork loaded, decorations did not intercept taps, and the graph and athlete asset remained available after an offline reload. Home and progress screenshots were visually inspected.

## Asset record

- Method: built-in image generation.
- Generated source: `exec-bbe5ae72-fc3a-453c-8088-e06a9f77ea50.png`.
- Project asset: [`artwork/greek-athlete-gold.webp`](../artwork/greek-athlete-gold.webp), converted to WebP at quality 88 without changing its dimensions or composition.

### Final generation prompt

```text
Use case: stylized-concept
Asset type: decorative background illustration for MENEI, a black-and-Pittsburgh-gold strength training app.
Primary request: one gold ancient Greek soldier performing an athletic lifting pose, isolated on a perfectly solid pure black (#000000) background.
Subject: a powerful adult Greek hoplite athlete in a recognizable Corinthian helmet, simple short Greek pleated athletic tunic/skirt and greaves. He is lifting a heavy round rough stone in both hands at upper chest height, elbows naturally bent, legs in a controlled athletic half-squat, feet firmly planted. Anatomically correct, balanced, strong and determined. Full body and complete stone visible, centered with generous black margin.
Style/medium: premium monochrome gold engraving / sculptural gold silhouette with carefully defined dark inset contour lines, inspired by ancient Greek pottery athletic figures and medal relief. Bold clear shape that remains readable as a subtle app background. Refined, clean, restrained detail; no photorealistic scene.
Color palette: only warm Pittsburgh gold (#FFB81C) and subtle gold highlights against pure black; no other colors. All background pixels black, no pedestal or scenery.
Composition: vertical portrait, one single figure, three-quarter view, stone at chest below face; compact pose fitting within portrait frame.
Constraints: no lettering, no logo, no M, no wreath (the approved M/wreath will be placed separately in code). No spear, sword, shield, weapons, cape, flames, glow, border, columns, other figures or watermark.
```
