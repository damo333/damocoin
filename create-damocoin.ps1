#!/usr/bin/env powershell
# DamoCoin Token Creator - Easy Launcher

$env:PATH = $env:PATH + ";C:\solana\solana-release\bin;C:\Program Files\nodejs"

Write-Host "DamoCoin Token Creator" -ForegroundColor Cyan
Write-Host "=====================`n" -ForegroundColor Cyan

# Check wallet balance
Write-Host "Checking wallet balance..." -ForegroundColor Yellow
$balance = & "C:\solana\solana-release\bin\solana.exe" balance 2>&1
Write-Host "Balance: $balance SOL`n"

if ($balance -eq "0") {
    Write-Host "WARNING: Your wallet has 0 SOL. You need at least 0.01 SOL to create a token." -ForegroundColor Red
    Write-Host "Try airdrop again: solana airdrop 2`n" -ForegroundColor Yellow
}

# Get arguments or use defaults
$metadataUri = if ($args.Count -gt 0) { $args[0] } else { "https://damo333.github.io/damocoin/solana-token-sample/damocoin.json" }

Write-Host "Starting DamoCoin creation..." -ForegroundColor Green
Write-Host "Metadata URI: $metadataUri`n"

# Run the token creation script
node create-token.js $metadataUri
