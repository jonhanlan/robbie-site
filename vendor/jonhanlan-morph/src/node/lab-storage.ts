import { promises as fs } from 'fs'
import os from 'os'
import path from 'path'
import {
  isCompiledMorphRuntimeDocumentV0,
  validateMorphRuntimeDocumentV0,
  type MorphRuntimeDocumentV0,
} from '../drawable/runtime-contract'
import type { DrawableScene } from '../drawable/types'
import {
  compileFlowerOrnamentRuntimeDocumentFromDatasetV0,
  drawableFlowerOrnamentDatasetKeyV0,
  drawableFlowerOrnamentDatasetKindV0,
  drawableFlowerOrnamentRuntimeStorageKeyV0,
  type FlowerOrnamentDatasetV0,
} from '../drawable/flower-ornament-runtime-export'
import {
  compileDrawableOrnamentRuntimeDocumentFromDatasetV0,
  drawableOrnamentRuntimeDatasetSpecForKindV0,
  drawableOrnamentRuntimeDatasetSpecV0,
  drawableOrnamentRuntimeDatasetSpecsV0,
} from '../drawable/ornament-runtime-export'
import {
  compileProceduralSceneRuntimeDocumentFromDatasetV0,
  proceduralSceneRuntimeDatasetKeyV0,
  proceduralSceneRuntimeDatasetKindV0,
  proceduralSceneRuntimeStorageKeyV0,
} from '../drawable/procedural-scene-runtime-export'
import {
  compileScrollDemoRuntimeDocumentFromDatasetV0,
  scrollDemoRuntimeDatasetSpecV0,
  type ScrollDemoRuntimeDatasetEntryV0,
} from '../drawable/scroll-demo-runtime-export'
import {
  compileSignatureClosedOutlineRuntimeDocumentFromDatasetV0,
  compileSignaturePathMorphProofRuntimeDocumentFromDatasetV0,
  compileSignatureRibbonBaselineRuntimeDocumentFromDatasetV0,
  compileSignatureRuntimeDocumentFromDatasetV0,
  drawableSignatureClosedOutlineRuntimeStorageKeyV0,
  drawableSignaturePathMorphProofRuntimeStorageKeyV0,
  drawableSignatureRuntimeDatasetKeyV0,
  drawableSignatureRuntimeDatasetKindV0,
  drawableSignatureRibbonBaselineRuntimeStorageKeyV0,
} from '../drawable/signature-runtime-export'
import {
  drawableSignatureRuntimeStorageKeyV0,
  type SignatureDataset,
} from '../drawable/signature-specimen'
import {
  compileProfileMaskRuntimeDocumentFromDatasetV0,
  PROFILE_MASK_RUNTIME_DATASET_KEY_V0,
  PROFILE_MASK_RUNTIME_DATASET_KIND_V0,
  PROFILE_MASK_RUNTIME_STORAGE_KEY_V0,
  type ProfileMaskLegacySpecimenV0,
} from '../legacy/profile-mask-runtime-source'
import { morphRuntimeArtifactSummaryV0 } from '../runtime/artifact-summary'
import {
  createMorphRuntimeHostCompatibilityReportForDocumentV0,
  type MorphRuntimeHostCompatibilityReportV0,
} from '../runtime/host-compatibility-core'
import { resolveMorphRuntimeHostAdapterV0 } from '../runtime/host-adapters'
import {
  listMorphRuntimeWebviewHostProfilesForStorageKeyV0,
  listMorphRuntimeWebviewHostProfilesV0,
  type MorphRuntimeWebviewHostProfileV0,
} from '../runtime/webview-host-profiles'

export type MorphLabEntry = Record<string, unknown>
export type MorphLabDataset = Record<string, MorphLabEntry>
export type MorphLabUnifiedStore = Record<string, MorphLabDataset | Record<string, unknown>>

export type MorphLabStorageOptions = {
  cwd?: string
  homeDir?: string
  repoRoot?: string
  standaloneManifestFile?: string
  draftDatasetDir?: string
  siteDataDir?: string
  profileMaskFile?: string
  runtimeExportDir?: string
  assetUploadDir?: string
  assetPublicPath?: string
  iCloudFile?: string
}

export type MorphLabRuntimeExportSidecar = {
  warnings?: string[]
  stats?: Record<string, unknown>
}

export type MorphLabRuntimeExportResult = {
  ok: true
  kind: 'runtime'
  storageKey: string
  path: string
  document: MorphRuntimeDocumentV0
} & MorphLabRuntimeExportSidecar

export type MorphLabRuntimeLibraryEntry = {
  storageKey: string
  default: boolean
  ready: boolean
  problems: string[]
  manifest: MorphRuntimeExportManifestEntryFileV0 | null
  document: MorphRuntimeDocumentV0 | null
  hostCompatibility: MorphRuntimeHostCompatibilityReportV0 | null
  webviewHostProfiles: MorphRuntimeWebviewHostProfileV0[]
}

export type MorphLabRuntimeLibrary = {
  kind: 'runtime'
  entries: MorphLabDataset
  manifest: MorphRuntimeExportManifestFileV0 | null
  defaultStorageKey: string | null
  library: MorphLabRuntimeLibraryEntry[]
}

export type MorphLabWebviewHostProfileStatusItem = {
  id: string
  title: string
  surface: MorphRuntimeWebviewHostProfileV0['surface']
  state: MorphLabStatusReviewState
  ok: boolean
  playerEntry: MorphRuntimeWebviewHostProfileV0['playerEntry']
  inputs: MorphRuntimeWebviewHostProfileV0['inputs']
  sampleStorageKeys: MorphRuntimeWebviewHostProfileV0['sampleStorageKeys']
  readySamples: number
  missingSamples: string[]
}

export type MorphLabWebviewHostProfileStatus = {
  ok: boolean
  profiles: number
  readyProfiles: number
  sampleRuntimeEntries: number
  coveredRuntimeEntries: number
  items: MorphLabWebviewHostProfileStatusItem[]
}

type MorphRuntimeExportManifestEntryFileV0 = {
  storageKey: string
  path: string
  schema: string
  version: number
  sceneId: string
  sceneKind: string
  title?: string
  description?: string
  tags: string[]
  exportedAt: string
  latestGeneratedAt: string
  renderTier?: string
  quality?: string
  byteLength: number
  generatedIds: string[]
  requiredCapabilities: string[]
  optionalCapabilities: string[]
  controllers: string[]
  fieldCacheLayerCount: number
  cachedProgresses: number[]
  default?: boolean
}

type MorphRuntimeExportManifestFileV0 = {
  schema: 'morph-runtime-export-manifest/v0'
  version: 0
  generatedAt: string
  defaultStorageKey: string
  entries: MorphRuntimeExportManifestEntryFileV0[]
}

export type MorphLabStorageFailure = {
  ok: false
  status: number
  error: string
  problems?: string[]
}

export type MorphLabStoragePaths = {
  dataDir: string
  repoRoot: string
  morphPackageRoot: string
  standaloneManifestFile: string
  draftDatasetDir: string
  siteDataDir: string
  packageProfileMaskFile: string
  runtimeExportDir: string
  assetUploadDir: string
  assetPublicPath: string
  iCloudFile: string
  repoFiles: Record<string, string>
  siteFiles: Record<string, string>
  runtimeFiles: Record<string, string>
}

export type MorphLabImageUpload = {
  fileName: string
  type: string
  size: number
  data: ArrayBuffer | Uint8Array
}

export type MorphLabFormFile = {
  name?: string
  type?: string
  size?: number
  arrayBuffer: () => Promise<ArrayBuffer>
}

export type MorphLabImageUploadResult = {
  ok: true
  path: string
  fileName: string
  bytes: number
  type: string
}

export type MorphLabAssetPromotionOptions = MorphLabStorageOptions & {
  sitePublicDir?: string
  siteAssetDir?: string
  overwrite?: boolean
  dryRun?: boolean
}

export type MorphLabAssetPromotionStatus = 'copied' | 'updated' | 'unchanged' | 'conflict'

export type MorphLabAssetPromotionItem = {
  status: MorphLabAssetPromotionStatus
  fileName: string
  sourcePath: string
  targetPath: string
  publicPath: string
  bytes: number
}

export type MorphLabAssetPromotionResult = {
  ok: boolean
  sourceDir: string
  targetDir: string
  dryRun: boolean
  overwrite: boolean
  copied: number
  updated: number
  unchanged: number
  conflicts: MorphLabAssetPromotionItem[]
  items: MorphLabAssetPromotionItem[]
}

export type MorphLabDatasetExportOptions = MorphLabStorageOptions & {
  overwrite?: boolean
  dryRun?: boolean
}

export type MorphLabDatasetExportStatus = 'copied' | 'updated' | 'unchanged' | 'missing-source' | 'conflict'

export type MorphLabDatasetExportItem = {
  status: MorphLabDatasetExportStatus
  kind: string
  sourcePath: string
  targetPath: string
  bytes: number
}

export type MorphLabDatasetExportResult = {
  ok: boolean
  sourceDir: string
  targetDir: string
  dryRun: boolean
  overwrite: boolean
  copied: number
  updated: number
  unchanged: number
  missing: MorphLabDatasetExportItem[]
  conflicts: MorphLabDatasetExportItem[]
  items: MorphLabDatasetExportItem[]
}

export type MorphLabLocalBackupInitResult = {
  ok: true
  action: 'init-local-backup'
  path: string
  created: boolean
  existed: boolean
  overwrite: boolean
  bytes: number
  datasets: Record<string, number>
}

export type MorphLabFileStatus = {
  path: string
  exists: boolean
  bytes: number
  updatedAt: string | null
}

export type MorphLabDirectoryStatus = {
  path: string
  exists: boolean
  files: number
  bytes: number
  updatedAt: string | null
}

export type MorphLabRuntimeManifestStatus = MorphLabFileStatus & {
  valid: boolean
  entries: number
  defaultStorageKey: string | null
}

export type MorphLabStandaloneManifestStatus = MorphLabFileStatus & {
  valid: boolean
  schema: string | null
  appName: string | null
  requiredPaths: number
  commands: number
  bridgeRoutes: number
  nextExtraction: number
  missingFiles: string[]
}

export type MorphLabDatasetMirrorStatus = {
  kind: string
  packageFile: MorphLabFileStatus
  siteFile: MorphLabFileStatus
  inSync: boolean
}

export type MorphLabStatusAction = 'sync-datasets' | 'promote-assets' | 'init-local-backup'

export type MorphLabStatusReviewState = 'ready' | 'draft-changes' | 'needs-review'

export type MorphLabStatusIssue = {
  severity: 'info' | 'warning' | 'error'
  code: string
  message: string
  action?: MorphLabStatusAction
}

export type MorphLabStatusActionPreviewItem = {
  status: MorphLabDatasetExportStatus | MorphLabAssetPromotionStatus
  label: string
  sourcePath: string
  targetPath: string
  bytes: number
  publicPath?: string
}

export type MorphLabStatusActionPreview = {
  action: MorphLabStatusAction
  state: MorphLabStatusReviewState
  ok: boolean
  recommended: boolean
  copied: number
  updated: number
  unchanged: number
  conflicts: number
  missing: number
  items: MorphLabStatusActionPreviewItem[]
}

export type MorphLabStatusReview = {
  state: MorphLabStatusReviewState
  ok: boolean
  issues: MorphLabStatusIssue[]
  actions: MorphLabStatusActionPreview[]
}

export type MorphLabStandaloneStepKey =
  | 'repo-lifecycle'
  | 'app-manifest'
  | 'package-lab'
  | 'local-backup'
  | 'publish-target'
  | 'player-export'
  | 'webview-host-profiles'

export type MorphLabStandaloneStep = {
  key: MorphLabStandaloneStepKey
  label: string
  state: MorphLabStatusReviewState
  ok: boolean
  detail: string
}

export type MorphLabStandaloneReadiness = {
  state: MorphLabStatusReviewState
  ok: boolean
  items: MorphLabStandaloneStep[]
}

export type MorphLabNextAction = {
  key: string
  label: string
  state: MorphLabStatusReviewState
  detail: string
  action?: MorphLabStatusAction
  command?: string
  href?: string
}

export type MorphLabRepoIdentity = {
  kind: 'standalone-repo' | 'source-workspace'
  state: MorphLabStatusReviewState
  ok: boolean
  label: string
  detail: string
  repoRoot: string
  markerPath: string
  sourceCommit: string | null
  targetCommit: string | null
  targetBranch: string | null
  temporary: boolean | null
  sourceDirty: boolean | null
  verifyCommand: string
}

export type MorphLabPublishTarget = {
  kind: 'local-mirror' | 'website-bridge'
  label: string
  state: MorphLabStatusReviewState
  detail: string
  datasetTargetDir: string
  assetPublicPath: string
}

export type MorphLabReleaseStatus = {
  state: MorphLabStatusReviewState
  appName: string
  channel: 'local-dev'
  rootPackageName: string | null
  rootVersion: string | null
  packageName: string | null
  packageVersion: string | null
  verifyCommand: string
  detail: string
}

export type MorphLabStatusSnapshot = {
  ok: boolean
  generatedAt: string
  paths: Pick<MorphLabStoragePaths,
    'repoRoot' |
    'morphPackageRoot' |
    'standaloneManifestFile' |
    'draftDatasetDir' |
    'siteDataDir' |
    'runtimeExportDir' |
    'assetUploadDir' |
    'assetPublicPath' |
    'iCloudFile'
  >
  datasets: {
    ok: boolean
    inSync: number
    total: number
    items: MorphLabDatasetMirrorStatus[]
  }
  runtimeExports: MorphLabDirectoryStatus
  runtimeManifest: MorphLabRuntimeManifestStatus
  webviewHostProfiles: MorphLabWebviewHostProfileStatus
  standaloneManifest: MorphLabStandaloneManifestStatus
  assetUploads: MorphLabDirectoryStatus
  iCloud: MorphLabFileStatus
  profileMask: MorphLabFileStatus
  repo: MorphLabRepoIdentity
  publishTarget: MorphLabPublishTarget
  release: MorphLabReleaseStatus
  review: MorphLabStatusReview
  standalone: MorphLabStandaloneReadiness
  nextActions: MorphLabNextAction[]
}

export type MorphLabStatusActionResult = {
  ok: boolean
  action: MorphLabStatusAction
  result: MorphLabDatasetExportResult | MorphLabAssetPromotionResult | MorphLabLocalBackupInitResult
  snapshot: MorphLabStatusSnapshot
}

export function morphLabStoragePaths(options: MorphLabStorageOptions = {}): MorphLabStoragePaths {
  const cwd = options.cwd ?? process.cwd()
  const homeDir = options.homeDir ?? os.homedir()
  const dataDir = path.join(cwd, 'data')
  const repoRoot = options.repoRoot ?? path.resolve(cwd, '../..')
  const morphPackageRoot = path.join(repoRoot, 'packages', 'morph')
  const standaloneManifestFile = options.standaloneManifestFile ??
    process.env.MORPH_STANDALONE_MANIFEST_FILE ??
    path.join(morphPackageRoot, 'standalone-app.manifest.json')
  const draftDatasetDir = options.draftDatasetDir ??
    process.env.MORPH_DRAFT_DATASET_DIR ??
    path.join(morphPackageRoot, 'exports', 'datasets')
  const siteDataDir = options.siteDataDir ??
    process.env.MORPH_SITE_DATA_DIR ??
    path.join(repoRoot, 'apps', 'me', 'data')
  const packageProfileMaskFile = options.profileMaskFile ??
    process.env.MORPH_PROFILE_MASK_EXPORT_FILE ??
    path.join(morphPackageRoot, 'exports', 'datasets', 'profile-mask.json')
  const runtimeExportDir = options.runtimeExportDir ??
    process.env.MORPH_RUNTIME_EXPORT_DIR ??
    path.join(morphPackageRoot, 'exports', 'runtime')
  const assetUploadDir = options.assetUploadDir ??
    process.env.MORPH_ASSET_UPLOAD_DIR ??
    path.join(morphPackageRoot, 'exports', 'assets', 'images', 'lab-uploads')
  const assetPublicPath = options.assetPublicPath ??
    process.env.MORPH_ASSET_PUBLIC_PATH ??
    '/images/lab-uploads'
  const iCloudFile = options.iCloudFile ?? path.join(
    homeDir,
    'Library',
    'Mobile Documents',
    'com~apple~CloudDocs',
    'MorphLab',
    'morph-lab-data.json',
  )

  return {
    dataDir,
    repoRoot,
    morphPackageRoot,
    standaloneManifestFile,
    draftDatasetDir,
    siteDataDir,
    packageProfileMaskFile,
    runtimeExportDir,
    assetUploadDir,
    assetPublicPath,
    iCloudFile,
    repoFiles: {
      mask: path.join(draftDatasetDir, 'morph-presets.json'),
      cursor: path.join(draftDatasetDir, 'cursor-states.json'),
      ...Object.fromEntries(Object.values(drawableOrnamentRuntimeDatasetSpecsV0).map((spec) => [
        spec.kind,
        path.join(draftDatasetDir, `${spec.runtimeStorageKey}.json`),
      ])),
      scrollDemoCueInView: path.join(draftDatasetDir, 'scroll-demo-cue-in-view.json'),
      scrollDemoCombined: path.join(draftDatasetDir, 'scroll-demo-combined.json'),
      scrollDemoHero: path.join(draftDatasetDir, 'scroll-demo-hero.json'),
      scrollDemoPage: path.join(draftDatasetDir, 'scroll-demo-page.json'),
      scrollDemoScrollPast: path.join(draftDatasetDir, 'scroll-demo-scroll-past.json'),
      scrollDemoTravel: path.join(draftDatasetDir, 'scroll-demo-travel.json'),
      flowerOrnament: path.join(draftDatasetDir, 'flower-ornament.json'),
      profileMask: path.join(draftDatasetDir, 'profile-mask.json'),
      proceduralScene: path.join(draftDatasetDir, 'procedural-scene.json'),
      signature: path.join(draftDatasetDir, 'signature.json'),
    },
    siteFiles: {
      mask: path.join(siteDataDir, 'morph-presets.json'),
      cursor: path.join(siteDataDir, 'cursor-states.json'),
      ...Object.fromEntries(Object.values(drawableOrnamentRuntimeDatasetSpecsV0).map((spec) => [
        spec.kind,
        path.join(siteDataDir, `${spec.runtimeStorageKey}.json`),
      ])),
      scrollDemoCueInView: path.join(siteDataDir, 'scroll-demo-cue-in-view.json'),
      scrollDemoCombined: path.join(siteDataDir, 'scroll-demo-combined.json'),
      scrollDemoHero: path.join(siteDataDir, 'scroll-demo-hero.json'),
      scrollDemoPage: path.join(siteDataDir, 'scroll-demo-page.json'),
      scrollDemoScrollPast: path.join(siteDataDir, 'scroll-demo-scroll-past.json'),
      scrollDemoTravel: path.join(siteDataDir, 'scroll-demo-travel.json'),
      flowerOrnament: path.join(siteDataDir, 'flower-ornament.json'),
      profileMask: path.join(siteDataDir, 'profile-mask.json'),
      proceduralScene: path.join(siteDataDir, 'procedural-scene.json'),
      signature: path.join(siteDataDir, 'signature.json'),
    },
    runtimeFiles: {
      'mask:jonhanlan-profile-mask-v2': packageProfileMaskFile,
    },
  }
}

export const MORPH_LAB_ALLOWED_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
])
export const MORPH_LAB_ALLOWED_IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif'])
export const MORPH_LAB_MAX_IMAGE_BYTES = 12 * 1024 * 1024

export function isMorphLabFormFile(value: unknown): value is MorphLabFormFile {
  return typeof value === 'object' &&
    value !== null &&
    'arrayBuffer' in value &&
    typeof value.arrayBuffer === 'function'
}

export async function writeMorphLabImageUpload(
  upload: MorphLabImageUpload,
  options: MorphLabStorageOptions = {},
): Promise<MorphLabImageUploadResult | MorphLabStorageFailure> {
  if (!MORPH_LAB_ALLOWED_IMAGE_TYPES.has(upload.type)) {
    return { ok: false, status: 415, error: `Unsupported type: ${upload.type}` }
  }
  const bytes = upload.data instanceof Uint8Array ? upload.data : new Uint8Array(upload.data)
  if (upload.size > MORPH_LAB_MAX_IMAGE_BYTES || bytes.byteLength > MORPH_LAB_MAX_IMAGE_BYTES) {
    return { ok: false, status: 413, error: 'File too large (max 12MB)' }
  }
  if (bytes.byteLength === 0) {
    return { ok: false, status: 400, error: 'File is empty' }
  }

  const paths = morphLabStoragePaths(options)
  await fs.mkdir(paths.assetUploadDir, { recursive: true })
  const fileName = await uniqueUploadFileName(paths.assetUploadDir, upload.fileName, upload.type)
  await fs.writeFile(path.join(paths.assetUploadDir, fileName), bytes)
  return {
    ok: true,
    path: `${paths.assetPublicPath.replace(/\/+$/, '')}/${fileName}`,
    fileName,
    bytes: bytes.byteLength,
    type: upload.type,
  }
}

export async function promoteMorphLabAssets(
  options: MorphLabAssetPromotionOptions = {},
): Promise<MorphLabAssetPromotionResult> {
  const paths = morphLabStoragePaths(options)
  const targetDir = morphLabAssetPromotionTargetDir(paths, options)
  const dryRun = Boolean(options.dryRun)
  const overwrite = Boolean(options.overwrite)
  const files = await listMorphLabAssetFiles(paths.assetUploadDir)
  const items: MorphLabAssetPromotionItem[] = []

  for (const fileName of files) {
    const sourcePath = path.join(paths.assetUploadDir, fileName)
    const targetPath = path.join(targetDir, fileName)
    const bytes = await fs.readFile(sourcePath)
    const existing = await readOptionalFile(targetPath)
    const publicPath = `${paths.assetPublicPath.replace(/\/+$/, '')}/${fileName.split(path.sep).join('/')}`

    if (existing && bytes.equals(existing)) {
      items.push({ status: 'unchanged', fileName, sourcePath, targetPath, publicPath, bytes: bytes.byteLength })
      continue
    }

    if (existing && !overwrite) {
      items.push({ status: 'conflict', fileName, sourcePath, targetPath, publicPath, bytes: bytes.byteLength })
      continue
    }

    if (!dryRun) {
      await fs.mkdir(path.dirname(targetPath), { recursive: true })
      await fs.writeFile(targetPath, bytes)
    }
    items.push({
      status: existing ? 'updated' : 'copied',
      fileName,
      sourcePath,
      targetPath,
      publicPath,
      bytes: bytes.byteLength,
    })
  }

  const conflicts = items.filter((item) => item.status === 'conflict')
  return {
    ok: conflicts.length === 0,
    sourceDir: paths.assetUploadDir,
    targetDir,
    dryRun,
    overwrite,
    copied: items.filter((item) => item.status === 'copied').length,
    updated: items.filter((item) => item.status === 'updated').length,
    unchanged: items.filter((item) => item.status === 'unchanged').length,
    conflicts,
    items,
  }
}

export async function exportMorphLabDatasets(
  options: MorphLabDatasetExportOptions = {},
): Promise<MorphLabDatasetExportResult> {
  const paths = morphLabStoragePaths(options)
  const dryRun = Boolean(options.dryRun)
  const overwrite = Boolean(options.overwrite)
  const items: MorphLabDatasetExportItem[] = []

  for (const kind of Object.keys(paths.repoFiles).sort()) {
    const sourcePath = paths.repoFiles[kind]
    const targetPath = paths.siteFiles[kind]
    const source = await readOptionalFile(sourcePath)
    if (!source) {
      items.push({ status: 'missing-source', kind, sourcePath, targetPath, bytes: 0 })
      continue
    }

    const existing = await readOptionalFile(targetPath)
    if (existing && source.equals(existing)) {
      items.push({ status: 'unchanged', kind, sourcePath, targetPath, bytes: source.byteLength })
      continue
    }

    if (existing && !overwrite) {
      items.push({ status: 'conflict', kind, sourcePath, targetPath, bytes: source.byteLength })
      continue
    }

    if (!dryRun) {
      await fs.mkdir(path.dirname(targetPath), { recursive: true })
      await fs.writeFile(targetPath, source)
    }
    items.push({
      status: existing ? 'updated' : 'copied',
      kind,
      sourcePath,
      targetPath,
      bytes: source.byteLength,
    })
  }

  const missing = items.filter((item) => item.status === 'missing-source')
  const conflicts = items.filter((item) => item.status === 'conflict')
  return {
    ok: missing.length === 0 && conflicts.length === 0,
    sourceDir: paths.draftDatasetDir,
    targetDir: paths.siteDataDir,
    dryRun,
    overwrite,
    copied: items.filter((item) => item.status === 'copied').length,
    updated: items.filter((item) => item.status === 'updated').length,
    unchanged: items.filter((item) => item.status === 'unchanged').length,
    missing,
    conflicts,
    items,
  }
}

export async function initMorphLabLocalBackup(
  options: MorphLabStorageOptions & { overwrite?: boolean } = {},
): Promise<MorphLabLocalBackupInitResult | MorphLabStorageFailure> {
  const paths = morphLabStoragePaths(options)
  const existing = await readOptionalFile(paths.iCloudFile)
  const overwrite = Boolean(options.overwrite)
  if (existing && !overwrite) {
    return {
      ok: false,
      status: 409,
      error: 'Local backup already exists. Export or archive it before creating a new seed.',
    }
  }

  const now = new Date().toISOString()
  const unified: MorphLabUnifiedStore = {
    _meta: {
      createdAt: now,
      updatedAt: now,
      source: 'morph-lab-standalone-init',
    },
  }
  const datasets: Record<string, number> = {}
  for (const kind of Object.keys(paths.repoFiles).sort()) {
    const dataset = await readMorphLabRepoDataset(kind, options, paths)
    unified[kind] = dataset
    datasets[kind] = Object.keys(dataset).length
  }

  const serialized = JSON.stringify(unified, null, 2) + '\n'
  await fs.mkdir(path.dirname(paths.iCloudFile), { recursive: true })
  await fs.writeFile(paths.iCloudFile, serialized, 'utf8')

  return {
    ok: true,
    action: 'init-local-backup',
    path: paths.iCloudFile,
    created: !existing,
    existed: Boolean(existing),
    overwrite,
    bytes: Buffer.byteLength(serialized),
    datasets,
  }
}

export async function readMorphLabStatus(options: MorphLabStorageOptions = {}): Promise<MorphLabStatusSnapshot> {
  const paths = morphLabStoragePaths(options)
  const datasetItems = await Promise.all(Object.keys(paths.repoFiles).sort().map(async (kind) => {
    const packagePath = paths.repoFiles[kind]
    const sitePath = paths.siteFiles[kind]
    const [packageFile, siteFile, packageBytes, siteBytes] = await Promise.all([
      fileStatus(packagePath),
      fileStatus(sitePath),
      readOptionalFile(packagePath),
      readOptionalFile(sitePath),
    ])

    return {
      kind,
      packageFile,
      siteFile,
      inSync: Boolean(packageBytes && siteBytes && packageBytes.equals(siteBytes)),
    }
  }))
  const datasetsOk = datasetItems.every((item) => item.packageFile.exists && item.siteFile.exists && item.inSync)

  const [runtimeExports, runtimeManifest, runtimeLibrary, standaloneManifest, assetUploads, iCloud, profileMask, repo] = await Promise.all([
    runtimeExportDirectoryStatus(paths.runtimeExportDir),
    runtimeManifestStatus(paths.runtimeExportDir),
    readMorphLabRuntimeLibrary(options),
    standaloneManifestStatus(paths.standaloneManifestFile),
    directoryStatus(paths.assetUploadDir, (name) => MORPH_LAB_ALLOWED_IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase())),
    fileStatus(paths.iCloudFile),
    fileStatus(paths.packageProfileMaskFile),
    morphLabRepoIdentity(paths),
  ])
  const webviewHostProfiles = morphLabWebviewHostProfileStatus(runtimeLibrary)
  const review = await readMorphLabStatusReview(options)
  const publishTarget = morphLabPublishTarget(paths, repo, review)
  const release = await morphLabReleaseStatus(paths, standaloneManifest, repo)
  const standalone = standaloneReadiness(datasetsOk, review, runtimeExports, runtimeManifest, webviewHostProfiles, standaloneManifest, iCloud, repo, publishTarget)
  const nextActions = morphLabNextActions(standalone, review, repo, publishTarget, iCloud)

  return {
    ok: datasetsOk,
    generatedAt: new Date().toISOString(),
    paths: {
      repoRoot: paths.repoRoot,
      morphPackageRoot: paths.morphPackageRoot,
      standaloneManifestFile: paths.standaloneManifestFile,
      draftDatasetDir: paths.draftDatasetDir,
      siteDataDir: paths.siteDataDir,
      runtimeExportDir: paths.runtimeExportDir,
      assetUploadDir: paths.assetUploadDir,
      assetPublicPath: paths.assetPublicPath,
      iCloudFile: paths.iCloudFile,
    },
    datasets: {
      ok: datasetsOk,
      inSync: datasetItems.filter((item) => item.inSync).length,
      total: datasetItems.length,
      items: datasetItems,
    },
    runtimeExports,
    runtimeManifest,
    webviewHostProfiles,
    standaloneManifest,
    assetUploads,
    iCloud,
    profileMask,
    repo,
    publishTarget,
    release,
    review,
    standalone,
    nextActions,
  }
}

function morphLabWebviewHostProfileStatus(runtimeLibrary: MorphLabRuntimeLibrary): MorphLabWebviewHostProfileStatus {
  const readyRuntimeKeys = new Set(
    runtimeLibrary.library
      .filter((entry) => entry.ready && entry.document)
      .map((entry) => entry.storageKey),
  )
  const coveredRuntimeKeys = new Set<string>()
  const items = listMorphRuntimeWebviewHostProfilesV0().map((profile): MorphLabWebviewHostProfileStatusItem => {
    const missingSamples = profile.sampleStorageKeys.filter((storageKey) => !readyRuntimeKeys.has(storageKey))
    const readySamples = profile.sampleStorageKeys.length - missingSamples.length
    if (!missingSamples.length) {
      for (const storageKey of profile.sampleStorageKeys) coveredRuntimeKeys.add(storageKey)
    }
    return {
      id: profile.id,
      title: profile.title,
      surface: profile.surface,
      state: missingSamples.length ? 'draft-changes' : 'ready',
      ok: missingSamples.length === 0,
      playerEntry: profile.playerEntry,
      inputs: profile.inputs,
      sampleStorageKeys: profile.sampleStorageKeys,
      readySamples,
      missingSamples,
    }
  })

  const sampleRuntimeEntries = new Set(items.flatMap((item) => [...item.sampleStorageKeys]))

  return {
    ok: items.every((item) => item.ok),
    profiles: items.length,
    readyProfiles: items.filter((item) => item.ok).length,
    sampleRuntimeEntries: sampleRuntimeEntries.size,
    coveredRuntimeEntries: coveredRuntimeKeys.size,
    items,
  }
}

async function morphLabReleaseStatus(
  paths: MorphLabStoragePaths,
  standaloneManifest: MorphLabStandaloneManifestStatus,
  repo: MorphLabRepoIdentity,
): Promise<MorphLabReleaseStatus> {
  const [rootPackage, morphPackage] = await Promise.all([
    packageIdentity(path.join(paths.repoRoot, 'package.json')),
    packageIdentity(path.join(paths.morphPackageRoot, 'package.json')),
  ])
  const hasIdentity = Boolean(rootPackage.name && rootPackage.version && morphPackage.name && morphPackage.version)
  const appName = standaloneManifest.appName || 'Morph Lab'
  const state: MorphLabStatusReviewState = hasIdentity ? 'ready' : 'draft-changes'
  return {
    state,
    appName,
    channel: 'local-dev',
    rootPackageName: rootPackage.name,
    rootVersion: rootPackage.version,
    packageName: morphPackage.name,
    packageVersion: morphPackage.version,
    verifyCommand: repo.verifyCommand,
    detail: hasIdentity
      ? `${appName} ${morphPackage.version} is running as ${rootPackage.name} on the local-dev channel.`
      : `${appName} needs root and package versions before release packaging.`,
  }
}

function standaloneReadiness(
  datasetsOk: boolean,
  review: MorphLabStatusReview,
  runtimeExports: MorphLabDirectoryStatus,
  runtimeManifest: MorphLabRuntimeManifestStatus,
  webviewHostProfiles: MorphLabWebviewHostProfileStatus,
  standaloneManifest: MorphLabStandaloneManifestStatus,
  iCloud: MorphLabFileStatus,
  repo: MorphLabRepoIdentity,
  publishTarget: MorphLabPublishTarget,
): MorphLabStandaloneReadiness {
  const manifestState: MorphLabStatusReviewState = standaloneManifest.valid ? 'ready' : 'needs-review'
  const packageState: MorphLabStatusReviewState = datasetsOk ? 'ready' : 'needs-review'
  const backupState: MorphLabStatusReviewState = iCloud.exists ? 'ready' : 'draft-changes'
  const playerReady = runtimeExports.files > 0 && runtimeManifest.valid
  const playerState: MorphLabStatusReviewState = playerReady ? 'ready' : 'draft-changes'
  const playerFileLabel = `${runtimeExports.files} runtime export${runtimeExports.files === 1 ? '' : 's'}`
  const hostProfileState: MorphLabStatusReviewState = webviewHostProfiles.ok ? 'ready' : 'draft-changes'
  const publishIssue = review.issues[0]
  const items: MorphLabStandaloneStep[] = [
    {
      key: 'repo-lifecycle',
      label: repo.label,
      state: repo.state,
      ok: repo.ok,
      detail: repo.detail,
    },
    {
      key: 'app-manifest',
      label: 'App manifest',
      state: manifestState,
      ok: standaloneManifest.valid,
      detail: standaloneManifest.valid
        ? `${standaloneManifest.requiredPaths} required paths, ${standaloneManifest.commands} commands and ${standaloneManifest.bridgeRoutes} bridge routes mapped.`
        : standaloneManifest.exists
          ? 'Standalone extraction manifest exists but is invalid.'
          : 'Standalone extraction manifest is missing.',
    },
    {
      key: 'package-lab',
      label: 'Package Lab',
      state: packageState,
      ok: packageState === 'ready',
      detail: datasetsOk
        ? 'Authoring mirrors are package-owned and aligned.'
        : 'Package authoring mirrors need dataset review before extraction.',
    },
    {
      key: 'local-backup',
      label: 'Local backup',
      state: backupState,
      ok: backupState === 'ready',
      detail: iCloud.exists
        ? 'Local authoring backup exists for this standalone repo.'
        : 'Create the standalone local backup before treating this app as self-owned.',
    },
    {
      key: 'publish-target',
      label: publishTarget.label,
      state: publishTarget.state,
      ok: publishTarget.state === 'ready',
      detail: publishIssue
        ? publishIssue.message
        : publishTarget.state === 'draft-changes'
          ? `Draft package changes are waiting for ${publishTarget.label.toLowerCase()}.`
          : publishTarget.detail,
    },
    {
      key: 'player-export',
      label: 'Player export',
      state: playerState,
      ok: playerState === 'ready',
      detail: playerReady
        ? `${playerFileLabel} and manifest ready for slim playback.`
        : runtimeExports.files > 0
          ? 'Compiled runtime export exists, but the runtime manifest is missing or invalid.'
          : 'No compiled runtime export yet; the public player has nothing to load.',
    },
    {
      key: 'webview-host-profiles',
      label: 'WebView host profiles',
      state: hostProfileState,
      ok: webviewHostProfiles.ok,
      detail: webviewHostProfiles.ok
        ? `${webviewHostProfiles.readyProfiles}/${webviewHostProfiles.profiles} profiles ready across ${webviewHostProfiles.coveredRuntimeEntries} runtime sample${webviewHostProfiles.coveredRuntimeEntries === 1 ? '' : 's'}.`
        : `${webviewHostProfiles.profiles - webviewHostProfiles.readyProfiles} WebView host profile${webviewHostProfiles.profiles - webviewHostProfiles.readyProfiles === 1 ? '' : 's'} need runtime shelf coverage.`,
    },
  ]
  const state = items.some((item) => item.state === 'needs-review')
    ? 'needs-review'
    : items.some((item) => item.state === 'draft-changes')
      ? 'draft-changes'
      : 'ready'

  return {
    state,
    ok: state === 'ready',
    items,
  }
}

function morphLabNextActions(
  standalone: MorphLabStandaloneReadiness,
  review: MorphLabStatusReview,
  repo: MorphLabRepoIdentity,
  publishTarget: MorphLabPublishTarget,
  iCloud: MorphLabFileStatus,
): MorphLabNextAction[] {
  const actions: MorphLabNextAction[] = []
  const blockedItem = standalone.items.find((item) => item.state === 'needs-review')
  if (blockedItem) {
    actions.push({
      key: `review-${blockedItem.key}`,
      label: `Review ${blockedItem.label}`,
      state: blockedItem.state,
      detail: blockedItem.detail,
    })
  }

  if (!iCloud.exists) {
    actions.push({
      key: 'init-local-backup',
      label: 'Create local backup',
      state: 'draft-changes',
      detail: 'Seed .morph-local/morph-lab-data.json from the package datasets without overwriting existing work.',
      action: 'init-local-backup',
    })
  }

  for (const action of review.actions) {
    if (action.state === 'ready') continue
    const hasBlockingReview = action.conflicts > 0 || action.missing > 0
    actions.push({
      key: action.action,
      label: action.action === 'sync-datasets'
        ? hasBlockingReview ? 'Review dataset sync' : publishTarget.kind === 'local-mirror' ? 'Sync local datasets' : 'Sync website datasets'
        : hasBlockingReview ? 'Review upload promotion' : 'Promote upload assets',
      state: action.state,
      detail: `${action.copied} copy, ${action.updated} update, ${action.unchanged} unchanged, ${action.conflicts} conflict, ${action.missing} missing.`,
      command: repo.kind === 'standalone-repo' || hasBlockingReview
        ? undefined
        : action.action === 'sync-datasets'
          ? 'npm run sync:morph-datasets --workspace=@jonhanlan/me'
          : 'npm run sync:morph-assets --workspace=@jonhanlan/me',
    })
  }

  const playerExport = standalone.items.find((item) => item.key === 'player-export')
  if (playerExport && playerExport.state !== 'ready') {
    actions.push({
      key: 'export-runtime',
      label: 'Export runtime specimen',
      state: playerExport.state,
      detail: playerExport.detail,
      command: repo.kind === 'standalone-repo'
        ? 'npm run export:runtime'
        : 'npm run export:runtime-specimen --workspace=@jonhanlan/morph',
    })
  }

  if (standalone.state === 'ready' && review.state === 'ready') {
    actions.push(
      {
        key: 'open-editor',
        label: 'Open the editor',
        state: 'ready',
        detail: 'Author the next Morph specimen from the package-owned app shell.',
        href: '/?view=editor&load=1',
      },
      {
        key: repo.kind === 'standalone-repo' ? 'verify-app' : 'prove-standalone',
        label: repo.kind === 'standalone-repo' ? 'Verify app' : 'Prove standalone app',
        state: 'ready',
        detail: repo.kind === 'standalone-repo'
          ? 'Run the standalone repo verification chain before calling a change ready.'
          : 'Run the extracted app proof outside this repo before the real split.',
        command: repo.verifyCommand,
      },
    )

    if (repo.kind !== 'standalone-repo') {
      actions.push({
        key: 'check-site-player',
        label: 'Check website player',
        state: 'ready',
        detail: 'Keep the website on the slim public runtime contract.',
        command: 'npm run check:morph-runtime --workspace=@jonhanlan/me',
      })
    }
  }

  const seen = new Set<string>()
  return actions.filter((action) => {
    if (seen.has(action.key)) return false
    seen.add(action.key)
    return true
  }).slice(0, 3)
}

function morphLabPublishTarget(
  paths: MorphLabStoragePaths,
  repo: MorphLabRepoIdentity,
  review: MorphLabStatusReview,
): MorphLabPublishTarget {
  const localMirror = path.resolve(paths.siteDataDir) === path.resolve(paths.draftDatasetDir)
  const state = review.state

  if (localMirror || repo.kind === 'standalone-repo') {
    return {
      kind: 'local-mirror',
      label: 'Local publish mirror',
      state,
      detail: state === 'ready'
        ? 'Dataset publish target is the local MorphLab export shelf; website export stays outside this repo.'
        : 'Local MorphLab export shelves need review before publishing further.',
      datasetTargetDir: paths.siteDataDir,
      assetPublicPath: paths.assetPublicPath,
    }
  }

  return {
    kind: 'website-bridge',
    label: 'Website bridge',
    state,
    detail: state === 'ready'
      ? 'Website bridge is clean.'
      : 'Website bridge has draft changes or conflicts waiting for review.',
    datasetTargetDir: paths.siteDataDir,
    assetPublicPath: paths.assetPublicPath,
  }
}

async function morphLabRepoIdentity(paths: MorphLabStoragePaths): Promise<MorphLabRepoIdentity> {
  const markerPath = path.join(paths.repoRoot, '.morph-lab-standalone-repo.json')
  const marker = await readJsonFile(markerPath) as {
    schema?: unknown
    source?: { commit?: unknown; dirty?: unknown }
    target?: { temporary?: unknown }
    git?: { commit?: unknown; branch?: unknown }
  } | null
  const sourceWorkspace = await pathExists(path.join(paths.repoRoot, 'apps', 'me', 'package.json'))

  if (marker?.schema === 'morph-lab-standalone-repo-promotion/v0') {
    const targetCommit = typeof marker.git?.commit === 'string' ? marker.git.commit : null
    const sourceCommit = typeof marker.source?.commit === 'string' ? marker.source.commit : null
    const targetBranch = typeof marker.git?.branch === 'string' ? marker.git.branch : null
    const temporary = typeof marker.target?.temporary === 'boolean' ? marker.target.temporary : null
    const sourceDirty = typeof marker.source?.dirty === 'boolean' ? marker.source.dirty : null
    return {
      kind: 'standalone-repo',
      state: targetCommit ? 'ready' : 'needs-review',
      ok: Boolean(targetCommit),
      label: 'Standalone repo',
      detail: targetCommit
        ? `Repo born from ${sourceCommit ?? 'unknown source'} on ${targetBranch ?? 'main'} at ${targetCommit}.`
        : 'Standalone repo marker exists, but no target commit is recorded.',
      repoRoot: paths.repoRoot,
      markerPath,
      sourceCommit,
      targetCommit,
      targetBranch,
      temporary,
      sourceDirty,
      verifyCommand: 'npm run verify',
    }
  }

  if (sourceWorkspace) {
    return {
      kind: 'source-workspace',
      state: 'ready',
      ok: true,
      label: 'Source workspace',
      detail: 'Package-owned Morph Lab is running inside jonhanlan; promote into MorphLab for standalone app work.',
      repoRoot: paths.repoRoot,
      markerPath,
      sourceCommit: null,
      targetCommit: null,
      targetBranch: null,
      temporary: null,
      sourceDirty: null,
      verifyCommand: 'npm run prove:standalone --workspace=@jonhanlan/morph',
    }
  }

  return {
    kind: 'standalone-repo',
    state: 'ready',
    ok: true,
    label: 'Standalone workspace',
    detail: 'Standalone app workspace is running without a repo-birth marker; promotion can add provenance when needed.',
    repoRoot: paths.repoRoot,
    markerPath,
    sourceCommit: null,
    targetCommit: null,
    targetBranch: null,
    temporary: null,
    sourceDirty: null,
    verifyCommand: 'npm run verify',
  }
}

async function readMorphLabStatusReview(options: MorphLabStorageOptions): Promise<MorphLabStatusReview> {
  const [datasetDryRun, assetDryRun] = await Promise.all([
    exportMorphLabDatasets({ ...options, dryRun: true }),
    promoteMorphLabAssets({ ...options, dryRun: true }),
  ])
  const actions = [
    datasetActionPreview(datasetDryRun),
    assetActionPreview(assetDryRun),
  ]
  const issues = statusIssuesFor(actions)
  const state = actions.some((action) => action.state === 'needs-review')
    ? 'needs-review'
    : actions.some((action) => action.state === 'draft-changes')
      ? 'draft-changes'
      : 'ready'

  return {
    state,
    ok: state !== 'needs-review',
    issues,
    actions,
  }
}

function datasetActionPreview(result: MorphLabDatasetExportResult): MorphLabStatusActionPreview {
  const conflicts = result.conflicts.length
  const missing = result.missing.length
  const pending = result.copied + result.updated
  return {
    action: 'sync-datasets',
    state: conflicts || missing ? 'needs-review' : pending ? 'draft-changes' : 'ready',
    ok: result.ok,
    recommended: pending > 0 && conflicts === 0 && missing === 0,
    copied: result.copied,
    updated: result.updated,
    unchanged: result.unchanged,
    conflicts,
    missing,
    items: result.items.map((item) => ({
      status: item.status,
      label: item.kind,
      sourcePath: item.sourcePath,
      targetPath: item.targetPath,
      bytes: item.bytes,
    })),
  }
}

function assetActionPreview(result: MorphLabAssetPromotionResult): MorphLabStatusActionPreview {
  const conflicts = result.conflicts.length
  const pending = result.copied + result.updated
  return {
    action: 'promote-assets',
    state: conflicts ? 'needs-review' : pending ? 'draft-changes' : 'ready',
    ok: result.ok,
    recommended: pending > 0 && conflicts === 0,
    copied: result.copied,
    updated: result.updated,
    unchanged: result.unchanged,
    conflicts,
    missing: 0,
    items: result.items.map((item) => ({
      status: item.status,
      label: item.publicPath || item.fileName,
      sourcePath: item.sourcePath,
      targetPath: item.targetPath,
      publicPath: item.publicPath,
      bytes: item.bytes,
    })),
  }
}

function statusIssuesFor(actions: MorphLabStatusActionPreview[]): MorphLabStatusIssue[] {
  const issues: MorphLabStatusIssue[] = []
  for (const action of actions) {
    if (action.conflicts > 0 || action.missing > 0) {
      issues.push({
        severity: 'error',
        code: `${action.action}:needs-review`,
        action: action.action,
        message: `${action.action === 'sync-datasets' ? 'Dataset sync' : 'Asset promotion'} needs review: ${action.conflicts} conflict${action.conflicts === 1 ? '' : 's'}, ${action.missing} missing source${action.missing === 1 ? '' : 's'}.`,
      })
    } else if (action.copied + action.updated > 0) {
      issues.push({
        severity: 'warning',
        code: `${action.action}:draft-changes`,
        action: action.action,
        message: `${action.action === 'sync-datasets' ? 'Datasets' : 'Uploads'} have draft changes ready to publish.`,
      })
    }
  }
  return issues
}

export async function runMorphLabStatusAction(
  action: string,
  options: MorphLabStorageOptions & { overwrite?: boolean } = {},
): Promise<MorphLabStatusActionResult | MorphLabStorageFailure> {
  const { overwrite, ...statusOptions } = options
  const actionOptions = overwrite ? { ...statusOptions, overwrite: true } : statusOptions

  if (action === 'sync-datasets') {
    const result = await exportMorphLabDatasets(actionOptions)
    return {
      ok: result.ok,
      action,
      result,
      snapshot: await readMorphLabStatus(statusOptions),
    }
  }

  if (action === 'promote-assets') {
    const result = await promoteMorphLabAssets(actionOptions)
    return {
      ok: result.ok,
      action,
      result,
      snapshot: await readMorphLabStatus(statusOptions),
    }
  }

  if (action === 'init-local-backup') {
    const result = await initMorphLabLocalBackup(actionOptions)
    if (!result.ok) return result
    return {
      ok: result.ok,
      action,
      result,
      snapshot: await readMorphLabStatus(statusOptions),
    }
  }

  return { ok: false, status: 400, error: 'Unknown Morph Lab status action.' }
}

export function morphRuntimeFileName(storageKey: string) {
  const base = storageKey
    .replace(/\.json$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)

  return `${base || 'scene'}.json`
}

export async function readMorphLabRuntimeEntries(options: MorphLabStorageOptions = {}): Promise<MorphLabDataset> {
  const paths = morphLabStoragePaths(options)
  try {
    const names = await fs.readdir(paths.runtimeExportDir)
    const entries: MorphLabDataset = {}
    for (const name of names) {
      if (!name.endsWith('.json')) continue
      try {
        const entry = JSON.parse(await fs.readFile(path.join(paths.runtimeExportDir, name), 'utf8')) as MorphLabEntry
        if (isCompiledMorphRuntimeDocumentV0(entry)) entries[name.replace(/\.json$/, '')] = entry
      } catch {
        // Ignore older/non-runtime files in this folder.
      }
    }
    return entries
  } catch {
    return {}
  }
}

export async function readMorphLabRuntimeLibrary(options: MorphLabStorageOptions = {}): Promise<MorphLabRuntimeLibrary> {
  const paths = morphLabStoragePaths(options)
  const entries = await readMorphLabRuntimeEntries(options)
  const manifest = await readRuntimeExportManifest(path.join(paths.runtimeExportDir, 'manifest.json'))
  const keys = new Set([
    ...Object.keys(entries),
    ...(manifest?.entries.map((entry) => entry.storageKey) ?? []),
  ])
  const library = Array.from(keys).sort((a, b) => {
    if (a === manifest?.defaultStorageKey) return -1
    if (b === manifest?.defaultStorageKey) return 1
    return a.localeCompare(b)
  }).map((storageKey): MorphLabRuntimeLibraryEntry => {
    const document = entries[storageKey]
    const manifestEntry = manifest?.entries.find((entry) => entry.storageKey === storageKey) ?? null
    const problems = [
      ...(!document ? ['Runtime document is missing.'] : []),
      ...(!manifestEntry ? ['Runtime manifest entry is missing.'] : []),
    ]
    const compiledDocument = isCompiledMorphRuntimeDocumentV0(document) ? document : null
    const hostAdapter = resolveMorphRuntimeHostAdapterV0(storageKey)
    return {
      storageKey,
      default: storageKey === manifest?.defaultStorageKey || manifestEntry?.default === true,
      ready: problems.length === 0,
      problems,
      manifest: manifestEntry,
      document: compiledDocument,
      hostCompatibility: compiledDocument
        ? createMorphRuntimeHostCompatibilityReportForDocumentV0(compiledDocument, {
          storageKey,
          artifactPath: manifestEntry?.path,
          sceneId: manifestEntry?.sceneId,
          sceneKind: manifestEntry?.sceneKind,
          title: manifestEntry?.title,
          byteLength: manifestEntry?.byteLength,
          renderTier: manifestEntry?.renderTier,
          quality: manifestEntry?.quality,
          requiredCapabilities: manifestEntry?.requiredCapabilities,
          optionalCapabilities: manifestEntry?.optionalCapabilities,
          reducedMotionFallback: compiledDocument.fallbacks?.reducedMotion,
          ...(hostAdapter ? { hostAdapter } : {}),
        })
        : null,
      webviewHostProfiles: compiledDocument
        ? listMorphRuntimeWebviewHostProfilesForStorageKeyV0(storageKey)
        : [],
    }
  })

  return {
    kind: 'runtime',
    entries,
    manifest,
    defaultStorageKey: manifest?.defaultStorageKey ?? null,
    library,
  }
}

export async function writeMorphLabRuntimeExport(
  storageKey: string,
  body: MorphLabEntry,
  options: MorphLabStorageOptions = {},
): Promise<MorphLabRuntimeExportResult | MorphLabStorageFailure> {
  const document = body.document
  const problems = validateMorphRuntimeDocumentV0(document)
  if (problems.length) {
    return { ok: false, status: 400, error: problems[0] ?? 'Invalid runtime document.', problems }
  }
  if (!isCompiledMorphRuntimeDocumentV0(document)) {
    return {
      ok: false,
      status: 400,
      error: 'Runtime export must be compiled before it can be saved.',
    }
  }

  const paths = morphLabStoragePaths(options)
  const filename = morphRuntimeFileName(storageKey)
  const resolvedStorageKey = filename.replace(/\.json$/, '')
  const exportPath = `packages/morph/exports/runtime/${filename}`
  await fs.mkdir(paths.runtimeExportDir, { recursive: true })
  await fs.writeFile(path.join(paths.runtimeExportDir, filename), JSON.stringify(document, null, 2) + '\n', 'utf8')
  await writeRuntimeExportManifestEntry(paths, {
    storageKey: resolvedStorageKey,
    path: exportPath,
    document,
    default: body.default === true,
  })

  return {
    ok: true,
    kind: 'runtime',
    storageKey: resolvedStorageKey,
    path: exportPath,
    document,
    ...runtimeExportSidecar(body),
  }
}

export async function writeMorphLabRuntimeExportFromDataset(
  storageKey: string,
  body: MorphLabEntry = {},
  options: MorphLabStorageOptions = {},
): Promise<MorphLabRuntimeExportResult | MorphLabStorageFailure> {
  if (storageKey === drawableSignatureRuntimeStorageKeyV0 || storageKey === drawableSignatureClosedOutlineRuntimeStorageKeyV0 || storageKey === drawableSignaturePathMorphProofRuntimeStorageKeyV0 || storageKey === drawableSignatureRibbonBaselineRuntimeStorageKeyV0) {
    const dataset = await readMorphLabDataset(drawableSignatureRuntimeDatasetKindV0, options)
    const entry = dataset[drawableSignatureRuntimeDatasetKeyV0]
    if (!entry) {
      return {
        ok: false,
        status: 404,
        error: `Missing dataset ${drawableSignatureRuntimeDatasetKindV0}:${drawableSignatureRuntimeDatasetKeyV0}.`,
      }
    }

    const compiled = storageKey === drawableSignatureRibbonBaselineRuntimeStorageKeyV0
      ? compileSignatureRibbonBaselineRuntimeDocumentFromDatasetV0(entry as unknown as SignatureDataset)
      : storageKey === drawableSignaturePathMorphProofRuntimeStorageKeyV0
        ? compileSignaturePathMorphProofRuntimeDocumentFromDatasetV0(entry as unknown as SignatureDataset)
      : storageKey === drawableSignatureClosedOutlineRuntimeStorageKeyV0
        ? compileSignatureClosedOutlineRuntimeDocumentFromDatasetV0(entry as unknown as SignatureDataset)
        : compileSignatureRuntimeDocumentFromDatasetV0(entry as unknown as SignatureDataset)
    if (compiled.problems.length) {
      return {
        ok: false,
        status: 400,
        error: compiled.problems[0] ?? 'Runtime dataset compile failed.',
        problems: compiled.problems,
      }
    }

    return writeMorphLabRuntimeExport(storageKey, {
      document: compiled.document,
      default: body.default === true,
      warnings: compiled.warnings,
      stats: compiled.stats,
    }, options)
  }

  if (storageKey === drawableFlowerOrnamentRuntimeStorageKeyV0) {
    const dataset = await readMorphLabDataset(drawableFlowerOrnamentDatasetKindV0, options)
    const entry = dataset[drawableFlowerOrnamentDatasetKeyV0]
    if (!entry) {
      return {
        ok: false,
        status: 404,
        error: `Missing dataset ${drawableFlowerOrnamentDatasetKindV0}:${drawableFlowerOrnamentDatasetKeyV0}.`,
      }
    }

    const compiled = compileFlowerOrnamentRuntimeDocumentFromDatasetV0(entry as unknown as FlowerOrnamentDatasetV0)
    if (compiled.problems.length) {
      return {
        ok: false,
        status: 400,
        error: compiled.problems[0] ?? 'Runtime dataset compile failed.',
        problems: compiled.problems,
      }
    }

    return writeMorphLabRuntimeExport(storageKey, {
      document: compiled.document,
      default: body.default === true,
      warnings: compiled.warnings,
      stats: compiled.stats,
    }, options)
  }

  const ornamentSpec = drawableOrnamentRuntimeDatasetSpecV0(storageKey)
  if (ornamentSpec) {
    const dataset = await readMorphLabDataset(ornamentSpec.kind, options)
    const entry = dataset[ornamentSpec.datasetStorageKey]
    if (!entry) {
      return {
        ok: false,
        status: 404,
        error: `Missing dataset ${ornamentSpec.kind}:${ornamentSpec.datasetStorageKey}.`,
      }
    }

    const compiled = compileDrawableOrnamentRuntimeDocumentFromDatasetV0(storageKey, entry as unknown as DrawableScene)
    if (compiled.problems.length) {
      return {
        ok: false,
        status: 400,
        error: compiled.problems[0] ?? 'Runtime dataset compile failed.',
        problems: compiled.problems,
      }
    }

    return writeMorphLabRuntimeExport(storageKey, {
      document: compiled.document,
      default: body.default === true,
      warnings: compiled.warnings,
      stats: compiled.stats,
    }, options)
  }

  if (storageKey === PROFILE_MASK_RUNTIME_STORAGE_KEY_V0) {
    const dataset = await readMorphLabDataset(PROFILE_MASK_RUNTIME_DATASET_KIND_V0, options)
    const entry = dataset[PROFILE_MASK_RUNTIME_DATASET_KEY_V0]
    if (!entry) {
      return {
        ok: false,
        status: 404,
        error: `Missing dataset ${PROFILE_MASK_RUNTIME_DATASET_KIND_V0}:${PROFILE_MASK_RUNTIME_DATASET_KEY_V0}.`,
      }
    }

    const compiled = compileProfileMaskRuntimeDocumentFromDatasetV0(entry as unknown as ProfileMaskLegacySpecimenV0)
    if (compiled.problems.length) {
      return {
        ok: false,
        status: 400,
        error: compiled.problems[0] ?? 'Runtime dataset compile failed.',
        problems: compiled.problems,
      }
    }

    return writeMorphLabRuntimeExport(storageKey, {
      document: compiled.document,
      default: body.default === true,
      warnings: compiled.warnings,
      stats: compiled.stats,
    }, options)
  }

  if (storageKey === proceduralSceneRuntimeStorageKeyV0) {
    const dataset = await readMorphLabDataset(proceduralSceneRuntimeDatasetKindV0, options)
    const entry = dataset[proceduralSceneRuntimeDatasetKeyV0]
    if (!entry) {
      return {
        ok: false,
        status: 404,
        error: `Missing dataset ${proceduralSceneRuntimeDatasetKindV0}:${proceduralSceneRuntimeDatasetKeyV0}.`,
      }
    }

    const compiled = compileProceduralSceneRuntimeDocumentFromDatasetV0(entry as unknown as DrawableScene)
    if (compiled.problems.length) {
      return {
        ok: false,
        status: 400,
        error: compiled.problems[0] ?? 'Runtime dataset compile failed.',
        problems: compiled.problems,
      }
    }

    return writeMorphLabRuntimeExport(storageKey, {
      document: compiled.document,
      default: body.default === true,
      warnings: compiled.warnings,
      stats: compiled.stats,
    }, options)
  }

  const spec = scrollDemoRuntimeDatasetSpecV0(storageKey)
  if (!spec) {
    return { ok: false, status: 400, error: `No dataset-backed runtime compiler for ${storageKey}.` }
  }

  const dataset = await readMorphLabDataset(spec.kind, options)
  const entry = dataset[spec.storageKey]
  if (!entry) {
    return { ok: false, status: 404, error: `Missing dataset ${spec.kind}:${spec.storageKey}.` }
  }

  const compiled = compileScrollDemoRuntimeDocumentFromDatasetV0(storageKey, entry as unknown as ScrollDemoRuntimeDatasetEntryV0)

  if (compiled.problems.length) {
    return {
      ok: false,
      status: 400,
      error: compiled.problems[0] ?? 'Runtime dataset compile failed.',
      problems: compiled.problems,
    }
  }

  return writeMorphLabRuntimeExport(storageKey, {
    document: compiled.document,
    default: body.default === true,
    warnings: compiled.warnings,
    stats: compiled.stats,
  }, options)
}

export async function readMorphLabDataset(kind: string, options: MorphLabStorageOptions = {}): Promise<MorphLabDataset> {
  const paths = morphLabStoragePaths(options)
  const unified = await readMorphLabUnifiedStore(options)
  const fromCloud = unified[kind]
  const fromRepo = await readMorphLabRepoDataset(kind, options, paths)
  if (fromCloud && typeof fromCloud === 'object') {
    const cloudDataset = fromCloud as MorphLabDataset
    const primaryStorageKey = primaryDatasetStorageKey(kind)
    if (primaryStorageKey && !cloudDataset[primaryStorageKey] && fromRepo[primaryStorageKey]) return fromRepo
    return cloudDataset
  }
  return fromRepo
}

export async function writeMorphLabDataset(
  kind: string,
  storageKey: string,
  fields: MorphLabEntry,
  options: MorphLabStorageOptions = {},
): Promise<MorphLabEntry | null> {
  const paths = morphLabStoragePaths(options)
  const dataset = await readMorphLabDataset(kind, options)
  dataset[storageKey] = { ...(dataset[storageKey] ?? {}), ...fields }

  const unified = await readMorphLabUnifiedStore(options)
  unified[kind] = dataset
  unified._meta = { ...(unified._meta ?? {}), updatedAt: new Date().toISOString() }
  await fs.mkdir(path.dirname(paths.iCloudFile), { recursive: true })
  await fs.writeFile(paths.iCloudFile, JSON.stringify(unified, null, 2) + '\n', 'utf8')

  const repoFile = paths.repoFiles[kind]
  if (repoFile) {
    await fs.mkdir(path.dirname(repoFile), { recursive: true })
    await fs.writeFile(repoFile, JSON.stringify(dataset, null, 2) + '\n', 'utf8')
  }

  const runtimeFile = paths.runtimeFiles[`${kind}:${storageKey}`]
  if (runtimeFile) {
    await fs.mkdir(path.dirname(runtimeFile), { recursive: true })
    await fs.writeFile(runtimeFile, JSON.stringify(dataset[storageKey], null, 2) + '\n', 'utf8')
  }

  return (await readMorphLabDataset(kind, options))[storageKey] ?? null
}

async function readMorphLabUnifiedStore(options: MorphLabStorageOptions): Promise<MorphLabUnifiedStore> {
  const paths = morphLabStoragePaths(options)
  try {
    return JSON.parse(await fs.readFile(paths.iCloudFile, 'utf8')) as MorphLabUnifiedStore
  } catch {
    return {}
  }
}

async function readMorphLabRepoDataset(
  kind: string,
  options: MorphLabStorageOptions,
  existingPaths?: MorphLabStoragePaths,
): Promise<MorphLabDataset> {
  const paths = existingPaths ?? morphLabStoragePaths(options)
  const files = [
    paths.repoFiles[kind] ?? paths.repoFiles.mask,
    paths.siteFiles[kind] ?? paths.siteFiles.mask,
    path.join(paths.dataDir, datasetFileName(kind)),
  ]
  for (const file of files) {
    try {
      return JSON.parse(await fs.readFile(file, 'utf8')) as MorphLabDataset
    } catch {
      // Try the next fallback source.
    }
  }
  return {}
}

function runtimeExportSidecar(body: MorphLabEntry): MorphLabRuntimeExportSidecar {
  const warnings = Array.isArray(body.warnings)
    ? body.warnings.filter((warning): warning is string => typeof warning === 'string')
    : []
  const stats = body.stats && typeof body.stats === 'object' && !Array.isArray(body.stats)
    ? body.stats as Record<string, unknown>
    : undefined
  return {
    warnings,
    ...(stats ? { stats } : {}),
  }
}

async function writeRuntimeExportManifestEntry(
  paths: MorphLabStoragePaths,
  options: {
    storageKey: string
    path: string
    document: MorphRuntimeDocumentV0
    default?: boolean
  },
) {
  const manifestPath = path.join(paths.runtimeExportDir, 'manifest.json')
  const byteLength = new TextEncoder().encode(JSON.stringify(options.document)).length
  const summary = morphRuntimeArtifactSummaryV0(options.document, { byteLength })
  const previousManifest = await readRuntimeExportManifest(manifestPath)
  const previousEntries = previousManifest?.entries ?? []
  const defaultStorageKey = options.default ? options.storageKey : previousManifest?.defaultStorageKey || options.storageKey
  const entry: MorphRuntimeExportManifestEntryFileV0 = {
    storageKey: options.storageKey,
    path: options.path,
    schema: options.document.schema,
    version: options.document.version,
    sceneId: summary.sceneId,
    sceneKind: options.document.scene.kind,
    ...(options.document.manifest?.title ? { title: options.document.manifest.title } : {}),
    ...(options.document.manifest?.description ? { description: options.document.manifest.description } : {}),
    tags: options.document.manifest?.tags ?? [],
    exportedAt: summary.exportedAt,
    latestGeneratedAt: summary.latestGeneratedAt,
    ...(summary.renderTier ? { renderTier: summary.renderTier } : {}),
    ...(summary.quality ? { quality: summary.quality } : {}),
    byteLength,
    generatedIds: summary.generatedIds,
    requiredCapabilities: summary.requiredCapabilities,
    optionalCapabilities: summary.optionalCapabilities,
    controllers: summary.controllers,
    fieldCacheLayerCount: summary.fieldCacheLayerCount,
    cachedProgresses: summary.cachedProgresses,
  }
  const existingIndex = previousEntries.findIndex((item) => item.storageKey === options.storageKey)
  const entries = [...previousEntries]
  if (existingIndex >= 0) {
    entries[existingIndex] = entry
  } else {
    entries.push(entry)
  }
  const normalizedEntries = entries.map((item) => ({
    ...item,
    ...(item.storageKey === defaultStorageKey ? { default: true } : { default: undefined }),
  }))

  const manifest: MorphRuntimeExportManifestFileV0 = {
    schema: 'morph-runtime-export-manifest/v0',
    version: 0,
    generatedAt: latestRuntimeManifestDate(normalizedEntries),
    defaultStorageKey,
    entries: normalizedEntries,
  }
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf8')
}

async function readRuntimeExportManifest(filePath: string): Promise<MorphRuntimeExportManifestFileV0 | null> {
  try {
    const value = JSON.parse(await fs.readFile(filePath, 'utf8')) as Partial<MorphRuntimeExportManifestFileV0>
    if (
      value.schema === 'morph-runtime-export-manifest/v0' &&
      value.version === 0 &&
      typeof value.defaultStorageKey === 'string' &&
      Array.isArray(value.entries)
    ) {
      return value as MorphRuntimeExportManifestFileV0
    }
  } catch {
    return null
  }
  return null
}

function latestRuntimeManifestDate(entries: MorphRuntimeExportManifestEntryFileV0[]) {
  let latestTime = Number.NaN
  for (const entry of entries) {
    const time = Date.parse(entry.latestGeneratedAt || entry.exportedAt)
    if (!Number.isNaN(time) && (Number.isNaN(latestTime) || time > latestTime)) latestTime = time
  }
  return Number.isNaN(latestTime) ? new Date(0).toISOString() : new Date(latestTime).toISOString()
}

async function uniqueUploadFileName(directory: string, originalName: string, mimeType: string) {
  const stem = safeUploadStem(originalName)
  const ext = extensionForMimeType(mimeType)
  for (let index = 1; index < 1000; index += 1) {
    const suffix = index === 1 ? '' : `-${index}`
    const candidate = `${stem}${suffix}${ext}`
    try {
      await fs.access(path.join(directory, candidate))
    } catch {
      return candidate
    }
  }
  return `${stem}-${Date.now()}${ext}`
}

function safeUploadStem(name: string) {
  const base = name.replace(/\.[^.]+$/, '')
  return base
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'image'
}

function extensionForMimeType(mimeType: string) {
  if (mimeType === 'image/png') return '.png'
  if (mimeType === 'image/jpeg') return '.jpg'
  if (mimeType === 'image/webp') return '.webp'
  if (mimeType === 'image/gif') return '.gif'
  if (mimeType === 'image/svg+xml') return '.svg'
  if (mimeType === 'image/avif') return '.avif'
  return '.bin'
}

function datasetFileName(kind: string) {
  if (kind === 'cursor') return 'cursor-states.json'
  if (kind === drawableFlowerOrnamentDatasetKindV0) return 'flower-ornament.json'
  if (kind === proceduralSceneRuntimeDatasetKindV0) return 'procedural-scene.json'
  if (kind === PROFILE_MASK_RUNTIME_DATASET_KIND_V0) return 'profile-mask.json'
  const ornamentSpec = drawableOrnamentRuntimeDatasetSpecForKindV0(kind)
  if (ornamentSpec) return `${ornamentSpec.runtimeStorageKey}.json`
  if (kind === 'scrollDemoCueInView') return 'scroll-demo-cue-in-view.json'
  if (kind === 'scrollDemoCombined') return 'scroll-demo-combined.json'
  if (kind === 'scrollDemoHero') return 'scroll-demo-hero.json'
  if (kind === 'scrollDemoPage') return 'scroll-demo-page.json'
  if (kind === 'scrollDemoScrollPast') return 'scroll-demo-scroll-past.json'
  if (kind === 'scrollDemoTravel') return 'scroll-demo-travel.json'
  if (kind === 'signature') return 'signature.json'
  return 'morph-presets.json'
}

function primaryDatasetStorageKey(kind: string) {
  if (kind === drawableFlowerOrnamentDatasetKindV0) return drawableFlowerOrnamentDatasetKeyV0
  if (kind === proceduralSceneRuntimeDatasetKindV0) return proceduralSceneRuntimeDatasetKeyV0
  if (kind === PROFILE_MASK_RUNTIME_DATASET_KIND_V0) return PROFILE_MASK_RUNTIME_DATASET_KEY_V0
  if (kind === drawableSignatureRuntimeDatasetKindV0) return drawableSignatureRuntimeDatasetKeyV0
  const ornamentSpec = drawableOrnamentRuntimeDatasetSpecForKindV0(kind)
  if (ornamentSpec) return ornamentSpec.datasetStorageKey
  const specStorageKey = scrollDemoRuntimeDatasetSpecV0(datasetFileName(kind).replace(/\.json$/u, ''))?.storageKey
  return specStorageKey ?? null
}

function morphLabAssetPromotionTargetDir(
  paths: MorphLabStoragePaths,
  options: MorphLabAssetPromotionOptions,
) {
  if (options.siteAssetDir) return options.siteAssetDir
  if (process.env.MORPH_SITE_ASSET_DIR) return process.env.MORPH_SITE_ASSET_DIR
  const sitePublicDir = options.sitePublicDir ??
    process.env.MORPH_SITE_PUBLIC_DIR ??
    path.join(paths.repoRoot, 'apps', 'me', 'public')
  return path.join(sitePublicDir, paths.assetPublicPath.replace(/^\/+/, ''))
}

async function listMorphLabAssetFiles(directory: string, prefix = ''): Promise<string[]> {
  let entries
  try {
    entries = await fs.readdir(path.join(directory, prefix), { withFileTypes: true })
  } catch (error) {
    if (isMissingFileError(error)) return []
    throw error
  }

  const files: string[] = []
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith('.')) continue
    const fileName = path.join(prefix, entry.name)
    if (entry.isDirectory()) {
      files.push(...await listMorphLabAssetFiles(directory, fileName))
    } else if (entry.isFile() && MORPH_LAB_ALLOWED_IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      files.push(fileName)
    }
  }
  return files
}

async function readOptionalFile(filePath: string) {
  try {
    return await fs.readFile(filePath)
  } catch (error) {
    if (isMissingFileError(error)) return null
    throw error
  }
}

async function readJsonFile(filePath: string): Promise<unknown | null> {
  try {
    return JSON.parse(await fs.readFile(filePath, 'utf8')) as unknown
  } catch (error) {
    if (isMissingFileError(error) || error instanceof SyntaxError) return null
    throw error
  }
}

function resolveRepoPath(repoRoot: string, value: string) {
  return path.isAbsolute(value) ? value : path.resolve(repoRoot, value)
}

async function pathExists(filePath: string) {
  try {
    await fs.stat(filePath)
    return true
  } catch (error) {
    if (isMissingFileError(error)) return false
    throw error
  }
}

async function fileStatus(filePath: string): Promise<MorphLabFileStatus> {
  try {
    const info = await fs.stat(filePath)
    return {
      path: filePath,
      exists: info.isFile(),
      bytes: info.isFile() ? info.size : 0,
      updatedAt: info.isFile() ? info.mtime.toISOString() : null,
    }
  } catch (error) {
    if (isMissingFileError(error)) {
      return { path: filePath, exists: false, bytes: 0, updatedAt: null }
    }
    throw error
  }
}

async function directoryStatus(
  directory: string,
  includeFile: (relativePath: string) => boolean,
): Promise<MorphLabDirectoryStatus> {
  let rootInfo
  try {
    rootInfo = await fs.stat(directory)
  } catch (error) {
    if (isMissingFileError(error)) {
      return { path: directory, exists: false, files: 0, bytes: 0, updatedAt: null }
    }
    throw error
  }

  if (!rootInfo.isDirectory()) {
    return { path: directory, exists: false, files: 0, bytes: 0, updatedAt: null }
  }

  const totals = { files: 0, bytes: 0, updatedAt: rootInfo.mtime }
  await collectDirectoryStatus(directory, includeFile, totals)
  return {
    path: directory,
    exists: true,
    files: totals.files,
    bytes: totals.bytes,
    updatedAt: totals.updatedAt.toISOString(),
  }
}

async function runtimeExportDirectoryStatus(directory: string): Promise<MorphLabDirectoryStatus> {
  let rootInfo
  try {
    rootInfo = await fs.stat(directory)
  } catch (error) {
    if (isMissingFileError(error)) {
      return { path: directory, exists: false, files: 0, bytes: 0, updatedAt: null }
    }
    throw error
  }

  if (!rootInfo.isDirectory()) {
    return { path: directory, exists: false, files: 0, bytes: 0, updatedAt: null }
  }

  const totals = { files: 0, bytes: 0, updatedAt: rootInfo.mtime }
  await collectRuntimeExportDirectoryStatus(directory, totals)
  return {
    path: directory,
    exists: true,
    files: totals.files,
    bytes: totals.bytes,
    updatedAt: totals.updatedAt.toISOString(),
  }
}

async function runtimeManifestStatus(directory: string): Promise<MorphLabRuntimeManifestStatus> {
  const manifestPath = path.join(directory, 'manifest.json')
  const status = await fileStatus(manifestPath)
  if (!status.exists) {
    return { ...status, valid: false, entries: 0, defaultStorageKey: null }
  }

  const manifest = await readRuntimeExportManifest(manifestPath)
  const defaultEntry = manifest?.entries.find((entry) => entry.storageKey === manifest.defaultStorageKey)
  return {
    ...status,
    valid: Boolean(manifest && defaultEntry),
    entries: manifest?.entries.length ?? 0,
    defaultStorageKey: manifest?.defaultStorageKey ?? null,
  }
}

async function standaloneManifestStatus(filePath: string): Promise<MorphLabStandaloneManifestStatus> {
  const status = await fileStatus(filePath)
  if (!status.exists) {
    return {
      ...status,
      valid: false,
      schema: null,
      appName: null,
      requiredPaths: 0,
      commands: 0,
      bridgeRoutes: 0,
      nextExtraction: 0,
      missingFiles: [],
    }
  }

  try {
    const manifest = JSON.parse(await fs.readFile(filePath, 'utf8'))
    const packageRoot = path.dirname(filePath)
    const repoRoot = path.resolve(packageRoot, '../..')
    const missingFiles: string[] = []
    const requiredPaths = manifest && typeof manifest === 'object' && !Array.isArray(manifest) && manifest.paths?.required && typeof manifest.paths.required === 'object'
      ? Object.keys(manifest.paths.required).length
      : 0
    if (manifest && typeof manifest === 'object' && !Array.isArray(manifest) && manifest.paths?.required && typeof manifest.paths.required === 'object') {
      for (const value of Object.values(manifest.paths.required)) {
        if (typeof value !== 'string') continue
        if (!await pathExists(resolveRepoPath(repoRoot, value))) missingFiles.push(value)
      }
    }
    const commands = manifest && typeof manifest === 'object' && !Array.isArray(manifest) && manifest.commands && typeof manifest.commands === 'object'
      ? Object.keys(manifest.commands).length
      : 0
    const bridgeRoutes = manifest && typeof manifest === 'object' && !Array.isArray(manifest) && Array.isArray(manifest.websiteBridge?.routes)
      ? manifest.websiteBridge.routes.length
      : 0
    const nextExtraction = manifest && typeof manifest === 'object' && !Array.isArray(manifest) && Array.isArray(manifest.nextExtraction)
      ? manifest.nextExtraction.length
      : 0
    const schema = typeof manifest?.schema === 'string' ? manifest.schema : null
    const appName = typeof manifest?.app?.name === 'string' ? manifest.app.name : null
    const valid = schema === 'morph-lab-standalone-app/v0' &&
      manifest?.version === 0 &&
      appName === 'Morph Lab' &&
      requiredPaths >= 9 &&
      commands >= 6 &&
      bridgeRoutes >= 3 &&
      nextExtraction >= 1 &&
      missingFiles.length === 0

    return {
      ...status,
      valid,
      schema,
      appName,
      requiredPaths,
      commands,
      bridgeRoutes,
      nextExtraction,
      missingFiles,
    }
  } catch {
    return {
      ...status,
      valid: false,
      schema: null,
      appName: null,
      requiredPaths: 0,
      commands: 0,
      bridgeRoutes: 0,
      nextExtraction: 0,
      missingFiles: [],
    }
  }
}

async function packageIdentity(filePath: string): Promise<{ name: string | null; version: string | null }> {
  try {
    const value = JSON.parse(await fs.readFile(filePath, 'utf8'))
    return {
      name: typeof value?.name === 'string' ? value.name : null,
      version: typeof value?.version === 'string' ? value.version : null,
    }
  } catch {
    return { name: null, version: null }
  }
}

async function collectRuntimeExportDirectoryStatus(
  directory: string,
  totals: { files: number; bytes: number; updatedAt: Date },
  prefix = '',
) {
  let entries
  try {
    entries = await fs.readdir(path.join(directory, prefix), { withFileTypes: true })
  } catch (error) {
    if (isMissingFileError(error)) return
    throw error
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const relativePath = path.join(prefix, entry.name)
    const absolutePath = path.join(directory, relativePath)
    if (entry.isDirectory()) {
      await collectRuntimeExportDirectoryStatus(directory, totals, relativePath)
      continue
    }
    if (!entry.isFile() || !entry.name.endsWith('.json')) continue

    try {
      const document = JSON.parse(await fs.readFile(absolutePath, 'utf8'))
      if (!isCompiledMorphRuntimeDocumentV0(document)) continue
    } catch {
      continue
    }

    const info = await fs.stat(absolutePath)
    totals.files += 1
    totals.bytes += info.size
    if (info.mtime > totals.updatedAt) totals.updatedAt = info.mtime
  }
}

async function collectDirectoryStatus(
  directory: string,
  includeFile: (relativePath: string) => boolean,
  totals: { files: number; bytes: number; updatedAt: Date },
  prefix = '',
) {
  let entries
  try {
    entries = await fs.readdir(path.join(directory, prefix), { withFileTypes: true })
  } catch (error) {
    if (isMissingFileError(error)) return
    throw error
  }

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    const relativePath = path.join(prefix, entry.name)
    const absolutePath = path.join(directory, relativePath)
    if (entry.isDirectory()) {
      await collectDirectoryStatus(directory, includeFile, totals, relativePath)
      continue
    }
    if (!entry.isFile() || !includeFile(relativePath)) continue

    const info = await fs.stat(absolutePath)
    totals.files += 1
    totals.bytes += info.size
    if (info.mtime > totals.updatedAt) totals.updatedAt = info.mtime
  }
}

function isMissingFileError(error: unknown) {
  return typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'ENOENT'
}
