# Design Context — /travel route

## Tech Stack
- Next.js (App Router hoặc Pages Router tùy project)
- Map: Leaflet.js + OpenStreetMap (không cần API key)
- AI Analysis: Anthropic Claude API (claude-sonnet-4-20250514)
- Routing trên map: Leaflet Routing Machine hoặc OSRM

## Aesthetic Direction
- Style: Fresh travel app — sáng, tươi, năng động
- Theme: LIGHT mode
- Primary color: #0EA5E9 (sky blue)
- Accent: #F97316 (warm orange)
- Background: #F8FAFC
- Surface/Card: #FFFFFF với shadow nhẹ
- Text: #0F172A (primary), #64748B (secondary)
- Font display: "Bricolage Grotesque" (Google Fonts) — bold, cá tính
- Font body: "Plus Jakarta Sans" (Google Fonts) — clean, readable
- Border radius: 16px cho card, 12px cho button
- Shadow: soft, subtle — box-shadow: 0 4px 24px rgba(0,0,0,0.06)

## Layout — /travel page
- Split layout: Map chiếm 60% bên phải (full height), Panel điều khiển 40% bên trái
- Panel bên trái cuộn được, map cố định
- Trên mobile: panel thu gọn phía dưới, map full screen

## DO NOT use
- Dark background
- Purple/violet gradient
- Inter, Roboto, Arial font
- Generic card list layout không có map
- Border radius > 20px
- Loading spinner kiểu cũ (dùng skeleton thay thế)