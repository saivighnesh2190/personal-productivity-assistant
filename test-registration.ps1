# PowerShell script to test registration
$body = @{
    username = "testuser123"
    email = "test123@example.com"
    password = "password123"
    fullName = "Test User"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/auth/register" -Method POST -Headers $headers -Body $body
    Write-Host "Registration successful!" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "Registration failed:" -ForegroundColor Red
    Write-Host $_.Exception.Message
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:" $_.ErrorDetails.Message
    }
}
