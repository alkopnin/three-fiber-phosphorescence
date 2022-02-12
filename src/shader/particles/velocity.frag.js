const fragmentShaderVelocity = {
	shader: `
		uniform vec2 u_resolution;
		uniform vec2 u_mouse;
		uniform float u_time;
		uniform float u_mousex;
		varying float v_op;

		// otaviogood's noise from https://www.shadertoy.com/view/ld2SzK
		const float nudge = 0.739513; // size of perpendicular vector
		float normalizer = 1.0 / sqrt(1.0 + nudge*nudge); // pythagorean theorem on that perpendicular to maintain scale
		float SpiralNoiseC(vec3 p)
		{
		  float n = 0.0;  // noise amount
		  float iter = 1.0;
		  for (int i = 0; i < 8; i++)
		  {
		      // add sin and cos scaled inverse with the frequency
		      n += -abs(sin(p.y*iter) + cos(p.x*iter)) / iter;  // abs for a ridged look
		      // rotate by adding perpendicular and scaling down
		      p.xy += vec2(p.y, -p.x) * nudge;
		      p.xy *= normalizer;
		      // rotate on other axis
		      p.xz += vec2(p.z, -p.x) * nudge;
		      p.xz *= normalizer;
		      // increase the frequency
		      iter *= 1.733733;
		  }
		  return n;
		}

		void main() {
			vec2 uv = gl_FragCoord.xy / resolution.xy;
			vec3 position = texture2D(v_samplerPosition, uv).xyz;
			vec3 velocity = texture2D(v_samplerVelocity, uv).xyz;
			vec3 acceleration = vec3(0.);

			float l = length(position);
			vec3 spherical = vec3(1./l, atan(position.y, position.x), acos(position.z / l));
			float n = SpiralNoiseC(spherical * 6. + u_time);
			n = SpiralNoiseC(vec3(l, spherical.y * 6. + u_time * 5., spherical.z));

			spherical.z += (1. / n-.5)*length(velocity);
			spherical.y += n;

			float a =  n * .1 + smoothstep(5., 40., l) * 20.;
			a += smoothstep(20., 0., l) * .3;
			a -= smoothstep(30., 41., l) * 21.;

			acceleration.x = spherical.x * sin(spherical.z) * cos(spherical.y) * a;
			acceleration.y = spherical.x * sin(spherical.z) * sin(spherical.y) * a;
			acceleration.z = spherical.x * cos(spherical.z) * a;

			vec3 vel = velocity * .98 + acceleration * .3;
			if(length(vel) > 5.) {
			  vel = normalize(vel) * 5.;
			}

			gl_FragColor = vec4(vel, 1.0);
		}
	`
};

export default fragmentShaderVelocity;