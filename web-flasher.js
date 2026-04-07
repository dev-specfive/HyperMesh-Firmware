/**
 * HyperMesh browser flasher — Web Serial + esptool-js (ESP32-S3).
 * Requires Chromium (Chrome/Edge) and HTTPS or localhost.
 *
 * esptool-js is vendored under vendor/ so the flasher works without a CDN
 * (corporate filters, offline mirrors, strict CSP).
 */

import { ESPLoader, Transport } from './vendor/esptool-js-0.5.7.bundle.js';

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

async function releasePort() {
  if (!state.port) return;
  try {
    await state.port.close();
  } catch {
    /* already closed or invalid */
  }
  state.port = null;
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
  return fetch(url)
    .then((r) => {
      if (!r.ok) throw new Error(`Firmware download failed (${r.status}).`);
      return r.arrayBuffer();
    })
    .then((buf) => toBinaryString(new Uint8Array(buf)));
}

function makeTerminal() {
  return {
    clean() {
      /* ESPLoader calls clean() in constructor; keep on-screen log */
    },
    writeLine(data) {
      log(data);
    },
    write(data) {
      log(data, 'webflasher-log--raw');
    },
  };
}

/**
 * Pick a new SerialPort. Must call navigator.serial.requestPort() with no prior await
 * in the same event turn, or Chromium will not open the chooser (user activation expires).
 */
async function requestNewPort() {
  if (!navigator.serial) {
    throw new Error('Web Serial is not available. Use Chrome or Edge over HTTPS (or localhost).');
  }
  const choosePromise = navigator.serial.requestPort();
  const port = await choosePromise;
  state.port = port;
  $('webflasher-port-status').textContent =
    'USB serial port selected. Put the board in download mode if needed, then click Flash.';
  return port;
}

async function ensurePort() {
  if (!navigator.serial) {
    throw new Error('Web Serial is not available. Use Chrome or Edge over HTTPS (or localhost).');
  }
  if (state.port) return state.port;
  return requestNewPort();
}

async function onChoosePort() {
  if (state.busy) return;
  if (!navigator.serial) {
    $('webflasher-port-status').textContent =
      'Web Serial is not available here. Use Google Chrome or Microsoft Edge on a desktop or laptop over HTTPS (not Safari/iPhone; mobile browsers generally cannot use USB serial).';
    log($('webflasher-port-status').textContent, 'webflasher-log--err');
    return;
  }
  try {
    clearLog();
    // Drop any previous port without awaiting before requestPort (keeps user activation valid).
    if (state.port) {
      const old = state.port;
      state.port = null;
      void old.close().catch(() => {});
      $('webflasher-port-status').textContent = 'Select your device in the browser dialog…';
    }
    await requestNewPort();
    log('Serial port granted. You can click Flash when ready.');
  } catch (e) {
    if (e && e.name === 'NotFoundError') {
      log('Port selection cancelled.');
      $('webflasher-port-status').textContent = 'Selection cancelled. Tap Choose USB serial port to try again.';
      return;
    }
    log(String((e && e.message) || e), 'webflasher-log--err');
    $('webflasher-port-status').textContent = 'Could not open the port chooser. See log above.';
  }
}

async function safeTransportDisconnect(transport) {
  if (!transport) return;
  try {
    await transport.disconnect();
  } catch {
    /* ignore */
  }
}

async function onFlash() {
  if (state.busy) return;
  const eraseAll = $('webflasher-erase').checked;
  clearLog();
  setProgress(0);

  let transport = null;
  setBusy(true);
  try {
    const port = await ensurePort();
    const firmwareData = await getFirmwareBytes();
    log(`Firmware image size: ${firmwareData.length} bytes (flash at 0x0, DIO).`);

    transport = new Transport(port, false);
    const espLoader = new ESPLoader({
      transport,
      baudrate: 115200,
      romBaudrate: 115200,
      enableTracing: false,
      terminal: makeTerminal(),
    });

    const chipDescription = await espLoader.main();
    log(`Connected: ${chipDescription}`);

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
    await safeTransportDisconnect(transport);
    transport = null;

    await releasePort();
    $('webflasher-port-status').textContent =
      'Done. Unplug/replug USB if the device does not boot. Choose the port again to flash another board.';
    setProgress(100);
    log('Complete.', 'webflasher-log--ok');
  } catch (e) {
    if (e.name === 'NotFoundError') {
      log('Port selection cancelled.');
    } else {
      log(String(e.message || e), 'webflasher-log--err');
    }
    await safeTransportDisconnect(transport);
    await releasePort();
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
      'Web Serial API is not available in this browser. Use Google Chrome or Microsoft Edge on a desktop or laptop with HTTPS or localhost (GitHub Pages is fine). Phone/tablet browsers cannot use this USB flasher.';
    $('webflasher-flash').disabled = true;
    $('webflasher-port').disabled = true;
    $('webflasher-port-status').textContent =
      'Buttons disabled: this environment has no Web Serial. Open the same page in Chrome or Edge on a computer.';
  }
  const portBtn = $('webflasher-port');
  const flashBtn = $('webflasher-flash');
  portBtn.addEventListener('click', () => void onChoosePort());
  flashBtn.addEventListener('click', () => void onFlash());
  wirePresetVisibility();
  window.__hypermeshWebFlasherInit = true;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
