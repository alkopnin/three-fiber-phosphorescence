const vertexShaderParticle = {
	shader: `
	    uniform vec2 u_resolution;
	    uniform vec2 u_mouse;
	    uniform float u_time;
	    uniform sampler2D u_noise;
	    attribute vec2 reference;
	    uniform sampler2D u_texturePosition;
	    uniform bool u_clicked;
	    varying float v_op;
	  
	  
		float random(vec2 st) {
			return fract(sin(dot(st,
			                     vec2(12.9898,78.233)))*
			    43758.5453123);
		}
	  
		void main() {
			vec3 position = texture2D(u_texturePosition, reference).xyz;
			position *= 3.;

			vec3 transformed = vec3( position );

			vec4 mvpos = modelViewMatrix * vec4( transformed, 1.0 );

			gl_PointSize = random(reference) * 50. * (1. / length(mvpos.xyz) * 5.51);
			v_op = 1. / length(position) * 8.;

			gl_Position = projectionMatrix * mvpos;
		}
	`
};

export default vertexShaderParticle;