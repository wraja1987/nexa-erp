module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/login'],
      numberOfRuns: 1,
      startServerCommand: 'pnpm -C apps/web start -p 3000',
      startServerReadyPattern: 'ready - started server',
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.5 }],
        'categories:accessibility': ['warn', { minScore: 0.8 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],
        'uses-responsive-images': 'warn',
        'uses-optimized-images': 'warn'
      }
    },
    upload: { target: 'temporary-public-storage' }
  }
}




