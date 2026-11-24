# 診療材料新規申請受付システム

> **本番環境URL:** [https://material-request.asabori.com](https://material-request.asabori.com)

## 1. 概要 & 解決する課題

- **背景:** 現職において市立病院の「診療材料審査委員会」事務局を担当した実務経験をベースに作成。
- **解決策:** アナログな申請プロセスの非効率さや、類似品目の増加によるコスト増大を解消するため、申請システム内に「価格比較によるプレゼン免除判定ロジック」を実装。

## 2. 技術スタック

| 領域            | 技術                    | 選定理由（概要）                                                                                                                                                                        |
| :-------------- | :---------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Frontend        | Next.js (App Router)    | 以前Laravelで苦戦した経験から、フォルダ構造がそのままURLになる直感性と、主流のフレームワークである点から採用。                                                                          |
| DB / ORM        | Neon + Drizzle          | 過去のレンタルサーバー運用時に苦労したため、DBはクラウドサービスを活用。Neonのブランチ機能によるCIの軽さを重視。Supabaseも検討したが後述の理由により却下。ORMはコードの見やすさで選択。 |
| Auth            | Clerk                   | DBとAuthをSupabaseにまとめることも検討したがGUI上の設定方法が分からず頓挫。多機能サービスの複雑な設定を避け、分かりやすい認証専用サービスであるclerkを選択。                            |
| Test / QA       | Vitest + Playwright     | 主流であること、テストの干渉しにくさに加え、`codegen` によるテストコード自動生成の効率性を評価し採用したものの、実際には`codegen`はほとんど使用せず。                                   |
| CI/CD & Hosting | GitHub Actions + Vercel | Next.js開発元によるトラブル回避、およびプレビュー環境・E2Eテスト・デプロイの自動化を実現するため。                                                                                      |

## 3. 品質保証 (QA) & CI/CD パイプライン

開発から本番デプロイまでの検証コストをゼロにし、堅牢性を担保する自動化フローを構築しています。

### ① PR段階の自動検証フロー

PR作成・pushをトリガーに、GitHub Actionsによる高速な静的検証・単体テストと、Neon・Vercelによるプレビュー環境でのE2Eテストが並列で実行されます。5つの必須チェックがすべてパスするまでmainへのマージはブロックされます。

```mermaid
flowchart TD
    %% 有効な padding でノードの内側に安全な余白を確保する
    classDef test fill:#e8f0fe,stroke:#4285f4,stroke-width:1.5px,padding:8px 16px;
    classDef db fill:#fef7e0,stroke:#f9ab00,stroke-width:1.5px,padding:8px 16px;
    classDef gate fill:#f3e8fd,stroke:#9334ea,stroke-width:1.5px,padding:8px 16px;
    classDef ok fill:#e6f4ea,stroke:#34a853,stroke-width:2px,padding:10px 20px;
    classDef ng fill:#fce8e6,stroke:#ea4335,stroke-width:1.5px,padding:8px 16px;

    PR["PR作成 / push&nbsp;&nbsp;"]:::test

    subgraph CI [" ① GitHub Actions: コアCI (並列実行) "]
        direction TB
        TC["typecheck: TypeScript型検査&nbsp;&nbsp;"]:::test
        LINT["lint: ESLint構文規則検査&nbsp;&nbsp;"]:::test
        FMT["format: Prettierコード整形検査&nbsp;&nbsp;"]:::test
        UNIT["test: Vitest単体・統合テスト&nbsp;&nbsp;"]:::test
    end

    subgraph PREVIEW [" ② Vercel & Neon (環境検証) "]
        direction TB
        NEON["Neon: テスト用DBブランチ作成&nbsp;&nbsp;"]:::db
        VERCEL["Vercel: プレビュー環境デプロイ (自動マイグレーション)&nbsp;&nbsp;"]:::db
        E2E["Playwright: プレビュー環境E2Eテスト実行&nbsp;&nbsp;"]:::test
        NEON --> VERCEL --> E2E
    end

    PR --> CI
    PR --> PREVIEW

    GATE{"GitHub ブランチ保護<br>(5つの必須チェック判定)"}:::gate
    CI --> GATE
    E2E --> GATE

    GATE -->|全チェック成功| PASS["マージ承認 & 完了&nbsp;&nbsp;&nbsp;&nbsp;"]:::ok
    GATE -->|いずれか失敗| FAIL["マージ自動ブロック&nbsp;&nbsp;"]:::ng
```

### ② マージ後・本番デプロイフロー

mainブランチへのマージ後は、Vercelが本番環境へ自動デプロイとマイグレーションを実行します。本番データや外部サービスの安全性を保護するため、E2Eテストはプレビュー環境で完結させ、本番環境に対してはテストを実行しません。

```mermaid
flowchart LR
    classDef main fill:#e8f0fe,stroke:#4285f4,stroke-width:1.5px;
    classDef success fill:#e6f4ea,stroke:#34a853,stroke-width:2px;
    classDef skip fill:#f1f3f4,stroke:#9aa0a6,stroke-width:1.5px,stroke-dasharray: 4 4;

    MERGE(["main マージ"]):::main --> VERCEL["Vercel: 本番環境へデプロイ <br> (本番DB自動マイグレーション)"]
    MERGE --> SKIP["E2Eテスト: 安全のためスキップ <br> ※本番データ・外部連携の保護"]:::skip

    VERCEL --> RELEASE(["本番リリース完了"]):::success
```

## 4. 技術的挑戦と問題解決

- **課題①: 初期セットアップ後の画面フリーズ（「登録中...」からの遷移不良）**
  - **発生原因:** ユーザーがフォームから送信した際、データベース（DB）側へのレコード登録自体は正常に完了していたが、Next.js（App Router）側で `/` のサーバーキャッシュが破棄されず、画面遷移後も古い「未登録状態のキャッシュ」がそのまま参照されていたため。
  - **解決策:** Server ActionでのDB登録処理直後に `revalidatePath('/')` を実行し、古いキャッシュを即時破棄。さらに `export const dynamic = 'force-dynamic';` を付与して動的評価を強制し、遷移を安定化。
- **課題②: 要求仕様に対するリソース最適化とスコープ制御**
  - **発生背景:** 認証基盤（Clerk）において、**個別実装したサインアップ動線側がうまく動作しないトラブルに直面**。調査の結果、そもそも「サインイン画面」のUIからサインアップ（新規登録）も兼ねられる仕様であることが判明した。
  - **解決策:** アプリ側で個別のサインアップ用ボタンを維持する必要性が低いと判断し、不要なボタンを画面から削除（Scope out）。限られた開発期間の中で、最優先事項である「QA・テスト自動化環境の構築」へリソースを集中投下。
