/**
 * AEGIS Sound Engine
 * All sounds generated procedurally via Web Audio API. Zero external files.
 * Every play is wrapped in try/catch and respects the global mute state.
 */

let _ctx: AudioContext | null = null;
let _unavailable = false;

export function getAudioContext(): AudioContext | null {
  if (_unavailable) return null;
  if (_ctx) return _ctx;
  try {
    const Ctor =
      (window as unknown as { AudioContext: typeof AudioContext }).AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) {
      _unavailable = true;
      console.warn("AEGIS Sound: AudioContext unavailable");
      return null;
    }
    _ctx = new Ctor();
    return _ctx;
  } catch {
    _unavailable = true;
    console.warn("AEGIS Sound: AudioContext unavailable");
    return null;
  }
}

export function isAudioAvailable(): boolean {
  if (_unavailable) return false;
  if (!_ctx) return getAudioContext() !== null;
  return true;
}

// Try to resume the context after a user gesture
export async function resumeAudio(): Promise<void> {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    if (ctx.state === "suspended") await ctx.resume();
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/* Primitive helpers                                                  */
/* ------------------------------------------------------------------ */

type WaveType = OscillatorType;

function tone(opts: {
  freq: number | [number, number]; // single or [start, end] sweep
  duration: number;
  type?: WaveType;
  volume?: number;
  startAt?: number; // seconds offset from now
  attack?: number;
  release?: number;
}): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime + (opts.startAt ?? 0);
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = opts.type ?? "sine";

    if (Array.isArray(opts.freq)) {
      osc.frequency.setValueAtTime(opts.freq[0], t0);
      osc.frequency.exponentialRampToValueAtTime(
        Math.max(opts.freq[1], 0.0001),
        t0 + opts.duration,
      );
    } else {
      osc.frequency.setValueAtTime(opts.freq, t0);
    }

    const v = opts.volume ?? 0.2;
    const attack = opts.attack ?? 0.005;
    const release = opts.release ?? Math.min(0.05, opts.duration * 0.3);

    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(v, t0 + attack);
    gain.gain.setValueAtTime(v, t0 + Math.max(attack, opts.duration - release));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.duration);

    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + opts.duration + 0.02);
  } catch {
    /* noop */
  }
}

function noiseBurst(opts: { duration: number; volume?: number; startAt?: number }): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const t0 = ctx.currentTime + (opts.startAt ?? 0);
    const len = Math.floor(ctx.sampleRate * opts.duration);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    const v = opts.volume ?? 0.15;
    gain.gain.setValueAtTime(v, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + opts.duration);
    src.connect(gain).connect(ctx.destination);
    src.start(t0);
    src.stop(t0 + opts.duration + 0.02);
  } catch {
    /* noop */
  }
}

/* ------------------------------------------------------------------ */
/* Sound library                                                      */
/* ------------------------------------------------------------------ */

export type SoundName =
  | "boot"
  | "tick"
  | "critical"
  | "select"
  | "intervene"
  | "dmca_done"
  | "pdf"
  | "access"
  | "threat_low_elevated"
  | "threat_elevated_critical"
  | "threat_critical_low"
  | "hover_persona"
  | "demo_step"
  | "sidebar_toggle"
  | "globe_snap"
  | "critical_entry"
  | "resolved"
  | "elevated"
  | "feed_boot"
  | "heartbeat"
  | "card_hover"
  | "leak_data_ready"
  | "leak_file_accept"
  | "leak_matrix_tick"
  | "leak_progress_hum"
  | "leak_vault_lock"
  | "leak_field_tick"
  | "leak_unlock"
  | "leak_decode_step1"
  | "leak_decode_step2"
  | "leak_decode_step3"
  | "leak_decode_step4"
  | "leak_match_found"
  | "leak_report_reveal"
  | "leak_bar_fill"
  | "leak_bar_ping"
  | "leak_export"
  | "conv_entry_thud"
  | "conv_entry_tick"
  | "conv_entry_ready"
  | "conv_pill_tick"
  | "conv_pill_final"
  | "conv_country_in"
  | "conv_country_uk"
  | "conv_country_us"
  | "conv_country_br"
  | "conv_country_ru"
  | "conv_country_id"
  | "conv_country_tr"
  | "conv_country_pk"
  | "conv_dev_mobile"
  | "conv_dev_desktop"
  | "conv_dev_tv"
  | "conv_dev_stb"
  | "conv_beh_direct"
  | "conv_beh_search"
  | "conv_beh_referred"
  | "conv_beh_repeat"
  | "conv_content"
  | "conv_slide_night"
  | "conv_slide_morning"
  | "conv_slide_afternoon"
  | "conv_slide_evening"
  | "conv_slide_late"
  | "conv_calc_press"
  | "conv_score_low"
  | "conv_score_med"
  | "conv_score_high"
  | "conv_card_hover"
  | "conv_modal_open"
  | "conv_modal_close"
  | "conv_metric_load"
  | "conv_metric_cash"
  | "ac_entry_thud"
  | "ac_entry_ticks"
  | "ac_entry_chord"
  | "ac_tab_dmca"
  | "ac_tab_queue"
  | "ac_tab_blocklist"
  | "ac_tab_nuke"
  | "ac_tab_indicator"
  | "ac_paste"
  | "ac_dropdown"
  | "ac_gavel"
  | "ac_load_step1"
  | "ac_load_step2"
  | "ac_load_step3"
  | "ac_load_step4"
  | "ac_load_done"
  | "ac_typewriter"
  | "ac_typewriter_break"
  | "ac_status_1"
  | "ac_status_2"
  | "ac_status_3"
  | "ac_row_hover_crit"
  | "ac_row_hover_high"
  | "ac_row_hover_med"
  | "ac_btn_notice"
  | "ac_btn_blocklist"
  | "ac_btn_nuke"
  | "ac_check"
  | "ac_uncheck"
  | "ac_analyze"
  | "ac_variant_tick"
  | "ac_variant_check"
  | "ac_export"
  | "ac_signature"
  | "ac_nuke_entry"
  | "ac_nuke_check"
  | "ac_nuke_uncheck"
  | "ac_counter"
  | "ac_nuke_button"
  | "ac_chime_1"
  | "ac_chime_2"
  | "ac_chime_3"
  | "ac_chime_4"
  | "ac_chime_5"
  | "ac_modal_open"
  | "ac_accordion"
  | "ac_confirm_key"
  | "ac_confirm_done"
  | "ac_wrong"
  | "ac_approve"
  | "ac_row_ping"
  | "ac_row_ping_final"
  | "ac_shimmer";

const sounds: Record<SoundName, () => void> = {
  boot: () => {
    tone({ freq: [80, 400], duration: 0.8, type: "sine", volume: 0.25 });
    tone({ freq: 600, duration: 0.18, type: "sine", volume: 0.25, startAt: 0.8 });
  },
  tick: () => {
    tone({ freq: 880, duration: 0.06, type: "sine", volume: 0.08 });
  },
  critical: () => {
    tone({ freq: 220, duration: 0.3, type: "square", volume: 0.2 });
    tone({ freq: 220, duration: 0.3, type: "square", volume: 0.2, startAt: 0.4 });
  },
  select: () => {
    tone({ freq: 1200, duration: 0.04, type: "sine", volume: 0.15 });
  },
  intervene: () => {
    tone({ freq: 900, duration: 0.1, type: "sine", volume: 0.3, startAt: 0.0 });
    tone({ freq: 80, duration: 0.15, type: "sine", volume: 0.3, startAt: 0.3 });
    tone({ freq: [300, 900], duration: 0.15, type: "sine", volume: 0.3, startAt: 0.7 });
    tone({ freq: [400, 80], duration: 0.2, type: "sawtooth", volume: 0.3, startAt: 1.1 });
    tone({ freq: [400, 80], duration: 0.2, type: "sawtooth", volume: 0.22, startAt: 1.5 });
    tone({ freq: [400, 80], duration: 0.2, type: "sawtooth", volume: 0.18, startAt: 1.9 });
    tone({ freq: [400, 80], duration: 0.2, type: "sawtooth", volume: 0.14, startAt: 2.3 });
    tone({ freq: [400, 80], duration: 0.2, type: "sawtooth", volume: 0.1, startAt: 2.7 });
    // rapid 60Hz pulses
    for (let i = 0; i < 6; i++) {
      tone({ freq: 60, duration: 0.06, type: "square", volume: 0.18, startAt: 3.1 + i * 0.08 });
    }
    // triumph chord
    tone({ freq: 523, duration: 0.3, type: "sine", volume: 0.25, startAt: 4.2 });
    tone({ freq: 784, duration: 0.3, type: "sine", volume: 0.25, startAt: 4.2 });
    // fade out
    tone({ freq: [100, 30], duration: 0.8, type: "sine", volume: 0.15, startAt: 4.8 });
  },
  dmca_done: () => {
    tone({ freq: 523, duration: 0.2, type: "sine", volume: 0.2 });
    tone({ freq: 659, duration: 0.2, type: "sine", volume: 0.2, startAt: 0.22 });
  },
  pdf: () => {
    noiseBurst({ duration: 0.1, volume: 0.15 });
    tone({ freq: 440, duration: 0.15, type: "sine", volume: 0.15, startAt: 0.1 });
  },
  access: () => {
    tone({ freq: 400, duration: 0.12, type: "sine", volume: 0.25 });
    tone({ freq: 600, duration: 0.12, type: "sine", volume: 0.25, startAt: 0.13 });
    tone({ freq: 800, duration: 0.12, type: "sine", volume: 0.25, startAt: 0.26 });
  },
  threat_low_elevated: () => {
    tone({ freq: 500, duration: 0.15, type: "sine", volume: 0.2 });
    tone({ freq: 550, duration: 0.15, type: "sine", volume: 0.2, startAt: 0.16 });
  },
  threat_elevated_critical: () => {
    tone({ freq: [700, 300], duration: 0.5, type: "sawtooth", volume: 0.2 });
  },
  threat_critical_low: () => {
    tone({ freq: [300, 600], duration: 0.4, type: "sine", volume: 0.2 });
  },
  hover_persona: () => {
    tone({ freq: 600, duration: 0.03, type: "sine", volume: 0.05 });
  },
  demo_step: () => {
    tone({ freq: 750, duration: 0.05, type: "sine", volume: 0.1 });
  },
  sidebar_toggle: () => {
    tone({ freq: [200, 400], duration: 0.15, type: "sine", volume: 0.08 });
  },
  globe_snap: () => {
    tone({ freq: [400, 200], duration: 0.2, type: "sine", volume: 0.15 });
    tone({ freq: 300, duration: 0.1, type: "sine", volume: 0.12, startAt: 0.3 });
  },
  critical_entry: () => {
    tone({ freq: 300, duration: 0.08, type: "square", volume: 0.12 });
  },
  resolved: () => {
    tone({ freq: 523, duration: 0.15, type: "sine", volume: 0.1 });
    tone({ freq: 659, duration: 0.15, type: "sine", volume: 0.1 });
  },
  elevated: () => {
    tone({ freq: 550, duration: 0.08, type: "sine", volume: 0.08 });
  },
  feed_boot: () => {
    for (let i = 0; i < 5; i++) {
      tone({ freq: 880, duration: 0.04, type: "sine", volume: 0.05, startAt: i * 0.08 });
    }
  },
  heartbeat: () => {
    tone({ freq: 60, duration: 0.05, type: "sine", volume: 0.03 });
  },
  card_hover: () => {
    tone({ freq: 600, duration: 0.03, type: "sine", volume: 0.05 });
  },
  leak_data_ready: () => {
    noiseBurst({ duration: 0.06, volume: 0.1 });
    tone({ freq: 660, duration: 0.1, type: "sine", volume: 0.1, startAt: 0.06 });
  },
  leak_file_accept: () => {
    tone({ freq: 120, duration: 0.1, type: "sine", volume: 0.18 });
    tone({ freq: 440, duration: 0.12, type: "sine", volume: 0.18 });
    tone({ freq: 800, duration: 0.03, type: "square", volume: 0.18, startAt: 0.08 });
  },
  leak_matrix_tick: () => {
    const f = 600 + Math.random() * 300;
    tone({ freq: f, duration: 0.02, type: "sine", volume: 0.04 });
  },
  leak_progress_hum: () => {
    tone({ freq: [80, 160], duration: 2.0, type: "sine", volume: 0.08 });
    tone({ freq: 523, duration: 0.1, type: "sine", volume: 0.1, startAt: 1.0 });
  },
  leak_vault_lock: () => {
    tone({ freq: 523, duration: 0.15, type: "sine", volume: 0.22 });
    tone({ freq: 659, duration: 0.15, type: "sine", volume: 0.22, startAt: 0.15 });
    tone({ freq: 784, duration: 0.15, type: "sine", volume: 0.22, startAt: 0.3 });
    tone({ freq: 1047, duration: 0.25, type: "sine", volume: 0.22, startAt: 0.45 });
  },
  leak_field_tick: () => {
    tone({ freq: 300, duration: 0.02, type: "sine", volume: 0.03 });
  },
  leak_unlock: () => {
    tone({ freq: [200, 350], duration: 0.15, type: "sine", volume: 0.1 });
    tone({ freq: 700, duration: 0.04, type: "square", volume: 0.1, startAt: 0.15 });
  },
  leak_decode_step1: () => {
    for (let i = 0; i < 8; i++) {
      tone({ freq: 440, duration: 0.02, type: "sine", volume: 0.08, startAt: i * 0.06 });
    }
  },
  leak_decode_step2: () => {
    tone({ freq: [40, 200], duration: 0.8, type: "sawtooth", volume: 0.08 });
  },
  leak_decode_step3: () => {
    for (let i = 0; i < 12; i++) {
      const f = 600 + Math.random() * 600;
      tone({ freq: f, duration: 0.02, type: "sine", volume: 0.05, startAt: i * 0.06 });
    }
  },
  leak_decode_step4: () => {
    tone({ freq: 800, duration: 0.1, type: "sine", volume: 0.1 });
    tone({ freq: 600, duration: 0.1, type: "sine", volume: 0.1, startAt: 0.15 });
    tone({ freq: 400, duration: 0.1, type: "sine", volume: 0.1, startAt: 0.3 });
  },
  leak_match_found: () => {
    tone({ freq: 60, duration: 0.2, type: "sine", volume: 0.2, startAt: 0.1 });
    tone({ freq: [200, 600], duration: 0.4, type: "sine", volume: 0.25, startAt: 0.3 });
    noiseBurst({ duration: 0.08, volume: 0.3, startAt: 0.7 });
    tone({ freq: 440, duration: 0.5, type: "triangle", volume: 0.15, startAt: 0.8 });
  },
  leak_report_reveal: () => {
    tone({ freq: 80, duration: 0.3, type: "sine", volume: 0.1 });
    for (let i = 0; i < 10; i++) {
      tone({ freq: 300, duration: 0.02, type: "sine", volume: 0.04, startAt: 0.3 + i * 0.02 });
    }
    tone({ freq: 440, duration: 0.2, type: "sine", volume: 0.15, startAt: 0.5 });
    tone({ freq: 880, duration: 0.2, type: "sine", volume: 0.15, startAt: 0.5 });
  },
  leak_bar_fill: () => {
    tone({ freq: [100, 440], duration: 1.5, type: "sine", volume: 0.06 });
  },
  leak_bar_ping: () => {
    tone({ freq: 1200, duration: 0.06, type: "sine", volume: 0.15 });
  },
  leak_export: () => {
    tone({ freq: 100, duration: 0.1, type: "sine", volume: 0.2 });
    tone({ freq: 1000, duration: 0.04, type: "square", volume: 0.2 });
    noiseBurst({ duration: 0.2, volume: 0.1, startAt: 0.2 });
    tone({ freq: [600, 200], duration: 0.2, type: "sine", volume: 0.12, startAt: 0.4 });
    tone({ freq: 523, duration: 0.3, type: "sine", volume: 0.18, startAt: 0.6 });
    tone({ freq: 659, duration: 0.3, type: "sine", volume: 0.18, startAt: 0.6 });
  },
  conv_entry_thud: () => {
    tone({ freq: 80, duration: 0.3, type: "sine", volume: 0.1 });
  },
  conv_entry_tick: () => {
    for (let i = 0; i < 6; i++) {
      tone({ freq: 300, duration: 0.03, type: "sine", volume: 0.04, startAt: i * 0.08 });
    }
  },
  conv_entry_ready: () => {
    tone({ freq: 523, duration: 0.2, type: "sine", volume: 0.12 });
    tone({ freq: 659, duration: 0.2, type: "sine", volume: 0.12 });
  },
  conv_pill_tick: () => {
    tone({ freq: 400, duration: 0.04, type: "sine", volume: 0.06 });
  },
  conv_pill_final: () => {
    tone({ freq: 800, duration: 0.06, type: "sine", volume: 0.1 });
    tone({ freq: 1000, duration: 0.06, type: "sine", volume: 0.1, startAt: 0.05 });
  },
  conv_country_in: () => tone({ freq: 200, duration: 0.08, type: "sine", volume: 0.08 }),
  conv_country_uk: () => tone({ freq: 660, duration: 0.06, type: "sine", volume: 0.08 }),
  conv_country_us: () => tone({ freq: 523, duration: 0.06, type: "sine", volume: 0.08 }),
  conv_country_br: () => tone({ freq: 300, duration: 0.07, type: "sine", volume: 0.08 }),
  conv_country_ru: () => tone({ freq: 150, duration: 0.07, type: "sine", volume: 0.08 }),
  conv_country_id: () => tone({ freq: 250, duration: 0.07, type: "sine", volume: 0.08 }),
  conv_country_tr: () => tone({ freq: 350, duration: 0.06, type: "sine", volume: 0.08 }),
  conv_country_pk: () => tone({ freq: 180, duration: 0.07, type: "sine", volume: 0.08 }),
  conv_dev_mobile: () => tone({ freq: 900, duration: 0.04, type: "sine", volume: 0.08 }),
  conv_dev_desktop: () => tone({ freq: 600, duration: 0.04, type: "sine", volume: 0.08 }),
  conv_dev_tv: () => tone({ freq: 350, duration: 0.04, type: "sine", volume: 0.08 }),
  conv_dev_stb: () => tone({ freq: 280, duration: 0.04, type: "sine", volume: 0.08 }),
  conv_beh_direct: () => tone({ freq: 1000, duration: 0.03, type: "square", volume: 0.07 }),
  conv_beh_search: () => tone({ freq: 700, duration: 0.04, type: "sine", volume: 0.07 }),
  conv_beh_referred: () => tone({ freq: 500, duration: 0.04, type: "sine", volume: 0.07 }),
  conv_beh_repeat: () => {
    tone({ freq: 600, duration: 0.03, type: "sine", volume: 0.07 });
    tone({ freq: 600, duration: 0.03, type: "sine", volume: 0.07, startAt: 0.04 });
  },
  conv_content: () => tone({ freq: 800, duration: 0.04, type: "sine", volume: 0.08 }),
  conv_slide_night: () => tone({ freq: 200, duration: 0.04, type: "sine", volume: 0.03 }),
  conv_slide_morning: () => tone({ freq: 400, duration: 0.04, type: "sine", volume: 0.04 }),
  conv_slide_afternoon: () => tone({ freq: 500, duration: 0.04, type: "sine", volume: 0.04 }),
  conv_slide_evening: () => tone({ freq: 300, duration: 0.04, type: "sine", volume: 0.05 }),
  conv_slide_late: () => tone({ freq: 150, duration: 0.04, type: "sine", volume: 0.04 }),
  conv_calc_press: () => {
    tone({ freq: 60, duration: 0.2, type: "sine", volume: 0.25 });
    tone({ freq: [150, 500], duration: 0.4, type: "sine", volume: 0.2, startAt: 0.2 });
    tone({ freq: 1800, duration: 0.2, type: "sine", volume: 0.07, startAt: 0.6 });
  },
  conv_score_low: () => {
    tone({ freq: 523, duration: 0.3, type: "sine", volume: 0.15 });
    tone({ freq: 659, duration: 0.3, type: "sine", volume: 0.15 });
  },
  conv_score_med: () => {
    tone({ freq: 440, duration: 0.3, type: "sine", volume: 0.12 });
  },
  conv_score_high: () => {
    tone({ freq: 220, duration: 0.15, type: "square", volume: 0.18 });
    tone({ freq: 220, duration: 0.15, type: "square", volume: 0.18, startAt: 0.2 });
  },
  conv_card_hover: () => tone({ freq: 800, duration: 0.04, type: "sine", volume: 0.05 }),
  conv_modal_open: () => {
    tone({ freq: [200, 600], duration: 0.2, type: "sine", volume: 0.12 });
    tone({ freq: 800, duration: 0.04, type: "square", volume: 0.1, startAt: 0.2 });
  },
  conv_modal_close: () => {
    tone({ freq: [600, 200], duration: 0.15, type: "sine", volume: 0.08 });
  },
  conv_metric_load: () => {
    tone({ freq: 440, duration: 0.08, type: "sine", volume: 0.08 });
    tone({ freq: 880, duration: 0.08, type: "sine", volume: 0.08, startAt: 0.04 });
  },
  conv_metric_cash: () => {
    tone({ freq: 800, duration: 0.08, type: "sine", volume: 0.15 });
    tone({ freq: 1000, duration: 0.08, type: "sine", volume: 0.15, startAt: 0.04 });
    tone({ freq: 1200, duration: 0.08, type: "sine", volume: 0.15, startAt: 0.08 });
  },
  ac_entry_thud: () => tone({ freq: 100, duration: 0.3, type: "sine", volume: 0.2 }),
  ac_entry_ticks: () => {
    for (let i = 0; i < 5; i++) {
      tone({ freq: 400, duration: 0.03, type: "sine", volume: 0.05, startAt: i * 0.06 });
    }
  },
  ac_entry_chord: () => tone({ freq: 523, duration: 0.15, type: "sine", volume: 0.1 }),
  ac_tab_dmca: () => tone({ freq: 523, duration: 0.06, type: "sine", volume: 0.12 }),
  ac_tab_queue: () => tone({ freq: 440, duration: 0.06, type: "sine", volume: 0.12 }),
  ac_tab_blocklist: () => tone({ freq: 392, duration: 0.06, type: "sine", volume: 0.12 }),
  ac_tab_nuke: () => tone({ freq: 220, duration: 0.08, type: "sawtooth", volume: 0.15 }),
  ac_tab_indicator: () => tone({ freq: [300, 400], duration: 0.1, type: "sine", volume: 0.06 }),
  ac_paste: () => {
    tone({ freq: 700, duration: 0.03, type: "sine", volume: 0.1 });
    tone({ freq: 700, duration: 0.03, type: "sine", volume: 0.1, startAt: 0.05 });
  },
  ac_dropdown: () => tone({ freq: [300, 400], duration: 0.08, type: "sine", volume: 0.06 }),
  ac_gavel: () => {
    tone({ freq: 100, duration: 0.15, type: "sine", volume: 0.3 });
    tone({ freq: 1200, duration: 0.04, type: "square", volume: 0.3 });
    tone({ freq: 80, duration: 1.0, type: "sine", volume: 0.08, startAt: 0.2 });
  },
  ac_load_step1: () => {
    for (let i = 0; i < 10; i++) {
      tone({ freq: 300, duration: 0.02, type: "sine", volume: 0.05, startAt: i * 0.04 });
    }
  },
  ac_load_step2: () => {
    tone({ freq: 500, duration: 0.1, type: "sine", volume: 0.06 });
    tone({ freq: 500, duration: 0.1, type: "sine", volume: 0.04, startAt: 0.12 });
  },
  ac_load_step3: () => tone({ freq: [80, 400], duration: 0.6, type: "sawtooth", volume: 0.07 }),
  ac_load_step4: () => {
    for (let i = 0; i < 22; i++) {
      const f = 300 + Math.random() * 200;
      tone({ freq: f, duration: 0.015, type: "sine", volume: 0.05, startAt: i * 0.07 });
    }
  },
  ac_load_done: () => {
    tone({ freq: 523, duration: 0.4, type: "sine", volume: 0.2, startAt: 0.2 });
    tone({ freq: 659, duration: 0.4, type: "sine", volume: 0.2, startAt: 0.2 });
    tone({ freq: 784, duration: 0.4, type: "sine", volume: 0.2, startAt: 0.2 });
  },
  ac_typewriter: () => {
    const f = Math.random() > 0.5 ? 320 : 360;
    tone({ freq: f, duration: 0.015, type: "sine", volume: 0.03 });
  },
  ac_typewriter_break: () => tone({ freq: 200, duration: 0.04, type: "sine", volume: 0.04 }),
  ac_status_1: () => {
    tone({ freq: 400, duration: 0.15, type: "sine", volume: 0.15 });
    tone({ freq: 600, duration: 0.15, type: "sine", volume: 0.15, startAt: 0.16 });
  },
  ac_status_2: () => {
    tone({ freq: 400, duration: 0.12, type: "sine", volume: 0.15 });
    tone({ freq: 600, duration: 0.12, type: "sine", volume: 0.15, startAt: 0.13 });
    tone({ freq: 800, duration: 0.12, type: "sine", volume: 0.15, startAt: 0.26 });
  },
  ac_status_3: () => {
    tone({ freq: 400, duration: 0.1, type: "sine", volume: 0.18 });
    tone({ freq: 600, duration: 0.1, type: "sine", volume: 0.18, startAt: 0.11 });
    tone({ freq: 800, duration: 0.1, type: "sine", volume: 0.18, startAt: 0.22 });
    tone({ freq: 1000, duration: 0.3, type: "sine", volume: 0.18, startAt: 0.33 });
  },
  ac_row_hover_crit: () => tone({ freq: 220, duration: 0.03, type: "sine", volume: 0.04 }),
  ac_row_hover_high: () => tone({ freq: 330, duration: 0.03, type: "sine", volume: 0.04 }),
  ac_row_hover_med: () => tone({ freq: 440, duration: 0.03, type: "sine", volume: 0.04 }),
  ac_btn_notice: () => tone({ freq: 600, duration: 0.05, type: "sine", volume: 0.1 }),
  ac_btn_blocklist: () => tone({ freq: 800, duration: 0.04, type: "sine", volume: 0.1 }),
  ac_btn_nuke: () => tone({ freq: 80, duration: 0.1, type: "sine", volume: 0.15 }),
  ac_check: () => tone({ freq: 660, duration: 0.04, type: "sine", volume: 0.08 }),
  ac_uncheck: () => tone({ freq: 440, duration: 0.04, type: "sine", volume: 0.06 }),
  ac_analyze: () => {
    tone({ freq: 700, duration: 0.05, type: "sine", volume: 0.1 });
    tone({ freq: [80, 300], duration: 0.3, type: "sawtooth", volume: 0.08, startAt: 0.1 });
    tone({ freq: 200, duration: 0.5, type: "sine", volume: 0.05, startAt: 0.4 });
  },
  ac_variant_tick: () => tone({ freq: 500, duration: 0.04, type: "sine", volume: 0.06 }),
  ac_variant_check: () => tone({ freq: 660, duration: 0.03, type: "sine", volume: 0.08 }),
  ac_export: () => {
    tone({ freq: 100, duration: 0.15, type: "sine", volume: 0.15 });
    noiseBurst({ duration: 0.2, volume: 0.1, startAt: 0.15 });
    tone({ freq: [600, 200], duration: 0.2, type: "sine", volume: 0.12, startAt: 0.35 });
    tone({ freq: 523, duration: 0.25, type: "sine", volume: 0.15, startAt: 0.55 });
    tone({ freq: 659, duration: 0.25, type: "sine", volume: 0.15, startAt: 0.55 });
  },
  ac_signature: () => tone({ freq: 60, duration: 0.3, type: "sine", volume: 0.08 }),
  ac_nuke_entry: () => {
    tone({ freq: 60, duration: 0.5, type: "sine", volume: 0.08, attack: 0.4 });
    tone({ freq: 110, duration: 0.2, type: "square", volume: 0.12, startAt: 0.3 });
  },
  ac_nuke_check: () => {
    tone({ freq: 80, duration: 0.08, type: "sine", volume: 0.12 });
    tone({ freq: 200, duration: 0.08, type: "sine", volume: 0.12 });
  },
  ac_nuke_uncheck: () => tone({ freq: [200, 80], duration: 0.08, type: "sine", volume: 0.08 }),
  ac_counter: () => tone({ freq: 600, duration: 0.03, type: "square", volume: 0.08 }),
  ac_nuke_button: () => {
    tone({ freq: 40, duration: 0.3, type: "sine", volume: 0.3 });
    tone({ freq: 200, duration: 0.2, type: "sine", volume: 0.25, startAt: 0.1 });
    noiseBurst({ duration: 0.1, volume: 0.2, startAt: 0.2 });
    tone({ freq: [150, 600], duration: 0.5, type: "sawtooth", volume: 0.2, startAt: 0.4 });
    tone({ freq: 80, duration: 1.0, type: "sine", volume: 0.08, startAt: 0.9 });
  },
  ac_chime_1: () => tone({ freq: 392, duration: 0.15, type: "sine", volume: 0.12 }),
  ac_chime_2: () => tone({ freq: 440, duration: 0.15, type: "sine", volume: 0.12 }),
  ac_chime_3: () => tone({ freq: 494, duration: 0.15, type: "sine", volume: 0.12 }),
  ac_chime_4: () => tone({ freq: 523, duration: 0.15, type: "sine", volume: 0.12 }),
  ac_chime_5: () => tone({ freq: 659, duration: 0.15, type: "sine", volume: 0.12 }),
  ac_modal_open: () => {
    tone({ freq: 60, duration: 0.4, type: "sine", volume: 0.1 });
    tone({ freq: 880, duration: 0.1, type: "sine", volume: 0.1, startAt: 0.2 });
  },
  ac_accordion: () => tone({ freq: [200, 350], duration: 0.12, type: "sine", volume: 0.06 }),
  ac_confirm_key: () => {
    const f = Math.random() > 0.5 ? 320 : 360;
    tone({ freq: f, duration: 0.015, type: "sine", volume: 0.04 });
  },
  ac_confirm_done: () => {
    tone({ freq: 600, duration: 0.05, type: "sine", volume: 0.12 });
    tone({ freq: 700, duration: 0.05, type: "sine", volume: 0.12, startAt: 0.05 });
    tone({ freq: 800, duration: 0.05, type: "sine", volume: 0.12, startAt: 0.1 });
  },
  ac_wrong: () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    try {
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const gain = ctx.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(200, t0);
      lfo.frequency.setValueAtTime(10, t0);
      lfoGain.gain.setValueAtTime(0.15, t0);
      gain.gain.setValueAtTime(0.2, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
      lfo.connect(lfoGain).connect(gain.gain);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0); lfo.start(t0);
      osc.stop(t0 + 0.32); lfo.stop(t0 + 0.32);
    } catch { /* noop */ }
  },
  ac_approve: () => {
    // T+0.3 rumble
    tone({ freq: 30, duration: 0.6, type: "sine", volume: 0.2, startAt: 0.3, attack: 0.3 });
    // T+0.6 auth tones
    tone({ freq: 300, duration: 0.2, type: "sine", volume: 0.25, startAt: 0.6 });
    tone({ freq: 400, duration: 0.2, type: "sine", volume: 0.25, startAt: 0.9 });
    tone({ freq: 500, duration: 0.2, type: "sine", volume: 0.25, startAt: 1.2 });
    // T+1.5 sharp pulses
    tone({ freq: 220, duration: 0.15, type: "square", volume: 0.3, startAt: 1.5 });
    tone({ freq: 220, duration: 0.15, type: "square", volume: 0.3, startAt: 1.75 });
    // T+2.0 rapid ticks
    for (let i = 0; i < 20; i++) {
      tone({ freq: 600, duration: 0.02, type: "sine", volume: 0.08, startAt: 2.0 + i * 0.05 });
    }
    // T+3.0 chord
    tone({ freq: 523, duration: 0.5, type: "sine", volume: 0.25, startAt: 3.0 });
    tone({ freq: 659, duration: 0.5, type: "sine", volume: 0.25, startAt: 3.0 });
    tone({ freq: 784, duration: 0.5, type: "sine", volume: 0.25, startAt: 3.0 });
    // T+3.5 relief hum
    tone({ freq: 60, duration: 1.0, type: "sine", volume: 0.08, startAt: 3.5 });
  },
  ac_row_ping: () => tone({ freq: 500, duration: 0.06, type: "sine", volume: 0.1 }),
  ac_row_ping_final: () => tone({ freq: 600, duration: 0.08, type: "sine", volume: 0.12 }),
  ac_shimmer: () => noiseBurst({ duration: 0.1, volume: 0.08 }),
};

/* ------------------------------------------------------------------ */
/* Public play API                                                    */
/* ------------------------------------------------------------------ */

import { create } from "zustand";

interface SoundState {
  isMuted: boolean;
  available: boolean;
  lastPlayedAt: number; // for waveform animation
  setMuted: (m: boolean) => void;
  toggleMuted: () => void;
  setAvailable: (a: boolean) => void;
  markPlayed: () => void;
}

export const useSoundStore = create<SoundState>((set) => ({
  isMuted: false,
  available: true,
  lastPlayedAt: 0,
  setMuted: (m) => set({ isMuted: m }),
  toggleMuted: () => set((s) => ({ isMuted: !s.isMuted })),
  setAvailable: (a) => set({ available: a }),
  markPlayed: () => set({ lastPlayedAt: Date.now() }),
}));

export function play(name: SoundName): void {
  try {
    const state = useSoundStore.getState();
    if (state.isMuted) return;
    if (!isAudioAvailable()) {
      if (state.available) useSoundStore.getState().setAvailable(false);
      return;
    }
    void resumeAudio();
    sounds[name]();
    useSoundStore.getState().markPlayed();
  } catch {
    /* noop */
  }
}
