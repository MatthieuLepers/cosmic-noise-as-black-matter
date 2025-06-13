import PointsRenderShaderCode from '@/core/classes/GPU/Kernels/Render/PointsRenderShader.wgsl?raw';
import { RenderKernel } from '@/core/classes/GPU/Kernels/Render';
import type { RenderPass } from '@/core/classes/GPU/Passes/RenderPass';

export class PointsRenderKernel extends RenderKernel {
  constructor(renderPass: RenderPass) {
    const renderModule = renderPass.context.device.createShaderModule({
      code: PointsRenderShaderCode,
    });
    super({
      renderPass,
      pipelineDescriptor: {
        layout: 'auto',
        vertex: {
          module: renderModule,
          entryPoint: 'vs_main',
          constants: {
            PARTICLE_COUNT: renderPass.context.particleCount,
          },
        },
        fragment: {
          module: renderModule,
          entryPoint: 'fs_main',
          targets: [{ format: renderPass.format }],
        },
        primitive: {
          topology: 'point-list',
        },
        depthStencil: {
          format: 'depth24plus',
          depthWriteEnabled: true,
          depthCompare: 'less',
        },
      },
    });
  }

  async prepare() {
    this
      .setBinding(0, this.renderPass.context.textures.particlesTextureRead.createView())
      .setBinding(1, { buffer: this.renderPass.camera.getUniformBuffer() })
      .setBindGroup()
    ;
  }

  async run(): Promise<void> {
    super.run();
    this.renderPass.passEncoder.draw(this.context.particleCount);
  }
}
