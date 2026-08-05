'use client'

import { useEffect, useRef, useState } from 'react'

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`

const FRAGMENT_SHADER = `
  precision mediump float;
  varying vec2 v_uv;
  uniform sampler2D u_image;
  uniform vec2 u_resolution;
  uniform vec2 u_image_resolution;
  uniform float u_time;
  uniform float u_reveal;

  float random(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float imageLuma(vec2 uv) {
    return dot(texture2D(u_image, uv).rgb, vec3(0.299, 0.587, 0.114));
  }

  void main() {
    float screen_aspect = u_resolution.x / u_resolution.y;
    float image_aspect = u_image_resolution.x / u_image_resolution.y;
    vec2 uv = v_uv;
    if (screen_aspect > image_aspect) {
      uv.y = (uv.y - 0.5) * (image_aspect / screen_aspect) + 0.5;
    } else {
      uv.x = (uv.x - 0.5) * (screen_aspect / image_aspect) + 0.5;
    }

    // Crop past the original Polaroid paper so only the flower photograph
    // becomes the responsive page texture.
    uv = vec2(
      mix(0.064, 0.936, uv.x),
      mix(0.210, 0.947, uv.y)
    );

    uv += vec2(
      sin(u_time * 0.045 + uv.y * 7.0) + sin(uv.x * 3.4),
      cos(u_time * 0.038 + uv.x * 6.0) + cos(uv.y * 3.1)
    ) * 0.017;

    // A broad, offset sample softens the literal photograph into blocks of
    // botanical tone before the halftone screen is applied.
    vec3 source = texture2D(u_image, uv).rgb * 0.56;
    source += texture2D(u_image, uv + vec2(0.018, -0.012)).rgb * 0.24;
    source += texture2D(u_image, uv + vec2(-0.014, 0.021)).rgb * 0.20;
    float luminance = dot(source, vec3(0.299, 0.587, 0.114));

    // Pull broad petal and leaf boundaries from the source. This gives the
    // abstract print enough structure to read as a flower without restoring
    // the literal photograph.
    vec2 edge_step = vec2(8.0) / u_image_resolution;
    float edge_x = imageLuma(uv + vec2(edge_step.x, 0.0)) - imageLuma(uv - vec2(edge_step.x, 0.0));
    float edge_y = imageLuma(uv + vec2(0.0, edge_step.y)) - imageLuma(uv - vec2(0.0, edge_step.y));
    float petal_edge = smoothstep(0.025, 0.19, length(vec2(edge_x, edge_y)) * 2.8);

    // The photograph exists only as a staggered field of ink dots. Offset
    // alternating rows so it feels printed rather than like a screen overlay.
    float cell_size = clamp(min(u_resolution.x, u_resolution.y) / 68.0, 9.0, 14.5);
    vec2 grid = gl_FragCoord.xy / cell_size;
    grid.x += mod(floor(grid.y), 2.0) * 0.5;
    vec2 cell_id = floor(grid);
    vec2 cell = fract(grid) - 0.5;
    vec2 jitter = vec2(random(cell_id), random(cell_id + vec2(19.1, 7.7))) - 0.5;
    cell -= jitter * 0.15;
    float tone = pow(smoothstep(0.055, 0.78, luminance), 0.72);
    float structure = max(tone, petal_edge * 0.92);
    float radius = mix(0.025, 0.335, structure);
    float dot_mask = 1.0 - smoothstep(radius - 0.035, radius + 0.055, length(cell));

    // A second, rotated screen acts like slightly misregistered warm ink. It
    // appears only along the flower contours and echoes the cover's light leak.
    float screen_angle = 0.19;
    mat2 rotate_screen = mat2(cos(screen_angle), -sin(screen_angle), sin(screen_angle), cos(screen_angle));
    vec2 contour_grid = rotate_screen * (gl_FragCoord.xy - u_resolution * 0.5) / (cell_size * 1.65);
    vec2 contour_id = floor(contour_grid);
    vec2 contour_cell = fract(contour_grid) - 0.5;
    contour_cell -= (vec2(random(contour_id + 5.4), random(contour_id + 12.8)) - 0.5) * 0.11;
    float contour_radius = mix(0.045, 0.235, petal_edge);
    float contour_dots = 1.0 - smoothstep(contour_radius - 0.035, contour_radius + 0.055, length(contour_cell));

    float cell_order = random(cell_id) * 0.56 + (1.0 - v_uv.y) * 0.34 + v_uv.x * 0.10;
    float dot_reveal = smoothstep(cell_order - 0.12, cell_order + 0.12, u_reveal);

    vec3 paper = vec3(0.006, 0.010, 0.008);
    float warmth = smoothstep(0.25, 0.82, source.r * 0.78 + luminance * 0.22);
    vec3 ink = mix(vec3(0.14, 0.19, 0.075), vec3(0.66, 0.255, 0.13), warmth);
    ink = mix(ink, vec3(0.52, 0.46, 0.39), smoothstep(0.58, 0.9, luminance) * 0.56);
    ink *= 0.14 + structure * 0.37;

    // Pull the screen back beneath the interface rather than adding another
    // panel. The flower stays present at the edges while text remains calm.
    vec2 content_distance = (gl_FragCoord.xy - u_resolution * 0.5) /
      vec2(min(380.0, u_resolution.x * 0.46), u_resolution.y * 0.49);
    float quiet_zone = 1.0 - smoothstep(0.56, 1.04, length(content_distance));
    float interface_clearance = mix(1.0, 0.22, quiet_zone);
    float main_ink = dot_mask * dot_reveal * interface_clearance;
    vec3 botanical = mix(paper, ink, main_ink);
    vec3 contour_ink = mix(vec3(0.71, 0.275, 0.12), vec3(0.66, 0.56, 0.45), luminance);
    float contour_clearance = mix(1.0, 0.30, quiet_zone);
    botanical = mix(botanical, contour_ink, contour_dots * petal_edge * dot_reveal * contour_clearance * 0.48);

    vec2 centered = v_uv - 0.5;
    float vignette = smoothstep(0.86, 0.2, length(centered * vec2(0.82, 1.0)));
    botanical *= mix(0.43, 1.0, vignette);
    gl_FragColor = vec4(botanical, 1.0);
  }
`

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Unable to create background shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || 'Unable to compile background shader'
    gl.deleteShader(shader)
    throw new Error(message)
  }
  return shader
}

export function HalftoneBackdrop({ src }: { src: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, powerPreference: 'low-power' })
    if (!gl) return

    let animationFrame = 0
    let disposed = false
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vertexShader)
    gl.attachShader(program, fragmentShader)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    const buffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    const resolutionLocation = gl.getUniformLocation(program, 'u_resolution')
    const imageResolutionLocation = gl.getUniformLocation(program, 'u_image_resolution')
    const timeLocation = gl.getUniformLocation(program, 'u_time')
    const revealLocation = gl.getUniformLocation(program, 'u_reveal')
    const image = new window.Image()
    image.decoding = 'async'

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
      const width = Math.max(1, Math.round(canvas.clientWidth * dpr))
      const height = Math.max(1, Math.round(canvas.clientHeight * dpr))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
        gl.viewport(0, 0, width, height)
      }
    }
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    image.onload = () => {
      if (disposed) return
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
      gl.uniform2f(imageResolutionLocation, image.naturalWidth, image.naturalHeight)
      setReady(true)
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      let lastFrame = 0
      let revealStartedAt: number | null = null
      const draw = (timestamp: number) => {
        if (disposed) return
        if (revealStartedAt == null) revealStartedAt = timestamp
        if (timestamp - lastFrame >= 33 || reducedMotion) {
          resize()
          lastFrame = timestamp
          gl.uniform2f(resolutionLocation, canvas.width, canvas.height)
          gl.uniform1f(timeLocation, reducedMotion ? 0 : timestamp / 1000)
          gl.uniform1f(revealLocation, reducedMotion ? 1 : Math.min(1, (timestamp - revealStartedAt) / 1850))
          gl.drawArrays(gl.TRIANGLES, 0, 6)
        }
        if (!reducedMotion) animationFrame = window.requestAnimationFrame(draw)
      }
      animationFrame = window.requestAnimationFrame(draw)
    }
    image.src = src

    return () => {
      disposed = true
      observer.disconnect()
      window.cancelAnimationFrame(animationFrame)
      gl.deleteTexture(texture)
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
      gl.deleteShader(vertexShader)
      gl.deleteShader(fragmentShader)
    }
  }, [src])

  return (
    <div className={`halftone-backdrop${ready ? ' is-ready' : ''}`} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt="" className="halftone-fallback" onLoad={() => setReady(true)} />
      <canvas ref={canvasRef} className="halftone-canvas" />
    </div>
  )
}
