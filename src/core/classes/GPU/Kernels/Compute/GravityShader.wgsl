struct Particle {
  @align(16) position: vec3<f32>, // 12 bytes + 4 bytes (padding) - Particle position
  @align(16) velocity: vec3<f32>, // 12 bytes + 4 bytes (padding) - Particle velocity
}

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

fn setParticle(index: u32, particle: Particle) {
  let dimX = textureDimensions(particlesTextureWrite).r;
  let x = i32((index * 2u) % dimX);
  let y = i32((index * 2u) / dimX);

  textureStore(particlesTextureWrite, vec2<i32>(x, y), vec4<f32>(particle.position, 0.0));
  textureStore(particlesTextureWrite, vec2<i32>(x + 1, y), vec4<f32>(particle.velocity, 0.0));
}

override PARTICLE_COUNT: u32;

@group(0) @binding(0) var particlesTextureRead: texture_storage_2d<rgba32float, read>;
@group(0) @binding(1) var particlesTextureWrite: texture_storage_2d<rgba32float, write>;
@group(0) @binding(2) var noiseTexture: texture_storage_3d<r32float, read>;

@compute @workgroup_size(256)
fn cs_main(@builtin(global_invocation_id) global_id: vec3u) {
  let index = global_id.x;
  if (index >= PARTICLE_COUNT) { return; }

  var p = getParticle(index);

  let fieldDim = vec3f(textureDimensions(noiseTexture));
  
  let texCoord = vec3u(
    u32((p.position.x + 1.0) * (fieldDim.x - 1.0) / 2.0),
    u32((p.position.y + 1.0) * (fieldDim.y - 1.0) / 2.0),
    u32((p.position.z + 1.0) * (fieldDim.z - 1.0) / 2.0)
  );
  
  let noiseValue = textureLoad(noiseTexture, texCoord).x * 2.0 - 1.0;

  let forceMagnitude = noiseValue;
  let distanceFactor = 1.0 - length(p.velocity) * 0.1;
  let force = vec3f(forceMagnitude) * distanceFactor;
  
  p.velocity += force * 0.01;

  let damping = 1.0 - abs(noiseValue) * 2.0;
  p.velocity *= damping * 0.9;

  p.position = clamp(p.position + p.velocity, vec3f(-1.0), vec3f(1.0));

  setParticle(index, p);
}
