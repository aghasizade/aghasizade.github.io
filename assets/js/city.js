/* ==========================================================
   Urban data city — the page's full-screen 3D background.
   City blocks = urban planning, breathing heights = live statistics,
   sweeping camera cones = video surveillance, arcs = data / AI network.
   The city tiles endlessly (torus wrap) so it always fills the screen;
   time and scrolling glide the view across it. Canvas 2D, no libraries.
   ========================================================== */
(function () {
  'use strict';

  var canvas = document.getElementById('city');
  if (!canvas || !canvas.getContext) return;
  var ctx = canvas.getContext('2d');
  var root = document.documentElement;
  var reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- deterministic noise ---------- */
  function hash(x, z) { var s = Math.sin(x * 127.1 + z * 311.7) * 43758.5453; return s - Math.floor(s); }
  function noise(x, z) {
    var xi = Math.floor(x), zi = Math.floor(z), xf = x - xi, zf = z - zi;
    var a = hash(xi, zi), b = hash(xi + 1, zi), c = hash(xi, zi + 1), d = hash(xi + 1, zi + 1);
    var u = xf * xf * (3 - 2 * xf), v = zf * zf * (3 - 2 * zf);
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  }
  function smooth(e0, e1, x) { var t = Math.max(0, Math.min(1, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); }

  /* ---------- the city (an N×N tile that wraps) ---------- */
  var N = 40, R = N / 2;
  function wrap(v) { v = (v + R) % N; if (v < 0) v += N; return v - R; }

  var blocks = [];
  for (var gz = 0; gz < N; gz++) {
    for (var gx = 0; gx < N; gx++) {
      if (gx % 5 === 4 || gz % 5 === 4) continue;             // avenues between districts
      var r = hash(gx, gz);
      if (r < 0.1) continue;                                    // plazas and parks
      var district = noise(gx * 0.07 + 11, gz * 0.07 + 5);     // downtown vs. low-rise
      var h = 0.2 + Math.pow(noise(gx * 0.2, gz * 0.2), 1.5) * 3 * (0.3 + 0.95 * district);
      if (r > 0.965) h += 1.2 + district * 1.8;                 // towers
      blocks.push({
        x: gx - R + 0.5, z: gz - R + 0.5, s: 0.33 + hash(gz, gx) * 0.08, h0: h, h: h,
        live: r > 0.7, ph: r * 6.283, lit: 0, rx: 0, rz: 0, depth: 0, fog: 0
      });
    }
  }

  // data links: each tall tower connects to its nearest tall neighbour
  var towers = blocks.slice().sort(function (a, b) { return b.h0 - a.h0; }).slice(0, 44);
  var links = [], seen = {};
  towers.forEach(function (a, i) {
    var best = null, bd = 1e9;
    towers.forEach(function (b, j) {
      if (i === j) return;
      var dx = wrap(a.x - b.x), dz = wrap(a.z - b.z), d = dx * dx + dz * dz;
      if (d < bd && d > 4) { bd = d; best = j; }
    });
    if (best === null || bd > 110) return;
    var key = Math.min(i, best) + '-' + Math.max(i, best);
    if (seen[key]) return;
    seen[key] = 1;
    links.push({ a: a, b: towers[best], off: (i * 0.37) % 1 });
  });

  // cameras stand on avenue intersections (avenues at world …-10.5, -5.5, -0.5, 4.5, 9.5…)
  var cams = [
    [-5.5, -5.5, 0.8], [4.5, -0.5, 3.3], [-0.5, 9.5, -1.7], [-10.5, 4.5, 0.2],
    [9.5, -10.5, 2.2], [14.5, 9.5, -2.6], [-15.5, -15.5, 1.1], [19.5, -5.5, 3.0], [-5.5, 14.5, -0.9]
  ].map(function (c, i) {
    return { x: c[0], z: c[1], base: c[2], y: 2.1 + (i % 3) * 0.2, amp: 0.5 + (i % 2) * 0.1, sp: 0.26 + (i % 4) * 0.03, ph: i * 1.7, fov: 0.4, range: 6.2, label: 'CAM-' + (i < 9 ? '0' : '') + (i + 1) };
  });

  /* ---------- palette from CSS tokens ---------- */
  var P = {};
  function rgb(hex) {
    hex = hex.trim().replace('#', '');
    if (hex.length === 3) hex = hex.replace(/./g, '$&$&');
    var n = parseInt(hex, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k]; }
  function css(c, a) { return 'rgba(' + (c[0] | 0) + ',' + (c[1] | 0) + ',' + (c[2] | 0) + ',' + (a === undefined ? 1 : a) + ')'; }
  function readPalette() {
    var cs = getComputedStyle(root);
    var dark = root.dataset.theme === 'dark';
    var bg = rgb(cs.getPropertyValue('--bg')), elev = rgb(cs.getPropertyValue('--bg-elev'));
    var sunk = rgb(cs.getPropertyValue('--bg-sunk')), line2 = rgb(cs.getPropertyValue('--line-2'));
    var ink3 = rgb(cs.getPropertyValue('--ink-3')), accent = rgb(cs.getPropertyValue('--accent'));
    P = {
      dark: dark, bg: bg, accent: accent, ink3: ink3,
      top: dark ? mix(sunk, line2, 0.35) : elev,
      sideA: dark ? mix(bg, sunk, 0.9) : mix(sunk, line2, 0.15),
      sideB: dark ? mix(bg, sunk, 0.35) : mix(sunk, line2, 0.65),
      edge: dark ? mix(line2, ink3, 0.15) : mix(line2, ink3, 0.25),
      grid: line2,
      rec: dark ? [255, 90, 90] : [217, 58, 58],
      coneFill: dark ? 0.14 : 0.13,
      edgeAlpha: dark ? 0.75 : 0.85
    };
  }
  readPalette();
  new MutationObserver(function () { readPalette(); if (typeof onScroll === 'function') onScroll(); if (reduced || paused) draw(time); })
    .observe(root, { attributes: true, attributeFilter: ['data-theme'] });

  /* ---------- view ---------- */
  var W = 0, H = 0, DPR = 1;
  var view = { yaw: 0.72, pitch: 0.98, dist: 55, f: 1, cx: 0, cy: 0 };
  var pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  var scrollK = 0, scrollY0 = 0, target = { x: 0, z: 0 };
  var FOG0 = 0.8, FOG1 = 0.99;     // fade ring, kept outside the screen

  var cosY, sinY, cosP, sinP;
  function setAngles(yaw, pitch) { cosY = Math.cos(yaw); sinY = Math.sin(yaw); cosP = Math.cos(pitch); sinP = Math.sin(pitch); }
  function project(x, y, z) {
    var xr = x * cosY - z * sinY, zr = x * sinY + z * cosY;
    var d = view.dist - y * sinP - zr * cosP;
    var up = y * cosP - zr * sinP;
    return [view.cx + view.f * xr / d, view.cy - view.f * up / d, d];
  }

  // pick the smallest scale whose fog-free ground disc still covers the whole viewport
  function covers(f, pitch) {
    var saveF = view.f; view.f = f; setAngles(0, pitch);
    var pts = [];
    for (var i = 0; i < 48; i++) { var a = i / 48 * 6.283; pts.push(project(Math.cos(a) * R * FOG0, 0, Math.sin(a) * R * FOG0)); }
    view.f = saveF;
    var m = 24, test = [[-m, -m], [W + m, -m], [W + m, H + m], [-m, H + m], [W / 2, -m], [W / 2, H + m]];
    return test.every(function (p) {
      for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        var a = pts[j], b = pts[i];
        if ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) < 0) return false;
      }
      return true;
    }) || test.every(function (p) {
      for (var i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        var a = pts[j], b = pts[i];
        if ((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0]) > 0) return false;
      }
      return true;
    });
  }
  function layout() {
    view.cx = W / 2;
    view.cy = H * 0.52;
    var lo = 50, hi = 60000;
    for (var k = 0; k < 28; k++) {
      var mid = (lo + hi) / 2;
      if (covers(mid, view.pitch - 0.07)) hi = mid; else lo = mid;
    }
    view.f = hi * 1.04;
  }
  function resize() {
    var w = innerWidth, h = innerHeight;
    if (Math.abs(w - W) < 2 && Math.abs(h - H) < 140 && W) return;
    W = w; H = h;
    DPR = Math.min(window.devicePixelRatio || 1, W < 900 ? 1.5 : 2);
    canvas.width = Math.round(W * DPR); canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    layout();
    if (reduced || paused) draw(time);
  }

  /* ---------- drawing ---------- */
  function poly(pts) {
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.closePath();
  }
  function fogAt(x, z) { return 1 - smooth(R * FOG0, R * FOG1, Math.sqrt(x * x + z * z)); }
  var LIGHT = [-0.55, 0.62];
  var SIDES = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  var lowQ = false, hl = 1;

  function drawBlock(b) {
    var s = b.s, h = b.h, x = b.rx, z = b.rz, lit = b.lit;
    ctx.globalAlpha = b.fog;
    var Cy = view.dist * sinP, Cz = view.dist * cosP;
    for (var i = 0; i < 4; i++) {
      var nx = SIDES[i][0], nz = SIDES[i][1];
      var fx = x + nx * s, fz = z + nz * s;
      var fxr = fx * cosY - fz * sinY, fzr = fx * sinY + fz * cosY;
      var nxr = nx * cosY - nz * sinY, nzr = nx * sinY + nz * cosY;
      if (nxr * (0 - fxr) + nzr * (Cz - fzr) <= 0) continue;
      var tx = nz, tz = -nx;
      var p1 = project(fx + tx * s, 0, fz + tz * s), p2 = project(fx - tx * s, 0, fz - tz * s);
      var p3 = project(fx - tx * s, h, fz - tz * s), p4 = project(fx + tx * s, h, fz + tz * s);
      var shade = 0.5 + 0.5 * (nx * LIGHT[0] + nz * LIGHT[1]);
      var col = mix(P.sideA, P.sideB, shade);
      if (lit > 0.01) col = mix(col, P.accent, lit * hl * (P.dark ? 0.28 : 0.22));
      poly([p1, p2, p3, p4]);
      ctx.fillStyle = css(col);
      ctx.fill();
      if (!lowQ) { ctx.strokeStyle = css(P.edge, P.edgeAlpha * 0.6); ctx.lineWidth = 0.6; ctx.stroke(); }
    }
    var t1 = project(x - s, h, z - s), t2 = project(x + s, h, z - s), t3 = project(x + s, h, z + s), t4 = project(x - s, h, z + s);
    poly([t1, t2, t3, t4]);
    ctx.fillStyle = css(lit > 0.01 ? mix(P.top, P.accent, lit * hl * (P.dark ? 0.55 : 0.45)) : P.top);
    ctx.fill();
    ctx.strokeStyle = lit > 0.25 ? css(P.accent, (0.5 + lit * 0.5) * hl) : css(P.edge, P.edgeAlpha);
    ctx.lineWidth = lit > 0.25 ? 1.1 : 0.7;
    ctx.stroke();
  }

  function camAngle(c, t) { return c.base + Math.sin(t * c.sp + c.ph) * c.amp; }

  function drawGround(t) {
    ctx.lineWidth = 0.8;
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = css(P.grid, 0.6);
    for (var a = 4; a < N; a += 5) {
      var w0 = a - R + 0.5;
      var lx = wrap(w0 - target.x), lz = wrap(w0 - target.z);
      for (var s = -R; s < R; s += 2) {
        var fa = fogAt(lx, s + 1), fb = fogAt(s + 1, lz);
        if (fa > 0.02) {
          ctx.globalAlpha = fa;
          var p = project(lx, 0, s), q = project(lx, 0, s + 2);
          ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(q[0], q[1]); ctx.stroke();
        }
        if (fb > 0.02) {
          ctx.globalAlpha = fb;
          var p2 = project(s, 0, lz), q2 = project(s + 2, 0, lz);
          ctx.beginPath(); ctx.moveTo(p2[0], p2[1]); ctx.lineTo(q2[0], q2[1]); ctx.stroke();
        }
      }
    }
    ctx.setLineDash([]);
    cams.forEach(function (c) {
      var cx = wrap(c.x - target.x), cz = wrap(c.z - target.z), fg = fogAt(cx, cz);
      c.rx = cx; c.rz = cz; c.fog = fg;
      if (fg < 0.05) return;
      ctx.globalAlpha = fg;
      var ang = camAngle(c, t);
      var pts = [project(cx, 0, cz)];
      for (var i = 0; i <= 12; i++) {
        var aa = ang - c.fov + (2 * c.fov) * i / 12;
        pts.push(project(cx + Math.cos(aa) * c.range, 0, cz + Math.sin(aa) * c.range));
      }
      poly(pts);
      ctx.fillStyle = css(P.accent, P.coneFill * hl);
      ctx.fill();
      ctx.strokeStyle = css(P.accent, 0.35);
      ctx.lineWidth = 1;
      ctx.stroke();
      var sa = ang - c.fov + (2 * c.fov) * ((Math.sin(t * 1.3 + c.ph) + 1) / 2);
      var s1 = project(cx + Math.cos(sa) * c.range, 0, cz + Math.sin(sa) * c.range);
      ctx.strokeStyle = css(P.accent, 0.55);
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); ctx.lineTo(s1[0], s1[1]); ctx.stroke();
    });
    ctx.globalAlpha = 1;
  }

  function drawOverlay(t) {
    links.forEach(function (l) {
      var ax = wrap(l.a.x - target.x), az = wrap(l.a.z - target.z), bx = wrap(l.b.x - target.x), bz = wrap(l.b.z - target.z);
      if (Math.abs(ax - bx) > R || Math.abs(az - bz) > R) return;
      var fg = Math.min(fogAt(ax, az), fogAt(bx, bz));
      if (fg < 0.05) return;
      ctx.globalAlpha = fg;
      var a = project(ax, l.a.h, az), b = project(bx, l.b.h, bz);
      var m = project((ax + bx) / 2, Math.max(l.a.h, l.b.h) + 2, (az + bz) / 2);
      var cxp = 2 * m[0] - (a[0] + b[0]) / 2, cyp = 2 * m[1] - (a[1] + b[1]) / 2;
      ctx.strokeStyle = css(P.accent, 0.28);
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(cxp, cyp, b[0], b[1]); ctx.stroke();
      if (!reduced) {
        var k = (t * 0.22 + l.off) % 1, q = 1 - k;
        ctx.fillStyle = css(P.accent, 0.95);
        ctx.beginPath(); ctx.arc(q * q * a[0] + 2 * q * k * cxp + k * k * b[0], q * q * a[1] + 2 * q * k * cyp + k * k * b[1], 2.2, 0, 6.283); ctx.fill();
      }
      ctx.fillStyle = css(P.accent, 0.8);
      ctx.beginPath(); ctx.arc(a[0], a[1], 1.8, 0, 6.283); ctx.arc(b[0], b[1], 1.8, 0, 6.283); ctx.fill();
    });
    ctx.font = '10px ui-monospace, Consolas, monospace';
    cams.forEach(function (c) {
      if (c.fog < 0.05) return;
      ctx.globalAlpha = c.fog;
      var ang = camAngle(c, t);
      var g = project(c.rx, 0, c.rz), hd = project(c.rx, c.y, c.rz);
      ctx.strokeStyle = css(P.edge, 0.9); ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(g[0], g[1]); ctx.lineTo(hd[0], hd[1]); ctx.stroke();
      ctx.strokeStyle = css(P.accent, 0.3); ctx.lineWidth = 0.8;
      [-1, 1].forEach(function (sgn) {
        var e = project(c.rx + Math.cos(ang + sgn * c.fov) * c.range, 0, c.rz + Math.sin(ang + sgn * c.fov) * c.range);
        ctx.beginPath(); ctx.moveTo(hd[0], hd[1]); ctx.lineTo(e[0], e[1]); ctx.stroke();
      });
      ctx.fillStyle = css(P.rec, reduced ? 1 : 0.55 + 0.45 * Math.abs(Math.sin(t * 2 + c.ph)));
      ctx.beginPath(); ctx.arc(hd[0], hd[1], 3.2, 0, 6.283); ctx.fill();
      ctx.fillStyle = css(P.ink3, 0.9);
      ctx.fillText(c.label, hd[0] + 7, hd[1] - 6);
    });
    ctx.globalAlpha = 1;
  }

  /* ---------- frame ---------- */
  var time = 0, start = performance.now(), paused = false, frame = 0, cost = 0;
  var visible = [];

  function update(t) {
    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;
    var drift = reduced ? 0 : t;
    target.x = drift * 0.16 + scrollY0 * 0.0042;
    target.z = drift * 0.09 + scrollY0 * 0.0068;
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      b.h = b.live && !reduced ? b.h0 * (1 + 0.09 * Math.sin(t * 0.7 + b.ph)) : b.h0;
      var hit = 0;
      for (var j = 0; j < cams.length; j++) {
        var c = cams[j], dx = wrap(b.x - c.x), dz = wrap(b.z - c.z);
        if (dx * dx + dz * dz > c.range * c.range) continue;
        var da = Math.atan2(dz, dx) - camAngle(c, t);
        da = Math.atan2(Math.sin(da), Math.cos(da));
        if (Math.abs(da) < c.fov) { hit = 1; break; }
      }
      b.lit += (hit - b.lit) * (reduced ? 1 : 0.08);
    }
  }

  function draw(t) {
    var t0 = performance.now();
    hl = (P.dark ? 0.85 : 0.7) * (1 - scrollK * 0.55);
    setAngles(view.yaw + (reduced ? 0 : t * 0.012) + pointer.x * 0.1, view.pitch + pointer.y * 0.04 + scrollK * 0.1);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    drawGround(t);
    visible.length = 0;
    for (var i = 0; i < blocks.length; i++) {
      var b = blocks[i];
      b.rx = wrap(b.x - target.x); b.rz = wrap(b.z - target.z);
      b.fog = fogAt(b.rx, b.rz);
      if (b.fog < 0.02) continue;
      var base = project(b.rx, 0, b.rz);
      if (base[0] < -90 || base[0] > W + 90 || base[1] < -60) continue;
      var top = project(b.rx, b.h, b.rz);
      if (top[1] > H + 60) continue;
      b.depth = project(b.rx, b.h / 2, b.rz)[2];
      visible.push(b);
    }
    visible.sort(function (a, b) { return b.depth - a.depth; });
    for (var k = 0; k < visible.length; k++) drawBlock(visible[k]);
    ctx.globalAlpha = 1;
    drawOverlay(t);
    cost = cost * 0.92 + (performance.now() - t0) * 0.08;
  }

  function loop(now) {
    if (paused) return;
    requestAnimationFrame(loop);
    frame++;
    // drop to half rate on slow devices, or when the city is only a backdrop
    if ((lowQ || scrollK > 0.9) && frame % 2) return;
    time = (now - start) / 1000;
    update(time);
    draw(time);
    if (frame > 60 && !lowQ && cost > 11) lowQ = true;
  }

  /* ---------- inputs ---------- */
  var PEAK = 0.3, FLOOR = 0.24;   // city opacity in the hero, and behind the content further down
  function onScroll() {
    var hero = document.getElementById('home');
    var hh = hero ? hero.offsetHeight : H;
    scrollY0 = scrollY;
    scrollK = Math.max(0, Math.min(1, scrollY / (hh * 0.85)));
    canvas.style.opacity = String(PEAK - scrollK * (PEAK - FLOOR));
    if (reduced) { update(0); draw(0); }
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', function () { clearTimeout(resize.t); resize.t = setTimeout(resize, 120); });
  if (!reduced) {
    addEventListener('pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      pointer.tx = (e.clientX / W - 0.5) * 2;
      pointer.ty = (e.clientY / H - 0.5) * 2;
    }, { passive: true });
  }
  document.addEventListener('visibilitychange', function () {
    if (reduced) return;
    paused = document.hidden;
    if (!paused) requestAnimationFrame(loop);
  });

  resize();
  onScroll();
  update(0);
  if (reduced) { draw(0); } else { requestAnimationFrame(loop); }
  canvas.classList.add('ready');
})();
