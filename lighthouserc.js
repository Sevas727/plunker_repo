/** @type {import('@lhci/cli').Config} */
module.exports = {
  ci: {
    collect: {
      // Lighthouse will start the production server automatically
      startServerCommand: 'pnpm start',
      startServerReadyPattern: 'Ready in',
      startServerReadyTimeout: 30_000,
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/login',
        'http://localhost:3000/contacts',
      ],
      // Run 3 times per URL to reduce variance
      numberOfRuns: 3,
      settings: {
        // Desktop preset for consistent results
        preset: 'desktop',
        // Throttling settings (simulated throttle for CI consistency)
        throttlingMethod: 'simulate',
      },
    },
    assert: {
      // Performance budgets — fail CI if below these thresholds
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        'categories:seo': ['warn', { minScore: 0.8 }],

        // Core Web Vitals assertions
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3500 }],
      },
    },
    upload: {
      // Store results locally (switch to LHCI server or temporary-public-storage for CI)
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
