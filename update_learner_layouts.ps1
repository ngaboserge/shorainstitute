# Update learner pages to use ResponsiveLayout

$files = @(
    @{path="src/pages/learner/Seminars.jsx"; title="Live Seminars"; subtitle="Join expert-led sessions and expand your network"},
    @{path="src/pages/learner/LearningPaths.jsx"; title="Learning Paths"; subtitle="Structured learning journeys to master financial topics"},
    @{path="src/pages/learner/Assessments.jsx"; title="Assessments"; subtitle="Test your knowledge and track your progress"},
    @{path="src/pages/learner/Resources.jsx"; title="Resource Library"; subtitle="Download guides, templates, and materials to support your learning"},
    @{path="src/pages/learner/Community.jsx"; title="Community"; subtitle="Connect with peers, ask questions, and share insights"},
    @{path="src/pages/learner/Profile.jsx"; title="My Profile"; subtitle="Manage your account and learning preferences"},
    @{path="src/pages/learner/Certificates.jsx"; title="My Certificates"; subtitle="View and download your earned certificates"}
)

foreach ($fileInfo in $files) {
    $filePath = $fileInfo.path
    $title = $fileInfo.title
    $subtitle = $fileInfo.subtitle
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw
        
        # Pattern 1: Update loading state
        $loadingPattern = '(?s)if \(loading\) \{.*?return \((.*?)<div className="dashboard-layout">(.*?)<Sidebar type="learner" />(.*?)<div className="main-content">(.*?)</div>(.*?)</div>(.*?)</div>(.*?)\)'
        $loadingReplacement = @"
if (loading) {
    return (
      <ResponsiveLayout 
        title="$title"
        subtitle="Loading..."
        type="learner"
      >
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <p>Loading...</p>
        </div>
      </ResponsiveLayout>
    )
  }
"@
        
        # Pattern 2: Update main return statement
        $pattern = '(?s)return \((.*?)<div className="dashboard-layout">(.*?)<Sidebar type="learner" />(.*?)<div className="main-content">(.*?)<Header (.*?)\/>(.*?)<div className="content-wrapper">'
        $replacement = @"
return (
    <ResponsiveLayout 
      title="$title"
      subtitle="$subtitle"
      type="learner"
    >
"@
        
        # Pattern 3: Update closing tags
        $closingPattern = '</div>(.*?)</div>(.*?)</div>(.*?)\)(.*?)}\s*export default'
        $closingReplacement = @"
</div>
    </ResponsiveLayout>
  )
}

export default
"@
        
        # Apply replacements
        if ($content -match $loadingPattern) {
            $content = $content -replace $loadingPattern, $loadingReplacement
        }
        
        if ($content -match $pattern) {
            $content = $content -replace $pattern, $replacement
        }
        
        if ($content -match $closingPattern) {
            $content = $content -replace $closingPattern, $closingReplacement
        }
        
        Set-Content -Path $filePath -Value $content -NoNewline
        Write-Host "Updated $filePath"
    } else {
        Write-Host "File not found: $filePath" -ForegroundColor Yellow
    }
}

Write-Host "`nAll files updated successfully!" -ForegroundColor Green
