# Orbia v0.1
病院の「算定病歴係長」「経営企画係長」向けに想定した、業務整理・管理システムのGitHub試作版です。

## できること
- HOMEダッシュボード
- カレンダー／予定登録
- TODO管理（期限・優先度・分類）
- メールテンプレート／下書き
- 集計結果ダッシュボード（ダミー）
- 試算（実績と分離）
- CSV取込プレビュー
- 様式・資料メニュー
- JSONバックアップ／復元
- 算定病歴係長／経営企画係長モード切替

## GitHub Pagesで公開する
1. このフォルダ一式をGitHubリポジトリにアップロード
2. GitHubの `Settings`
3. `Pages`
4. `Build and deployment` → `Deploy from a branch`
5. Branchを `main` / `(root)` に設定
6. 数分後に公開URLが発行されます

## セキュリティ
この版は開発・UI確認用です。

**実データを入れないでください。**
- 患者氏名
- 患者ID
- 職員個人情報
- 院内限定資料
- SharePoint URLや秘密情報
- パスワード／APIキー

GitHubがPrivateでも、本番院内データの置き場としては使用しない想定です。

## データ保存
予定・TODO・メール設定はブラウザの `localStorage` に保存されます。
「設定」または上部の「バックアップ」からJSONを書き出せます。

## 本番移行イメージ
GitHub版はUI・操作・要件の試作に使用し、本番では以下へ置換します。

- 認証 → Microsoft Entra ID
- ファイル／資料 → SharePoint
- 予定 → SharePoint Lists / Microsoft 365
- メール → Outlook + Power Automate
- Excel取込 → SharePoint + Power Query / Office Scripts
- 様式出力 → Office Scripts / Power Automate
- ダッシュボード → 集計済みExcel / Power BI
- 試算 → 実績テーブルと試算テーブルを分離

詳細は `docs/migration.md` を参照してください。

## バージョン
Orbia v0.1 / GitHub prototype
