"use client";

import { useEffect, useRef } from "react";

// A single triangle big enough to cover the whole clip-space square
// (-1..1 on both axes) is cheaper to draw than a quad -- no index buffer,
// no second triangle -- the corners outside the viewport just get clipped.
const VERTEX_SOURCE = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SOURCE = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;

// Cheap pseudo-random hash, used only for the grain pass at the end.
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  // uv: pixel position normalized to 0..1, then re-centered around the
  // middle of the screen and corrected for aspect ratio, so the flow
  // field below isn't stretched into ovals on a wide screen.
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;
  vec2 p = uv - 0.5;
  p.x *= u_resolution.x / u_resolution.y;

  // Mouse influence: nudge the sampling point toward wherever the cursor
  // is, so the ribbons visibly lean in that direction. u_mouse is already
  // normalized 0..1 with the same bottom-left origin as gl_FragCoord.
  vec2 mouseOffset = u_mouse - 0.5;
  mouseOffset.x *= u_resolution.x / u_resolution.y;
  p += mouseOffset * 0.35;

  // The flow field: three sine waves at different frequencies, angles and
  // speeds, summed together. This -- not a noise texture -- is the whole
  // "aurora" effect: overlapping waves interfere and drift over time.
  float flow = 0.0;
  flow += sin(p.x * 3.0 + u_time * 0.4 + p.y * 2.0) * 0.5;
  flow += sin(p.y * 4.0 - u_time * 0.3 + p.x * 1.5) * 0.35;
  flow += sin((p.x + p.y) * 5.0 + u_time * 0.25) * 0.25;

  // Rescale flow (roughly -1..1) to 0..1 so it can drive a color mix.
  float t = flow * 0.5 + 0.5;

  // Palette: deep indigo -> teal -> violet (bioluminescence, not a
  // generic sunset). Two smoothstep-driven mixes instead of one so teal
  // gets its own visible band instead of being a fleeting midpoint.
  vec3 colorA = vec3(0.03, 0.05, 0.15);
  vec3 colorB = vec3(0.10, 0.55, 0.55);
  vec3 colorC = vec3(0.45, 0.25, 0.75);
  vec3 color = mix(colorA, colorB, smoothstep(0.0, 0.6, t));
  color = mix(color, colorC, smoothstep(0.5, 1.0, t));

  // Vignette: darken toward the edges regardless of what the flow field
  // is doing there, so headline text placed over this always has a
  // dark-enough backdrop to stay readable.
  float vignette = 1.0 - smoothstep(0.4, 0.9, length(p));
  color *= mix(0.5, 1.0, vignette);

  // Grain: a tiny per-pixel dither. Breaks up gradient banding on
  // lower-color-depth displays; subtle enough to read as texture, not noise.
  float grain = (hash(gl_FragCoord.xy + u_time) - 0.5) * 0.035;
  color += grain;

  gl_FragColor = vec4(color, 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Could not create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${info}`);
  }
  return shader;
}

const MAX_DPR = 2;

// Fullscreen WebGL fragment shader, positioned behind whatever content the
// caller layers on top. Plain WebGL rather than react-three-fiber: this is
// a 2D effect with no scene graph, so a raw canvas + two small shaders is
// the whole app -- no 3D library needed to draw a gradient.
export function ShaderHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;

    const glCtx = canvasEl.getContext("webgl");
    // No WebGL support: bail out silently. The canvas's CSS background
    // (set below in the JSX) is a static gradient in the same palette,
    // and simply stays visible since nothing ever draws over it.
    if (!glCtx) return;

    // Rebound to plain names (not just narrowed) so TS treats them as
    // definitely non-null inside the closures below (resize, draw,
    // handlePointerMove) -- narrowing from an `if` guard doesn't persist
    // into nested function bodies, but a fresh non-nullable binding does.
    const canvas: HTMLCanvasElement = canvasEl;
    const gl: WebGLRenderingContext = glCtx;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SOURCE);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
    const program = gl.createProgram();
    if (!program) throw new Error("Could not create program");
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`);
    }
    gl.useProgram(program);

    // The one triangle described above.
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const positionLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLoc);
    gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const mouseLoc = gl.getUniformLocation(program, "u_mouse");

    const mouse = { x: 0.5, y: 0.5 };
    function handlePointerMove(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = (e.clientX - rect.left) / rect.width;
      // Flip y: DOM coordinates start top-left; gl_FragCoord starts bottom-left.
      mouse.y = 1 - (e.clientY - rect.top) / rect.height;
    }
    window.addEventListener("pointermove", handlePointerMove);

    // Backing-store resolution is capped at 2x device pixels -- a 3x/4x
    // phone display doesn't need 3-4x the fragment-shader work for a
    // background gradient nobody is inspecting pixel-by-pixel.
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      const width = Math.round(canvas.clientWidth * dpr);
      const height = Math.round(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
    }
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    function draw(time: number) {
      gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, time);
      gl.uniform2f(mouseLoc, mouse.x, mouse.y);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let rafId: number | null = null;
    const start = performance.now();
    function loop(now: number) {
      draw((now - start) / 1000);
      rafId = requestAnimationFrame(loop);
    }

    if (prefersReducedMotion) {
      // One real frame of the shader, frozen -- a still, not a blank
      // canvas and not a separate plain-gradient code path.
      draw(0);
    } else {
      rafId = requestAnimationFrame(loop);
    }

    // Pause entirely when the tab isn't visible; resume where a fresh
    // frame naturally picks up when it becomes visible again.
    function handleVisibilityChange() {
      if (prefersReducedMotion) return;
      if (document.hidden) {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = null;
      } else if (rafId === null) {
        rafId = requestAnimationFrame(loop);
      }
    }
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      resizeObserver.disconnect();
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{
        // Static CSS fallback in the same palette the shader draws --
        // shows immediately on load, and is *all* a browser with no
        // WebGL support (or a failed context) will ever show, since the
        // effect above bails out before drawing anything.
        background: "linear-gradient(135deg, #08090f 0%, #12384a 55%, #6b3fbf 100%)",
      }}
    />
  );
}
