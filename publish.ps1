Param(
    [string]$RemoteUrl = "https://github.com/damo333/damocoin.git",
    [string]$Branch = "main"
)

Write-Host "Publishing DamoCoin project to GitHub..."

if (-not (Test-Path .git)) {
    git init
    git branch -M $Branch
    git remote add origin $RemoteUrl
}

git add .
git commit -m "Publish DamoCoin sample" -ErrorAction SilentlyContinue

git push -u origin $Branch

Write-Host "Done. If using GitHub Pages, enable Pages in repository settings."
