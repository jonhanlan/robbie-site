import { createReadStream, promises as fs } from 'fs'
import { createServer, type IncomingMessage, type ServerResponse } from 'http'
import path from 'path'
import { Readable } from 'stream'
import { fileURLToPath } from 'url'
import {
  readMorphLabEntriesApi,
  readMorphLabStatusApi,
  writeMorphLabEntryApi,
  writeMorphLabStatusApi,
  writeMorphLabUploadApi,
} from './lab-api'
import {
  morphLabStoragePaths,
  type MorphLabStorageOptions,
} from './lab-storage'

export type MorphLabServerOptions = {
  packageRoot?: string
  repoRoot?: string
  appShellFile?: string
  distDir?: string
  storage?: MorphLabStorageOptions
}

const DEFAULT_BODY_LIMIT_BYTES = 6 * 1024 * 1024

export function createMorphLabServer(options: MorphLabServerOptions = {}) {
  const paths = resolveServerPaths(options)
  const storage = options.storage ?? { repoRoot: paths.repoRoot }

  return createServer(async (request, response) => {
    try {
      await handleRequest(request, response, paths, storage)
    } catch (error) {
      json(response, 500, {
        error: error instanceof Error ? error.message : 'Morph Lab server error',
      })
    }
  })
}

async function handleRequest(
  request: IncomingMessage,
  response: ServerResponse,
  paths: ReturnType<typeof resolveServerPaths>,
  storage: MorphLabStorageOptions | undefined,
) {
  const method = request.method ?? 'GET'
  const url = new URL(request.url ?? '/', 'http://127.0.0.1')

  if ((url.pathname === '/' || url.pathname === '/index.html' || url.pathname === '/app') && method === 'GET') {
    await file(response, paths.appShellFile, 'text/html; charset=utf-8')
    return
  }

  if (url.pathname === '/favicon.ico' && method === 'GET') {
    response.writeHead(204, { 'Cache-Control': 'no-store' })
    response.end()
    return
  }

  if (url.pathname === '/morph-lab.html' && method === 'GET') {
    await file(response, path.join(paths.distDir, 'morph-lab.html'), 'text/html; charset=utf-8')
    return
  }

  if ((url.pathname === '/public-player-proof' || url.pathname === '/public-player-proof.html') && method === 'GET') {
    await file(response, path.join(paths.distDir, 'public-player-proof.html'), 'text/html; charset=utf-8')
    return
  }

  if (url.pathname === '/morph-lab-engine.js' && method === 'GET') {
    await file(response, path.join(paths.distDir, 'morph-lab-engine.js'), 'text/javascript; charset=utf-8')
    return
  }

  if (url.pathname === '/public-player-proof.js' && method === 'GET') {
    await file(response, path.join(paths.distDir, 'public-player-proof.js'), 'text/javascript; charset=utf-8')
    return
  }

  if (url.pathname.startsWith('/runtime/') && method === 'GET') {
    const fileName = path.basename(url.pathname)
    if (!/^[a-z0-9-]+\.json$/.test(fileName)) {
      json(response, 404, { error: 'Not found' })
      return
    }
    await file(response, path.join(paths.distDir, 'runtime', fileName), 'application/json; charset=utf-8')
    return
  }

  if (url.pathname.startsWith('/settings/') && method === 'GET') {
    const fileName = path.basename(url.pathname)
    if (!/^[a-z0-9-]+\.json$/.test(fileName)) {
      json(response, 404, { error: 'Not found' })
      return
    }
    await file(response, path.join(paths.distDir, 'settings', fileName), 'application/json; charset=utf-8')
    return
  }

  if (url.pathname.startsWith('/images/') && method === 'GET') {
    await image(response, paths, storage, url.pathname)
    return
  }

  if (url.pathname === '/api/morph-lab/status') {
    await handleStatusApi(method, request, response, storage)
    return
  }

  if (url.pathname === '/api/morph-lab') {
    await handleMorphLabApi(method, url, request, response, storage)
    return
  }

  if (url.pathname === '/api/morph-lab/upload') {
    await handleUploadApi(method, request, response, storage)
    return
  }

  json(response, 404, { error: 'Not found' })
}

async function handleStatusApi(
  method: string,
  request: IncomingMessage,
  response: ServerResponse,
  storage: MorphLabStorageOptions | undefined,
) {
  if (method === 'GET') {
    const result = await readMorphLabStatusApi(storage)
    json(response, result.status, result.body)
    return
  }

  if (method !== 'POST') {
    json(response, 405, { error: 'Method not allowed' })
    return
  }

  const body = await readJsonBody(request)
  const result = await writeMorphLabStatusApi(body, storage)
  json(response, result.status, result.body)
}

async function handleUploadApi(
  method: string,
  request: IncomingMessage,
  response: ServerResponse,
  storage: MorphLabStorageOptions | undefined,
) {
  if (method !== 'POST') {
    json(response, 405, { error: 'Method not allowed' })
    return
  }
  const form = await webRequestFor(request).formData().catch(() => null)
  const upload = form?.get('file')
  const result = await writeMorphLabUploadApi(upload, storage)
  json(response, result.status, result.body)
}

async function handleMorphLabApi(
  method: string,
  url: URL,
  request: IncomingMessage,
  response: ServerResponse,
  storage: MorphLabStorageOptions | undefined,
) {
  if (method === 'GET') {
    const kind = url.searchParams.get('kind') ?? 'mask'
    const result = await readMorphLabEntriesApi(kind, storage)
    json(response, result.status, result.body)
    return
  }

  if (method !== 'POST') {
    json(response, 405, { error: 'Method not allowed' })
    return
  }

  const body = await readJsonBody(request)
  const result = await writeMorphLabEntryApi(body, storage)
  json(response, result.status, result.body)
}

function resolveServerPaths(options: MorphLabServerOptions) {
  const packageRoot = options.packageRoot ?? path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  const repoRoot = options.repoRoot ?? path.resolve(packageRoot, '../..')
  return {
    packageRoot,
    repoRoot,
    distDir: options.distDir ?? path.join(packageRoot, 'dist'),
    appShellFile: options.appShellFile ?? path.join(options.distDir ?? path.join(packageRoot, 'dist'), 'index.html'),
    packagePublicDir: path.join(packageRoot, 'assets'),
    sitePublicDir: path.join(repoRoot, 'apps', 'me', 'public'),
  }
}

function webRequestFor(request: IncomingMessage) {
  return new Request('http://127.0.0.1' + (request.url ?? '/'), {
    method: request.method,
    headers: request.headers as Record<string, string>,
    body: Readable.toWeb(request) as BodyInit,
    // Required by Node when streaming a request body into fetch primitives.
    duplex: 'half',
  } as RequestInit & { duplex: 'half' })
}

function readJsonBody(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0
    const chunks: Buffer[] = []
    request.on('data', (chunk: Buffer) => {
      size += chunk.length
      if (size > DEFAULT_BODY_LIMIT_BYTES) {
        request.destroy(new Error('Request body is too large.'))
        return
      }
      chunks.push(chunk)
    })
    request.on('error', reject)
    request.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'))
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
  })
}

async function file(response: ServerResponse, filePath: string, contentType: string) {
  try {
    await fs.access(filePath)
  } catch {
    json(response, 404, { error: 'Not found' })
    return
  }
  response.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': 'no-store',
  })
  createReadStream(filePath).pipe(response)
}

async function image(
  response: ServerResponse,
  paths: ReturnType<typeof resolveServerPaths>,
  storage: MorphLabStorageOptions | undefined,
  pathname: string,
) {
  const relativePath = pathname.replace(/^\/images\/lab-uploads\//, '')
  if (relativePath !== pathname) {
    const uploadPath = safeJoin(morphLabStoragePaths(storage).assetUploadDir, relativePath)
    if (uploadPath && await exists(uploadPath)) {
      await file(response, uploadPath, mediaType(pathname))
      return
    }
  }

  const packagePath = safeJoin(paths.packagePublicDir, pathname.replace(/^\//, ''))
  if (packagePath && await exists(packagePath)) {
    await file(response, packagePath, mediaType(pathname))
    return
  }

  const publicPath = safeJoin(paths.sitePublicDir, pathname.replace(/^\//, ''))
  if (!publicPath) {
    json(response, 404, { error: 'Not found' })
    return
  }
  await file(response, publicPath, mediaType(pathname))
}

async function exists(filePath: string) {
  try {
    await fs.access(filePath)
    return true
  } catch {
    return false
  }
}

function safeJoin(root: string, child: string) {
  const resolvedRoot = path.resolve(root)
  const resolvedChild = path.resolve(resolvedRoot, child)
  return resolvedChild.startsWith(`${resolvedRoot}${path.sep}`) || resolvedChild === resolvedRoot
    ? resolvedChild
    : null
}

function json(response: ServerResponse, status: number, body: unknown) {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
  })
  response.end(JSON.stringify(body))
}

function mediaType(pathname: string) {
  if (pathname.endsWith('.webp')) return 'image/webp'
  if (pathname.endsWith('.png')) return 'image/png'
  if (pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')) return 'image/jpeg'
  if (pathname.endsWith('.svg')) return 'image/svg+xml'
  return 'application/octet-stream'
}
