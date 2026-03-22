# ============================================================
# Claude Code Local Startup Script
# Stack: Ollama + Qwen2.5-Coder | Fallback: Antigravity / CCR
# ============================================================

param (
    [string]$Model = "qwen2.5-coder:7b",
    [string]$Mode = "direct",   # "direct" | "ccr" | "cloud"
    [string]$Project = ""          # Percorso opzionale al progetto (es. "C:\dev\streamflix")
)

# ── Helpers ─────────────────────────────────────────────────

function Write-Step { param($msg) Write-Host "`n$msg" -ForegroundColor Cyan }
function Write-OK { param($msg) Write-Host "  ✅ $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "  ⚠️  $msg" -ForegroundColor Yellow }
function Write-Fail { param($msg) Write-Host "  ❌ $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "     $msg" -ForegroundColor Gray }

# ── Banner ───────────────────────────────────────────────────

Write-Host ""
Write-Host "╔══════════════════════════════════════════════╗" -ForegroundColor Magenta
Write-Host "║     Claude Code · Local AI Setup             ║" -ForegroundColor Magenta
Write-Host "║     Mode: $($Mode.PadRight(10)) Model: $($Model.PadRight(20))║" -ForegroundColor Magenta
Write-Host "╚══════════════════════════════════════════════╝" -ForegroundColor Magenta

# ── 1. Modalità: imposta variabili d'ambiente ─────────────────

Write-Step "Configurazione ambiente ($Mode)..."

switch ($Mode) {

    "cloud" {
        # Antigravity Claude Proxy (Gemini/Claude via proxy gratuito)
        $env:ANTHROPIC_BASE_URL = "http://localhost:8080"
        $env:ANTHROPIC_API_KEY = "antigravity"
        Write-OK "Modalità Cloud (Antigravity)"
        Write-Info "Assicurati che antigravity-claude-proxy sia in esecuzione su porta 8080."
        Write-Info "Login → http://localhost:8080"
    }

    "ccr" {
        # Claude Code Router – migliora il tool-calling con modelli locali
        if ($null -eq (Get-Command "ccr" -ErrorAction SilentlyContinue)) {
            Write-Warn "'ccr' non trovato. Installalo con:"
            Write-Info  "npm install -g @musistudio/claude-code-router"
            Write-Warn  "Fallback a modalità diretta Ollama."
            $env:ANTHROPIC_BASE_URL = "http://localhost:11434"
            $env:ANTHROPIC_API_KEY = "ollama"
        }
        else {
            $env:ANTHROPIC_BASE_URL = "http://localhost:3456"
            $env:ANTHROPIC_API_KEY = "ollama"
            Write-OK "Modalità CCR"
            Write-Info "Assicurati che 'ccr start' sia in esecuzione."
        }
    }

    default {
        # ── Modalità diretta Ollama (consigliata) ──────────────────

        # 1a. Controlla se Ollama risponde già
        Write-Step "Controllo Ollama..."
        $ollamaRunning = $false
        try {
            $resp = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 3 -ErrorAction Stop
            $ollamaRunning = $true
        }
        catch { }

        if (-not $ollamaRunning) {
            Write-Warn "Ollama non è in esecuzione. Avvio in corso..."
            $env:OLLAMA_CONTEXT_LENGTH = "20000"

            # Cerca l'eseguibile ollama
            $ollamaBin = Get-Command "ollama" -ErrorAction SilentlyContinue
            if ($null -eq $ollamaBin) {
                Write-Fail "Ollama non trovato nel PATH. Installalo da https://ollama.com"
                exit 1
            }

            Start-Process -FilePath "ollama" -ArgumentList "serve" -WindowStyle Hidden
            Write-Info "Attendo avvio Ollama..."
            $timeout = 15
            $elapsed = 0
            while (-not $ollamaRunning -and $elapsed -lt $timeout) {
                Start-Sleep -Seconds 1
                $elapsed++
                try {
                    Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 2 -ErrorAction Stop | Out-Null
                    $ollamaRunning = $true
                }
                catch { }
            }
            if (-not $ollamaRunning) {
                Write-Fail "Ollama non risponde dopo $timeout secondi. Controlla l'installazione."
                exit 1
            }
            Write-OK "Ollama avviato (context: 20k token)"
        }
        else {
            Write-OK "Ollama già in esecuzione"
            # Imposta context length per la sessione anche se Ollama era già aperto
            $env:OLLAMA_CONTEXT_LENGTH = "20000"
        }

        # 1b. Verifica che il modello sia disponibile localmente
        Write-Step "Verifica modello '$Model'..."
        try {
            $tags = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -ErrorAction Stop
            $available = $tags.models | Where-Object { $_.name -like "$Model*" }
            if ($null -eq $available) {
                Write-Warn "Modello '$Model' non trovato localmente. Download in corso..."
                ollama pull $Model
                if ($LASTEXITCODE -ne 0) {
                    Write-Fail "Impossibile scaricare il modello. Controlla la connessione."
                    exit 1
                }
                Write-OK "Modello scaricato."
            }
            else {
                Write-OK "Modello '$Model' disponibile"
            }
        }
        catch {
            Write-Warn "Impossibile verificare il modello. Procedo comunque."
        }

        $env:ANTHROPIC_BASE_URL = "http://localhost:11434"
        $env:ANTHROPIC_API_KEY = "ollama"
        Write-OK "Modalità diretta Ollama attiva"
        Write-Info "ANTHROPIC_BASE_URL = $env:ANTHROPIC_BASE_URL"
        Write-Info "ANTHROPIC_API_KEY  = ollama (dummy)"
        Write-Info "OLLAMA_CONTEXT_LENGTH = $env:OLLAMA_CONTEXT_LENGTH"
    }
}

# ── 2. Navigazione al progetto ────────────────────────────────

if ($Project -ne "") {
    if (Test-Path $Project) {
        Write-Step "Navigazione al progetto..."
        Set-Location $Project
        Write-OK "Directory: $Project"

        # Mostra stack se esiste CLAUDE.md
        if (Test-Path "CLAUDE.md") {
            Write-Info "CLAUDE.md trovato → orchestrazione attiva (plan mode, subagents, lessons)"
        }
    }
    else {
        Write-Warn "Percorso progetto non trovato: $Project"
        Write-Info "Continuo dalla directory corrente: $(Get-Location)"
    }
}

# ── 3. Avvio Claude Code ──────────────────────────────────────

Write-Step "Avvio Claude Code..."
Write-Info "Modello: $Model"
Write-Info "Tip: se il tool-calling fallisce, riprova con -Mode ccr"
Write-Host ""

claude --model $Model