override PARTICLE_COUNT: u32;
override CUBE_SIZE: u32;

@group(0) @binding(0) var particlesTexture: texture_storage_2d<rgba32float, write>;

@compute @workgroup_size(256)
fn cs_main(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let index = global_id.x;
  if (index >= PARTICLE_COUNT) { return; }

  let size = f32(CUBE_SIZE);
  let x = f32(index % CUBE_SIZE) / (size - 1.0);
  let y = f32((index / CUBE_SIZE) % CUBE_SIZE) / (size - 1.0);
  let z = f32(index / (CUBE_SIZE * CUBE_SIZE)) / (size - 1.0);

  let position = vec3<f32>(
    x * 2.0 - 1.0,
    y * 2.0 - 1.0,
    z * 2.0 - 1.0,
  );

  let velocity = vec3<f32>(0.0);

  let dimX = textureDimensions(particlesTexture).r;
  let px = i32((index * 2u) % dimX);
  let py = i32((index * 2u) / dimX);

  textureStore(particlesTexture, vec2<i32>(px, py), vec4<f32>(position, 0.0));
  textureStore(particlesTexture, vec2<i32>(px + 1, py), vec4<f32>(velocity, 0.0));
}
