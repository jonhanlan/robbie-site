import {
  isMorphLabFormFile,
  readMorphLabDataset,
  readMorphLabRuntimeLibrary,
  readMorphLabStatus,
  runMorphLabStatusAction,
  writeMorphLabDataset,
  writeMorphLabImageUpload,
  writeMorphLabRuntimeExport,
  writeMorphLabRuntimeExportFromDataset,
  type MorphLabEntry,
  type MorphLabFormFile,
  type MorphLabStorageOptions,
} from './lab-storage'

export type MorphLabApiResponse = {
  status: number
  body: unknown
}

function isMorphLabRecord(value: unknown): value is MorphLabEntry {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export async function readMorphLabEntriesApi(
  kind = 'mask',
  storage?: MorphLabStorageOptions,
): Promise<MorphLabApiResponse> {
  if (kind === 'runtime') {
    return { status: 200, body: await readMorphLabRuntimeLibrary(storage) }
  }

  const entries = await readMorphLabDataset(kind, storage)
  return {
    status: 200,
    // `presets` stays for the existing mask client until the Lab shell is fully package-native.
    body: { kind, entries, presets: entries },
  }
}

export async function writeMorphLabEntryApi(
  body: unknown,
  storage?: MorphLabStorageOptions,
): Promise<MorphLabApiResponse> {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { status: 400, body: { error: 'Empty body' } }
  }

  const request = body as MorphLabEntry & { kind?: string; storageKey?: string; entry?: unknown }
  const kind = typeof request.kind === 'string' ? request.kind : 'mask'
  const storageKey = typeof request.storageKey === 'string' ? request.storageKey.trim() : ''
  if (!storageKey) {
    return { status: 400, body: { error: 'storageKey required' } }
  }

  if (kind === 'runtime') {
    try {
      const result = request.compileFromDataset === true
        ? await writeMorphLabRuntimeExportFromDataset(storageKey, request, storage)
        : await writeMorphLabRuntimeExport(storageKey, request, storage)
      return {
        status: result.ok ? 200 : result.status,
        body: result.ok ? result : { error: result.error, problems: result.problems },
      }
    } catch (error) {
      return {
        status: 500,
        body: { error: `Runtime export failed: ${error instanceof Error ? error.message : 'unknown'}` },
      }
    }
  }

  const fields = isMorphLabRecord(request.entry) ? { ...request.entry } : { ...request }
  if (!isMorphLabRecord(request.entry)) {
    delete fields.kind
    delete fields.storageKey
  }

  try {
    const saved = await writeMorphLabDataset(kind, storageKey, fields, storage)
    return { status: 200, body: { ok: true, kind, storageKey, entry: saved } }
  } catch (error) {
    return {
      status: 500,
      body: { error: `Write failed: ${error instanceof Error ? error.message : 'unknown'}` },
    }
  }
}

export async function readMorphLabStatusApi(storage?: MorphLabStorageOptions): Promise<MorphLabApiResponse> {
  return { status: 200, body: await readMorphLabStatus(storage) }
}

export async function writeMorphLabStatusApi(
  body: unknown,
  storage?: MorphLabStorageOptions,
): Promise<MorphLabApiResponse> {
  const action = body && typeof body === 'object' && !Array.isArray(body) && typeof (body as { action?: unknown }).action === 'string'
    ? (body as { action: string }).action
    : ''
  const overwrite = body && typeof body === 'object' && !Array.isArray(body) && (body as { overwrite?: unknown }).overwrite === true
  const result = await runMorphLabStatusAction(action, overwrite ? { ...(storage ?? {}), overwrite: true } : storage)

  return {
    status: result.ok ? 200 : ('status' in result ? result.status : 409),
    body: result,
  }
}

export async function writeMorphLabUploadApi(
  upload: unknown,
  storage?: MorphLabStorageOptions,
): Promise<MorphLabApiResponse> {
  if (!isMorphLabFormFile(upload)) {
    return { status: 400, body: { error: 'No file' } }
  }

  const file = upload as MorphLabFormFile
  const result = await writeMorphLabImageUpload({
    fileName: file.name || 'image.png',
    type: file.type || 'application/octet-stream',
    size: file.size ?? 0,
    data: await file.arrayBuffer(),
  }, storage)

  return {
    status: result.ok ? 200 : result.status,
    body: result.ok ? result : { error: result.error },
  }
}
