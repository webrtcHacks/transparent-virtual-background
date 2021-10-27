// Copyright from James Fisher
// Source: https://jameshfisher.com/2020/08/11/production-ready-green-screen-in-the-browser/
// Republished with permission of the author

// ToDo: make a class
window.enableWebgl = true;


const shader = `
  precision mediump float;

  uniform sampler2D tex;
  uniform float texWidth;
  uniform float texHeight;

  uniform vec3 keyColor;
  uniform float similarity;
  uniform float smoothness;
  uniform float spill;

  // From https://github.com/libretro/glsl-shaders/blob/master/nnedi3/shaders/rgb-to-yuv.glsl
  vec2 RGBtoUV(vec3 rgb) {
    return vec2(
      rgb.r * -0.169 + rgb.g * -0.331 + rgb.b *  0.5    + 0.5,
      rgb.r *  0.5   + rgb.g * -0.419 + rgb.b * -0.081  + 0.5
    );
  }

  vec4 ProcessChromaKey(vec2 texCoord) {
    vec4 rgba = texture2D(tex, texCoord);
    float chromaDist = distance(RGBtoUV(texture2D(tex, texCoord).rgb), RGBtoUV(keyColor));

    float baseMask = chromaDist - similarity;
    float fullMask = pow(clamp(baseMask / smoothness, 0., 1.), 1.5);
    rgba.a = fullMask;

    float spillVal = pow(clamp(baseMask / spill, 0., 1.), 1.5);
    float desat = clamp(rgba.r * 0.2126 + rgba.g * 0.7152 + rgba.b * 0.0722, 0., 1.);
    rgba.rgb = mix(vec3(desat, desat, desat), rgba.rgb, spillVal);

    return rgba;
  }

  void main(void) {
    vec2 texCoord = vec2(gl_FragCoord.x/texWidth, 1.0 - (gl_FragCoord.y/texHeight));
    gl_FragColor = ProcessChromaKey(texCoord);
  }
  `;


export function addShader(source, target, keyColorElem, similarityElem, smoothnessElem, spillElm){


    const gl = target.getContext("webgl", {premultipliedAlpha: false});

    const vs = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vs, 'attribute vec2 c; void main(void) { gl_Position=vec4(c, 0.0, 1.0); }');
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fs, shader);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(fs));
    }

    const prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const vb = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vb);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, 1, -1, -1, 1, -1, 1, 1]), gl.STATIC_DRAW);

    const coordLoc = gl.getAttribLocation(prog, 'c');
    gl.vertexAttribPointer(coordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(coordLoc);

    gl.activeTexture(gl.TEXTURE0);
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

    const texLoc = gl.getUniformLocation(prog, "tex");
    const texWidthLoc = gl.getUniformLocation(prog, "texWidth");
    const texHeightLoc = gl.getUniformLocation(prog, "texHeight");
    const keyColorLoc = gl.getUniformLocation(prog, "keyColor");
    const similarityLoc = gl.getUniformLocation(prog, "similarity");
    const smoothnessLoc = gl.getUniformLocation(prog, "smoothness");
    const spillLoc = gl.getUniformLocation(prog, "spill");


    function processFrame() {

        if(!window.enableWebgl)
            return;

        target.width = source.width;
        target.height = source.height;
        gl.viewport(0, 0, source.width, source.height);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, source);
        gl.uniform1i(texLoc, 0);
        gl.uniform1f(texWidthLoc, target.width);
        gl.uniform1f(texHeightLoc, target.height);
        const m = keyColorElem.value.match(/^#([0-9a-f]{6})$/i)[1];
        gl.uniform3f(keyColorLoc, parseInt(m.substr(0, 2), 16) / 255, parseInt(m.substr(2, 2), 16) / 255, parseInt(m.substr(4, 2), 16) / 255);
        gl.uniform1f(similarityLoc, similarityElem.value);
        gl.uniform1f(smoothnessLoc, smoothnessElem.value);
        gl.uniform1f(spillLoc, spillElm.value);
        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
        requestAnimationFrame(processFrame);
    }

    requestAnimationFrame(processFrame)

}
