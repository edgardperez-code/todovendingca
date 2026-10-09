// ================= HERO ANIMADO (PRUEBA) =================
// Igual que el hero publicado (24 fps, 450vh, seguimiento directo), con un
// panel para comparar en vivo: reparto del scroll, textos, paso final,
// encuadre y ayudas en el telefono, cierre sin velo y video liviano.
(function(){
  var video  = document.getElementById('mocha-video');
  var escena = document.getElementById('mocha');
  var cierre = document.getElementById('mocha-cierre');
  var pista  = document.getElementById('mocha-pista');
  var riel   = document.getElementById('mocha-riel');
  var barra  = document.getElementById('mocha-barra');
  var saltar = document.getElementById('mocha-saltar');
  if (!video || !escena) return;

  var pasos   = Array.prototype.slice.call(escena.querySelectorAll('.mocha-paso'));
  var botones = Array.prototype.slice.call(riel.querySelectorAll('button'));
  var segs    = Array.prototype.slice.call(barra.querySelectorAll('.mocha-progreso i'));
  var reduce  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var movil   = window.matchMedia('(max-width:900px)');

  // ---------- opciones ----------
  var CLAVE = 'co-prueba-hero-v1';
  var PRESETS = {
    hoy:   {ritmo:'lineal', textos:'hoy',   final:'no', encuadre:'no', ayudas:'no', velo:'con'},
    nuevo: {ritmo:'suave',  textos:'choco', final:'si', encuadre:'si', ayudas:'si', velo:'con'}
  };
  var op = {video:'v2'};
  Object.keys(PRESETS.nuevo).forEach(function(k){ op[k] = PRESETS.nuevo[k]; });
  try {
    var guardado = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    if (guardado) Object.keys(op).forEach(function(k){ if (guardado[k]) op[k] = guardado[k]; });
  } catch(e){}
  function guardar(){ try { localStorage.setItem(CLAVE, JSON.stringify(op)); } catch(e){} }

  // ---------- reparto del scroll ----------
  // Puntos clave [scroll 0..1, segundo del video] medidos sobre mocachino-v2.mp4.
  // La curva suave es el punto medio entre la completa y una recta que acaba en 0,90.
  var D_REF = 7.9167;
  var K_COMPLETA = [[0,0],[.17,1.45],[.28,2.67],[.44,3.80],[.51,4.95],[.62,6.04],[.80,7.17],[.90,7.9167]];
  var K_SUAVE = K_COMPLETA.map(function(k){ return [k[0], (k[1] + k[0] / 0.90 * D_REF) / 2]; });

  function crearMapa(K){
    var n=K.length,x=[],y=[],d=[],m=[],i;
    for(i=0;i<n;i++){x[i]=K[i][0];y[i]=K[i][1];}
    for(i=0;i<n-1;i++) d[i]=(y[i+1]-y[i])/(x[i+1]-x[i]);
    m[0]=d[0]; m[n-1]=d[n-2];
    for(i=1;i<n-1;i++){
      if(d[i-1]*d[i]<=0){m[i]=0;continue;}
      var w1=2*(x[i+1]-x[i])+(x[i]-x[i-1]), w2=(x[i+1]-x[i])+2*(x[i]-x[i-1]);
      m[i]=(w1+w2)/(w1/d[i-1]+w2/d[i]);
    }
    return function(p){
      if(p<=x[0]) return y[0];
      if(p>=x[n-1]) return y[n-1];
      var k=0; while(p>x[k+1]) k++;
      var h=x[k+1]-x[k], s=(p-x[k])/h, s2=s*s, s3=s2*s;
      return (2*s3-3*s2+1)*y[k]+(s3-2*s2+s)*h*m[k]+(-2*s3+3*s2)*y[k+1]+(s3-s2)*h*m[k+1];
    };
  }
  var MAPAS = {suave: crearMapa(K_SUAVE), completa: crearMapa(K_COMPLETA)};

  // segundo "de referencia" (0..7,9167) que pide la posicion del scroll
  function segundoDe(p){
    var t = op.ritmo === 'lineal' ? p * D_REF : MAPAS[op.ritmo](p);
    return t < 0 ? 0 : (t > D_REF ? D_REF : t);
  }
  // inversa, para el riel: que scroll corresponde a un segundo
  function scrollDe(t){
    var a = 0, b = 1;
    for (var i = 0; i < 30; i++){ var c = (a + b) / 2; if (segundoDe(c) < t) a = c; else b = c; }
    return b;
  }

  // ---------- textos ----------
  var LECHE = 'Vaporizada a la temperatura justa para envolver el café sin apagarlo. Ni tibia ni hirviendo: en su punto, taza tras taza.';
  var DATOS = [
    'Molienda al momento · <b>&lt; 40 seg</b>',
    'Dosificación automática · <b>siempre igual</b>',
    'Temperatura controlada · <b>sin supervisión</b>',
    'Textura uniforme · <b>10 bebidas del menú</b>'
  ];
  var TEXTOS = {
    hoy: [
      ['Ingrediente 01', 'Espresso <em>recién molido</em>', 'Grano entero que la estación muele en el instante exacto de tu pedido. Nunca café instantáneo: por eso el aroma llega antes que la taza.'],
      ['Ingrediente 02', 'Chocolate <em>premium</em>', 'Cacao de cuerpo intenso que se funde con el espresso caliente. Es el ingrediente que convierte un café con leche en un mocachino.'],
      ['Ingrediente 03', 'Leche <em>cremosa</em>', LECHE],
      ['Ingrediente 04', 'Espuma de <em>leche</em>', 'La nube que corona la bebida y sostiene el aroma. Densa, estable y del mismo grosor cada vez que presionas el botón.']
    ],
    choco: [
      ['01 · Espresso', 'Todo empieza en el <em>grano</em>', 'Esa corona de crema es espresso de grano entero, molido en el instante de tu pedido. Nunca café instantáneo: por eso el aroma llega antes que la taza.'],
      ['02 · Chocolate', 'Cae el <em>chocolate</em>', 'Un hilo de chocolate de cuerpo intenso atraviesa el espresso y baja directo al vaso. Es lo que convierte un café con leche en un mocachino.'],
      ['03 · Leche', 'Atraviesa la <em>leche</em>', LECHE],
      ['04 · Espuma', 'La espuma <em>corona</em> el vaso', 'La nube baja, el espresso se asienta encima y el vaso se arma solo, capa sobre capa. Siempre del mismo grosor.']
    ]
  };
  TEXTOS.chorro = TEXTOS.choco.slice();
  TEXTOS.chorro[1] = ['02 · Chocolate', 'Un solo <em>chorro</em>', 'La estación sirve chocolate y espresso en un mismo hilo, directo al vaso. Siempre la misma medida.'];

  // Segundo del video en que entra cada texto. "Como hoy" reproduce los
  // cortes de scroll publicados (0,13 / 0,32 / 0,51 / 0,70 del recorrido).
  var MOMENTOS_HOY   = [0, 1.03, 2.53, 4.03, 5.53];
  var MOMENTOS_VIDEO = [0, 0.95, 2.45, 3.5, 4.85];
  var MOMENTO_LISTO  = 6.9;

  var momentos, cierreDesde, finPaso4;
  function configurar(){
    momentos = (op.textos === 'hoy' ? MOMENTOS_HOY : MOMENTOS_VIDEO).slice();
    if (op.final === 'si') momentos.push(MOMENTO_LISTO);
    // Con el ritmo de hoy el video no cambia de velocidad: el paso final
    // gana espacio retrasando el cierre (0,91 -> 0,97).
    if (op.ritmo === 'lineal') cierreDesde = op.final === 'si' ? 0.97 : 0.91;
    else                       cierreDesde = op.final === 'si' ? 0.95 : 0.92;
    finPaso4 = op.final === 'si' ? MOMENTO_LISTO : segundoDe(cierreDesde);

    var tx = TEXTOS[op.textos] || TEXTOS.hoy;
    for (var i = 0; i < 4; i++){
      pasos[i + 1].innerHTML =
        '<span class="mocha-num">' + tx[i][0] + '</span>' +
        '<h2>' + tx[i][1] + '</h2>' +
        '<p class="mocha-txt">' + tx[i][2] + '</p>' +
        '<div class="mocha-dato">' + DATOS[i] + '</div>';
    }
    escena.classList.toggle('encuadre', op.encuadre === 'si');
    escena.classList.toggle('ayudas',   op.ayudas === 'si');
    escena.classList.toggle('sinvelo',  op.velo === 'sin');
    pasoActivo = -99;
  }

  // ---------- video ----------
  var VIDEOS = {v2:'assets/mocachino-v2.mp4', v3:'assets/mocachino-v3.mp4'};
  var duracion = D_REF;
  var objetivo = 0;
  var pasoActivo = -99;
  var listo = false;

  function iniciar(){
    if (listo || !isFinite(video.duration) || video.duration <= 0) return;
    duracion = video.duration;
    listo = true;
    aplicar();
  }

  function desbloquear(){
    var p = video.play();
    if (p && p.then) p.then(function(){ video.pause(); pedirCuadro(); }).catch(function(){});
  }
  window.addEventListener('touchstart', desbloquear, {passive:true, once:true});
  window.addEventListener('click', desbloquear, {once:true});

  // En esta prueba el video se descarga entero y se sirve desde memoria: el
  // alojamiento de la prueba puede no aceptar descargas por partes, y sin eso
  // Safari en iPhone no deja saltar por el video. En la pagina real no hace falta.
  var pedido = '', blobs = {};
  function asignar(url){
    listo = false;
    video.src = url;
    video.load();
    desbloquear();
  }
  function ponerVideo(){
    var src = VIDEOS[op.video] || VIDEOS.v2;
    if (pedido === src) return;
    pedido = src;
    if (blobs[src]) return asignar(blobs[src]);
    fetch(src).then(function(r){
      if (!r.ok) throw new Error(r.status);
      return r.blob();
    }).then(function(b){
      blobs[src] = URL.createObjectURL(b);
      if (pedido === src) asignar(blobs[src]);
    }).catch(function(){
      if (pedido === src) asignar(src);
    });
  }

  var arriba = 0, recorrido = 1;
  function medirEscena(){
    arriba    = escena.getBoundingClientRect().top + window.scrollY;
    recorrido = escena.offsetHeight - window.innerHeight;
    if (recorrido <= 0) recorrido = 1;
  }
  function progreso(){
    var p = (window.scrollY - arriba) / recorrido;
    return p < 0 ? 0 : (p > 1 ? 1 : p);
  }

  configurar();
  ponerVideo();
  medirEscena();
  video.addEventListener('loadedmetadata', iniciar);
  video.addEventListener('durationchange', iniciar);
  if (video.readyState >= 1) iniciar();

  function suave(x){ x = x < 0 ? 0 : (x > 1 ? 1 : x); return x * x * (3 - 2 * x); }
  // Telefono: el encuadre sube con la bebida. Depende solo del segundo que
  // pide el scroll, asi que si el dedo para, la imagen para.
  function encuadreY(t){
    var y = -22 * suave((t - 2.6) / 3.0);                      // 2,6 s -> 5,6 s: sube hasta -22 %
    if (op.final === 'si') y += 9 * suave((t - 6.9) / 0.7);    // vaso listo: baja un poco para centrarlo
    return y;
  }
  var transformActual = '';

  var lectura = document.getElementById('pp-lectura');
  var panelAbierto = false;
  var NOMBRES = ['inicio', 'espresso', 'chocolate', 'leche', 'espuma', 'listo'];

  function aplicar(){
    var p = progreso();
    var t = segundoDe(p);
    objetivo = t * (duracion / D_REF);

    var idx = 0;
    for (var i = 0; i < momentos.length; i++){ if (t >= momentos[i]) idx = i; }
    var cerrado = p >= cierreDesde;
    if (cerrado) idx = -1;

    if (idx !== pasoActivo){
      pasoActivo = idx;
      pasos.forEach(function(el, i){ el.classList.toggle('on', i === idx); });
      botones.forEach(function(b){
        var n = +b.dataset.ir;
        b.classList.toggle('on', n === idx);
        b.classList.toggle('hecho', n < idx || idx === -1);
      });
      escena.classList.toggle('fase5', idx === 5);
    }
    cierre.classList.toggle('on', cerrado);
    escena.classList.toggle('cerrado', cerrado);

    if (op.ayudas === 'si'){
      pista.classList.remove('oculta');
      if (p > 0.02) pista.classList.remove('ve');
      barra.classList.toggle('ve', p > 0.02 && !cerrado);
      for (var s = 0; s < 4; s++){
        var a = momentos[s + 1], b = s < 3 ? momentos[s + 2] : finPaso4;
        var f = (t - a) / (b - a);
        segs[s].style.setProperty('--f', (f < 0 ? 0 : (f > 1 ? 1 : f)).toFixed(3));
      }
    } else {
      pista.classList.toggle('oculta', p > 0.04);
      barra.classList.remove('ve');
    }

    var tr = '';
    if (op.encuadre === 'si' && movil.matches) tr = 'translate3d(0,' + encuadreY(t).toFixed(2) + '%,0)';
    if (tr !== transformActual){ video.style.transform = tr; transformActual = tr; }

    if (panelAbierto && lectura){
      lectura.textContent = 'Scroll ' + Math.round(p * 100) + ' % · video ' +
        objetivo.toFixed(2).replace('.', ',') + ' s · ' + (idx === -1 ? 'cierre' : NOMBRES[idx]);
    }
    pedirCuadro();
  }

  function topeDescargado(){
    var b = video.buffered;
    for (var i = 0; i < b.length; i++){ if (b.start(i) <= 0.05) return b.end(i); }
    return 0;
  }

  var rafId = 0;
  function pedirCuadro(){
    if (!rafId && !document.hidden) rafId = requestAnimationFrame(bucle);
  }
  // Seguimiento directo, igual que en la pagina publicada.
  function bucle(){
    rafId = 0;
    if (!listo) return;
    var t = Math.max(0, Math.min(duracion - 0.02, objetivo));
    var tope = topeDescargado();
    if (tope > 0.1 && t > tope - 0.05) t = tope - 0.05;
    if (!video.seeking && video.readyState >= 2 && Math.abs(video.currentTime - t) > 0.008){
      try { video.currentTime = t; } catch(e){}
    }
  }
  video.addEventListener('progress', pedirCuadro);
  video.addEventListener('seeked', pedirCuadro);
  video.addEventListener('canplay', pedirCuadro);
  document.addEventListener('visibilitychange', function(){ if (!document.hidden) pedirCuadro(); });

  // salto sin scroll suave: un solo salto del video en vez de cientos
  function irA(y){
    var raiz = document.documentElement, antes = raiz.style.scrollBehavior;
    raiz.style.scrollBehavior = 'auto';
    window.scrollTo(0, y);
    raiz.style.scrollBehavior = antes;
  }

  botones.forEach(function(b){
    b.addEventListener('click', function(){
      var t = momentos[+b.dataset.ir] + 0.15;
      window.scrollTo({top: arriba + scrollDe(t) * recorrido, behavior:'smooth'});
    });
  });
  saltar.addEventListener('click', function(e){
    e.preventDefault();
    irA(arriba + escena.offsetHeight);
  });

  setTimeout(function(){ if (progreso() <= 0.02) pista.classList.add('ve'); }, 1200);

  var rz = 0;
  function alRedimensionar(){
    if (rz) return;
    rz = requestAnimationFrame(function(){ rz = 0; medirEscena(); aplicar(); });
  }
  if (movil.addEventListener) movil.addEventListener('change', alRedimensionar);

  if (reduce){
    var img = document.createElement('img');
    img.src = 'assets/final-v1.webp';
    img.width = 720; img.height = 1280;
    img.alt = 'Mocachino Café Oriente terminado, con espuma de leche y cacao espolvoreado.';
    video.parentNode.replaceChild(img, video);
    pasos.forEach(function(el){ el.classList.add('on'); });
    cierre.classList.add('on');
  } else {
    window.addEventListener('scroll', aplicar, {passive:true});
    window.addEventListener('resize', alRedimensionar);
    window.addEventListener('orientationchange', alRedimensionar);
    medirEscena();
    aplicar();
  }

  // ---------- panel de prueba ----------
  var panel = document.getElementById('pp');
  var abrir = document.getElementById('pp-abrir');
  var grupos = Array.prototype.slice.call(panel.querySelectorAll('.pp-grupo'));

  function marcar(){
    grupos.forEach(function(g){
      var k = g.dataset.op;
      g.querySelectorAll('.pp-ops button').forEach(function(b){
        b.setAttribute('aria-pressed', String(b.dataset.v === op[k]));
      });
    });
  }
  function cambiar(){
    configurar();
    ponerVideo();
    guardar();
    marcar();
    medirEscena();
    aplicar();
  }
  grupos.forEach(function(g){
    g.querySelectorAll('.pp-ops button').forEach(function(b){
      b.addEventListener('click', function(){
        op[g.dataset.op] = b.dataset.v;
        cambiar();
      });
    });
  });
  panel.querySelectorAll('[data-preset]').forEach(function(b){
    b.addEventListener('click', function(){
      var pr = PRESETS[b.dataset.preset];
      Object.keys(pr).forEach(function(k){ op[k] = pr[k]; });
      cambiar();
    });
  });
  function mostrarPanel(si){
    panelAbierto = si;
    panel.hidden = !si;
    abrir.setAttribute('aria-expanded', String(si));
    if (si) aplicar();
  }
  abrir.addEventListener('click', function(){ mostrarPanel(!panelAbierto); });
  document.getElementById('pp-cerrar').addEventListener('click', function(){ mostrarPanel(false); abrir.focus(); });
  document.getElementById('pp-arriba').addEventListener('click', function(){ mostrarPanel(false); irA(0); });
  document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && panelAbierto) mostrarPanel(false); });
  marcar();
})();
