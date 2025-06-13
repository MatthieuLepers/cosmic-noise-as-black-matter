struct Particle {
  @align(16) position: vec3<f32>, // 12 bytes + 4 bytes (padding) - Particle position
  @align(16) velocity: vec3<f32>, // 12 bytes + 4 bytes (padding) - Particle velocity
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
}

struct CameraUniform {
  projectionMatrix : mat4x4<f32>,
  viewMatrix: mat4x4<f32>,
  cameraPosition: vec3<f32>,
  padding: f32,
}

override PARTICLE_COUNT: u32;

@group(0) @binding(0) var particlesTextureRead: texture_storage_2d<rgba32float, read>;
@group(0) @binding(1) var<uniform> camera: CameraUniform;

fn getParticle(index: u32) -> Particle {
  let dimX = textureDimensions(particlesTextureRead).r;
  let x = i32((index * 2u) % dimX);
  let y = i32((index * 2u) / dimX);

  let data1 = textureLoad(particlesTextureRead, vec2<i32>(x, y));
  let data2 = textureLoad(particlesTextureRead, vec2<i32>(x + 1, y));

  return Particle(
    data1.xyz,
    data2.xyz,
  );
}

@vertex
fn vs_main(@builtin(vertex_index) index: u32) -> VertexOutput {
  if (index >= PARTICLE_COUNT) {
    return VertexOutput(vec4<f32>(0.0), vec4<f32>(0.0));
  }

  var out: VertexOutput;
  let particle = getParticle(index);

  out.position = camera.projectionMatrix * vec4<f32>(particle.position.xyz, 1.0);
  out.color = vec4<f32>(1.0);

  return out;
}

@fragment
fn fs_main(input: VertexOutput) -> @location(0) vec4<f32> {
  return input.color;
}
