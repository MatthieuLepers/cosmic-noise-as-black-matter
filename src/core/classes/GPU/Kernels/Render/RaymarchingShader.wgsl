@group(0) @binding(0) var u_volume: texture_3d<f32>;
@group(0) @binding(1) var<uniform> u_cam: Camera;

override CUBE_SIZE: f32 = 64.0;

struct Camera {
  origin: vec3f,
  dirX: vec3f,
  dirY: vec3f,
  dirZ: vec3f,
};

@fragment
fn fs_main(@builtin(position) pos: vec4f) -> @location(0) vec4f {
  let uv = (pos.xy / vec2f(800.0, 600.0)) * 2.0 - 1.0;
  let rayDir = normalize(uv.x * u_cam.dirX + uv.y * u_cam.dirY + u_cam.dirZ);
  var rayPos = u_cam.origin;

  var color = vec3f(0.0);
  var alpha = 0.0;
  let steps = 128;
  let stepSize = 1.0 / f32(steps);

  for (var i = 0; i < steps; i++) {
    let samplePos = rayPos;
    if (all(samplePos >= vec3f(0.0)) && all(samplePos <= vec3f(1.0))) {
      let density = textureLoad(u_volume, vec3<i32>(samplePos * CUBE_SIZE), 0).r;
      let dAlpha = 1.0 - exp(-density * 4.0);
      color += (1.0 - alpha) * dAlpha * vec3f(1.0);
      alpha += (1.0 - alpha) * dAlpha;
    }
    rayPos += rayDir * stepSize;
  }

  return vec4f(color, alpha);
}
