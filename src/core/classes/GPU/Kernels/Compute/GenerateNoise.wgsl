@group(0) @binding(0) var field : texture_storage_3d<r32float, write>;

fn hash33(p: vec3u) -> f32 {
  let dot = f32(p.x) * 12.9898 + f32(p.y) * 78.233 + f32(p.z) * 37.719;
  return fract(sin(dot) * 43758.5453);
}

@compute @workgroup_size(8, 8, 8)
fn cs_main(@builtin(global_invocation_id) global_id: vec3u) {
  let size = textureDimensions(field);

  if (all(global_id < size)) {
    let noiseValue = hash33(global_id);
    textureStore(field, global_id, vec4<f32>(noiseValue, 0.0, 0.0, 1.0));
  }
}
