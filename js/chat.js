/* Maths 7 Lab — chapter chatbot. Uses Claude (artifact `sample`) when offered; otherwise a local tutor that searches the chapter and solves common Stage 7 calculations. History lives only for this browser session. */
(function () {
  'use strict';
  const { h, icon, esc, store, SFX, AI, U, parse } = APP;
  const CH = { unit: null, open: false, busy: false, ctl: null, deep: false };
  APP.CHAT = CH;

  const plain = (html) => String(html || '').replace(/<span class="frac"><span>(.*?)<\/span><span>(.*?)<\/span><\/span>/g, '($1/$2)').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/\s+/g, ' ').trim();
  APP.plain = plain;

  function unitContext(u) {
    if (!u) {
      return 'TOÀN BỘ SÁCH Cambridge Lower Secondary Mathematics 7 gồm 16 chương:\n' + APP.units.map((x) => `Unit ${x.n}: ${x.title} (${x.vi}) — các mục: ${x.sections.map((s) => s.id + ' ' + s.t).join('; ')}`).join('\n');
    }
    let t = `CHƯƠNG ${u.n}: ${u.title} (${u.vi}).\n${plain(u.blurb)}\nTừ khoá: ${(u.words || []).map((w) => w[0] + ' = ' + w[1]).join(', ')}\n`;
    u.sections.forEach((s) => {
      t += `\n## ${s.id} ${s.t} (${s.vi})\n`;
      (s.goals || []).forEach((g) => (t += '- Mục tiêu: ' + plain(g) + '\n'));
      (s.body || []).forEach((b) => {
        if (['p', 'rule', 'tip', 'vi'].includes(b[0])) t += plain(Array.isArray(b[1]) ? b[1].join('; ') : b[1]) + '\n';
        else if (b[0] === 'ex') t += 'Ví dụ: ' + plain(b[1].q) + ' → ' + b[1].steps.map(plain).join(' | ') + '\n';
        else if (b[0] === 'list') t += b[1].map(plain).join('; ') + '\n';
      });
    });
    return t.slice(0, 14000);
  }
  const RULES = (u) => `Bạn là "Gia sư Toán 7", trợ lý học tập thân thiện cho một học sinh lớp 7 người Việt đang học sách Cambridge Lower Secondary Mathematics 7 (sách tiếng Anh).
Quy tắc trả lời:
- Trả lời bằng tiếng Việt, câu ngắn, dễ hiểu; chia bước rõ ràng (1, 2, 3…).
- Mỗi khi dùng một khái niệm, ghi kèm thuật ngữ tiếng Anh trong ngoặc, ví dụ: bội chung nhỏ nhất (lowest common multiple, LCM).
- Khi giải toán: trình bày từng bước, kiểm tra lại đáp án ở cuối. Nếu học sinh nhờ giải bài tập, hãy đưa gợi ý trước, sau đó mới đưa lời giải đầy đủ.
- Dùng ký hiệu đơn giản: ×, ÷, −, phân số viết a/b, lũy thừa viết x². Có thể dùng **in đậm** và danh sách.
- Khi được yêu cầu "tạo bài tập", đưa 3 bài tương tự sách (có đáp án ẩn ở cuối, ghi "Đáp án:").
- Ưu tiên kiến thức của chương dưới đây. Nếu câu hỏi không liên quan đến học tập, nhẹ nhàng hướng học sinh quay lại bài học.
- Độ dài: thường dưới 180 từ, trừ khi học sinh yêu cầu giải thích chi tiết.

NỘI DUNG THAM KHẢO:
${unitContext(u)}`;

  /* ---------- markdown-lite renderer ---------- */
  function md(text) {
    const lines = esc(text).split(/\n/); let out = '', list = null;
    const inline = (s) => s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[^*])\*(?!\s)(.+?)\*(?!\*)/g, '$1<i>$2</i>').replace(/`([^`]+)`/g, '<code>$1</code>');
    for (let ln of lines) {
      const ul = ln.match(/^\s*[-•*]\s+(.*)/), ol = ln.match(/^\s*(\d+)[.)]\s+(.*)/);
      if (ul || ol) { const tag = ul ? 'ul' : 'ol'; if (list !== tag) { if (list) out += `</${list}>`; out += `<${tag}>`; list = tag; } out += `<li>${inline((ul || ol)[ul ? 1 : 2])}</li>`; continue; }
      if (list) { out += `</${list}>`; list = null; }
      if (/^#{1,4}\s/.test(ln)) { out += `<p><b>${inline(ln.replace(/^#+\s/, ''))}</b></p>`; continue; }
      if (ln.trim()) out += `<p>${inline(ln)}</p>`;
    }
    if (list) out += `</${list}>`;
    return out;
  }

  /* ---------- local tutor (offline) ---------- */
  const nums = (q) => (parse.cleanInput(q).match(/-?\d+(?:[.,]\d+)?/g) || []).map((x) => parseFloat(x.replace(',', '.')));
  function local(q, u) {
    const t = q.toLowerCase(); const n = nums(q);
    const has = (...k) => k.some((x) => t.includes(x));
    if (/^(hi|hello|chào|xin chào|alo)\b/.test(t)) return `Chào bạn! Mình là gia sư của **${u ? 'Chương ' + u.n + ' · ' + u.title : 'cả cuốn sách'}**. Bạn có thể hỏi: khái niệm, cách giải, hoặc gõ một phép tính như \`BCNN 12 18\`, \`ƯCLN 24 36\`, \`3/4 + 2/5\`, \`15% của 80\`.`;
    if (has('lcm', 'bcnn', 'bội chung nhỏ nhất', 'lowest common multiple') && n.length >= 2) {
      const ints = n.map(Math.abs).filter((x) => Number.isInteger(x) && x > 0 && x < 1e6); const L = ints.reduce((a, b) => U.lcm(a, b));
      return `**BCNN (LCM) của ${ints.join(', ')} là ${L}.**\n\nCách làm (liệt kê bội):\n${ints.map((x) => `- Bội của ${x}: ${Array.from({ length: Math.min(8, L / x) }, (_, i) => x * (i + 1)).join(', ')}${L / x > 8 ? ', …, ' + L : ''}`).join('\n')}\n\nSố nhỏ nhất xuất hiện trong mọi danh sách là **${L}**.`;
    }
    if (has('hcf', 'gcd', 'ucln', 'ưcln', 'ước chung lớn nhất', 'highest common factor') && n.length >= 2) {
      const ints = n.map(Math.abs).filter((x) => Number.isInteger(x) && x > 0 && x < 1e6); const G = ints.reduce((a, b) => U.gcd(a, b));
      return `**ƯCLN (HCF) của ${ints.join(', ')} là ${G}.**\n\n${ints.map((x) => `- Ước của ${x}: ${U.factors(x).join(', ')}`).join('\n')}\n\nSố lớn nhất có trong mọi danh sách là **${G}**.`;
    }
    if (has('factor', 'ước của', 'ước số') && n.length === 1 && Number.isInteger(n[0]) && n[0] > 0 && n[0] < 1e5) { const f = U.factors(n[0]); return `Các ước (factors) của **${n[0]}**: ${f.join(', ')}.\n\nCặp nhân: ${f.filter((x) => x * x <= n[0]).map((x) => `${x} × ${n[0] / x}`).join(', ')}.${f.length === 2 ? `\n\n${n[0]} là **số nguyên tố** (prime number).` : ''}`; }
    if (has('prime', 'nguyên tố') && n.length === 1) return `${n[0]} ${U.isPrime(n[0]) ? '**là** số nguyên tố (prime) — chỉ có 2 ước là 1 và chính nó.' : '**không phải** số nguyên tố. Các ước: ' + U.factors(Math.abs(n[0])).join(', ') + '.'}`;
    if (has('căn bậc ba', 'cube root', '∛') && n.length) { const v = Math.cbrt(n[0]); return Number.isInteger(U.round(v, 9)) ? `∛${n[0]} = **${U.round(v, 9)}** vì ${U.round(v, 9)} × ${U.round(v, 9)} × ${U.round(v, 9)} = ${n[0]}.` : `∛${n[0]} ≈ ${U.round(v, 3)} (không phải số nguyên). Số lập phương gần nhất: ${Math.round(v) ** 3}.`; }
    if (has('căn', 'square root', '√') && n.length) { const v = Math.sqrt(n[0]); return Number.isInteger(U.round(v, 9)) ? `√${n[0]} = **${U.round(v, 9)}** vì ${U.round(v, 9)}² = ${n[0]}. (Còn −${U.round(v, 9)} cũng có bình phương bằng ${n[0]}.)` : `√${n[0]} ≈ ${U.round(v, 3)}. Nó nằm giữa ${Math.floor(v)} và ${Math.ceil(v)} vì ${Math.floor(v) ** 2} < ${n[0]} < ${Math.ceil(v) ** 2}.`; }
    if (has('%') && has('của', ' of ') && n.length >= 2) { const v = (n[0] / 100) * n[1]; return `${n[0]}% của ${n[1]} = ${n[0]}/100 × ${n[1]} = **${U.round(v, 4)}**.`; }
    if (has('ratio', 'tỉ số', 'tỷ số', ':') && /\d+\s*:\s*\d+/.test(t)) { const m = t.match(/(\d+)\s*:\s*(\d+)(?:\s*:\s*(\d+))?/); const p = [m[1], m[2], m[3]].filter(Boolean).map(Number); const g = p.reduce((a, b) => U.gcd(a, b)); return `Rút gọn tỉ số ${p.join(' : ')}: chia mọi phần cho ƯCLN = ${g} → **${p.map((x) => x / g).join(' : ')}**.`; }
    if (has('chia hết', 'divisible') && n.length >= 2) { const [a, b] = n; return `${a} ${a % b === 0 ? '**chia hết**' : '**không chia hết**'} cho ${b} (${a} ÷ ${b} = ${U.round(a / b, 4)}).`; }
    // fraction arithmetic like 3/4 + 2/5
    const fm = parse.cleanInput(q).match(/^\s*(-?\d+)\s*\/\s*(\d+)\s*([+\-*/×÷x])\s*(-?\d+)\s*\/\s*(\d+)\s*=?\s*$/);
    if (fm) { const [, a, b, op, c, d] = fm; let nn, dd; const A = +a, B = +b, C = +c, D = +d; if (op === '+') { nn = A * D + C * B; dd = B * D; } else if (op === '-') { nn = A * D - C * B; dd = B * D; } else if ('*×x'.includes(op)) { nn = A * C; dd = B * D; } else { nn = A * D; dd = B * C; } const [sn, sd] = U.fracSimp(nn, dd); return `${A}/${B} ${op} ${C}/${D} = ${nn}/${dd} = **${U.fracStr(sn, sd)}**${Math.abs(sn) > sd && sd !== 1 ? ` = ${Math.trunc(sn / sd)} ${Math.abs(sn % sd)}/${sd}` : ''}`; }
    // pure arithmetic expression
    if (/^[\d\s+\-*/×÷().,^−]+=?$/.test(q.trim()) && /\d/.test(q)) { try { const v = parse.evalExpr(q.replace(/=\s*$/, '').replace(/,/g, '.'), {}); return `${q.replace(/=\s*$/, '').trim()} = **${U.N(U.round(v, 6))}**\n\nNhớ thứ tự thực hiện: ngoặc → lũy thừa → nhân/chia → cộng/trừ.`; } catch (e) {} }
    // knowledge search
    return search(q, u);
  }
  function search(q, u) {
    const units = u ? [u] : APP.units; const words = q.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').split(/\s+/).filter((w) => w.length > 1);
    // map vietnamese key words to english terms
    const extra = [];
    units.forEach((x) => (x.words || []).forEach(([en, vi]) => { if (q.toLowerCase().includes(vi.toLowerCase())) extra.push(...en.toLowerCase().split(/\s+/)); }));
    const terms = [...new Set([...words, ...extra])].filter((w) => !['là', 'gì', 'the', 'what', 'how', 'cách', 'của', 'và', 'có', 'cho', 'mình', 'em', 'tôi', 'làm', 'thế', 'nào', 'is', 'a', 'an', 'to', 'of', 'in'].includes(w));
    let best = null;
    units.forEach((x) => x.sections.forEach((s) => {
      const text = (s.t + ' ' + s.vi + ' ' + (s.body || []).map((b) => (['p', 'rule', 'vi', 'tip'].includes(b[0]) ? plain(Array.isArray(b[1]) ? b[1].join(' ') : b[1]) : b[0] === 'ex' ? plain(b[1].q) : '')).join(' ')).toLowerCase();
      let sc = 0; terms.forEach((w) => { if (text.includes(w)) sc += w.length > 3 ? 2 : 1; if ((s.t + s.vi).toLowerCase().includes(w)) sc += 3; });
      if (!best || sc > best.sc) best = { sc, s, x };
    }));
    if (!best || best.sc < 2) return `Mình chưa tìm thấy nội dung phù hợp${u ? ' trong chương này' : ''}. Bạn thử hỏi bằng từ khoá cụ thể hơn (ví dụ: *"LCM là gì"*, *"cách cộng phân số hỗn số"*), hoặc gõ một phép tính.\n\n_Chế độ ngoại tuyến: khi mở trong Claude, trợ lý AI sẽ trả lời đầy đủ hơn._`;
    const s = best.s; const vi = (s.body || []).filter((b) => b[0] === 'vi').map((b) => (Array.isArray(b[1]) ? b[1].map((x) => '- ' + plain(x)).join('\n') : plain(b[1])));
    const rules = (s.body || []).filter((b) => b[0] === 'rule').map((b) => '**' + plain(b[1]) + '**');
    const ex = (s.body || []).find((b) => b[0] === 'ex');
    return `Nội dung liên quan: **${s.id} ${s.t}** (${s.vi})${u ? '' : ` — Chương ${best.x.n}`}\n\n${rules.slice(0, 2).join('\n\n')}\n\n${vi.join('\n')}${ex ? `\n\n**Ví dụ:** ${plain(ex[1].q)}\n${ex[1].steps.map((x, i) => `${i + 1}. ${plain(x)}`).join('\n')}` : ''}\n\n_Mở tab Lý thuyết → mục ${s.id} để xem hình minh hoạ._`;
  }

  /* ---------- UI ---------- */
  let fab, panel, bodyEl, inputEl, sugEl, titleEl, subEl, modeEl;
  const key = () => 'chat:' + (CH.unit ? 'u' + CH.unit.n : 'all');
  const hist = () => store.sget(key(), []);
  const setHist = (v) => store.sset(key(), v.slice(-30));

  function build() {
    fab = h('button', { class: 'fab', 'aria-label': 'Mở trợ lý hỏi đáp', html: icon('chat') + '<span class="dot"></span>', onclick: () => toggle(true) });
    document.body.append(fab);
  }
  function toggle(on) {
    CH.open = on;
    if (!on) { panel && panel.remove(); panel = null; fab.hidden = false; return; }
    fab.hidden = true; SFX.play('open');
    const u = CH.unit;
    titleEl = h('b'); subEl = h('small');
    panel = h('div', { class: 'chat ' + (u ? 's-' + u.strand : 's-number'), role: 'dialog', 'aria-label': 'Trợ lý hỏi đáp' },
      h('div', { class: 'chat-h' }, h('div', { class: 'av', html: icon('robot') }), h('div', { style: { minWidth: 0, flex: 1 } }, titleEl, subEl),
        h('button', { class: 'ibtn', 'aria-label': 'Xoá lịch sử', title: 'Xoá lịch sử phiên này', html: icon('trash'), onclick: clear }),
        h('button', { class: 'ibtn', 'aria-label': 'Đóng', html: icon('close'), onclick: () => toggle(false) })));
    bodyEl = h('div', { class: 'chat-b', 'data-tr': '' });
    sugEl = h('div', { class: 'sugs' });
    modeEl = h('div', { class: 'chat-mode' });
    inputEl = h('textarea', { rows: 1, placeholder: 'Hỏi về ' + (u ? u.title : 'bất kỳ chương nào') + '…', 'aria-label': 'Câu hỏi' });
    inputEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } if (e.key === 'Escape') toggle(false); });
    inputEl.addEventListener('input', () => { inputEl.style.height = 'auto'; inputEl.style.height = Math.min(120, inputEl.scrollHeight) + 'px'; });
    const sendB = h('button', { class: 'btn sc', 'aria-label': 'Gửi', html: icon('send'), onclick: send });
    panel.append(bodyEl, modeEl, sugEl, h('div', { class: 'chat-f' }, inputEl, sendB));
    document.body.append(panel);
    refresh();
    setTimeout(() => inputEl.focus(), 100);
  }
  async function refresh() {
    if (!panel) return; const u = CH.unit;
    titleEl.textContent = u ? `Gia sư Chương ${u.n}` : 'Gia sư Toán 7';
    const ai = await AI.get();
    subEl.textContent = (u ? u.title : 'Toàn bộ sách') + (ai ? ' · Claude AI' : ' · Chế độ ngoại tuyến');
    modeEl.innerHTML = ''; if (ai) { const cb = h('input', { type: 'checkbox', checked: CH.deep }); cb.onchange = () => (CH.deep = cb.checked); modeEl.append(h('label', {}, cb, 'Suy nghĩ kỹ hơn (chậm hơn)'), h('span', {}, '· Lịch sử chỉ lưu trong phiên này')); }
    else modeEl.textContent = 'Lịch sử chỉ lưu trong phiên này';
    bodyEl.innerHTML = '';
    const H = hist();
    if (!H.length) bodyEl.append(msgEl('b', `Xin chào! Mình là gia sư cho **${u ? 'Chương ' + u.n + ': ' + u.title + ' (' + u.vi + ')' : 'cả cuốn Cambridge Maths 7'}**. Hỏi mình bất cứ điều gì về bài học, hoặc nhờ mình ra thêm bài tập nhé.`));
    H.forEach((m) => bodyEl.append(msgEl(m.role === 'user' ? 'u' : 'b', m.content, m.local)));
    const sugs = (u && u.chat) || [];
    const base = u ? [`Tóm tắt chương ${u.n} giúp mình`, `Giải thích "${(u.words && u.words[0] && u.words[0][0]) || u.title}"`, 'Cho mình 3 bài tập luyện thêm', 'Mẹo nhớ nhanh kiến thức chương này'] : ['Sách có những chương nào?', 'BCNN 12 18', '3/4 + 2/5', 'Mẹo học toán bằng tiếng Anh'];
    sugEl.innerHTML = ''; [...sugs, ...base].slice(0, 5).forEach((sg) => sugEl.append(h('button', { type: 'button', onclick: () => { inputEl.value = sg; send(); } }, sg)));
    bodyEl.scrollTop = bodyEl.scrollHeight;
  }
  function msgEl(who, text, isLocal) { const el = h('div', { class: 'msg ' + who }); if (who === 'u') el.textContent = text; else el.innerHTML = md(text) + (isLocal ? '<span class="src">Trả lời ngoại tuyến từ nội dung sách</span>' : ''); return el; }
  function clear() { store.sdel(key()); CH.ctl && CH.ctl.abort(); SFX.play('whoosh'); refresh(); }

  async function send() {
    const q = inputEl.value.trim(); if (!q || CH.busy) return;
    inputEl.value = ''; inputEl.style.height = 'auto'; sugEl.innerHTML = '';
    const H = hist(); H.push({ role: 'user', content: q }); setHist(H);
    bodyEl.append(msgEl('u', q)); SFX.play('msg');
    const bot = h('div', { class: 'msg b', html: '<div class="typing"><i></i><i></i><i></i></div>' }); bodyEl.append(bot); bodyEl.scrollTop = bodyEl.scrollHeight;
    CH.busy = true;
    const ai = await AI.get(); const u = CH.unit;
    if (ai) {
      CH.ctl = new AbortController();
      const turns = [{ role: 'user', content: RULES(u) }, { role: 'assistant', content: 'Mình đã sẵn sàng giúp bạn học chương này.' }, ...H.slice(-12).map((m) => ({ role: m.role, content: m.content }))];
      try {
        const { text } = await ai(turns, { cache: false, signal: CH.ctl.signal, modelTier: CH.deep ? 'default' : 'quick', onText: ({ text }) => { bot.innerHTML = md(text); bodyEl.scrollTop = bodyEl.scrollHeight; } });
        bot.innerHTML = md(text); const H2 = hist(); H2.push({ role: 'assistant', content: text }); setHist(H2); SFX.play('msg');
      } catch (e) {
        const m = AI.errText(e);
        if (AI.denied || !e || e.code !== 'cancelled') {
          const ans = local(q, u); bot.innerHTML = (m ? `<p class="muted">${esc(m)}</p>` : '') + md(ans) + '<span class="src">Trả lời ngoại tuyến từ nội dung sách</span>';
          const H2 = hist(); H2.push({ role: 'assistant', content: ans, local: true }); setHist(H2);
        } else bot.innerHTML = md(e.text || '') || '<span class="muted">Đã dừng.</span>';
        if (AI.denied) refresh();
      }
    } else {
      await new Promise((r) => setTimeout(r, 450));
      const ans = local(q, u); bot.innerHTML = md(ans) + '<span class="src">Trả lời ngoại tuyến từ nội dung sách</span>';
      const H2 = hist(); H2.push({ role: 'assistant', content: ans, local: true }); setHist(H2); SFX.play('msg');
    }
    CH.busy = false; bodyEl.scrollTop = bodyEl.scrollHeight;
  }

  CH.setUnit = function (u) { const changed = CH.unit !== u; CH.unit = u || null; if (fab) fab.className = 'fab'; if (changed && panel) { panel.className = 'chat ' + (u ? 's-' + u.strand : 's-number'); refresh(); } };
  CH.ask = function (q) { if (!CH.open) toggle(true); setTimeout(() => { inputEl.value = q; send(); }, 150); };
  CH.init = build;
  CH.local = local;
})();
