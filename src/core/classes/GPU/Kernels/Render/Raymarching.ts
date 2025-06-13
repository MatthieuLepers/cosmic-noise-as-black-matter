import RaymarchingShaderCode from './RaymarchingShader.wgsl?raw';
import { RenderKernel } from '.';
import type { RenderPass } from '../../Passes/RenderPass';

export class RaymarchingKernel extends RenderKernel {
  constructor(renderPass: RenderPass) {
    const renderModule = renderPass.context.device.createShaderModule({
      code: RaymarchingShaderCode,
    });
    super({
      renderPass,
      pipelineDescriptor: {
        layout: 'auto',
        vertex: {
          module: renderModule,
          entryPoint: 'vs_main',
        },
        fragment: {
          module: renderModule,
          entryPoint: 'fs_main',
          targets: [{ format: renderPass.format }],
        },
        primitive: { topology: 'triangle-list' },
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
}
