$headers = New-Object "System.Collections.Generic.Dictionary[[String],[String]]"
$headers.Add("Content-Type", "application/json")
$headers.Add("Authorization", "Basic Y2tfYTdjNGVlM2U5NTc1MDI4MWQ5MTg1MmRlOTJkMjc1NWNkMDUyZGUyMjpjc18yNWU4NDQ4YzZkMWE1YzdkYTlhMGFlMDE0Y2M4ZWQ2YzViMGU2MWE5")

$body = @"
{
    `"otp`":4081
}
"@

$response = Invoke-RestMethod 'https://zardan.com/wp-json/phone/v1/verify-otp/9100261726' -Method 'POST' -Headers $headers -Body $body
$response | ConvertTo-Json