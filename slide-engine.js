/* ═══════════════════════════════════════════════════
   slide-engine.js — Shared JS for all chapter slides
   ก๋วยเตี๋ยวเรือ Programming
   ═══════════════════════════════════════════════════
   Required globals from each HTML (set before loading):
     const TITLES = ['Cover', 'slide title', ...]
   ═══════════════════════════════════════════════════ */

(function () {
  const slides = [...document.querySelectorAll('.slide')];
  const total  = slides.length;
  let cur = 0;

  /* ── NAVIGATION ── */
  function go(dir) {
    if (cur + dir < 0 || cur + dir >= total) return;
    const leaving = cur;
    cur += dir;

    slides[leaving].classList.remove('active');
    slides[leaving].classList.add(dir > 0 ? 'out-left' : 'out-right');
    slides[leaving].addEventListener('animationend', () =>
      slides[leaving].classList.remove('out-left', 'out-right'), { once: true });

    slides[cur].classList.add(dir > 0 ? 'in-right' : 'in-left');
    slides[cur].addEventListener('animationend', () => {
      slides[cur].classList.remove('in-right', 'in-left');
      slides[cur].classList.add('active');
    }, { once: true });

    update();
  }
  window.go = go;  // expose to inline onclick

  function update() {
    const pBtn = document.getElementById('prevBtn');
    const nBtn = document.getElementById('nextBtn');
    const ctr  = document.getElementById('counter');
    const fill = document.getElementById('navFill');
    const lbl  = document.getElementById('chapterLabel');
    if (pBtn) pBtn.disabled = cur === 0;
    if (nBtn) nBtn.disabled = cur === total - 1;
    if (ctr)  ctr.textContent  = `${cur + 1} / ${total}`;
    if (fill) fill.style.width = `${((cur + 1) / total) * 100}%`;
    if (lbl && typeof TITLES !== 'undefined') lbl.textContent = TITLES[cur] || '';
  }

  /* ── KEYBOARD ── */
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') go(1);
    if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   go(-1);
  });

  /* ── SWIPE ── */
  let tx = 0;
  document.addEventListener('touchstart', e => { tx = e.touches[0].clientX; });
  document.addEventListener('touchend',   e => {
    const dx = tx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) go(dx > 0 ? 1 : -1);
  });

  /* ── FILL-IN CHECK ── */
  window.checkFill = function (inputId, correct, alts, badPats, okMsg, errMsg) {
    const inp = document.getElementById(inputId);
    const num = inputId.replace(/^[^\d]+/, '');
    const fb  = document.getElementById('fb' + num);
    if (!inp || inp.disabled) return;

    /* normalize: trim + collapse spaces + strip all quote chars */
    function norm(s) {
      return s.trim()
              .replace(/\s+/g, ' ')          /* collapse whitespace */
              .replace(/['"\\]/g, '')         /* strip ' " \ */
              .replace(/\s*([?:=!<>&|+\-*%,])\s*/g, '$1') /* rm spaces around ops */
              .toLowerCase();
    }

    const val  = norm(inp.value);
    const ok   = [correct, ...alts].some(a => norm(a) === val);
    const bad  = badPats.some(b => norm(b) === val);

    inp.disabled = true;
    inp.classList.add(ok ? 'correct' : 'wrong');
    if (fb) {
      fb.textContent = ok ? '✓ ' + okMsg
                          : (bad ? '⚠️ ใกล้แล้ว! ' + errMsg : '✗ ' + errMsg);
      fb.className   = 'ex-feedback show ' + (ok ? 'ok' : 'err');
    }
    const btn = inp.closest('.exercise')?.querySelector('.ex-btn');
    if (btn) btn.disabled = true;
  };

  /* ── MULTIPLE CHOICE ── */
  window.pickMC = function (groupId, chosen, correct, msg) {
    const opts = [...document.querySelectorAll(`#${groupId} .mc-opt`)];
    if (opts.some(o => o.classList.contains('done'))) return;
    opts.forEach((o, i) => {
      o.classList.add('done');
      if (i === correct) o.classList.add('reveal');
      else if (i === chosen) o.classList.add('wrong');
    });
    const fb = document.getElementById(groupId + '-fb');
    if (fb) {
      fb.textContent = chosen === correct ? '✓ ' + msg : '✗ ผิด — ' + msg;
      fb.className   = 'ex-feedback show ' + (chosen === correct ? 'ok' : 'err');
    }
  };

  /* ── INIT ── */
  update();
})();
