# Create Environment File Script
# Run this in PowerShell from the project root

$envContent = @"
VITE_SUPABASE_URL=https://yzxkrwegoqlrmuhldsgy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6eGtyd2Vnb3Fscm11aGxkc2d5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAxNzE5ODksImV4cCI6MjA3NTc0Nzk4OX0.kK_6n8KmdGlXdb601tgkHYyyCxJTNNQYs5rFeng-h1A
"@

$envPath = "client\.env.local"

# Create the directory if it doesn't exist
if (!(Test-Path "client")) {
    New-Item -ItemType Directory -Path "client"
}

# Write the environment file
$envContent | Out-File -FilePath $envPath -Encoding UTF8

Write-Host "✅ Environment file created at: $envPath"
Write-Host "📝 Content:"
Get-Content $envPath
Write-Host ""
Write-Host "🚀 Now restart your dev server with: npm run dev"
