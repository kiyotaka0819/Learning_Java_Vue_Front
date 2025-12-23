# Learning_Java_Vue_Front

Vue3 (Vite) を利用した、フロントエンドとバックエンド（Java/GAS）の学習成果物まとめ。
単に動くものを作るのではなく、コンポーネントの再利用性と、実用的な判定ロジックの実装に重点を置いています。

## Technical Stack

- **Frontend**: Vue.js 3 (Composition API / Vue Router)
- **Infrastructure**: GitHub Pages (Static Hosting)
- **Others**: Java (Spring Boot), GAS (Google Apps Script)

## アプリケーション詳解

### お天気取得アプリ
APIから取得したデータをそのまま出すのではなく、生活に密着したアドバイスを表示。
- **こだわり**: 「夏は最高気温、冬は最低気温」という、季節によって判断基準を切り替えるロジック。
- **実装面**: 生データを直感的に理解できるよう、CSSでの整形と条件分岐に時間をかけました。

### ギターコード（コード進行）表示アプリ
スプレッドシートをDB代わりに使い、GAS経由でデータを取得する構成。
- **独自性**: 多数の画像ファイルを保持するのではなく、1枚のドットマップ用画像からコード譜を動的に組み立てる描画ロジックを構築。

## Java / Backend の学習進捗
現在、Spring Boot を用いたAPI開発と、PostgreSQLによるDB設計を並行して学習中。
SQLでは、複雑な結合（JOIN）やサブクエリを用いたクエリの最適化を課題として取り組んでいます。