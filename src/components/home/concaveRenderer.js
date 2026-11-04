// A small curved image wall renderer. The original product files are used as textures.
export function createConcaveRenderer(canvas, products, onReady) {
  const gl = canvas.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: false, preserveDrawingBuffer: true });
  if (!gl) { onReady(false); return null; }
  const vertex = `
    precision mediump float;
    attribute vec2 a_uv;
    uniform vec2 u_viewport;
    uniform float u_width, u_offset, u_reflection;
    varying vec2 v_uv;
    varying float v_edge;
    void main() {
      float height = u_width / 1.25;
      float camera = height * 4.0;
      float radius = camera * 0.72;
      float angle = (u_offset + (a_uv.x - 0.5) * u_width) / radius;
      float x = radius * sin(angle);
      float z = radius * (1.0 - cos(angle));
      float scale = camera / max(camera - z, camera * 0.12);
      float y = (0.5 - a_uv.y) * height;
      if (u_reflection > 0.5) y = -height * 0.5 - 16.0 - a_uv.y * height;
      gl_Position = vec4(x * scale * 2.0 / u_viewport.x, y * scale * 2.0 / u_viewport.y - 0.02, 0.0, 1.0);
      v_uv = a_uv;
      v_edge = clamp(abs(x * scale) / (u_viewport.x * 0.5), 0.0, 1.0);
    }
  `;
  const fragment = `
    precision mediump float;
    uniform sampler2D u_image;
    uniform vec2 u_crop;
    uniform float u_width, u_reflection;
    varying vec2 v_uv;
    varying float v_edge;
    void main() {
      vec2 size = vec2(u_width, u_width / 1.25);
      vec2 corner = abs((v_uv - 0.5) * size) - size * 0.5 + 14.0;
      float distance = length(max(corner, 0.0)) + min(max(corner.x, corner.y), 0.0) - 14.0;
      float alpha = 1.0 - smoothstep(-0.75, 0.75, distance);
      vec2 uv = v_uv;
      if (u_reflection > 0.5) uv.y = 1.0 - uv.y;
      vec4 image = texture2D(u_image, (uv - 0.5) * u_crop + 0.5);
      // Side cards turn slightly transparent towards the viewport edges.
      alpha *= 1.0 - 0.25 * v_edge * v_edge;
      if (u_reflection > 0.5) alpha *= 0.06 * pow(1.0 - v_uv.y, 3.0);
      gl_FragColor = vec4(image.rgb, image.a * alpha);
    }
  `;
  const shaders = [];
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { const detail = gl.getShaderInfoLog(shader); gl.deleteShader(shader); throw new Error(detail); }
    shaders.push(shader);
    return shader;
  };
  const program = gl.createProgram();
  try {
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (error) {
    console.warn('Curved gallery is using its CSS fallback:', error.message);
    shaders.forEach((shader) => gl.deleteShader(shader));
    gl.deleteProgram(program);
    return null;
  }
  gl.useProgram(program);
  const vertices = [];
  // Dense strips bend each image smoothly, including its top and bottom edges.
  for (let i = 0; i < 48; i++) {
    const a = i / 48, b = (i + 1) / 48;
    vertices.push(a, 0, b, 0, a, 1, a, 1, b, 0, b, 1);
  }
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
  const uv = gl.getAttribLocation(program, 'a_uv');
  gl.enableVertexAttribArray(uv);
  gl.vertexAttribPointer(uv, 2, gl.FLOAT, false, 0, 0);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  const uniforms = Object.fromEntries(['viewport', 'width', 'offset', 'reflection', 'crop', 'image'].map((name) => [name, gl.getUniformLocation(program, `u_${name}`)]));
  gl.uniform1i(uniforms.image, 0);
  let disposed = false;
  let ready = false;
  let lastPosition = 0;
  let lastWidth = 300;
  const textures = products.map(() => gl.createTexture());
  const images = products.map(() => new Image());
  let loaded = 0;
  const draw = (position = lastPosition, cardWidth = lastWidth) => {
    lastPosition = position;
    lastWidth = cardWidth;
    if (disposed || !ready || gl.isContextLost()) return;
    const width = canvas.clientWidth, height = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const pixelWidth = Math.round(width * dpr), pixelHeight = Math.round(height * dpr);
    if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
      canvas.width = pixelWidth;
      canvas.height = pixelHeight;
    }
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(uniforms.viewport, width, height);
    gl.uniform1f(uniforms.width, cardWidth);
    products.forEach((_, index) => {
      const offset = index - position;
      if (Math.abs(offset) > 3) return;
      gl.bindTexture(gl.TEXTURE_2D, textures[index]);
      const aspect = images[index].naturalWidth / images[index].naturalHeight;
      gl.uniform2f(uniforms.crop, Math.min(1, 1.25 / aspect), Math.min(1, aspect / 1.25));
      gl.uniform1f(uniforms.offset, offset * (cardWidth + 24));
      gl.uniform1f(uniforms.reflection, 1);
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
      gl.uniform1f(uniforms.reflection, 0);
      gl.drawArrays(gl.TRIANGLES, 0, vertices.length / 2);
    });
  };
  images.forEach((image, index) => {
    image.onload = () => {
      if (disposed || gl.isContextLost()) return;
      gl.bindTexture(gl.TEXTURE_2D, textures[index]);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      loaded++;
      if (loaded === products.length) { ready = true; draw(); onReady(true); }
    };
    image.src = products[index].image;
  });
  const lost = (event) => { event.preventDefault(); ready = false; onReady(false); };
  canvas.addEventListener('webglcontextlost', lost);
  return {
    draw,
    destroy() {
      disposed = true;
      images.forEach((image) => { image.onload = null; });
      canvas.removeEventListener('webglcontextlost', lost);
      textures.forEach((texture) => gl.deleteTexture(texture));
      gl.deleteBuffer(buffer);
      shaders.forEach((shader) => gl.deleteShader(shader));
      gl.deleteProgram(program);
      onReady(false);
    },
  };
}
