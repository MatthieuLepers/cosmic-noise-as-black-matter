import { generateCosmicFieldCPU, type CosmicNoiseOptions } from '@/core/utils/CosmicNoise';

export interface IGPUContextOptions {
  device: GPUDevice;
  workgroupSizeX?: number;
  workgroupSizeY?: number;
  workgroupSizeZ?: number;
  initParticleDone?: boolean;
  cosmicNoiseOptions?: CosmicNoiseOptions;
  generateCosmicNoise?: () => Float32Array;
}

export class GPUContext {
  public device: GPUDevice;

  public workgroupSize: [number, number, number] = [1, 1, 1];

  public initParticleDone: boolean = false;

  public cosmicNoiseOptions: CosmicNoiseOptions;

  public generateCosmicNoise: () => Float32Array;

  public debug: boolean = false;

  public textures: Record<string, GPUTexture> = {};

  public buffers: Record<string, GPUBuffer> = {};

  constructor({
    device,
    initParticleDone = false,
    workgroupSizeX = 256,
    workgroupSizeY = 1,
    workgroupSizeZ = 1,
    cosmicNoiseOptions = {
      size: 64,
      octaves: 4,
      persistence: 0.5,
      scale: 0.05,
    },
    generateCosmicNoise = () => generateCosmicFieldCPU(cosmicNoiseOptions),
  }: IGPUContextOptions) {
    this.device = device;
    this.initParticleDone = initParticleDone;
    this.workgroupSize = [workgroupSizeX, workgroupSizeY, workgroupSizeZ];
    this.cosmicNoiseOptions = cosmicNoiseOptions;
    this.generateCosmicNoise = generateCosmicNoise;
  }

  get particleCount() {
    return this.cosmicNoiseOptions.size ** 3;
  }
}
