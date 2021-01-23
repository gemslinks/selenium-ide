# Selenium ide 開発環境構築
## WSL2(Windows Subsystem for Linux) / Ubuntuインストール

https://qiita.com/rubytomato@github/items/a290ecef2ea86ea8350f

or

https://qiita.com/kenchan1193/items/74edfc67910b51469b45

## UbuntuにGitをインストール

### インストール
```sh
sudo apt-get install git
```
### 確認
```sh
dpkg -l git
```
### 初期設定
```sh
git config --global user.email "gemslinks@gmail.com" 
git config --global user.name "gemslinks" 
```



## UbuntuにNode.jsをインストール

### インストール
```sh
curl -sL https://deb.nodesource.com/setup_15.x | sudo -E bash -
sudo apt-get install -y nodejs
```
### 確認
```sh
dpkg -l nodejs
```



## Ubuntuにyarnインストール

yarnはパッケージマネージャー。https://yarnpkg.com/en/
nodeをインストールすると自動でインストールされるnpmと役割は同様。
ただ、並行処理でのインストールによってnpmよりも高速にパッケージをインストールできる。

### インストール

```sh
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add - 
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt-get update && sudo apt-get install yarn
```
### 確認

```sh
dpkg -l yarn
```



## UbuntuのPython 3アップデート

### アップデート
```sh
sudo apt update
sudo apt -y upgrade
```

### 確認
```sh
dpkg -l python3
```



## UbuntuのPython 3にpip3のインストール

### インストール

```sh
curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
sudo python3 get-pip.py
pip3 install -U pip
```
### 確認
```sh
pip show pip
```



## UbuntuのPython 3にperuインストール

### インストール
```sh
sudo pip install peru
```
### 確認
```sh
pip show peru
```



## Selenium ideのcodeをgithubからclone
### workspace作成(※作成してなければ)

```sh
mkdir /home/k1810-08/wks
```
### workspaceへソースをclone
```sh
cd /home/k1810-08/wks
git clone https://github.com/gemslinks/selenium-ide.git -b v3 --depth 1 
```
### 確認
```sh
ls -l
```
下記が表示される
```sh
total 4
drwxr-xr-x 10 k1810-08 k1810-08 4096 Jan  9 20:49 selenium-ide
```

## First Build selenium-ide
```sh
cd /home/k1810-08/wks/selenium-ide

peru sync

yarn

yarn build
```

下記が表示されたら、「\home\k1810-08\wks\selenium-ide\packages\selenium-ide\build」フォルダーが作成される。

```
...
lerna success run Ran npm script 'build' in 14 packages:
lerna success - browser-webdriver
lerna success - @seleniumhq/code-export-csharp-commons
lerna success - @seleniumhq/code-export-csharp-nunit
lerna success - @seleniumhq/code-export-csharp-xunit
lerna success - @seleniumhq/code-export-java-junit
lerna success - @seleniumhq/code-export-javascript-mocha
lerna success - @seleniumhq/code-export-python-pytest
lerna success - @seleniumhq/code-export-ruby-rspec
lerna success - @seleniumhq/code-export
lerna success - selenium-ide-extension
lerna success - selenium-side-runner
lerna success - selianize
lerna success - @seleniumhq/side-model
lerna success - @seleniumhq/side-utils
Done in 86.94s.
```

下記をChromeのextensionとして登録。
```url
\\wsl$\Ubuntu-20.04\home\k1810-08\wks\selenium-ide\packages\selenium-ide\build
```

## After Build selenium-ide

1. リリース用

```sh
yarn build
```

2. 開発用

```sh
yarn build:ext
```

```sh
# Loacal ファイルの変更確認
git status
# Loacal ステージングエリアに追加(全て)
git add .
# Loacal ステージしたファイルを取り消し
git reset README.md
# Loacal ファイルの確認(ステージングエリアにある)
git status
# Loacalへコミット
git commit -m "first commit"
# リモート確認
git remote -v
# リモートにfork_master
git remote add fork_master https://github.com/gemslinks/selenium-ide.git
#local repをremote rep mainにpush
git push -u fork_master v3

```



# selenium-ide-extensions 作成

### git remoteレポジトリを作成

[参照]
https://qiita.com/sodaihirai/items/caf8d39d314fa53db4db#5-github%E3%81%AE%E3%83%AA%E3%83%A2%E3%83%BC%E3%83%88%E3%83%AA%E3%83%9D%E3%82%B8%E3%83%88%E3%83%AA%E6%83%85%E5%A0%B1%E3%82%92%E3%83%AD%E3%83%BC%E3%82%AB%E3%83%AB%E3%83%AA%E3%83%9D%E3%82%B8%E3%83%88%E3%83%AA%E3%81%AB%E8%BF%BD%E5%8A%A0%E3%81%99%E3%82%8B

### git localレポジトリを作成

1. プロジェクトフォルダー作成

```sh
cd /home/k1810-08/wks
mkdir selenium-ide-extensions
```
2. local repの初期化 ～ remote repへコミット

```sh
cd selenium-ide-extensions
#read meを作成
echo "# selenium-ide-extensions" >> README.md
#git初期化
git init
#local repにファイル追加
git add README.md
#local repにcommit
git commit -m "first commit"
#main branch作成
git branch -M main
#remote rep origin 設定
git remote add origin https://github.com/gemslinks/selenium-ide-extensions.git
#local repをremote rep mainにpush
git push -u origin main
```



# WSL2停止・再開

windows PowerShellを起動

## WSL停止

```sh
# どのディストリビューションが動いているか確認
wsl -l -v

  NAME                   STATE           VERSION
* Ubuntu-20.04           Running         2
  docker-desktop         Stopped         2
  docker-desktop-data    Stopped         2

# 特定タスク終了
wsl -t Ubuntu-20.04
# WSL停止
wsl --shutdown
```

## WSL 再開

再起動は、特に明示的に指定する必要はありません。

Windows Terminalで新規のUbuntuタブを開く、Ubuntu2004.exeを実行する、スタートメニューからUbuntu 20.04を選択する、など、通常通りUbuntuを起動すればOKです。





# その他

## WSLとwindows間のファイル連携
https://qiita.com/quzq/items/1096c638c0d86795be13
## windowsからWSLファイルシステムへのアクセス
https://qiita.com/quzq/items/1096c638c0d86795be13
## pip commands list
https://qiita.com/yuta-38/items/730bf91526f92fe0b41a

## npm / yarn commands list

https://qiita.com/rubytomato@github/items/1696530bb9fd59aa28d8

## Linux commands list

https://qiita.com/savaniased/items/d2c5c699188a0f1623ef

yarn global add jest

yarn info jest

