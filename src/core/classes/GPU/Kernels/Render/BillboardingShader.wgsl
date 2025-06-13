struct Particle {
  @align(16) position: vec3<f32>, // 12 bytes + 4 bytes (padding) - Particle position
  @align(16) velocity: vec3<f32>, // 12 bytes + 4 bytes (padding) - Particle velocity
}

struct CameraUniform {
  projectionMatrix : mat4x4<f32>,
  viewMatrix: mat4x4<f32>,
  cameraPosition: vec3<f32>,
}

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) localPos: vec2<f32>,
  @location(1) color: vec4<f32>,
  @location(2) localOffset: vec3<f32>,
}

override SIZE_FACTOR: f32 = 0.008;

@group(0) @binding(0) var particleTexture: texture_storage_2d<rgba32float, read>;
@group(0) @binding(1) var<uniform> camera: CameraUniform;

fn getParticle(index: u32) -> Particle {
  let dimX = textureDimensions(particleTexture).r;

  let x = i32((index * 2u) % dimX);
  let y = i32(((index * 2u) / dimX));

  let data1 = textureLoad(particleTexture, vec2<i32>(x, y));
  let data2 = textureLoad(particleTexture, vec2<i32>(x + 1, y));

  return Particle(
    data1.xyz,
    data2.xyz,
  );
}

@vertex
fn vs_billboard(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> VertexOutput {
  var quad = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>(1.0, -1.0),
    vec2<f32>(-1.0, 1.0),
    vec2<f32>(-1.0, 1.0),
    vec2<f32>(1.0, -1.0),
    vec2<f32>(1.0, 1.0),
  );

  let p = getParticle(instanceIndex);

  let right = vec3<f32>(camera.viewMatrix[0].x, camera.viewMatrix[1].x, camera.viewMatrix[2].x);
  let up = vec3<f32>(camera.viewMatrix[0].y, camera.viewMatrix[1].y, camera.viewMatrix[2].y);

  let offset = (quad[vertexIndex].x * right + quad[vertexIndex].y * up) * 1.0 * SIZE_FACTOR;
  let worldPosition = p.position + offset;

  var out: VertexOutput;
  out.position = camera.projectionMatrix * vec4<f32>(worldPosition, 1.0);
  out.localPos = quad[vertexIndex];
  out.color = vec4<f32>(1.0);
  out.localOffset = p.position.xyz;

  return out;
}

@fragment
fn fs_billboard(in: VertexOutput) -> @location(0) vec4<f32> {
  let dist = length(in.localPos);
  if (dist > 1.0) { discard; }

  let alpha = smoothstep(1.0, 0.9, dist);
  return vec4<f32>(in.color.rgb, in.color.a * alpha);
}

