$body = @{
    username = 'testuser123'
    email = 'testuser123@example.com'
    password = 'password123'
    fullName = 'Test User'
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:8080/api/auth/register' -Method Post -ContentType 'application/json' -Body $body -UseBasicParsing -ErrorAction Stop
    Write-Output "STATUS:$($response.StatusCode)"
    Write-Output "CONTENT:$($response.Content)"
}
catch {
    if ($_.Exception.Response -ne $null) {
        $resp = $_.Exception.Response
        $status = [int]$resp.StatusCode
        $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
        $content = $reader.ReadToEnd()
        Write-Output "STATUS:$status"
        Write-Output "CONTENT:$content"
    }
    else {
        Write-Output "ERROR:$($_.Exception.Message)"
    }
}
