# 🛠 開発環境セットアップ手順

## 1. プロジェクト構造

```project-root/
├── frontend/ # Next.js (TypeScript + Tailwind)
├── backend/ # Express (TypeScript)
└── docker-compose.yml
```

---

## 2. フロントエンド (Next.js)

```bash
cd frontend
npx create-next-app@latest . --ts --tailwind
```

起動確認:
http://localhost:3000


## 3. バックエンド (Express + TypeScript)

```bash
cd backend
npm init -y
npm install express cors
npm install -D typescript ts-node nodemon @types/node @types/express
npx tsc --init
src/index.ts
```

```ts

import express from "express";
import cors from "cors";

const app = express();
const PORT = 4000;

app.use(cors());

app.get("/", (_req, res) => {
  res.send("Hello from Express + TypeScript backend!");
});

app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
```

起動確認:
http://localhost:4000

## 4. docker-compose.yml

```yaml
services:
  frontend:
    build: ./frontend
    container_name: next-app
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:4000
    depends_on:
      - backend

  backend:
    build: ./backend
    container_name: express-api
    ports:
      - "4000:4000"
    volumes:
      - ./backend:/app
```

## 5. 起動方法
docker compose build

docker compose up

## 6. 確認済み
- フロント（Next.js）はホットリロードが効く
- バックエンド（Express + TypeScript）も起動確認済み
- フロントからバックへの API 通信テスト済み
  - Backend API: http://localhost:4000/api/test
  - フロント疎通確認ページ: http://localhost:3000/api-test
- ※テストページは `frontend/src/app/api-test/page.tsx` に配置  
- ※このページは疎通確認用です。チーム全員の環境が整ったら削除して構いません。

## CORS設定について
- 開発中は `app.use(cors())` を有効化しており、全てのオリジンからのアクセスを許可しています。
- 本番環境では必要に応じて `origin` を指定して制限してください。
  ```ts
  app.use(cors({ origin: "https://yourdomain.com" }));
  ```

## 📌 今後追加予定
- Firebase Emulator
- Redis（キャッシュ用途）
- Stripe 連携
- .env 管理