const fragmentShaderPosition = {
	shader: `
		uniform float delta;
		uniform float u_time;
		uniform sampler2D v_samplerPosition_orig;
		uniform sampler2D u_noise;

		vec3 hash3(vec2 p)
		{
			vec3 o = texture2D( u_noise, (p+0.5)/256.0, -100.0 ).xyz;
			return o;
		}

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution.xy;
			vec3 position_original = texture2D(v_samplerPosition_orig, uv).xyz;
			vec3 position = texture2D(v_samplerPosition, uv).xyz;
			vec3 velocity = texture2D(v_samplerVelocity, uv).xyz;

			vec3 pos = position + velocity * delta;

			// This just adds a little touch more randomness to the motion.
			// This is incredibly subtle but has the effect of making the particles
			// look more "separate" in motion
			vec3 hash = hash3(position_original.xy * position_original.zx * 20.);

			if(length(pos) > 40.) {
			  pos = position_original;
			}

			gl_FragColor = vec4(pos, 1.0);
		}
	`
};

export default fragmentShaderPosition;