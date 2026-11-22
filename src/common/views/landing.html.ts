export function getLandingHtml(): string {
  return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planora API — Event Management & Ticketing Engine</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%236366f1'><path d='M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5'/></svg>">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          },
          colors: {
            brand: {
              50: '#eef2ff',
              100: '#e0e7ff',
              400: '#818cf8',
              500: '#6366f1',
              600: '#4f46e5',
              700: '#4338ca',
            }
          }
        }
      }
    }
  </script>
  <style>
    body {
      background: radial-gradient(ellipse 80% 80% at 50% -20%, rgba(99, 102, 241, 0.15), rgba(15, 23, 42, 1));
      background-color: #0b0f19;
    }
    .glass-card {
      background: rgba(17, 24, 39, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
    }
    .glass-card:hover {
      border-color: rgba(99, 102, 241, 0.3);
      transform: translateY(-2px);
    }
    .gradient-text {
      background: linear-gradient(135deg, #a5b4fc 0%, #6366f1 50%, #c084fc 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .pulse-dot {
      box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
      }
      70% {
        box-shadow: 0 0 0 8px rgba(34, 197, 94, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
      }
    }
  </style>
</head>
<body class="text-slate-100 min-h-screen font-sans selection:bg-brand-500 selection:text-white">

  <!-- Top Announcement Bar -->
  <header class="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-brand-500/25">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <span class="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            PLANORA <span class="text-xs px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 font-mono font-medium border border-brand-500/30">API v1.0</span>
          </span>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <div class="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
          <span class="w-2 h-2 rounded-full bg-emerald-400 pulse-dot"></span>
          <span>All Systems Operational</span>
        </div>
        <a href="/docs" class="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-semibold transition-all duration-200 shadow-md shadow-brand-600/30 flex items-center gap-2">
          <span>Swagger Docs</span>
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  </header>

  <!-- Hero Section -->
  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
    <div class="text-center max-w-3xl mx-auto">
      <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/60 text-slate-300 text-xs font-mono mb-6">
        <span>⚡ Built with NestJS 12 & Clean Architecture</span>
      </div>

      <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
        Event Management & <br class="hidden sm:block"/>
        <span class="gradient-text">Ticketing Platform API</span>
      </h1>

      <p class="text-base sm:text-lg text-slate-400 mb-8 leading-relaxed">
        Enterprise-grade, scalable serverless REST API engineered with NestJS, Prisma 7 ORM, Better Auth, Stripe checkout, Cloudinary media storage, and comprehensive OpenAPI documentation.
      </p>

      <div class="flex flex-wrap items-center justify-center gap-4">
        <a href="/docs" class="px-6 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-brand-600/25 transition flex items-center gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
          Explore Swagger API Docs
        </a>
        <a href="/docs-json" target="_blank" class="px-6 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 font-semibold text-sm transition flex items-center gap-2">
          <svg class="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
          OpenAPI JSON Spec
        </a>
        <button onclick="testPing()" class="px-6 py-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-sm transition flex items-center gap-2">
          <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          Live Ping Test
        </button>
      </div>
    </div>

    <!-- Live Platform Statistics Bar -->
    <div class="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-5xl mx-auto">
      <div class="glass-card rounded-2xl p-5 text-center transition">
        <div class="text-3xl font-extrabold text-brand-400 font-mono" id="stat-events">16</div>
        <div class="text-xs text-slate-400 uppercase tracking-wider font-medium mt-1">Core Modules</div>
      </div>
      <div class="glass-card rounded-2xl p-5 text-center transition">
        <div class="text-3xl font-extrabold text-emerald-400 font-mono">66+</div>
        <div class="text-xs text-slate-400 uppercase tracking-wider font-medium mt-1">Documented Endpoints</div>
      </div>
      <div class="glass-card rounded-2xl p-5 text-center transition">
        <div class="text-3xl font-extrabold text-purple-400 font-mono">&lt; 200ms</div>
        <div class="text-xs text-slate-400 uppercase tracking-wider font-medium mt-1">Vercel Cold Boot</div>
      </div>
      <div class="glass-card rounded-2xl p-5 text-center transition">
        <div class="text-3xl font-extrabold text-amber-400 font-mono">99.9%</div>
        <div class="text-xs text-slate-400 uppercase tracking-wider font-medium mt-1">Uptime Guarantee</div>
      </div>
    </div>

    <!-- Interactive Live Playground Section -->
    <div class="mt-16 max-w-5xl mx-auto">
      <div class="glass-card rounded-3xl p-6 sm:p-8">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
          <div>
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <span class="w-3 h-3 rounded-full bg-brand-500"></span>
              Live API Explorer
            </h2>
            <p class="text-xs text-slate-400 mt-1">Click any quick endpoint below to test live JSON response directly from the database.</p>
          </div>
          <div class="flex items-center gap-2 flex-wrap">
            <button onclick="runSample('api/v1/category', this)" class="sample-btn px-3 py-1.5 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/40 text-xs font-mono hover:bg-brand-500/30 transition">
              GET /category
            </button>
            <button onclick="runSample('api/v1/banner/active', this)" class="sample-btn px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono hover:bg-slate-700 transition">
              GET /banner/active
            </button>
            <button onclick="runSample('api/v1/stat/public', this)" class="sample-btn px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono hover:bg-slate-700 transition">
              GET /stat/public
            </button>
            <button onclick="runSample('api/v1/event', this)" class="sample-btn px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono hover:bg-slate-700 transition">
              GET /event
            </button>
          </div>
        </div>

        <div class="mt-6">
          <div class="flex items-center justify-between bg-slate-950 px-4 py-2.5 rounded-t-xl border border-slate-800 border-b-0 font-mono text-xs text-slate-400">
            <span id="current-endpoint" class="text-emerald-400">GET https://planora02.vercel.app/api/v1/category</span>
            <span id="response-status" class="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800">200 OK</span>
          </div>
          <pre id="json-output" class="bg-slate-950/90 border border-slate-800 rounded-b-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-72">Loading preview...</pre>
        </div>
      </div>
    </div>

    <!-- Modules Architecture Grid -->
    <div class="mt-20">
      <div class="text-center mb-12">
        <h2 class="text-3xl font-extrabold text-white tracking-tight">API Ecosystem & Modules</h2>
        <p class="text-sm text-slate-400 mt-2">Comprehensive architectural breakdown of all 16 integrated modules.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        <!-- Auth -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-4">🔐</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            Auth & OAuth
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">11 routes</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">Better Auth integration with Google OAuth2 social login, session cookies, JWT token rotation, OTP verification, and password reset.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/auth</span>
            <a href="/docs#/Auth" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>

        <!-- Event -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold mb-4">🎪</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            Events Management
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">10 routes</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">Physical, virtual & hybrid events. Filter by category, location, featured spotlights, dates, and dynamic organizer controls.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/event</span>
            <a href="/docs#/Event" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>

        <!-- Ticket -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4">🎟️</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            Tickets & QR Scanning
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">3 routes</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">Unique ticket generation with QR code security, instant check-in verification for event gates, and purchased ticket wallets.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/ticket</span>
            <a href="/docs#/Ticket" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>

        <!-- Payment -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold mb-4">💳</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            Stripe Payments
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">5 routes</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">Stripe Checkout session initialization, raw webhook signature verification, automatic PDF invoice generation, and payouts.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/payment</span>
            <a href="/docs#/Payment" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>

        <!-- Participation -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold mb-4">👥</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            Participation & Attendees
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">4 routes</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">Attendee tracking, registration status updates (APPROVED, REJECTED, BANNED), and organizer participant rosters.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/participation</span>
            <a href="/docs#/Participation" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>

        <!-- Review -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center font-bold mb-4">⭐</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            Reviews & Ratings
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">6 routes</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">Verified attendee star ratings, feedback comments, organizer sentiment analytics, and moderation tools.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/review</span>
            <a href="/docs#/Review" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>

        <!-- Category -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center font-bold mb-4">🏷️</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            Categories Taxonomy
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">5 routes</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">Event categories taxonomy, custom icons, admin management, and categorization filters for frontend discovery.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/category</span>
            <a href="/docs#/Category" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>

        <!-- Banner -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold mb-4">🖼️</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            Promotional Banners
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">6 routes</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">Dynamic homepage hero carousel banners, position ordering, click-through links, and active/inactive toggles.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/banner</span>
            <a href="/docs#/Banner" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>

        <!-- File -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold mb-4">📁</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            Cloudinary Media
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">2 routes</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">Multipart image upload to Cloudinary (up to 10 images per batch) with automated web optimization and deletion endpoints.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/file</span>
            <a href="/docs#/File" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>

        <!-- Invitation -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold mb-4">✉️</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            Speaker Invitations
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">4 routes</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">Invite VIPs, speakers, and special guests. Status tracking, acceptance flows, and invitation notifications.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/invitation</span>
            <a href="/docs#/Invitation" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>

        <!-- Notification -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold mb-4">🔔</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            User Notifications
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">4 routes</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">System notifications, event reminder alerts, unread counters, and instant mark-all-read operations.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/notification</span>
            <a href="/docs#/Notification" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>

        <!-- Stats & Analytics -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold mb-4">📊</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            Analytics & Metrics
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">5 routes</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">Tiered analytics: Superadmin macro figures, organizer ticket revenue, attendee participation trends, and public counts.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/stat</span>
            <a href="/docs#/Stat" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>

        <!-- Admin -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold mb-4">🛡️</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            SuperAdmin Control
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">7 routes</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">User role management, account status control (ACTIVE/BLOCKED), supervisor delegation, and user termination.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/admin</span>
            <a href="/docs#/Admin" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>

        <!-- Audit -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold mb-4">📜</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            Audit Trails
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">1 route</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">Complete security and administrative logs. Tracks user modifications, event deletions, and role escalations.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/audit</span>
            <a href="/docs#/Audit" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>

        <!-- Profile -->
        <div class="glass-card rounded-2xl p-6 transition">
          <div class="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold mb-4">👤</div>
          <h3 class="text-lg font-bold text-white mb-2 flex items-center justify-between">
            User Profile
            <span class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">2 routes</span>
          </h3>
          <p class="text-xs text-slate-400 leading-relaxed">Profile inspection, avatar customization, personal metadata, and secure credentials synchronization.</p>
          <div class="mt-4 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span class="font-mono text-brand-400">/api/v1/profile</span>
            <a href="/docs#/Profile" class="text-slate-400 hover:text-white transition">View in Docs &rarr;</a>
          </div>
        </div>
      </div>
    </div>

    <!-- Tech Stack Specs -->
    <div class="mt-20 glass-card rounded-3xl p-8 border border-slate-800">
      <div class="text-center mb-8">
        <h3 class="text-xl font-bold text-white">Under The Hood & Tech Stack</h3>
        <p class="text-xs text-slate-400 mt-1">Engineered with modern, zero-level clean backend principles.</p>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">⚡ NestJS 12</span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">🐘 PostgreSQL</span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">💎 Prisma 7 ORM</span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">🔐 Better-Auth</span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">💳 Stripe API</span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">☁️ Cloudinary SDK</span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">📜 OpenAPI / Swagger</span>
        <span class="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">▲ Vercel Serverless</span>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="border-t border-slate-900 py-8 mt-16 bg-slate-950/80 text-center text-xs text-slate-500 font-mono">
    <div class="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        &copy; 2026 Planora Platform. All rights reserved.
      </div>
      <div class="flex items-center space-x-6">
        <a href="/docs" class="hover:text-brand-400 transition">Swagger UI</a>
        <a href="/docs-json" class="hover:text-brand-400 transition">OpenAPI JSON</a>
        <a href="/api/auth" class="hover:text-brand-400 transition">Auth Status</a>
      </div>
    </div>
  </footer>

  <script>
    async function runSample(endpoint, btn) {
      if (btn) {
        document.querySelectorAll('.sample-btn').forEach(b => {
          b.classList.remove('bg-brand-500/20', 'text-brand-300', 'border-brand-500/40');
          b.classList.add('bg-slate-800', 'text-slate-300', 'border-slate-700');
        });
        btn.classList.remove('bg-slate-800', 'text-slate-300', 'border-slate-700');
        btn.classList.add('bg-brand-500/20', 'text-brand-300', 'border-brand-500/40');
      }

      const fullUrl = window.location.origin + '/' + endpoint;
      document.getElementById('current-endpoint').innerText = 'GET ' + fullUrl;
      const output = document.getElementById('json-output');
      const statusBadge = document.getElementById('response-status');
      output.innerText = 'Fetching ' + fullUrl + '...';

      try {
        const start = performance.now();
        const res = await fetch('/' + endpoint);
        const duration = Math.round(performance.now() - start);
        const data = await res.json();
        
        statusBadge.innerText = res.status + ' ' + res.statusText + ' (' + duration + 'ms)';
        statusBadge.className = 'px-2 py-0.5 rounded text-xs border ' + 
          (res.ok ? 'bg-emerald-950 text-emerald-400 border-emerald-800' : 'bg-red-950 text-red-400 border-red-800');
        
        output.innerText = JSON.stringify(data, null, 2);
      } catch (err) {
        statusBadge.innerText = 'Network Error';
        statusBadge.className = 'px-2 py-0.5 rounded text-xs border bg-red-950 text-red-400 border-red-800';
        output.innerText = err.message;
      }
    }

    async function testPing() {
      await runSample('api/v1/stat/public');
    }

    // Auto load categories on page open
    window.addEventListener('DOMContentLoaded', () => {
      runSample('api/v1/category');
    });
  </script>
</body>
</html>`;
}
