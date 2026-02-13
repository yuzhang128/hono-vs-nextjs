import { useState } from 'react'
import { CodeBlock } from './components/CodeBlock'
import { FileTree } from './components/FileTree'

const nextjsFileTree = `app/
├── api/
│   ├── users/
│   │   └── route.ts        ← GET /api/users
│   ├── posts/
│   │   ├── route.ts        ← GET /api/posts
│   │   └── [id]/
│   │       └── route.ts    ← GET /api/posts/:id
│   ├── auth/
│   │   ├── login/
│   │   │   └── route.ts    ← POST /api/auth/login
│   │   └── logout/
│   │       └── route.ts    ← POST /api/auth/logout
│   └── comments/
│       └── route.ts        ← GET /api/comments

6 files for 6 endpoints
⚠️ Adding a new endpoint = create a new file`

const honoFileTree = `app/
└── api/
    └── [[...route]]/
        └── route.ts        ← ALL endpoints here!

// Inside route.ts:
import { Hono } from 'hono'
import { handle } from 'hono/vercel'

const app = new Hono().basePath('/api')

app.get('/users', ...)
app.get('/posts', ...)
app.get('/posts/:id', ...)
app.post('/auth/login', ...)
app.post('/auth/logout', ...)
app.get('/comments', ...)

export const GET = handle(app)
export const POST = handle(app)

✅ 1 file for all endpoints
✅ Adding new endpoint = add one line`

const nextjsAuthCode = `// lib/auth.ts
export async function verifyAuth(request: Request) {
  const token = request.headers.get('authorization')
  if (!token) throw new Error('Unauthorized')
  return { userId: '123' }
}

// app/api/users/route.ts
import { verifyAuth } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const { userId } = await verifyAuth(request)
    return Response.json({ users: [], userId })
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}

// app/api/posts/route.ts - Must repeat auth logic
export async function GET(request: Request) {
  try {
    const { userId } = await verifyAuth(request)
    // ... repeated pattern
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }
}`

const honoAuthCode = `// app/api/[[...route]]/route.ts
import { Hono } from 'hono'

const app = new Hono().basePath('/api')

// Auth middleware - defined once
app.use('/protected/*', async (c, next) => {
  const token = c.req.header('authorization')
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  c.set('userId', '123')  // Store in context
  await next()
})

// All protected routes automatically inherit auth
app.get('/protected/users', (c) => {
  const userId = c.get('userId')  // Retrieve from context
  return c.json({ users: [], userId })
})

app.get('/protected/posts', (c) => {
  const userId = c.get('userId')
  // No auth logic needed here
  return c.json({ posts: [], userId })
})`

const nextjsErrorCode = `// app/api/users/route.ts
export async function GET() {
  try {
    const users = await fetchUsers()
    return Response.json({ users })
  } catch (error) {
    return Response.json(
      { message: 'An error occurred' },
      { status: 500 }
    )
  }
}

// app/api/posts/route.ts - Different error format
export async function GET() {
  try {
    const posts = await fetchPosts()
    return Response.json({ posts })
  } catch (err) {
    return Response.json(
      { error: 'Failed to load', details: err.message },
      { status: 500 }
    )
  }
}

// Inconsistent error formats across routes`

const honoErrorCode = `import { Hono, HTTPException } from 'hono'

const app = new Hono()

// Global error handler - catches ALL errors
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse()
  }
  console.error('Server error:', err)
  return c.json({
    error: 'internal_server_error',
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500)
})

// Throw anywhere - consistent format guaranteed
app.get('/users/:id', async (c) => {
  const id = c.req.param('id')
  if (!id) {
    throw new HTTPException(400, { message: 'Invalid ID' })
  }
  const user = await getUser(id)
  if (!user) {
    throw new HTTPException(404, { message: 'User not found' })
  }
  return c.json({ user })
})

// All errors follow the same format`

const nextjsMiddlewareCode = `// middleware.ts
// ⚠️ Next.js middleware is NOT designed for API layer
// Official docs: "Do not recommend Middleware as sole 
// method of protecting routes"

// Designed for: redirects, rewrites, page-level auth
// NOT for: API authentication, business logic

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  
  // ✅ Good: Page-level redirects
  if (path.startsWith('/dashboard')) {
    const session = request.cookies.get('session')
    if (!session) {
      return NextResponse.redirect('/login')
    }
  }
  return NextResponse.next()
}

// Exclude API routes - middleware shouldn't touch APIs
export const config = {
  matcher: ['/((?!api|_next).*)'],
}`

const honoMiddlewareCode = `// app/api/[[...route]]/route.ts
import { Hono } from 'hono'

const app = new Hono().basePath('/api')

// ✅ Hono middleware runs WITHIN your API handler
// Perfect for: auth, logging, validation, CORS

app.use('/protected/*', async (c, next) => {
  const token = c.req.header('authorization')
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }
  // Verify token, set user in context
  c.set('userId', verifyToken(token))
  await next()
})

// Protected routes automatically inherit auth
app.get('/protected/users', (c) => {
  const userId = c.get('userId')
  return c.json({ users: [], userId })
})`

const nextjsRoutingCode = `// Routing is implicit via file structure
// Each folder = route segment
// Each route.ts = endpoint handler

app/
├── api/
│   ├── users/
│   │   ├── route.ts        → /api/users
│   │   └── [id]/
│   │       └── route.ts    → /api/users/:id
│   └── posts/
│       └── route.ts        → /api/posts

// route.ts exports HTTP methods
export async function GET(request: Request) { }
export async function POST(request: Request) { }
export async function PUT(request: Request) { }
export async function DELETE(request: Request) { }

// No explicit route registration
// Routes determined by file location`

const honoRoutingCode = `// app/api/[[...route]]/route.ts
import { Hono } from 'hono'

const app = new Hono().basePath('/api')

// Explicit, programmatic routing
app.get('/users', listUsers)
app.get('/users/:id', getUser)
app.post('/users', createUser)
app.put('/users/:id', updateUser)
app.delete('/users/:id', deleteUser)

// Route groups with shared middleware
const protectedRoutes = new Hono()
protectedRoutes.use('*', authMiddleware)
protectedRoutes.get('/profile', getProfile)
protectedRoutes.put('/profile', updateProfile)

app.route('/protected', protectedRoutes)

// Mount sub-apps
import { blogApp } from './blog'
app.route('/blog', blogApp)

// Full control over routing structure
export const GET = handle(app)
export const POST = handle(app)
export const PUT = handle(app)
export const DELETE = handle(app)`

const honoRpcServerCode = `// server.ts
import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'

const app = new Hono()

const postSchema = z.object({
  title: z.string().min(1),
  body: z.string(),
})

const routes = app
  .get('/posts', (c) => c.json({ posts: [] }))
  .post('/posts', 
    zValidator('json', postSchema),
    (c) => {
      const { title, body } = c.req.valid('json')
      return c.json({ created: true, title, body }, 201)
    }
  )
  .get('/posts/:id', (c) => {
    const id = c.req.param('id')
    return c.json({ id, title: 'Post Title', body: 'Content' })
  })

// Export type for client
export type AppRoutes = typeof routes
export default app`

const honoRpcClientCode = `// client.ts (in frontend or another project)
import { hc } from 'hono/client'
import type { AppRoutes } from './server'

// Create type-safe client
const client = hc<AppRoutes>('http://localhost:3000/api/')

// Full TypeScript support
const response = await client.posts.$get()
const data = await response.json()
//    ^? { posts: [] }

// Type-safe POST with validation
const createRes = await client.posts.$post({
  json: {
    title: 'Hello',
    body: 'World',
  }
})

// Auto-completion for all routes
// Compile-time error for wrong params
const post = await client.posts[':id'].$get({
  param: { id: '123' }
})`

type TabType = 'structure' | 'auth' | 'error' | 'middleware' | 'routing'

const comparisons: Record<TabType, { title: string; nextjs: string; hono: string }> = {
  structure: {
    title: 'File Structure',
    nextjs: 'New endpoint = create new file in nested folder',
    hono: 'New endpoint = add one line of code',
  },
  auth: {
    title: 'Authentication Middleware',
    nextjs: 'Import and call auth function in every route file',
    hono: 'Define once as middleware, applies to all matched routes',
  },
  error: {
    title: 'Error Handling',
    nextjs: 'Per-route try/catch, inconsistent formats possible',
    hono: 'Global error handler, consistent response format',
  },
  middleware: {
    title: 'Middleware',
    nextjs: 'Designed for pages, NOT suitable for API layer (official docs)',
    hono: 'Perfect for API auth, logging, CORS, validation',
  },
  routing: {
    title: 'Route Registration',
    nextjs: 'File-based, implicit from folder structure',
    hono: 'Programmatic, explicit with app.get/post/etc',
  },
}

type BlockItem = 
  | { type: 'tree'; tree: string; title: string }
  | { type: 'code'; code: string; lang: string; title: string }

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="py-6 border-b border-[#3c3c3c] last:border-b-0">
      <h2 className="text-sm font-mono text-[#569cd6] mb-4 flex items-center gap-2">
        <span className="text-[#808080]">//</span> {title}
      </h2>
      {children}
    </section>
  )
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('structure')

  const tabs: { id: TabType; label: string }[] = [
    { id: 'structure', label: 'File Structure' },
    { id: 'routing', label: 'Route Registration' },
    { id: 'auth', label: 'Auth Middleware' },
    { id: 'error', label: 'Error Handling' },
    { id: 'middleware', label: 'Middleware' },
  ]

  const getBlocks = (): BlockItem[] => {
    switch (activeTab) {
      case 'structure':
        return [
          { type: 'tree', tree: nextjsFileTree, title: 'Next.js Route Handlers' },
          { type: 'tree', tree: honoFileTree, title: 'Hono Catch-All Handler' },
        ]
      case 'routing':
        return [
          { type: 'code', code: nextjsRoutingCode, lang: 'typescript', title: 'Next.js File-Based Routing' },
          { type: 'code', code: honoRoutingCode, lang: 'typescript', title: 'Hono Programmatic Routing' },
        ]
      case 'auth':
        return [
          { type: 'code', code: nextjsAuthCode, lang: 'typescript', title: 'Next.js (Manual Per-Route)' },
          { type: 'code', code: honoAuthCode, lang: 'typescript', title: 'Hono (Middleware Chain)' },
        ]
      case 'error':
        return [
          { type: 'code', code: nextjsErrorCode, lang: 'typescript', title: 'Next.js (Inconsistent)' },
          { type: 'code', code: honoErrorCode, lang: 'typescript', title: 'Hono (Global Handler)' },
        ]
      case 'middleware':
        return [
          { type: 'code', code: nextjsMiddlewareCode, lang: 'typescript', title: 'Next.js Middleware' },
          { type: 'code', code: honoMiddlewareCode, lang: 'typescript', title: 'Hono Middleware' },
        ]
      default:
        return []
    }
  }

  const blocks = getBlocks()

  return (
    <div className="min-h-screen bg-[#1e1e1e] flex justify-center py-8 px-4">
      <div className="w-full max-w-6xl rounded-xl overflow-hidden border border-[#3c3c3c] bg-[#1e1e1e] shadow-2xl">
        {/* Title bar */}
        <div className="flex items-center px-4 py-3 bg-[#323233] border-b border-[#3c3c3c]">
          <span className="text-xs text-[#808080] font-mono">hono-vs-nextjs-route-handler.md</span>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          <Section title="Overview">
            <p className="text-[#d4d4d4] leading-relaxed mb-4">
              This comparison explores two approaches to building APIs in a Next.js application:
              using native <span className="text-[#ce9178]">Route Handlers</span> vs integrating 
              <span className="text-[#ce9178]"> Hono</span> as a catch-all handler within Next.js.
            </p>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg p-4 bg-[#252526] border border-[#3c3c3c]">
                <div className="text-[#569cd6] font-medium mb-2">Next.js Route Handlers</div>
                <p className="text-[#808080]">File-based routing with one file per endpoint. Built into Next.js.</p>
              </div>
              <div className="rounded-lg p-4 bg-[#252526] border border-[#3c3c3c]">
                <div className="text-[#4ec9b0] font-medium mb-2">Hono + Next.js</div>
                <p className="text-[#808080]">Hono as catch-all handler in <code className="text-[#ce9178]">app/api/[[...route]]/route.ts</code></p>
              </div>
            </div>
          </Section>

          <Section title="What is Hono?">
            <p className="text-[#d4d4d4] leading-relaxed mb-4">
              <span className="text-[#4ec9b0]">Hono</span> (炎 - "flame" in Japanese) is a lightweight, 
              ultrafast web framework built on Web Standards. When used with Next.js, it runs as a 
              catch-all handler, allowing you to build APIs with Express-like routing and middleware 
              while still deploying on Vercel.
            </p>
            <div className="grid grid-cols-4 gap-3 text-center text-sm">
              <div className="rounded-lg p-3 bg-[#252526] border border-[#3c3c3c]">
                <div className="text-[#4ec9b0] font-bold text-lg">~12KB</div>
                <div className="text-[#808080] text-xs">Bundle</div>
              </div>
              <div className="rounded-lg p-3 bg-[#252526] border border-[#3c3c3c]">
                <div className="text-[#4ec9b0] font-bold text-lg">400K+</div>
                <div className="text-[#808080] text-xs">Ops/sec</div>
              </div>
              <div className="rounded-lg p-3 bg-[#252526] border border-[#3c3c3c]">
                <div className="text-[#4ec9b0] font-bold text-lg">25+</div>
                <div className="text-[#808080] text-xs">Middleware</div>
              </div>
              <div className="rounded-lg p-3 bg-[#252526] border border-[#3c3c3c]">
                <div className="text-[#4ec9b0] font-bold text-lg">v4.11</div>
                <div className="text-[#808080] text-xs">Version</div>
              </div>
            </div>
          </Section>

          <Section title="Detailed Comparison">
            <div className="flex flex-wrap gap-2 mb-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-[#4ec9b0] text-[#1e1e1e]'
                      : 'bg-[#252526] text-[#808080] hover:text-[#d4d4d4] border border-[#3c3c3c]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <p className="text-[#606060] text-xs mb-4">Click tabs to switch comparison topic</p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg p-3 bg-[#252526] border border-[#3c3c3c]">
                <div className="text-[#569cd6] text-xs font-medium mb-1">Next.js Route Handler</div>
                <p className="text-[#808080] text-sm">{comparisons[activeTab].nextjs}</p>
              </div>
              <div className="rounded-lg p-3 bg-[#252526] border border-[#3c3c3c]">
                <div className="text-[#4ec9b0] text-xs font-medium mb-1">Hono Catch-All</div>
                <p className="text-[#808080] text-sm">{comparisons[activeTab].hono}</p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              {blocks.map((block, index) => (
                block.type === 'tree' 
                  ? <FileTree key={index} tree={block.tree} title={block.title} />
                  : <CodeBlock key={index} code={block.code} lang={block.lang} title={block.title} />
              ))}
            </div>
          </Section>

          <Section title="Hono RPC - Type-Safe API Client">
            <p className="text-[#d4d4d4] leading-relaxed mb-4">
              One of Hono's unique features when integrated with Next.js is the ability to share 
              type definitions between server and client. This enables end-to-end type safety 
              without code generation.
            </p>
            <div className="grid lg:grid-cols-2 gap-4">
              <CodeBlock code={honoRpcServerCode} lang="typescript" title="Server (with type export)" />
              <CodeBlock code={honoRpcClientCode} lang="typescript" title="Client (type-safe calls)" />
            </div>
          </Section>

          <Section title="Summary">
            <div className="grid md:grid-cols-2 gap-6 text-sm">
              <div className="rounded-lg p-4 bg-[#252526] border border-[#3c3c3c]">
                <h3 className="text-[#569cd6] font-medium mb-3">Next.js Route Handlers are better when:</h3>
                <ul className="space-y-2 text-[#808080]">
                  <li className="flex gap-2">
                    <span className="text-[#4ec9b0]">•</span>
                    Simple API with few endpoints
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#4ec9b0]">•</span>
                    Prefer file-based routing convention
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#4ec9b0]">•</span>
                    No complex middleware requirements
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#4ec9b0]">•</span>
                    Staying within Next.js ecosystem
                  </li>
                </ul>
              </div>
              <div className="rounded-lg p-4 bg-[#252526] border border-[#3c3c3c]">
                <h3 className="text-[#4ec9b0] font-medium mb-3">Hono Catch-All is better when:</h3>
                <ul className="space-y-2 text-[#808080]">
                  <li className="flex gap-2">
                    <span className="text-[#4ec9b0]">•</span>
                    Complex API with many endpoints
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#4ec9b0]">•</span>
                    Need reusable middleware chains
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#4ec9b0]">•</span>
                    Want type-safe RPC client
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#4ec9b0]">•</span>
                    Require global error handling
                  </li>
                </ul>
              </div>
            </div>
          </Section>

          <footer className="pt-4 text-center text-[#808080] text-xs font-mono">
            Sources: hono.dev • nextjs.org/docs • vercel.com/docs
          </footer>
        </div>
      </div>
    </div>
  )
}
