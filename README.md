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

npm run dev


http://localhost:3000

## 3. バックエンド (Express + TypeScript)

```bash
cd backend
npm init -y
npm install express cors
npm install -D typescript ts-node nodemon @types/node @types/express
npx tsc --init
```

src/index.ts
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

package.json の scripts 設定
```json
"scripts": {
  "test": "echo \"Error: no test specified\" && exit 1",
  "dev": "nodemon src/index.ts",   
  "build": "tsc",                 
  "start": "node dist/index.js"
}   
```

起動確認: 

npm run dev

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
```bash
docker compose build

docker compose up
```

## 6. 確認済み
- フロント（Next.js）はホットリロードが効く
- バックエンド（Express + TypeScript）も起動確認済み
- フロントからバックへの API 通信テスト済み
  - Backend API: http://localhost:4000/api/test
  - フロント疎通確認ページ: http://localhost:3000/api-test
- ※テストページは `frontend/src/app/api-test/page.tsx` に配置  
- ※このページは疎通確認用です。チーム全員の環境が整ったら削除して構いません。

## 7. CORS設定について
- 開発中は `app.use(cors())` を有効化しており、全てのオリジンからのアクセスを許可しています。
- 本番環境では必要に応じて `origin` を指定して制限してください。
  ```ts
  app.use(cors({ origin: "https://yourdomain.com" }));
  ```
## 8. 使用バージョン（初期構築時点）
### Frontend
- Next.js: 15.5.4
- React: 19.1.0
- TypeScript: 5.9.3
- Tailwind CSS: 4.1.14

### Backend
- Express: 5.1.0
- TypeScript: 5.9.3
- ts-node: 10.9.2
- nodemon: 3.1.10
- cors: 2.8.5

## 📌 今後追加予定
- Firebase Emulator
- Redis（キャッシュ用途）
- Stripe 連携
- .env 管理