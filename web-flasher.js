/**
 * HyperMesh browser flasher — Web Serial + esptool-js (ESP32-S3).
 * Requires Chromium-based browser and HTTPS (or localhost).
 */

import { ESPLoader, Transport } from 'https://unpkg.com/esptool-js@0.5.7/bundle.js';

const PRESETS = [
  {
    id: 'tracker',
    label: 'Heltec Tracker V1.2',
    file: 'firmware_heltec_tracker_v1_2.bin',
  },
  {
    id: 'wireless',
    label: 'Heltec Wireless Stick V3.1',
    file: 'firmware_heltec_wireless_v3_1.bin',
  },
  {
    id: 'lora32',
    label: 'Heltec LoRa32 V3',
    file: 'firmware_heltec_wireless_v3_1.bin',
  },
];

function resolveFirmwareUrl(pathOrUrl) {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, window.location.href).href;
}

function toBinaryString(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return s;
}

function $(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el;
}

const state = {
  port: null,
  busy: false,
};

function setBusy(on) {
  state.busy = on;
  const flashBtn = $('webflasher-flash');
  const portBtn = $('webflasher-port');
  const fileInput = $('webflasher-file');
  flashBtn.disabled = on;
  portBtn.disabled = on;
  fileInput.disabled = on;
}

function log(line, cls) {
  const pre = $('webflasher-log');
  const row = document.createElement('div');
  row.textContent = line;
  if (cls) row.className = cls;
  pre.appendChild(row);
  pre.scrollTop = pre.scrollHeight;
}

function clearLog() {
  $('webflasher-log').innerHTML = '';
}

function setProgress(pct) {
  const fill = $('webflasher-progress-fill');
  const label = $('webflasher-progress-label');
  const n = Math.max(0, Math.min(100, pct));
  fill.style.width = `${n}%`;
  label.textContent = `${n}%`;
}

async function closePortIfNeeded() {
  if (!state.port) return;
  try {
    await state.port.close();
  } catch {
    /* ignore */
  }
}

function getFirmwareBytes() {
  const source = document.querySelector('input[name="webflasher-source"]:checked')?.value || 'preset';
  if (source === 'upload') {
    const file = $('webflasher-file').files?.[0];
    if (!file) throw new Error('Choose a .bin file to upload, or select a board preset.');
    if (!file.name.toLowerCase().endsWith('.bin')) {
      throw new Error('Please select a .bin firmware file.');
    }
    return file.arrayBuffer().then((buf) => toBinaryString(new Uint8Array(buf)));
  }
  const presetId = $('webflasher-preset').value;
  const preset = PRESETS.find((p) => p.id === presetId);
  if (!preset) throw new Error('Select a board / firmware preset.');
  const url = resolveFirmwareUrl(preset.file);
  log(`Downloading firmware: ${url}`);
  return fetch(url).then((r) => {
    if (!r.ok) throw new Error(`Firmware download failed (${r.status}).`);
    return r.arrayBuffer();
  }).then((buf) => toBinaryString(new Uint8Array(buf)));
}

function makeTerminal() {
  return {
    clean() {
      /* esptool-js clears loader UI; keep our step log visible */
    },
    writeLine(data) {
      log(data);
    },
    write(data) {
      log(data, 'webflasher-log--raw');
    },
  };
}

async function ensurePort() {
  if (!navigator.serial) {
    throw new Error('Web Serial is not available. Use Chrome or Edge over HTTPS (or localhost).');
  }
  if (state.port) return state.port;
  state.port = await navigator.serial.requestPort({});
  $('webflasher-port-status').textContent = 'USB serial port selected. Put the board in download mode if needed, then click Flash.';
  return state.port;
}

async function onChoosePort() {
  if (state.busy) return;
  try {
    if (state.port) {
      await closePortIfNeeded();
      state.port = null;
      $('webflasher-port-status').textContent = 'Port cleared. Choose again.';
    }
    clearLog();
    await ensurePort();
  } catch (e) {
    if (e.name === 'NotFoundError') {
      log('Port selection cancelled.');
      return;
    }
    log(String(e.message || e), 'webflasher-log--err');
  }
}

async function onFlash() {
  if (state.busy) return;
  const eraseAll = $('webflasher-erase').checked;
  clearLog();
  setProgress(0);

  setBusy(true);
  try {
    const port = await ensurePort();
    const firmwareData = await getFirmwareBytes();
    log(`Firmware image size: ${firmwareData.length} bytes (flash at 0x0, DIO, matches ESP Flash Download Tool guidance).`);

    const transport = new Transport(port, true);
    const terminal = makeTerminal();
    const espLoader = new ESPLoader({
      transport,
      baudrate: 115200,
      enableTracing: false,
      terminal,
    });

    const chip = await espLoader.main();
    log(`Connected: ${typeof chip === 'string' ? chip : JSON.stringify(chip)}`);

    setProgress(0);
    await espLoader.writeFlash({
      fileArray: [{ data: firmwareData, address: 0x0 }],
      flashSize: 'keep',
      eraseAll,
      compress: true,
      flashMode: 'dio',
      flashFreq: 'keep',
      reportProgress: (_fileIndex, written, total) => {
        setProgress(Math.round((written / total) * 100));
      },
    });

    log('Flash finished. Resetting device…');
    await transport.setRTS(true);
    await new Promise((r) => setTimeout(r, 100));
    await transport.setRTS(false);
    await transport.disconnect();
    await transport.waitForUnlock(1500);

    try {
      await port.close();
    } catch {
      /* ignore */
    }
    state.port = null;
    $('webflasher-port-status').textContent = 'Done. Unplug/replug USB if the device does not boot. You can choose the port again to flash another board.';
    setProgress(100);
    log('Complete.', 'webflasher-log--ok');
  } catch (e) {
    if (e.name === 'NotFoundError') {
      log('Port selection cancelled.');
    } else {
      log(String(e.message || e), 'webflasher-log--err');
    }
    try {
      if (state.port) await state.port.close();
    } catch {
      /* ignore */
    }
    state.port = null;
    $('webflasher-port-status').textContent = 'Select USB port again after fixing the issue above.';
  } finally {
    setBusy(false);
  }
}

function wirePresetVisibility() {
  const sourceInputs = document.querySelectorAll('input[name="webflasher-source"]');
  const presetRow = $('webflasher-preset-row');
  const fileRow = $('webflasher-file-row');
  const sync = () => {
    const v = document.querySelector('input[name="webflasher-source"]:checked')?.value;
    presetRow.hidden = v !== 'preset';
    fileRow.hidden = v !== 'upload';
  };
  sourceInputs.forEach((el) => el.addEventListener('change', sync));
  sync();
}

function fillPresets() {
  const sel = $('webflasher-preset');
  sel.innerHTML = '';
  PRESETS.forEach((p) => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.label;
    sel.appendChild(opt);
  });
}

function init() {
  fillPresets();
  if (!navigator.serial) {
    $('webflasher-banner').hidden = false;
    $('webflasher-banner').textContent =
      'Web Serial API is not available in this browser. Use Google Chrome or Microsoft Edge on desktop, over HTTPS (GitHub Pages works).';
    $('webflasher-flash').disabled = true;
    $('webflasher-port').disabled = true;
  }
  $('webflasher-port').addEventListener('click', () => void onChoosePort());
  $('webflasher-flash').addEventListener('click', () => void onFlash());
  wirePresetVisibility();
}

init();
