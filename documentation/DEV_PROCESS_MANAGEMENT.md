# Development Process Management Guide (Windows)

This document provides instructions on how to manage and terminate development processes (Frontend and Backend) when they become unresponsive or need to be forcefully restarted.

## Common Scenarios
- **Backend (Python/Uvicorn)**: Port 8000 is already in use.
- **Frontend (Angular/Node)**: Port 4200 is already in use.
- Script execution is blocked by a running process.

## Killing Processes via PowerShell

You can use the following PowerShell commands to find and kill processes by name or port.

### 1. Kill by Process Name

**To kill all Python processes (Backend):**
```powershell
Stop-Process -Name "python" -Force
```

**To kill all Node processes (Frontend):**
```powershell
Stop-Process -Name "node" -Force
```

### 2. Kill by Port Number

If you need to kill a specific process running on a port (e.g., 8000 or 4200):

**Find the PID (Process ID):**
```powershell
netstat -ano | findstr :8000
```
*Example Output:* `TCP    0.0.0.0:8000           0.0.0.0:0              LISTENING       1234`

**Kill the process using the PID (e.g., 1234):**
```powershell
Stop-Process -Id 1234 -Force
```

## Killing Processes via Command Prompt (cmd)

**To kill all Python processes:**
```cmd
taskkill /F /IM python.exe
```

**To kill all Node processes:**
```cmd
taskkill /F /IM node.exe
```

### 3. Kill by Process ID (PID)

If you already know the PID (e.g., 1234):

**PowerShell:**
```powershell
Stop-Process -Id 1234 -Force
```

**CMD:**
```cmd
taskkill /PID 1234 /F
```

## "One-Liner" Reset Script

You can save this as `kill_dev.ps1` in your project root to quickly reset your environment:

```powershell
# kill_dev.ps1
Write-Host "Killing Python and Node processes..."
Stop-Process -Name "python" -Force -ErrorAction SilentlyContinue
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Write-Host "Done."
```
