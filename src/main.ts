import { GUI } from 'dat.gui';

import { Camera } from '@/core/classes/Camera';
import { RenderPass } from '@/core/classes/GPU/Passes/RenderPass';
import { GPUContext } from '@/core/classes/GPU/Context';

import './style.css';
import { ComputePass } from './core/classes/GPU/Passes/ComputePass';
import { InitParticlesKernel } from './core/classes/GPU/Kernels/Compute/InitParticles';
import { GravityKernel } from './core/classes/GPU/Kernels/Compute/Gravity';
import { createCosmicTexture3D, generateCosmicFieldCPU, generateCosmicNoise3D, generateCosmicStructure, generateFilamentNoise } from './core/utils/CosmicNoise';
import { PointsRenderKernel } from './core/classes/GPU/Kernels/Render/PointsRender';

const GENERATORS = {
  hash3D: generateCosmicNoise3D,
  simplex3D: generateCosmicFieldCPU,
  structure: generateCosmicStructure,
  filament: generateFilamentNoise,
};

interface GUIParams {
  camera: 'wasd' | 'arcball';
  noiseSize: number;
  noiseType: keyof typeof GENERATORS;
}

export async function main() {
  const warning = document.getElementById('warning');

  if (!navigator.gpu) {
    console.error('Your browser doesn\' support WebGPU!');
    warning?.classList.remove('hide');
    return;
  }

  const adapter = await navigator.gpu.requestAdapter();
  if (!adapter) {
    console.error('WebGPU Adapter is unavailable!');
    warning?.classList.remove('hide');
    return;
  }

  const device = await adapter.requestDevice({
    requiredLimits: {
      maxTextureDimension2D: 8192,
    },
  });

  // Init GUI
  const gui = new GUI({ width: 340 });
  const params: GUIParams = {
    camera: 'arcball',
    noiseSize: 64,
    noiseType: 'simplex3D',
  };

  const canvas = document.createElement('canvas');
  document.getElementById('app')!.appendChild(canvas);
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const camera = new Camera(device, canvas);
  const context = new GPUContext({
    device,
    workgroupSizeX: 256,
    cosmicNoiseOptions: {
      size: 64,
      octaves: 6,
      persistence: 0.6,
      scale: 0.02,
    },
  });
  context.textures.cosmicNoise = createCosmicTexture3D(
    device,
    context.cosmicNoiseOptions.size,
    () => GENERATORS[params.noiseType](context.cosmicNoiseOptions),
  );

  gui
    .add(params, 'camera', ['arcball', 'wasd'])
    .name('Camera type')
    .onChange(() => {
      camera.setType(params.camera);
    })
  ;
  gui
    .add(params, 'noiseSize', 16, 128, 16)
    .name('Noise size')
    .onChange(() => {
      context.initParticleDone = false;
      context.cosmicNoiseOptions.size = params.noiseSize;
      context.textures.cosmicNoise = createCosmicTexture3D(
        device,
        context.cosmicNoiseOptions.size,
        () => GENERATORS[params.noiseType](context.cosmicNoiseOptions),
      );
    })
  ;
  gui
    .add(params, 'noiseType', Object.keys(GENERATORS))
    .name('Noise type')
    .onChange(() => {
      context.initParticleDone = false;
      context.textures.cosmicNoise = createCosmicTexture3D(
        device,
        context.cosmicNoiseOptions.size,
        () => GENERATORS[params.noiseType](context.cosmicNoiseOptions),
      );
    })
  ;
  const restartBtn = gui
    .add({ restart() { context.initParticleDone = false; } }, 'restart')
    .name('Restart simulation')
  ;
  const btnStyle = (restartBtn.domElement.previousSibling as HTMLElement)!.style;
  btnStyle.textAlign = 'center';
  btnStyle.fontWeight = 'bold';

  async function frame() {
    camera.frame();

    const computePass = ComputePass.create(context);

    if (!context.initParticleDone) {
      await computePass.addKernel(new InitParticlesKernel(context));
      context.initParticleDone = true;
    }

    await computePass.addKernel(new GravityKernel(context));
    await computePass.submit();

    [context.textures.particlesTextureRead, context.textures.particlesTextureWrite] = [context.textures.particlesTextureWrite, context.textures.particlesTextureRead];

    const pass = RenderPass.create({ context, canvas, camera });
    await pass.addKernel(new PointsRenderKernel(pass));
    await pass.submit();

    requestAnimationFrame(frame);
  }

  frame();
}

window.addEventListener('DOMContentLoaded', async () => {
  await main();
});
