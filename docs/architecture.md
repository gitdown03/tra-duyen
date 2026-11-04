# Kiến trúc Hệ thống - Trà Duyên v1

## 1. Tổng quan Cấu trúc (Monorepo)
```
VibeCode/
├── apps/
│   ├── web/                     # React + Vite + Three.js / React Three Fiber + TailwindCSS/Tokens
│   └── server/                  # Node.js + Colyseus + Express/Fastify + Prisma + Media Pipeline
├── packages/
│   ├── contracts/               # Shared DTOs, Zod schemas, network messages, event types
│   ├── content/                 # Tea lore, questions, pastries, scenarios, cosmetic catalog
│   └── game-domain/             # Pure business logic: State machines, pairing algorithms, rules
└── docs/                        # Tài liệu hợp đồng, kiểm thử, bảo mật
```

## 2. Công nghệ Cốt lõi
- **Client:** React 19 / Vite, Three.js, React Three Fiber, Lucide Icons, Canvas 3D stylized low-poly.
- **Server:** Node.js, Colyseus (authoritative WebSocket game room server), Express/Node HTTP cho Auth & Media REST APIs.
- **Database & ORM:** PostgreSQL / SQLite fallback for lightweight test environments, Prisma ORM.
- **Validation:** Zod trên cả client và server.
- **State Management & Communication:** Colyseus State Schema cho sync realtime 3D + HTTP Session Auth với HttpOnly Cookie.

## 3. Ranh giới Phân tầng (Layer Boundaries)
1. **Domain (`packages/game-domain`):** Pure TypeScript, 0 dependency vào UI, Three.js, Colyseus hay Prisma. Chứa state machine của Bàn Đôi và Xem Mắt Chung, thuật toán phân cặp Round-Robin, tính toán điểm thưởng.
2. **Contracts (`packages/contracts`):** Chứa các schema validation (Zod) cho payload, thông điệp mạng, cấu trúc profile, danh thiếp.
3. **Server Modules (`apps/server/src/modules/`):**
   - `identity`: Guest issuance, Email register/login, password reset, session management.
   - `profiles`: Player character profile vs private personal profile with visibility filtering.
   - `media`: Safe image upload pipeline (mime sniffing, sharp transcode to webp/png, EXIF strip, size cap).
   - `rooms`: Colyseus room handlers (`TeaRoom`), atomic seating, presence, role assignment.
   - `activities`: Server-side timers, phase transitions, question prompt dispatch.
   - `matching`: Private submissions, dual-blind matching verification, private table unlocking.
   - `social`: Friend requests, room invites, contact card consent grants/revocation.
   - `progression`: "Lá Trà" ledger, daily cap, item purchases with idempotent transactions.
   - `moderation`: Mute, block, user report capture (with bounded chat memory snapshot), admin audit.
   - `persistence`: Prisma repositories and encryption layer for sensitive contacts.
4. **Client Layers (`apps/web/src/`):**
   - `scene/`: 3D Tea room scene, isometric camera, warm oriental lighting, props.
   - `character/`: Character procedural/stylized mesh with shared skeletal rigging and animations.
   - `interaction/`: Waypoint/nav clicks, seat interaction, action intents.
   - `network/`: Colyseus client connection, interpolation, session handling.
   - `ui/`: Design tokens, modal dialogues, tea cards, scoped chat, inventory, admin panels.

## 4. Quyền Thẩm Quyền Máy Chủ (Server Authority)
- Toàn bộ vị trí, ghế ngồi, chuyển phase, phân cặp, tính điểm và quyết định ghép đôi được tính và xác thực 100% tại máy chủ.
- Client chỉ gửi **Intent** (ví dụ: `INTENT_SIT`, `INTENT_SUBMIT_CARD`, `INTENT_VOTE`).
- Máy chủ kiểm tra session, membership, role, phase, cooldown trước khi cập nhật state.
- Bí mật (phiếu kín, chat cặp, danh thiếp riêng tư) **không bao giờ** được gửi trong public room state.
