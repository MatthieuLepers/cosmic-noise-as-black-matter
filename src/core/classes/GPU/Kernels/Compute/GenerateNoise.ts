import GenerateNoiseShaderCode from './GenerateNoise.wgsl?raw';
import { ComputeKernel } from '.';

export class GenerateNoiseKernel extends ComputeKernel {
  async prepare() {
    this.context.textures.cosmicNoise = this.context.device.createTexture({
      size: [
        this.context.cosmicNoiseOptions.size,
        this.context.cosmicNoiseOptions.size,
        this.context.cosmicNoiseOptions.size,
      ],
      format: 'r32float',
      dimension: '3d',
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.STORAGE_BINDING,
    });

    this
      .initPipeline(GenerateNoiseShaderCode, 'cs_main')
      .setBinding(0, this.context.textures.cosmicNoise.createView())
      .setBindGroup()
    ;

    return Promise.resolve();
  }
}
