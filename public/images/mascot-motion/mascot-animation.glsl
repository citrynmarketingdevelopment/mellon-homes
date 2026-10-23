/** @resolution */
uniform vec2 u_resolution;
/** @time */
uniform float u_time;
/** @label Animation frames 1 to 16 */
uniform sampler2D u_frames0;
/** @label Animation frames 17 to 32 */
uniform sampler2D u_frames1;
/** @label Animation frames 33 to 48 */
uniform sampler2D u_frames2;
/** @label Animation frames 49 to 64 */
uniform sampler2D u_frames3;
/** @label Animation frames 65 to 80 */
uniform sampler2D u_frames4;
/** @label Animation frames 81 to 96 */
uniform sampler2D u_frames5;
/** @label Animation frames 97 to 112 */
uniform sampler2D u_frames6;
/** @label Animation frames 113 to 128 */
uniform sampler2D u_frames7;
/** @label Animation frames 129 to 144 */
uniform sampler2D u_frames8;
/** @label Animation frames 145 to 160 */
uniform sampler2D u_frames9;
/** @label Animation frames 161 to 176 */
uniform sampler2D u_frames10;
/** @label Animation frames 177 to 192 */
uniform sampler2D u_frames11;
/** @label Animation frames 193 to 208 */
uniform sampler2D u_frames12;
/** @label Animation frames 209 to 224 */
uniform sampler2D u_frames13;
/** @label Animation frames 225 to 240 */
uniform sampler2D u_frames14;
void main() {
  float frame = mod(floor(u_time*24.0),240.0);
  float page = floor(frame/16.0);
  float cell = mod(frame,16.0);
  vec2 pixel = gl_FragCoord.xy - vec2(0.0,u_resolution.y-112.0);
  if (pixel.x < 0.0 || pixel.y < 0.0 || pixel.x > 112.0 || pixel.y > 112.0) { gl_FragColor=vec4(0.0); return; }
  vec2 uv = clamp(pixel/112.0,0.003125,0.996875);
  uv = (vec2(mod(cell,4.0),3.0-floor(cell/4.0))+uv)/4.0;
  vec4 color;
  if (page < 0.5) color=texture2D(u_frames0,uv);
  else if (page < 1.5) color=texture2D(u_frames1,uv);
  else if (page < 2.5) color=texture2D(u_frames2,uv);
  else if (page < 3.5) color=texture2D(u_frames3,uv);
  else if (page < 4.5) color=texture2D(u_frames4,uv);
  else if (page < 5.5) color=texture2D(u_frames5,uv);
  else if (page < 6.5) color=texture2D(u_frames6,uv);
  else if (page < 7.5) color=texture2D(u_frames7,uv);
  else if (page < 8.5) color=texture2D(u_frames8,uv);
  else if (page < 9.5) color=texture2D(u_frames9,uv);
  else if (page < 10.5) color=texture2D(u_frames10,uv);
  else if (page < 11.5) color=texture2D(u_frames11,uv);
  else if (page < 12.5) color=texture2D(u_frames12,uv);
  else if (page < 13.5) color=texture2D(u_frames13,uv);
  else if (page < 14.5) color=texture2D(u_frames14,uv);
  gl_FragColor=color;
}
