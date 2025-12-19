$ErrorActionPreference = "Stop"

Write-Host "Preparing release.zip..."

# Define items to exclude (folders and files)
$exclude = @(
    "node_modules",
    ".git",
    ".next",
    "dist",
    "build",
    ".vscode",
    "release.zip",
    "coverage",
    "*.log"
)

# Get all items in the current directory except the excluded ones
$items = Get-ChildItem -Path . | Where-Object { $exclude -notcontains $_.Name }

# Create the zip file
if ($items) {
    Compress-Archive -Path $items.FullName -DestinationPath "release.zip" -Force
    Write-Host "Success! 'release.zip' created in the current directory."
} else {
    Write-Error "No files found to zip."
}
