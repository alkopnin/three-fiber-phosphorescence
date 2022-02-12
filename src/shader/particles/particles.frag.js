const fragmentShaderParticle = {
	shader: `
		uniform vec2 u_resolution;
		uniform vec2 u_mouse;
		uniform float u_time;
		uniform sampler2D u_noise;
		uniform bool u_clicked;
		varying float v_op;

		vec2 hash2(vec2 p)
		{
			vec2 o = texture2D( u_noise, (p+0.5)/256.0, -100.0 ).xy;
			return o;
		}

		void main() {
			// vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / min(u_resolution.x, u_resolution.y);
			vec2 uv = gl_PointCoord.xy - .5;

			vec3 particlecolour = vec3(.5, .53, .53) * 1.8;
			vec3 outercolour = vec3(1.);

			if(u_clicked) {
			  particlecolour = vec3(.05, .15, .2) * .5;
			  outercolour = vec3(0.);
			}

			float l = length(uv);
			vec3 colour = mix(outercolour, particlecolour, smoothstep(.5, -.1, l));
			colour = mix(vec3(2., 0.5, 0.), colour, smoothstep(3., 0.5, v_op));

			gl_FragColor = vec4(colour, 1. - l * 2.);
		}
	`
};

export default fragmentShaderParticle;