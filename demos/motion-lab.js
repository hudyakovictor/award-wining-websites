/**
 * Демо-заглушка для любого блока, пока не написан собственный пример.
 * Motion-лаборатория: видно, как работают токены --d-* и --e-* из tokens.css.
 * Свой демо-файл блока кладём в demos/NN-*.js и подключаем так же.
 */
const CURVES = {
  expo: 'cubic-bezier(0.16, 1, 0.3, 1)',
  quart: 'cubic-bezier(0.25, 1, 0.5, 1)',
  inout: 'cubic-bezier(0.65, 0, 0.35, 1)',
  back: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  snap: 'cubic-bezier(0.9, 0, 0.1, 1)',
};

export const mount = (host) => {
  host.innerHTML = `
    <div class="stage__inner" style="display:grid;gap:var(--sp-5);width:min(40rem,100%)">
      <p class="u-mono" data-lab-readout>motion lab · expo · 560ms</p>
      <div data-lab-track style="position:relative;height:5rem;border:var(--hair);border-radius:var(--r-pill);overflow:hidden">
        <i data-lab-puck style="position:absolute;top:50%;left:1rem;width:3rem;height:3rem;margin-top:-1.5rem;border-radius:50%;background:var(--accent);box-shadow:var(--glow-accent)"></i>
      </div>
      <div class="cluster" style="justify-content:center" data-lab-curves>
        ${Object.keys(CURVES)
          .map((c, i) => `<button class="chip" type="button" data-curve="${c}" aria-pressed="${i === 0}">${c}</button>`)
          .join('')}
      </div>
      <label class="u-mono" style="display:grid;gap:var(--sp-2);justify-items:center">
        длительность <output data-lab-ms>560</output> мс
        <input type="range" min="90" max="1400" step="10" value="560" data-lab-dur style="width:min(24rem,100%);accent-color:var(--accent)">
      </label>
      <button class="chip" type="button" data-lab-play aria-pressed="false">проиграть</button>
    </div>`;

  const puck = host.querySelector('[data-lab-puck]');
  const readout = host.querySelector('[data-lab-readout]');
  const msOut = host.querySelector('[data-lab-ms]');
  const dur = host.querySelector('[data-lab-dur]');
  let curve = CURVES.expo;
  let curveName = 'expo';

  const paint = () => {
    readout.textContent = `motion lab · ${curveName} · ${dur.value}ms`;
    puck.style.transition = `transform ${dur.value}ms ${curve}`;
  };

  const play = () => {
    paint();
    const track = host.querySelector('[data-lab-track]');
    const end = track.clientWidth - 64;
    const x = puck.style.transform ? 0 : end;
    puck.style.transform = `translate3d(${x}px,0,0)`;
  };

  host.querySelector('[data-lab-play]').addEventListener('click', play);
  dur.addEventListener('input', paint);
  host.querySelector('[data-lab-curves]').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-curve]');
    if (!btn) return;
    curve = CURVES[btn.dataset.curve];
    curveName = btn.dataset.curve;
    host.querySelectorAll('[data-curve]').forEach((c) => c.setAttribute('aria-pressed', String(c === btn)));
    play();
  });

  paint();
};
