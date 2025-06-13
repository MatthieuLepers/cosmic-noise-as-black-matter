import InitParticlesShaderCode from '@/core/classes/GPU/Kernels/Compute/InitParticlesShader.wgsl?raw';
import { ComputeKernel } from '@/core/classes/GPU/Kernels/Compute/';
import type { GPUContext } from '@/core/classes/GPU/Context';
import { readStorageTexture } from '@/core/classes/utils';
import { extractData, getAsFloat32Array } from '@/core/tests/utils';

export const PARTICLE_STRIDE = 8;

export const PIXELS_PER_PARTICLE = Math.ceil(PARTICLE_STRIDE / 4);

export class InitParticlesKernel extends ComputeKernel {
  constructor(context: GPUContext) {
    super(context);
    this.dispatchSize[0] = Math.ceil(context.particleCount / 256);
  }

  async prepare() {
    const textureWidth = Math.min(8192, this.context.particleCount * PIXELS_PER_PARTICLE);
    const textureHeight = Math.ceil((this.context.particleCount * PIXELS_PER_PARTICLE) / textureWidth);

    this.context.textures.particlesTextureRead = this.context.device.createTexture({
      size: [textureWidth, textureHeight],
      format: 'rgba32float',
      dimension: '2d',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC | GPUTextureUsage.STORAGE_BINDING,
    });

    this.context.textures.particlesTextureWrite = this.context.device.createTexture({
      size: [textureWidth, textureHeight],
      format: 'rgba32float',
      dimension: '2d',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.COPY_SRC | GPUTextureUsage.STORAGE_BINDING,
    });

    this
      .initPipeline(InitParticlesShaderCode, 'cs_main', {
        PARTICLE_COUNT: this.context.particleCount,
        CUBE_SIZE: this.context.cosmicNoiseOptions.size - 2,
      })
      .setBinding(0, this.context.textures.particlesTextureRead.createView())
      .setBindGroup()
    ;
  }

  async debug() {
    const readData = await readStorageTexture(this.context.device, this.context.textures.particlesTextureRead, getAsFloat32Array);
    const extractedReadData = extractData(readData, PARTICLE_STRIDE, this.context.particleCount);
    console.log(extractedReadData);
  }
}
