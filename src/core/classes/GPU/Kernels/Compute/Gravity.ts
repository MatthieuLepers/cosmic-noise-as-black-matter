import GravityShaderCode from '@/core/classes/GPU/Kernels/Compute/GravityShader.wgsl?raw';
import { ComputeKernel } from '@/core/classes/GPU/Kernels/Compute';
import type { GPUContext } from '@/core/classes/GPU/Context';

export class GravityKernel extends ComputeKernel {
  constructor(context: GPUContext) {
    super(context);
    this.dispatchSize[0] = Math.ceil(context.particleCount / 256);
  }

  async prepare() {
    this
      .initPipeline(GravityShaderCode, 'cs_main', {
        PARTICLE_COUNT: this.context.particleCount,
      })
      .setBinding(0, this.context.textures.particlesTextureRead.createView())
      .setBinding(1, this.context.textures.particlesTextureWrite.createView())
      .setBinding(2, this.context.textures.cosmicNoise.createView())
      .setBindGroup()
    ;
  }
}
