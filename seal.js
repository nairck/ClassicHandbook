// Sealing a shared session in a browser (or Node), byte for byte as planner/share.py's seal does, with WebCrypto
// only: an ephemeral P-256 key agreed with the creators' public key (ECDH), HKDF-SHA256 (salt 32 zero bytes, info
// "ClassicHandbook share v1" + the header) to an AES-256-GCM key, and the envelope
//   "CHS1" | key id (SHA-256 of the public key, first 4 bytes) | ephemeral public key (65) | nonce (12) | ciphertext+tag
// with the header (the first 73 bytes) authenticated. Then the proof of work and the POST, as share.send does.
// The web page loads this file as it is (an ES module); training/grind_analysis/test_share.py checks that what it
// seals opens in Python.

const enc = new TextEncoder();
const MAGIC = enc.encode("CHS1");
const INFO = enc.encode("ClassicHandbook share v1");
export const PROOF_BITS = 16;
export const MARK = "classic-handbook-share/1";   // share.MARK: the endpoint's own answers carry it

const join = (...parts) => {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
};
const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

// plain (Uint8Array: the gzipped JSON) sealed to publicKey (base64 of the uncompressed point): share.PUBLIC_KEY
export async function seal(plain, publicKey) {
  const subtle = globalThis.crypto.subtle;
  const raw = b64(publicKey);
  const kid = new Uint8Array(await subtle.digest("SHA-256", raw)).slice(0, 4);
  const peer = await subtle.importKey("raw", raw, { name: "ECDH", namedCurve: "P-256" }, false, []);
  const mine = await subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, false, ["deriveBits"]);
  const eph = new Uint8Array(await subtle.exportKey("raw", mine.publicKey));
  const head = join(MAGIC, kid, eph);
  const shared = await subtle.deriveBits({ name: "ECDH", public: peer }, mine.privateKey, 256);
  const ikm = await subtle.importKey("raw", shared, "HKDF", false, ["deriveKey"]);
  const key = await subtle.deriveKey({ name: "HKDF", hash: "SHA-256", salt: new Uint8Array(32), info: join(INFO, head) },
    ikm, { name: "AES-GCM", length: 256 }, false, ["encrypt"]);
  const nonce = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await subtle.encrypt({ name: "AES-GCM", iv: nonce, additionalData: head, tagLength: 128 }, key, plain));
  return join(head, nonce, ct);
}

// a nonce (decimal digits) whose SHA-256 over the envelope and it starts with `bits` zero bits: share.proof
export async function proof(data, bits = PROOF_BITS) {
  for (let n = 0; ; n++) {
    const d = new Uint8Array(await globalThis.crypto.subtle.digest("SHA-256", join(data, enc.encode(String(n)))));
    if ((((d[0] << 24) | (d[1] << 16) | (d[2] << 8) | d[3]) >>> 0) >>> (32 - bits) === 0) return String(n);
  }
}

// gzip in the browser (CompressionStream), as share.pack's gzip.compress
export async function gzip(text) {
  const stream = new Blob([enc.encode(text)]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

// the body as share.pack lays it out before gzip: from form 2, the readings by column, the times as tenths of a
// second since the reading before (share.unpack reverses it)
export function byColumn(body) {
  if ((body.form || 1) < 2) return body;
  const { readings, ...out } = body;
  const n = (body.columns || []).length;
  const cols = readings.length ? readings[0].map((_, i) => readings.map((r) => r[i])) : Array.from({ length: n }, () => []);
  if (cols.length && cols[0].length) {
    const tenths = cols[0].map((t) => Math.round(t * 10));
    cols[0] = tenths.map((t, i) => (i ? t - tenths[i - 1] : t));
  }
  return { ...out, by_column: cols };
}

// one shared body (share.body's form, already checked as share.check does) sealed and sent: {ok, why}, as share.send
export async function send(body, url, publicKey) {
  const form = body.form || 1;
  const data = await seal(await gzip(JSON.stringify(byColumn(body))), publicKey);
  try {
    const r = await fetch(url, { method: "POST", body: data, headers: { "Content-Type": "application/octet-stream",
      "X-CH-ID": body.user, "X-CH-Form": String(form), "X-CH-Proof": await proof(data) } });
    // only the endpoint's own answer counts (its X-CH-Endpoint mark, and a receipt naming this session), as
    // share.send: anything else on the way (a sign-in page, a proxy) is "no connection", tried again
    let got = null;
    try { got = r.headers.get("X-CH-Endpoint") === MARK ? await r.json() : null; } catch (e) { got = null; }
    if (!got || typeof got !== "object") return { ok: false, why: `no connection (HTTP ${r.status}, not the endpoint's answer)` };
    if (r.status === 409 && got.id === body.user) return { ok: true, why: "had it" };
    if (r.status === 201 && got.id === body.user) return { ok: true, why: `HTTP ${r.status}` };
    if (r.ok || r.status === 409) return { ok: false, why: `no connection (HTTP ${r.status}, not the endpoint's receipt)` };
    return { ok: false, why: `HTTP ${r.status}` + (got.error ? `: ${got.error}` : "") };
  } catch (e) {
    return { ok: false, why: `no connection (${e.name})` };
  }
}
