import { createNoise3D } from 'simplex-noise';
import Noise from 'noisejs';

export interface CosmicNoiseOptions {
  size: number;
  octaves: number;
  persistence: number;
  scale: number;
}

export function generateCosmicFieldCPU(options: CosmicNoiseOptions): Float32Array {
  const { size } = options;
  const noise3D = createNoise3D();
  const field = new Float32Array(size * size * size);

  let idx = 0;
  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const scale = 0.05; // Moduler la "fréquence" du bruit
        const value = noise3D(x * scale, y * scale, z * scale);
        field[idx++] = value;
      }
    }
  }

  return field;
}

export function generateCosmicNoise3D(options: CosmicNoiseOptions): Float32Array {
  const { size, octaves, persistence, scale } = options;
  const data = new Float32Array(size * size * size);

  function noise3D(x: number, y: number, z: number): number {
    const val = Math.sin(x * 12.9898 + y * 78.233 + z * 45.164) * 43758.5453;
    return val - Math.floor(val);
  }

  for (let z = 0; z < size; z += 1) {
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        let amplitude = 1.0;
        let frequency = scale;
        let noiseValue = 0.0;

        for (let o = 0; o < octaves; o += 1) {
          const nx = x * frequency;
          const ny = y * frequency;
          const nz = z * frequency;
          const sample = noise3D(nx, ny, nz);

          const smoothed = Math.tanh(Math.PI * (sample * 2.0 - 1.0));

          noiseValue += smoothed * amplitude;
          amplitude *= persistence;
          frequency *= 2.0;
        }

        const index = x + y * size + z * size * size;
        data[index] = noiseValue;
      }
    }
  }

  return data;
}

export function createCosmicTexture3D(
  device: GPUDevice,
  size: number,
  generateNoise: () => Float32Array,
): GPUTexture {
  const texture = device.createTexture({
    size: [size, size, size],
    format: 'r32float',
    dimension: '3d',
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.STORAGE_BINDING,
  });

  const bytesPerRow = size * Float32Array.BYTES_PER_ELEMENT; // 1 float par voxel
  const rowsPerImage = size;

  // Upload
  device.queue.writeTexture(
    { texture: texture },
    generateNoise(),
    { bytesPerRow, rowsPerImage },
    [size, size, size]
  );

  return texture;
}

export function generateCosmicStructure(options: CosmicNoiseOptions): Float32Array {
  const { size, octaves, persistence, scale } = options;
  const noise3D = createNoise3D();
  const data = new Float32Array(size * size * size);

  function ridgedNoise(x: number, y: number, z: number): number {
    const value = noise3D(x, y, z);
    return 1.0 - Math.abs(value);
  }

  function domainWarp(x: number, y: number, z: number): [number, number, number] {
    const warp = 2.0;
    const nx = x + noise3D(x, y, z) * warp;
    const ny = y + noise3D(x + 5.2, y + 1.3, z + 8.7) * warp;
    const nz = z + noise3D(x + 9.2, y + 2.8, z + 1.7) * warp;
    return [nx, ny, nz];
  }

  for (let z = 0; z < size; z++) {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        let amplitude = 1.0;
        let frequency = scale;
        let noiseValue = 0.0;
        let weight = 1.0;

        for (let o = 0; o < octaves; o++) {
          // Domain warping pour créer des distorsions naturelles
          const [nx, ny, nz] = domainWarp(
            x * frequency,
            y * frequency,
            z * frequency
          );

          // Ridged noise pour créer des filaments
          let ridged = ridgedNoise(nx, ny, nz);
          ridged = ridged * ridged; // Carré pour accentuer les crêtes

          // Combiner avec le bruit de base
          const baseNoise = noise3D(nx, ny, nz);
          const combined = (ridged + baseNoise) * 0.5;

          noiseValue += combined * amplitude * weight;
          amplitude *= persistence;
          frequency *= 2.0;
          weight = ridged; // Utiliser le ridged comme poids pour le prochain octave
        }

        // Normaliser entre -1 et 1
        noiseValue = noiseValue * 2.0 - 1.0;

        const index = x + y * size + z * size * size;
        data[index] = noiseValue;
      }
    }
  }

  return data;
}

export function generateFilamentNoise(options: CosmicNoiseOptions): Float32Array {
  const { size, octaves } = options;
  const noise = new Noise(Math.random());

  const points: [number, number, number][] = Array.from({ length: 30 }, () => [
    Math.random() * size,
    Math.random() * size,
    Math.random() * size,
  ]);

  function voronoiDistance(x: number, y: number, z: number): number {
    let minDist = Infinity;
    for (const [px, py, pz] of points) {
      const dx = x - px, dy = y - py, dz = z - pz;
      const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
      minDist = Math.min(minDist, dist);
    }
    return minDist / size;
  }


  const data = new Float32Array(size * size * size);
  for (let z = 0; z < size; z += 1) {
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const i = x + y * size + z * size * size;

        const nx = x / size;
        const ny = y / size;
        const nz = z / size;

        const p = noise.perlin3(nx * octaves, ny * octaves, nz * octaves);
        const v = voronoiDistance(x, y, z);
        const filament = Math.max(0, 1.0 - v * 8.0);

        data[i] = p * filament;
      }
    }
  }
  return data;
}
