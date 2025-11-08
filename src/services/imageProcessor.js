// Esqueleto de integração com MediaPipe (Tasks Vision) e utilitários de máscara
// Objetivo: fornecer funções iniciais para carregar o segmenter, gerar máscara e aplicar cor
// Observação: o código tenta inicializar o segmenter se a biblioteca estiver instalada.

let _segmenter = null;

/**
 * Inicializa o ImageSegmenter (MediaPipe Tasks Vision) se possível.
 * Opções mínimas: { wasmBasePath }
 */
export async function initializeSegmenter(options = {}) {
  if (_segmenter) return _segmenter;
  try {
    // Import dinâmico para não quebrar em ambientes sem a lib instalada
    const { FilesetResolver, ImageSegmenter } = await import('@mediapipe/tasks-vision');

    const wasmBase = options.wasmBasePath || 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm';
    // Criar FilesetResolver conforme exemplo do pacote
    const filesetResolver = await FilesetResolver.forVisionTasks(wasmBase);

    // A configuração do modelo depende de onde você hospeda o .tflite; usando placeholder
    const segmenter = await ImageSegmenter.createFromOptions(filesetResolver, {
      baseOptions: {
        // modelAssetPath: options.modelAssetPath || 'https://.../your_segmenter.tflite'
      },
      runningMode: 'IMAGE'
    });

    _segmenter = segmenter;
    console.info('[imageProcessor] MediaPipe ImageSegmenter inicializado');
    return _segmenter;
  } catch (err) {
    console.warn('[imageProcessor] não foi possível inicializar MediaPipe ImageSegmenter:', err?.message || err);
    _segmenter = null;
    return null;
  }
}

/**
 * Recebe um ImageBitmap (ou Canvas/Image) e retorna uma máscara booleana como Uint8ClampedArray
 * Se MediaPipe não estiver disponível, retorna uma máscara circular de teste.
 * Resultado: { width, height, mask } onde mask é um Uint8ClampedArray com 0/255 por pixel.
 */
export async function segmentImage(imageBitmap, opts = {}) {
  if (!imageBitmap) throw new Error('segmentImage: imageBitmap é obrigatório');

  // se o segmenter está disponível, use-o
  if (_segmenter) {
    try {
      // A API exata depende da versão da lib; aqui usamos um padrão esperado.
      const result = await _segmenter.segment(imageBitmap, { directory: 0 });
      // `result` API varia — tente extrair um mask ou segmentation
      if (result && result.segmentationMask) {
        const { width, height, data } = result.segmentationMask;
        // Data pode ser Float32Array ou Uint8Array; normalizar para 0/255
        let mask;
        if (data instanceof Uint8ClampedArray || data instanceof Uint8Array) {
          mask = new Uint8ClampedArray(data.length);
          for (let i = 0; i < data.length; i++) mask[i] = data[i] ? 255 : 0;
        } else if (data && data.length) {
          mask = new Uint8ClampedArray(data.length);
          for (let i = 0; i < data.length; i++) mask[i] = data[i] > 0.5 ? 255 : 0;
        } else {
          // fallback: criar máscara vazia
          mask = new Uint8ClampedArray(width * height);
        }
        return { width, height, mask };
      }
    } catch (err) {
      console.warn('[imageProcessor] segmenter failed:', err?.message || err);
    }
  }

  // Fallback: máscara circular no centro (útil para desenvolvimento/local)
  const width = imageBitmap.width || opts.width || 256;
  const height = imageBitmap.height || opts.height || 256;
  const cx = Math.floor(width / 2);
  const cy = Math.floor(height / 2);
  const r = Math.floor(Math.min(width, height) / 4);
  const mask = new Uint8ClampedArray(width * height);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const inside = dx * dx + dy * dy <= r * r;
      mask[y * width + x] = inside ? 255 : 0;
    }
  }
  return { width, height, mask };
}

/**
 * Aplica a cor `color` (string CSS) apenas nos pixels ativos da máscara sobre o canvas.
 * Blend simples preservando iluminação: converte pixels para HSL, substitui hue/saturation e reconstrói.
 * Implementação simples: aplica um overlay colorido com alpha proporcional à máscara.
 */
/**
 * Extrai o componente conectado (4-vizinhos) da máscara no ponto (cx, cy).
 * Retorna um novo objeto { width, height, mask } onde mask contém apenas o componente (0/255).
 */
export function extractComponentMask(maskObj, cx, cy) {
  if (!maskObj) throw new Error('extractComponentMask: maskObj é obrigatório');
  const { width, height, mask } = maskObj;
  if (cx < 0 || cy < 0 || cx >= width || cy >= height) return { width, height, mask: new Uint8ClampedArray(width * height) };

  const idx = cy * width + cx;
  if (mask[idx] === 0) {
    // clique em área sem máscara
    return { width, height, mask: new Uint8ClampedArray(width * height) };
  }

  const out = new Uint8ClampedArray(width * height);
  const queue = [idx];
  out[idx] = 255;

  while (queue.length) {
    const i = queue.pop();
    const y = Math.floor(i / width);
    const x = i % width;

    // vizinhos 4-direções
    const neighbors = [ [x-1,y], [x+1,y], [x,y-1], [x,y+1] ];
    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const ni = ny * width + nx;
      if (mask[ni] && !out[ni]) {
        out[ni] = 255;
        queue.push(ni);
      }
    }
  }

  return { width, height, mask: out };
}

export function applyColorToMask(ctx, maskObj, color = '#ff0000', alpha = 0.8) {
  if (!ctx || !maskObj) throw new Error('applyColorToMask: ctx e maskObj são obrigatórios');
  const { width, height, mask } = maskObj;
  // captura imagem atual
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // parse color para RGB
  const tmp = document.createElement('canvas');
  tmp.width = 1; tmp.height = 1;
  const tctx = tmp.getContext('2d');
  tctx.fillStyle = color;
  tctx.fillRect(0, 0, 1, 1);
  const c = tctx.getImageData(0, 0, 1, 1).data;
  const rc = c[0], gc = c[1], bc = c[2];

  for (let i = 0, p = 0; i < mask.length; i++, p += 4) {
    const m = mask[i] / 255;
    if (m <= 0) continue;
    // blend: new = lerp(original, color, alpha * mask)
    const blend = alpha * m;
    data[p] = Math.round(data[p] * (1 - blend) + rc * blend);
    data[p + 1] = Math.round(data[p + 1] * (1 - blend) + gc * blend);
    data[p + 2] = Math.round(data[p + 2] * (1 - blend) + bc * blend);
    // mantemos alpha original
  }

  ctx.putImageData(imageData, 0, 0);
}

const imageProcessor = {
  initializeSegmenter,
  segmentImage,
  applyColorToMask,
  extractComponentMask
};

export default imageProcessor;
