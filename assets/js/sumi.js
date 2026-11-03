/* Suminagashi em WebGL: anéis de sumi que nascem de gotas e boiam numa corrente lenta.
   O ciclo é periódico (corrente em círculo, anéis deslocados um número inteiro de voltas),
   então o mesmo shader grava o MP4 do celular sem emenda (tools/gerar_video.py).
   sumiGL(canvas, {retrato, preserveDrawingBuffer}) -> {desenhar(t, entrada), tamanho(), ciclo} */
(function () {
  var CICLO = 36;
  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 uRes;uniform float uT;uniform float uIn;uniform float uRet;',
    'const float TAU=6.2831853;const float CICLO=' + CICLO.toFixed(1) + ';',
    'float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);',
    ' return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}',
    'float fbm(vec2 p){float s=0.,a=.5;for(int i=0;i<4;i++){s+=a*n(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return s;}',
    'vec2 gira(vec2 p,vec2 c,float ang,float k){vec2 d=p-c;float t=ang*exp(-dot(d,d)*k);float cs=cos(t),sn=sin(t);return c+mat2(cs,sn,-sn,cs)*d;}',
    'void main(){',
    ' vec2 uv=gl_FragCoord.xy/uRes;float asp=uRes.x/uRes.y;',
    ' vec2 p=(uv-.5)*vec2(asp,1.)*2.;',
    ' float a=TAU*uT/CICLO;vec2 o=vec2(cos(a),sin(a))*.55;',
    ' vec2 v1=mix(vec2(-asp*.35,.15),vec2(-.2,-.45),uRet),v2=mix(vec2(asp*.35,-.35),vec2(.35,.35),uRet),v3=mix(vec2(-asp*.8,-.45),vec2(-.6,-1.2),uRet);',
    ' p=gira(p,v1,2.6+.7*sin(a),1.1);p=gira(p,v2,-2.2+.6*cos(a),1.4);p=gira(p,v3,1.8+.5*sin(a+1.),1.8);',
    ' vec2 q=p*.75;',
    ' vec2 w=vec2(fbm(q+o),fbm(q+vec2(5.2,1.3)-o));',
    ' vec2 w2=vec2(fbm(q*1.05+2.6*w+o.yx),fbm(q*1.05+2.6*w+vec2(2.,7.)-o.yx));',
    ' vec2 pw=p+(w-.5)*.8+(w2-.5)*.4;',
    ' vec2 c0=mix(vec2(-asp*.98,.92),vec2(-.95,-.25),uRet);',
    ' vec2 c1=mix(vec2(-asp*.55,-1.18),vec2(.55,-1.05),uRet);',
    ' vec2 c2=mix(vec2(asp*.08,.35),vec2(.85,.15),uRet);',
    ' vec2 c3=mix(vec2(asp*.92,-.85),vec2(-.35,-.95),uRet);',
    ' float d0=length(pw-c0),d1=length(pw-c1)*1.08,d2=length(pw-c2)*1.2,d3=length(pw-c3)*1.1;',
    ' const float K=.16;',
    ' float F=-K*log(exp(-d0/K)+exp(-d1/K)+exp(-d2/K)+exp(-d3/K));',
    ' float r=F*5.2+.45*sin(F*11.)-2.*uT/CICLO;',
    ' float v=fract(r);',
    ' float wv=.035+.12*fbm(pw*2.1+3.);',
    ' float dl=abs(v-.5)-wv*.5;',
    ' float linha=1.-smoothstep(0.,.03,dl);',
    ' float halo=exp(-max(dl,0.)*26.)*.22;',
    ' float dl2=abs(v-.5-.16)-wv*.25;',
    ' float par=(1.-smoothstep(0.,.026,dl2))*.55;',
    ' float tinta=max(max(linha,halo),par);',
    ' float tom=mod(floor(r),2.)<.5?1.:.55;',
    ' float alcance=smoothstep(2.3,.2,F);',
    ' float ent=smoothstep(uIn*2.6,uIn*2.6-.4,F);',
    ' float bruma=fbm(pw*1.4-o)*.07;',
    ' vec3 fundo=vec3(.055,.051,.047);',
    ' vec3 cinza=vec3(.80,.77,.72);',
    ' float k=(tinta*tom*.34+bruma)*alcance*ent;',
    ' vec3 col=fundo+cinza*k;',
    ' float vin=smoothstep(1.75,.4,length((uv-.5)*vec2(1.,1.15)*2.));',
    ' col*=.78+.22*vin;',
    ' col+=(fract(52.9829189*fract(dot(gl_FragCoord.xy,vec2(.06711056,.00583715))))-.5)/255.;',
    ' gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  function sh(gl, t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o);
    if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }

  window.sumiGL = function (cv, op) {
    op = op || {};
    var gl = cv.getContext('webgl', { antialias: false, alpha: false, preserveDrawingBuffer: !!op.preserveDrawingBuffer });
    if (!gl) return null;
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl, gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl, gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(pr); gl.useProgram(pr);
    var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var lp = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, 0, 0);
    var U = { res: gl.getUniformLocation(pr, 'uRes'), t: gl.getUniformLocation(pr, 'uT'), ent: gl.getUniformLocation(pr, 'uIn'), ret: gl.getUniformLocation(pr, 'uRet') };
    return {
      ciclo: CICLO, gl: gl,
      tamanho: function () { gl.viewport(0, 0, cv.width, cv.height); },
      desenhar: function (t, ent) {
        gl.viewport(0, 0, cv.width, cv.height);
        gl.uniform2f(U.res, cv.width, cv.height); gl.uniform1f(U.t, t % CICLO);
        gl.uniform1f(U.ent, ent == null ? 1 : ent); gl.uniform1f(U.ret, op.retrato ? 1 : 0);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }
    };
  };
})();
