# Ralph Wiggum - Long-running AI agent loop (Windows PowerShell version)
# Usage: .\ralph.ps1 [max_iterations]

param(
    [int]$MaxIterations = 10
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$PrdFile = Join-Path $ScriptDir "prd.json"
$ProgressFile = Join-Path $ScriptDir "progress.txt"
$ArchiveDir = Join-Path $ScriptDir "archive"
$LastBranchFile = Join-Path $ScriptDir ".last-branch"

# Archive previous run if branch changed
if ((Test-Path $PrdFile) -and (Test-Path $LastBranchFile)) {
    $CurrentBranch = ""
    try {
        $prdContent = Get-Content $PrdFile -Raw | ConvertFrom-Json
        $CurrentBranch = $prdContent.branchName
    } catch {
        $CurrentBranch = ""
    }
    
    $LastBranch = ""
    try {
        $LastBranch = Get-Content $LastBranchFile -Raw
        $LastBranch = $LastBranch.Trim()
    } catch {
        $LastBranch = ""
    }
    
    if ($CurrentBranch -and $LastBranch -and ($CurrentBranch -ne $LastBranch)) {
        # Archive the previous run
        $Date = Get-Date -Format "yyyy-MM-dd"
        $FolderName = $LastBranch -replace "^ralph/", ""
        $ArchiveFolder = Join-Path $ArchiveDir "$Date-$FolderName"
        
        Write-Host "Archiving previous run: $LastBranch"
        New-Item -ItemType Directory -Force -Path $ArchiveFolder | Out-Null
        
        if (Test-Path $PrdFile) {
            Copy-Item $PrdFile -Destination $ArchiveFolder
        }
        if (Test-Path $ProgressFile) {
            Copy-Item $ProgressFile -Destination $ArchiveFolder
        }
        Write-Host "   Archived to: $ArchiveFolder"
        
        # Reset progress file for new run
        $progressHeader = @"
# Ralph Progress Log
Started: $(Get-Date)
---
"@
        Set-Content -Path $ProgressFile -Value $progressHeader
    }
}

# Track current branch
if (Test-Path $PrdFile) {
    try {
        $prdContent = Get-Content $PrdFile -Raw | ConvertFrom-Json
        if ($prdContent.branchName) {
            Set-Content -Path $LastBranchFile -Value $prdContent.branchName
        }
    } catch {
        # Ignore parsing errors
    }
}

# Initialize progress file if it doesn't exist
if (-not (Test-Path $ProgressFile)) {
    $progressHeader = @"
# Ralph Progress Log
Started: $(Get-Date)
---
"@
    Set-Content -Path $ProgressFile -Value $progressHeader
}

Write-Host "Starting Ralph - Max iterations: $MaxIterations"
Write-Host ""

for ($i = 1; $i -le $MaxIterations; $i++) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════"
    Write-Host "  Ralph Iteration $i of $MaxIterations"
    Write-Host "═══════════════════════════════════════════════════════"
    
    # Run antigravity with the ralph prompt
    $PromptFile = Join-Path $ScriptDir "prompt.md"
    $PromptContent = Get-Content $PromptFile -Raw
    
    try {
        $Output = $PromptContent | antigravity --dangerously-allow-all 2>&1 | Tee-Object -Variable OutputCapture
        $Output | Write-Host
    } catch {
        Write-Host "Error running antigravity: $_"
    }
    
    # Check for completion signal
    if ($Output -match "<promise>COMPLETE</promise>") {
        Write-Host ""
        Write-Host "Ralph completed all tasks!"
        Write-Host "Completed at iteration $i of $MaxIterations"
        exit 0
    }
    
    Write-Host "Iteration $i complete. Continuing..."
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "Ralph reached max iterations ($MaxIterations) without completing all tasks."
Write-Host "Check $ProgressFile for status."
exit 1
