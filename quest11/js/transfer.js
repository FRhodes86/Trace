// Move progress between devices, browsers or sign-ins. Progress lives in each browser's storage, so it travels as a
// small save file (or a code to paste). The save is compressed, and data the game can rebuild (recent-question history,
// the full text of old mistakes) is left out to keep it short. Before an import replaces anything, the current save is
// backed up so it can be restored.
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const S = () => State.s;
  const UI = () => Game.ui;
  const BACKUP = 'botk-save-v1-backup';

  /* ---------------- packing ---------------- */
  const b64u = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64u = str => { str = str.replace(/-/g, '+').replace(/_/g, '/'); while (str.length % 4) str += '='; const bin = atob(str); const out = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i); return out; };
  async function gzip(text) { if (!window.CompressionStream) return null; const st = new Blob([text]).stream().pipeThrough(new CompressionStream('gzip')); return new Uint8Array(await new Response(st).arrayBuffer()); }
  async function gunzip(bytes) { const st = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')); return new Response(st).text(); }
  function slim(s) {
    const c = JSON.parse(JSON.stringify(s));
    c.recentQs = []; c.recentPassages = [];
    c.mistakes = (c.mistakes || []).map(m => ({ ...m, q: null })); // Blood Moon makes a fresh question of the same kind
    return c;
  }
  async function pack() {
    const json = JSON.stringify(slim(S()));
    const z = await gzip(json).catch(() => null);
    return z ? 'BOTK2:' + b64u(z) : 'BOTK1:' + b64u(new TextEncoder().encode(json));
  }
  async function unpack(text) {
    text = String(text || '').trim();
    let json;
    if (text.startsWith('{')) json = text;
    else {
      text = text.replace(/\s+/g, '');
      if (text.startsWith('BOTK2:')) json = await gunzip(unb64u(text.slice(6)));
      else if (text.startsWith('BOTK1:')) json = new TextDecoder().decode(unb64u(text.slice(6)));
      else json = decodeURIComponent(escape(atob(text))); // save codes from older versions of the game
    }
    const obj = JSON.parse(json);
    if (!obj || obj.v !== 1 || typeof obj.hero !== 'string') throw new Error('Not a save');
    return obj;
  }

  /* ---------------- summaries ---------------- */
  function summary(o) {
    const stars = Object.values(o.stars || {}).reduce((a, b) => a + b, 0);
    const max = State.SUBJECTS.reduce((a, x) => a + CONTENT[x].length * 3, 0);
    const bosses = Object.keys(o.bosses || {}).filter(k => o.bosses[k]).length;
    const hrs = Math.round(((o.stats && o.stats.playSeconds) || 0) / 360) / 10;
    const when = o.savedAt ? new Date(o.savedAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'unknown';
    return `<div class="xfer-card slate"><div class="xfer-hero">${ART.hero({ armour: o.armour, shield: o.shield, weapon: o.weapon })}</div>
      <div><b>${U.esc(o.hero)}</b><small>Last saved: ${when}</small>
        <ul><li>⭐ ${stars}/${max} shrine stars</li><li>❤️ ${o.hearts || 3} hearts · 🐉 ${bosses}/4 Divine Beasts</li><li>${ART.icons.rupee('green')} ${(o.rupees || 0).toLocaleString('en-GB')} rupees · ⏱ ${hrs} h played</li></ul></div></div>`;
  }
  const fileName = () => `${(S().hero || 'hero').replace(/[^a-z0-9]+/gi, '-')}-breath-of-knowledge-save.txt`;

  /* ---------------- importing ---------------- */
  function confirmImport(obj, back) {
    const { modal } = UI(); const cur = S();
    modal(`<h3>Load this adventure?</h3>${summary(obj)}
      ${cur ? `<p class="muted">This replaces <b>${U.esc(cur.hero)}</b>'s progress on this device. Don't worry: it's backed up, and you can undo this from the Transfer screen.</p>` : ''}`,
    [{ label: 'Cancel', fn: back }, { label: 'Load it! ✔', cls: 'primary', fn: () => {
      try { if (cur) localStorage.setItem(BACKUP, JSON.stringify({ at: Date.now(), save: cur })); } catch (e) { /* storage full: carry on */ }
      State.s = State.migrate(obj); State.save(); U.soundOn = State.s.settings.sound;
      FX.flash('#bff8ff', 0.8); U.sfx.fanfare();
      FX.itemGet(ART.icons.orb(), `Welcome back, ${U.esc(State.s.hero)}!`, 'Your adventure has been loaded on this device.', () => Game.map());
    } }]);
  }
  async function tryText(text, back) {
    try { confirmImport(await unpack(text), back); }
    catch (e) { UI().toast('That save didn\'t work. Check you copied all of it.', 'bad'); }
  }
  function backupInfo() { try { const b = JSON.parse(localStorage.getItem(BACKUP) || 'null'); return b && b.save ? b : null; } catch (e) { return null; } }

  /* ---------------- the screen ---------------- */
  function show(from = 'settings') {
    const s = S(); const { screen, hud, on, toast, modal } = UI();
    const back = () => (from === 'title' || !s ? Game.title() : Game.settings());
    const canShareFiles = (() => { try { return !!(navigator.canShare && navigator.canShare({ files: [new File(['x'], 'x.txt', { type: 'text/plain' })] })); } catch (e) { return false; } })();
    const bk = backupInfo();
    screen(`${s ? hud() : ''}<div class="page xfer-page">
      <div class="page-head"><button class="btn ghost" id="back">◀ Back</button><h2>Transfer Progress</h2></div>
      <p class="intro slate">Each device, browser or sign-in keeps its own save. To carry on somewhere else, <b>send</b> a save from here and <b>load</b> it there.</p>
      ${s ? `<h3>📤 Send this adventure</h3>${summary(s)}
        <div class="xfer-btns">
          ${canShareFiles ? '<button class="btn primary" id="share">📤 Share save file</button>' : ''}
          <button class="btn ${canShareFiles ? '' : 'primary'}" id="dl">💾 Download save file</button>
          <button class="btn" id="copy">📋 Copy save code</button>
        </div>
        <textarea id="outcode" rows="3" readonly placeholder="Your save code will appear here"></textarea>
        <p class="muted small">Send the file (or code) to the other device by AirDrop, Messages, email, WhatsApp or Google Drive.</p>` : ''}
      <h3>📥 Load an adventure on this device</h3>
      <div class="xfer-btns"><label class="btn primary" for="file">📂 Open save file</label><input type="file" id="file" accept=".txt,.botk,.json,text/plain" hidden></div>
      <textarea id="incode" rows="3" placeholder="…or paste a save code here"></textarea>
      <div class="xfer-btns"><button class="btn" id="load">✔ Load pasted code</button></div>
      ${bk ? `<div class="xfer-undo slate"><span>↩️</span><div><b>Undo the last load</b><small>Restore ${U.esc(bk.save.hero)}'s adventure as it was on ${new Date(bk.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</small></div><button class="btn small" id="undo">Restore</button></div>` : ''}
      <details class="xfer-help slate"><summary>👪 Step-by-step for grown-ups</summary><ol>
        <li>On the device with the progress: <b>Settings → Transfer progress → Share</b> (or Download) the save file.</li>
        <li>Send it to the other device, for example by AirDrop, Messages or email, and save it there.</li>
        <li>On the other device, open the game and tap <b>Continue from another device</b> on the title screen (or Settings → Transfer progress), then <b>Open save file</b>.</li>
        <li>Check the hero card, then tap <b>Load it!</b> Done!</li>
      </ol><p class="muted">Tip: progress doesn't sync on its own, so always continue on the device you loaded it on. Send a fresh save whenever you switch.</p></details>
    </div>`, 'map', 'field');
    on('#back', back);
    const out = $('#outcode');
    const withCode = async fn => { try { const code = await pack(); if (out) out.value = code; fn(code); } catch (e) { toast('Sorry, the save couldn\'t be made.', 'bad'); } };
    on('#copy', () => withCode(code => { out.focus(); out.select(); const ok = () => toast(`Save code copied! (${code.length.toLocaleString('en-GB')} characters)`, 'good'); try { navigator.clipboard.writeText(code).then(ok, () => toast('Select the code above and copy it.')); } catch (e) { toast('Select the code above and copy it.'); } }));
    on('#dl', () => withCode(code => { try { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([code], { type: 'text/plain' })); a.download = fileName(); document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000); toast('Save file downloaded 💾', 'good'); } catch (e) { toast('Download isn\'t allowed here. Use Copy save code instead.', 'bad'); } }));
    on('#share', () => withCode(async code => { try { await navigator.share({ files: [new File([code], fileName(), { type: 'text/plain' })], title: `${s.hero}'s adventure`, text: 'Breath of Knowledge save file' }); } catch (e) { if (e && e.name !== 'AbortError') toast('Sharing isn\'t available. Try Download or Copy instead.', 'bad'); } }));
    const fileIn = $('#file');
    fileIn.addEventListener('change', () => { const f = fileIn.files && fileIn.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => tryText(r.result, () => show(from)); r.onerror = () => toast('That file couldn\'t be read.', 'bad'); r.readAsText(f); fileIn.value = ''; });
    on('#load', () => tryText($('#incode').value, () => show(from)));
    on('#undo', () => { const b = backupInfo(); if (!b) return; modal(`<h3>Restore the previous adventure?</h3>${summary(b.save)}<p class="muted">The adventure on this device now will be replaced.</p>`, [{ label: 'Cancel' }, { label: 'Restore', cls: 'primary', fn: () => { State.s = State.migrate(b.save); State.save(); try { localStorage.removeItem(BACKUP); } catch (e) { /* ignore */ } toast('Restored!', 'good'); Game.map(); } }]); });
  }

  window.Transfer = { show, pack, unpack };
})();
