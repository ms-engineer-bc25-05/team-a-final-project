# Day3-2 Postman: /api/surveys

## 使い方
1. Postman: Import → `TimeSuggestion.postman_collection.json` / `Local.postman_environment.json`
2. 右上の環境を **Local** に切替
3. サーバ起動: `cd backend && npm run dev`
4. リクエスト:
   - **POST /api/surveys** → 201 & `{"ok":true,"id":"..."}` 期待
   - **GET  /api/surveys?userId=abc123&limit=10** → `items` を新しい順で返却
5. Firestore 確認:
   - トップレベル `surveys` に保存
   - `userId`, `lifestyle`, `interests[]`, `createdAt/updatedAt` を確認

## 補足
- GET は `userId` 絞り + `createdAt desc`。必要なら複合インデックス（surveys: userId ASC × createdAt DESC）を作成。