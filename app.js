// ==================== DEFAULT MASTER DATA PT KENCANA AGRI ====================
const DEFAULT_MASTER = {
  orgs: {
    "PT Kencana Agri (Plasma BSP)": {
      "Plasma BSP - AFD 1": [
        { kode: "A-01", luas: 25.0 },
        { kode: "A-02", luas: 28.5 }
      ],
      "Plasma BSP - AFD 4": [
        { kode: "D01/2023", luas: 24.5 },
        { kode: "D02/2023", luas: 26.0 },
        { kode: "D03/2022", luas: 28.0 },
        { kode: "D04/2022", luas: 25.4 }
      ]
    },
    "PT Kencana Agri (Plasma MSM)": {
      "Plasma MSM - AFD 1": [
        { kode: "M-01", luas: 25.0 },
        { kode: "M-02", luas: 27.5 }
      ],
      "Plasma MSM - AFD 2": [
        { kode: "N-01", luas: 24.0 },
        { kode: "N-02", luas: 26.5 }
      ]
    }
  },
  units: ["Ha", "Pokok", "Kg", "Liter", "Meter", "Janjang", "Titik"],
  jobs: [
    { nama: "Chemis Piringan & Pasar Pikul", unit: "Ha" },
    { nama: "Chemis Gawangan / Anak Kayu", unit: "Ha" },
    { nama: "Pemupukan Manual (Manuring)", unit: "Kg" },
    { nama: "Pemupukan Pokok", unit: "Pokok" },
    { nama: "Tebas / Babat Gawangan", unit: "Ha" },
    { nama: "Pruning / Tunas Pokok", unit: "Pokok" },
    { nama: "Kastrasi & Sanitasi", unit: "Pokok" },
    { nama: "Perawatan Parit / Drainase", unit: "Meter" }
  ],
  materials: [
    { nama: "Glyphosate (Roundup / Glifosat)", jenis: "Racun", unit: "Liter" },
    { nama: "Metsulfuron Methyl (Ally)", jenis: "Racun", unit: "Gram" },
    { nama: "Paraquat (Gramoxone)", jenis: "Racun", unit: "Liter" },
    { nama: "Fluroxypyr (Starane)", jenis: "Racun", unit: "Liter" },
    { nama: "NPK 15-15-6-4 / 13-6-27", jenis: "Pupuk", unit: "Kg" },
    { nama: "Urea", jenis: "Pupuk", unit: "Kg" },
    { nama: "KCl / MOP", jenis: "Pupuk", unit: "Kg" },
    { nama: "RP (Rock Phosphate)", jenis: "Pupuk", unit: "Kg" },
    { nama: "Dolomit", jenis: "Pupuk", unit: "Kg" },
    { nama: "Borate (HGFB)", jenis: "Pupuk", unit: "Kg" }
  ],
  asistens: ["Sukri"],
  mandors: ["Meti", "Pak Ramin", "Pak Budi", "Bang Candra", "Bang Edi"]
};

// ==================== STATE ====================
let masterData = JSON.parse(localStorage.getItem("kencana_master_v3")) || structuredClone(DEFAULT_MASTER);
let records = JSON.parse(localStorage.getItem("kencana_records_v3")) || [];
let sheetConfig = JSON.parse(localStorage.getItem("kencana_gsheet_cfg_v3")) || { url: "", autoSync: false };

// ==================== SPLASH SCREEN & SUARA WANITA SEMANGAT ====================
function playKencanaVoice() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (AudioCtx) {
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.11);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + i * 0.11);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.11 + 0.45);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.11);
        osc.stop(ctx.currentTime + i * 0.11 + 0.45);
      });
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance("Kencana, Pasti Bisa!");
      utter.lang = "id-ID";
      utter.pitch = 1.25;
      utter.rate = 1.05;
      utter.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const femaleIdVoice = voices.find(v =>
        v.lang.toLowerCase().includes("id") &&
        (v.name.toLowerCase().includes("female") ||
         v.name.toLowerCase().includes("gadis") ||
         v.name.toLowerCase().includes("damayanti") ||
         v.name.toLowerCase().includes("google"))
      ) || voices.find(v => v.lang.toLowerCase().includes("id"));

      if (femaleIdVoice) utter.voice = femaleIdVoice;
      window.speechSynthesis.speak(utter);
    }
  } catch (e) {
    console.warn("Audio tidak didukung:", e);
  }
}

function enterApp(withSound) {
  const splash = document.getElementById("splashScreen");
  if (withSound) {
    document.getElementById("voiceStatusPill").classList.remove("hidden");
    document.getElementById("voiceStatusPill").classList.add("inline-flex");
    playKencanaVoice();
    setTimeout(() => {
      splash.classList.add("opacity-0", "pointer-events-none");
      setTimeout(() => splash.remove(), 650);
    }, 1700);
  } else {
    splash.classList.add("opacity-0", "pointer-events-none");
    setTimeout(() => splash.remove(), 400);
  }
}

if ("speechSynthesis" in window) {
  window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
}

// ==================== INIT ====================
document.addEventListener("DOMContentLoaded", () => {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const thisMonth = today.substring(0, 7);

  document.getElementById("inpTanggal").value = today;
  document.getElementById("fltTanggal").value = today;
  document.getElementById("fltBulan").value = thisMonth;

  document.getElementById("gsheetWebhookUrl").value = sheetConfig.url || "";
  document.getElementById("autoSyncCheck").checked = !!sheetConfig.autoSync;

  refreshAllDropdowns();
  renderMasterUI();
  renderRecentFeed();
  renderRekapAll();
  updateDashboardKPI();
});

function saveStorage() {
  localStorage.setItem("kencana_master_v3", JSON.stringify(masterData));
  localStorage.setItem("kencana_records_v3", JSON.stringify(records));
}

function showToast(msg, icon = "✅") {
  const t = document.getElementById("toast");
  document.getElementById("toastMsg").textContent = msg;
  document.getElementById("toastIcon").textContent = icon;
  t.classList.remove("translate-y-24", "opacity-0");
  setTimeout(() => t.classList.add("translate-y-24", "opacity-0"), 3000);
}

function switchTab(name) {
  ["input", "rekap", "master"].forEach(t => {
    document.getElementById(`tab-${t}`).classList.add("hidden");
    document.getElementById(`tabBtn-${t}`).classList.remove("nav-pill-active");
  });
  document.getElementById(`tab-${name}`).classList.remove("hidden");
  document.getElementById(`tabBtn-${name}`).classList.add("nav-pill-active");

  if (name === "rekap") renderRekapAll();
  if (name === "master") renderMasterUI();
}

// ==================== DROPDOWN POPULATION ====================
function refreshAllDropdowns() {
  const ptNames = Object.keys(masterData.orgs);
  const inpPT = document.getElementById("inpPT");
  const mstPt = document.getElementById("mstSelectPtForAfd");
  const prevPT = inpPT.value;

  inpPT.innerHTML = `<option value="">-- Pilih PT --</option>`;
  mstPt.innerHTML = "";
  ptNames.forEach(pt => {
    inpPT.innerHTML += `<option value="${pt}">${pt}</option>`;
    mstPt.innerHTML += `<option value="${pt}">${pt}</option>`;
  });
  inpPT.value = ptNames.includes(prevPT) ? prevPT : (ptNames[0] || "");
  onPTChange();

  const fltAfd = document.getElementById("fltAfdeling");
  const mstAfd = document.getElementById("mstSelectAfdForBlok");
  fltAfd.innerHTML = `<option value="">Semua Afdeling</option>`;
  mstAfd.innerHTML = "";
  Object.entries(masterData.orgs).forEach(([pt, afds]) => {
    Object.keys(afds).forEach(afd => {
      fltAfd.innerHTML += `<option value="${afd}">${afd}</option>`;
      mstAfd.innerHTML += `<option value="${pt}|||${afd}">${pt} — ${afd}</option>`;
    });
  });

  const inpAsisten = document.getElementById("inpAsisten");
  const inpMandor = document.getElementById("inpMandor");
  inpAsisten.innerHTML = `<option value="">-- Pilih Asisten --</option>` +
    masterData.asistens.map(a => `<option value="${a}">${a}</option>`).join("");
  if (masterData.asistens.length) inpAsisten.value = masterData.asistens[0];

  inpMandor.innerHTML = `<option value="">-- Pilih Mandor --</option>` +
    masterData.mandors.map(m => `<option value="${m}">${m}</option>`).join("");

  const inpJob = document.getElementById("inpPekerjaan");
  const fltJob = document.getElementById("fltPekerjaan");
  inpJob.innerHTML = `<option value="">-- Pilih Jenis Pekerjaan --</option>` +
    masterData.jobs.map(j => `<option value="${j.nama}" data-unit="${j.unit}">${j.nama} (${j.unit})</option>`).join("");
  fltJob.innerHTML = `<option value="">Semua Pekerjaan</option>` +
    masterData.jobs.map(j => `<option value="${j.nama}">${j.nama}</option>`).join("");

  const inpUnit = document.getElementById("inpSatuan");
  const mstUnit = document.getElementById("newJobUnit");
  inpUnit.innerHTML = masterData.units.map(u => `<option value="${u}">${u}</option>`).join("");
  mstUnit.innerHTML = masterData.units.map(u => `<option value="${u}">${u}</option>`).join("");

  const matOptions = `<option value="">-- Tidak Pakai Material --</option>` +
    masterData.materials.map((m, idx) => `<option value="${idx}" data-nama="${m.nama}" data-jenis="${m.jenis}" data-unit="${m.unit}">[${m.jenis}] ${m.nama}</option>`).join("");
  document.getElementById("inpMat1").innerHTML = matOptions;
  document.getElementById("inpMat2").innerHTML = matOptions;
}

function onPTChange() {
  const pt = document.getElementById("inpPT").value;
  const afdSel = document.getElementById("inpAfdeling");
  const afds = masterData.orgs[pt] ? Object.keys(masterData.orgs[pt]) : [];

  afdSel.innerHTML = `<option value="">-- Pilih Afdeling --</option>` +
    afds.map(a => `<option value="${a}">${a}</option>`).join("");
  if (afds.length) afdSel.value = afds[0];

  document.getElementById("hdrPtBadge").textContent = pt || "PT KENCANA AGRI";
  onAfdelingChange();
}

function onAfdelingChange() {
  const pt = document.getElementById("inpPT").value;
  const afd = document.getElementById("inpAfdeling").value;
  const blokSel = document.getElementById("inpBlok");
  document.getElementById("infoLuasBlok").textContent = "";
  document.getElementById("hdrAfdBadge").textContent = afd || "Wanggarasi";

  const bloks = (masterData.orgs[pt] && masterData.orgs[pt][afd]) ? masterData.orgs[pt][afd] : [];
  blokSel.innerHTML = `<option value="">-- Pilih Blok (${bloks.length}) --</option>` +
    bloks.map(b => `<option value="${b.kode}" data-luas="${b.luas}">Blok ${b.kode} (${b.luas} Ha)</option>`).join("");
}

function onBlokChange() {
  const sel = document.getElementById("inpBlok");
  const luas = sel.options[sel.selectedIndex]?.getAttribute("data-luas");
  document.getElementById("infoLuasBlok").textContent = luas ? `• ${luas} Ha` : "";
}

function onPekerjaanChange() {
  const sel = document.getElementById("inpPekerjaan");
  const unit = sel.options[sel.selectedIndex]?.getAttribute("data-unit");
  if (unit && masterData.units.includes(unit)) {
    document.getElementById("inpSatuan").value = unit;
  }
}

function onMaterialSelect(slot) {
  const sel = document.getElementById(`inpMat${slot}`);
  const unitInput = document.getElementById(`inpMat${slot}Unit`);
  const qtyInput = document.getElementById(`inpMat${slot}Qty`);
  const opt = sel.options[sel.selectedIndex];

  if (!sel.value) {
    unitInput.value = "-";
    qtyInput.value = "";
  } else {
    unitInput.value = opt.getAttribute("data-unit") || "";
  }
}

// ==================== CRUD REALISASI ====================
function handleFormSubmit(e) {
  e.preventDefault();
  const editId = document.getElementById("editId").value;

  const mat1Idx = document.getElementById("inpMat1").value;
  const mat1Obj = mat1Idx !== "" ? masterData.materials[Number(mat1Idx)] : null;
  const mat1Qty = parseFloat(document.getElementById("inpMat1Qty").value) || 0;

  const mat2Idx = document.getElementById("inpMat2").value;
  const mat2Obj = mat2Idx !== "" ? masterData.materials[Number(mat2Idx)] : null;
  const mat2Qty = parseFloat(document.getElementById("inpMat2Qty").value) || 0;

  const rec = {
    id: editId || "KC-" + Date.now().toString().slice(-6),
    tanggal: document.getElementById("inpTanggal").value,
    pt: document.getElementById("inpPT").value,
    afdeling: document.getElementById("inpAfdeling").value,
    blok: document.getElementById("inpBlok").value,
    asisten: document.getElementById("inpAsisten").value,
    mandor: document.getElementById("inpMandor").value,
    pekerjaan: document.getElementById("inpPekerjaan").value,
    satuan: document.getElementById("inpSatuan").value,
    hasil: parseFloat(document.getElementById("inpHasil").value) || 0,
    hk: parseFloat(document.getElementById("inpHK").value) || 0,
    mat1Nama: mat1Obj ? mat1Obj.nama : "-",
    mat1Jenis: mat1Obj ? mat1Obj.jenis : "-",
    mat1Qty: mat1Obj ? mat1Qty : 0,
    mat1Unit: mat1Obj ? mat1Obj.unit : "-",
    mat2Nama: mat2Obj ? mat2Obj.nama : "-",
    mat2Jenis: mat2Obj ? mat2Obj.jenis : "-",
    mat2Qty: mat2Obj ? mat2Qty : 0,
    mat2Unit: mat2Obj ? mat2Obj.unit : "-",
    keterangan: document.getElementById("inpKeterangan").value.trim() || "-"
  };

  if (editId) {
    const idx = records.findIndex(r => r.id === editId);
    if (idx !== -1) records[idx] = rec;
    showToast("Data realisasi diperbarui!");
  } else {
    records.unshift(rec);
    showToast("Realisasi tersimpan!");
    if (sheetConfig.autoSync && sheetConfig.url) {
      postRecordToWebhook(rec);
    }
  }

  saveStorage();
  resetForm(true);
  renderRecentFeed();
  renderRekapAll();
  updateDashboardKPI();
}

function resetForm(keepHeader = false) {
  document.getElementById("editId").value = "";
  document.getElementById("btnSubmitForm").innerHTML = `<span>✓ Simpan Realisasi</span>`;
  document.getElementById("btnCancelEdit").classList.add("hidden");

  if (!keepHeader) {
    document.getElementById("realisasiForm").reset();
    document.getElementById("inpTanggal").value = new Date().toISOString().split("T")[0];
    onPTChange();
  } else {
    document.getElementById("inpHasil").value = "";
    document.getElementById("inpHK").value = "";
    document.getElementById("inpMat1").value = "";
    document.getElementById("inpMat1Qty").value = "";
    document.getElementById("inpMat1Unit").value = "-";
    document.getElementById("inpMat2").value = "";
    document.getElementById("inpMat2Qty").value = "";
    document.getElementById("inpMat2Unit").value = "-";
    document.getElementById("inpKeterangan").value = "";
  }
}

function editRecord(id) {
  const r = records.find(item => item.id === id);
  if (!r) return;

  switchTab("input");
  document.getElementById("editId").value = r.id;
  document.getElementById("inpTanggal").value = r.tanggal;
  document.getElementById("inpPT").value = r.pt;
  onPTChange();
  document.getElementById("inpAfdeling").value = r.afdeling;
  onAfdelingChange();
  document.getElementById("inpBlok").value = r.blok;
  onBlokChange();
  document.getElementById("inpAsisten").value = r.asisten;
  document.getElementById("inpMandor").value = r.mandor;
  document.getElementById("inpPekerjaan").value = r.pekerjaan;
  document.getElementById("inpSatuan").value = r.satuan;
  document.getElementById("inpHasil").value = r.hasil;
  document.getElementById("inpHK").value = r.hk;

  const m1Idx = masterData.materials.findIndex(m => m.nama === r.mat1Nama);
  document.getElementById("inpMat1").value = m1Idx !== -1 ? String(m1Idx) : "";
  onMaterialSelect(1);
  if (m1Idx !== -1) document.getElementById("inpMat1Qty").value = r.mat1Qty;

  const m2Idx = masterData.materials.findIndex(m => m.nama === r.mat2Nama);
  document.getElementById("inpMat2").value = m2Idx !== -1 ? String(m2Idx) : "";
  onMaterialSelect(2);
  if (m2Idx !== -1) document.getElementById("inpMat2Qty").value = r.mat2Qty;

  document.getElementById("inpKeterangan").value = r.keterangan === "-" ? "" : r.keterangan;
  document.getElementById("btnSubmitForm").innerHTML = `<span>💾 Update Perubahan</span>`;
  document.getElementById("btnCancelEdit").classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function deleteRecord(id) {
  if (!confirm("Hapus catatan realisasi ini?")) return;
  records = records.filter(r => r.id !== id);
  saveStorage();
  renderRecentFeed();
  renderRekapAll();
  updateDashboardKPI();
  showToast("Data dihapus", "🗑️");
}

// ==================== KPI & RECENT FEED ====================
function updateDashboardKPI() {
  const selDate = document.getElementById("inpTanggal").value;
  const selMonth = selDate ? selDate.substring(0, 7) : "";

  const dayList = records.filter(r => r.tanggal === selDate);
  const monthList = records.filter(r => r.tanggal && r.tanggal.startsWith(selMonth));
  const totalHK = dayList.reduce((acc, r) => acc + Number(r.hk || 0), 0);

  document.getElementById("kpiTanggalCount").textContent = `${dayList.length} Item`;
  document.getElementById("kpiTotalHK").textContent = `${totalHK.toLocaleString("id-ID")} HK`;
  document.getElementById("kpiBulanCount").textContent = `${monthList.length} Data`;
  document.getElementById("badgeCount").textContent = records.length;

  const cloudEl = document.getElementById("kpiCloudStatus");
  if (sheetConfig.url) {
    cloudEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-[#056839] animate-pulse"></span> Terhubung Google Sheet`;
    cloudEl.className = "text-xs font-bold text-[#056839] mt-2 flex items-center gap-1.5";
  } else {
    cloudEl.innerHTML = `<span class="w-2 h-2 rounded-full bg-amber-400"></span> Lokal (Belum Set URL)`;
    cloudEl.className = "text-xs font-bold text-slate-500 mt-2 flex items-center gap-1.5";
  }
}

function formatMatBadge(r) {
  let parts = [];
  if (r.mat1Nama && r.mat1Nama !== "-") parts.push(`${r.mat1Nama} (${r.mat1Qty} ${r.mat1Unit})`);
  if (r.mat2Nama && r.mat2Nama !== "-") parts.push(`${r.mat2Nama} (${r.mat2Qty} ${r.mat2Unit})`);
  return parts.length ? parts.join(" + ") : "Tanpa material";
}

function renderRecentFeed() {
  const box = document.getElementById("recentFeedList");
  if (!records.length) {
    box.innerHTML = `<div class="text-center py-12 text-slate-400 text-xs">Belum ada realisasi yang diinput hari ini.</div>`;
    return;
  }

  box.innerHTML = records.slice(0, 8).map(r => `
    <div class="p-3.5 rounded-2xl border border-slate-200/80 bg-[#FAFDFB] hover:border-[#056839]/40 transition flex items-start justify-between gap-2">
      <div class="space-y-1">
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="px-2 py-0.5 rounded-md bg-[#056839] text-white text-[10px] font-bold">${r.afdeling}</span>
          <span class="px-2 py-0.5 rounded-md bg-[#FFF200] text-[#056839] text-[10px] font-extrabold">Blok ${r.blok}</span>
          <span class="text-[11px] text-slate-400 font-medium">${r.tanggal}</span>
        </div>
        <p class="text-xs font-extrabold text-slate-800">${r.pekerjaan}</p>
        <p class="text-xs font-bold text-[#056839]">
          ${Number(r.hasil).toLocaleString("id-ID")} ${r.satuan} • ${r.hk} HK
        </p>
        <p class="text-[11px] text-slate-500">🧪 ${formatMatBadge(r)} • Mandor: ${r.mandor}</p>
      </div>
      <button onclick="editRecord('${r.id}')" class="text-xs px-2 py-1 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer">✏️</button>
    </div>
  `).join("");
}

// ==================== REKAP HARIAN & BULANAN ====================
function onFilterModeChange() {
  const mode = document.getElementById("fltMode").value;
  document.getElementById("wrapFltTanggal").classList.toggle("hidden", mode !== "harian");
  document.getElementById("wrapFltBulan").classList.toggle("hidden", mode !== "bulanan");
  renderRekapAll();
}

function getFilteredRecords() {
  const mode = document.getElementById("fltMode").value;
  const fTgl = document.getElementById("fltTanggal").value;
  const fBln = document.getElementById("fltBulan").value;
  const fAfd = document.getElementById("fltAfdeling").value;
  const fJob = document.getElementById("fltPekerjaan").value;

  return records.filter(r => {
    if (mode === "harian" && fTgl && r.tanggal !== fTgl) return false;
    if (mode === "bulanan" && fBln && (!r.tanggal || !r.tanggal.startsWith(fBln))) return false;
    if (fAfd && r.afdeling !== fAfd) return false;
    if (fJob && r.pekerjaan !== fJob) return false;
    return true;
  });
}

function resetFilters() {
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("fltMode").value = "harian";
  document.getElementById("fltTanggal").value = today;
  document.getElementById("fltBulan").value = today.substring(0, 7);
  document.getElementById("fltAfdeling").value = "";
  document.getElementById("fltPekerjaan").value = "";
  onFilterModeChange();
}

function renderRekapAll() {
  const mode = document.getElementById("fltMode").value;
  const label = mode === "harian"
    ? `Harian (${document.getElementById("fltTanggal").value || "-"})`
    : (mode === "bulanan" ? `Bulanan (${document.getElementById("fltBulan").value || "-"})` : "Semua Periode");

  document.getElementById("lblPeriodeBadge1").textContent = label;
  document.getElementById("lblPeriodeBadge2").textContent = label;

  const list = getFilteredRecords();
  document.getElementById("tblRowCount").textContent = `${list.length} Baris`;

  const jobMap = {};
  list.forEach(r => {
    const key = `${r.pekerjaan}|||${r.satuan}`;
    if (!jobMap[key]) jobMap[key] = { pekerjaan: r.pekerjaan, satuan: r.satuan, hasil: 0, hk: 0 };
    jobMap[key].hasil += Number(r.hasil || 0);
    jobMap[key].hk += Number(r.hk || 0);
  });

  const jobRows = Object.values(jobMap);
  document.getElementById("rekapPekerjaanBody").innerHTML = jobRows.length
    ? jobRows.map(j => `
        <tr>
          <td class="py-2.5 px-4 font-bold text-slate-800">${j.pekerjaan}</td>
          <td class="py-2.5 px-4 text-right font-extrabold text-[#056839]">${j.hasil.toLocaleString("id-ID")}</td>
          <td class="py-2.5 px-4 font-bold text-[#A6891B]">${j.satuan}</td>
          <td class="py-2.5 px-4 text-right font-bold">${j.hk.toLocaleString("id-ID")}</td>
          <td class="py-2.5 px-4 text-right text-slate-500">${j.hk > 0 ? (j.hasil / j.hk).toFixed(2) : "0.00"}</td>
        </tr>`).join("")
    : `<tr><td colspan="5" class="py-6 text-center text-slate-400">Tidak ada data pada periode ini</td></tr>`;

  const matMap = {};
  list.forEach(r => {
    [
      { nama: r.mat1Nama, jenis: r.mat1Jenis, qty: Number(r.mat1Qty || 0), unit: r.mat1Unit },
      { nama: r.mat2Nama, jenis: r.mat2Jenis, qty: Number(r.mat2Qty || 0), unit: r.mat2Unit }
    ].forEach(m => {
      if (m.nama && m.nama !== "-" && m.qty > 0) {
        const key = `${m.nama}|||${m.unit}`;
        if (!matMap[key]) matMap[key] = { nama: m.nama, jenis: m.jenis, qty: 0, unit: m.unit };
        matMap[key].qty += m.qty;
      }
    });
  });

  const matRows = Object.values(matMap);
  document.getElementById("rekapMaterialBody").innerHTML = matRows.length
    ? matRows.map(m => `
        <tr>
          <td class="py-2.5 px-4 font-bold text-slate-800">${m.nama}</td>
          <td class="py-2.5 px-4">
            <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${m.jenis === 'Pupuk' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${m.jenis}</span>
          </td>
          <td class="py-2.5 px-4 text-right font-extrabold text-[#056839]">${m.qty.toLocaleString("id-ID")}</td>
          <td class="py-2.5 px-4 font-bold text-slate-600">${m.unit}</td>
        </tr>`).join("")
    : `<tr><td colspan="4" class="py-6 text-center text-slate-400">Belum ada pemakaian material</td></tr>`;

  const tbody = document.getElementById("sheetTableBody");
  const tfoot = document.getElementById("sheetTableFoot");
  if (!list.length) {
    tbody.innerHTML = `<tr><td colspan="9" class="py-8 text-center text-slate-400">Belum ada data realisasi.</td></tr>`;
    tfoot.innerHTML = "";
    return;
  }

  let totalHK = 0;
  tbody.innerHTML = list.map(r => {
    totalHK += Number(r.hk || 0);
    return `
      <tr class="hover:bg-[#F6F9F7]">
        <td class="py-2.5 px-3.5 whitespace-nowrap font-medium">${r.tanggal}</td>
        <td class="py-2.5 px-3.5">
          <div class="font-bold text-[#056839]">${r.afdeling}</div>
          <div class="text-[10px] text-slate-400">${r.pt}</div>
        </td>
        <td class="py-2.5 px-3.5 font-extrabold">${r.blok}</td>
        <td class="py-2.5 px-3.5 font-semibold">${r.pekerjaan}</td>
        <td class="py-2.5 px-3.5 text-right font-extrabold text-[#056839]">${Number(r.hasil).toLocaleString("id-ID")} ${r.satuan}</td>
        <td class="py-2.5 px-3.5 text-right font-bold">${r.hk}</td>
        <td class="py-2.5 px-3.5 text-[11px] text-slate-600">${formatMatBadge(r)}</td>
        <td class="py-2.5 px-3.5 text-[11px]">
          <div class="font-bold text-slate-700">${r.mandor}</div>
          <div class="text-slate-400">Ast: ${r.asisten}</div>
        </td>
        <td class="py-2.5 px-3.5 text-center whitespace-nowrap">
          <button onclick="editRecord('${r.id}')" class="text-[#056839] font-bold mr-2 hover:underline cursor-pointer">Edit</button>
          <button onclick="deleteRecord('${r.id}')" class="text-red-500 font-bold hover:underline cursor-pointer">Hapus</button>
        </td>
      </tr>`;
  }).join("");

  tfoot.innerHTML = `
    <tr>
      <td colspan="5" class="py-3 px-3.5 text-right uppercase text-xs">Total Tenaga Kerja (HK):</td>
      <td class="py-3 px-3.5 text-right text-sm">${totalHK.toLocaleString("id-ID")} HK</td>
      <td colspan="3"></td>
    </tr>`;
}

// ==================== MASTER DATABASE CRUD ====================
function renderMasterUI() {
  refreshAllDropdowns();

  const orgBox = document.getElementById("masterOrgList");
  orgBox.innerHTML = Object.entries(masterData.orgs).map(([pt, afds]) => `
    <div class="p-3 rounded-2xl border border-slate-200 bg-slate-50/70 space-y-2">
      <div class="flex items-center justify-between">
        <span class="text-xs font-extrabold text-[#056839]">${pt}</span>
        <button onclick="deletePT('${pt}')" class="text-[10px] text-red-500 font-bold cursor-pointer">Hapus PT</button>
      </div>
      ${Object.entries(afds).map(([afd, bloks]) => `
        <div class="pl-2.5 border-l-2 border-[#A6891B] space-y-1">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-slate-700">${afd}</span>
            <button onclick="deleteAfdeling('${pt}','${afd}')" class="text-[10px] text-red-400 cursor-pointer">× Afd</button>
          </div>
          <div class="flex flex-wrap gap-1">
            ${bloks.map((b, i) => `
              <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-semibold">
                ${b.kode} (${b.luas}Ha)
                <button onclick="deleteBlok('${pt}','${afd}',${i})" class="text-red-500 font-bold cursor-pointer">×</button>
              </span>
            `).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `).join("");

  document.getElementById("masterUnitList").innerHTML = masterData.units.map((u, i) => `
    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F4F8F5] border border-[#056839]/20 text-[#056839] text-[11px] font-bold">
      ${u} <button onclick="deleteUnit(${i})" class="text-red-500 cursor-pointer">×</button>
    </span>
  `).join("");

  document.getElementById("masterJobList").innerHTML = masterData.jobs.map((j, i) => `
    <div class="py-2 flex items-center justify-between text-xs">
      <div>
        <span class="font-bold text-slate-800">${j.nama}</span>
        <span class="ml-1.5 px-1.5 py-0.5 rounded bg-[#FFF200]/60 text-[#056839] text-[10px] font-extrabold">${j.unit}</span>
      </div>
      <button onclick="deleteJob(${i})" class="text-red-500 text-[11px] font-bold cursor-pointer">Hapus</button>
    </div>
  `).join("");

  document.getElementById("masterMaterialList").innerHTML = masterData.materials.map((m, i) => `
    <div class="py-2 flex items-center justify-between text-xs">
      <div>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold mr-1 ${m.jenis === 'Pupuk' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}">${m.jenis}</span>
        <span class="font-bold text-slate-800">${m.nama}</span>
        <span class="text-slate-400 text-[11px]">(${m.unit})</span>
      </div>
      <button onclick="deleteMaterial(${i})" class="text-red-500 text-[11px] font-bold cursor-pointer">Hapus</button>
    </div>
  `).join("");

  document.getElementById("masterAsistenList").innerHTML = masterData.asistens.map((a, i) => `
    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FFFDF2] border border-[#A6891B]/30 text-[#A6891B] text-[11px] font-bold">
      ${a} <button onclick="deletePerson('asisten', ${i})" class="text-red-500 cursor-pointer">×</button>
    </span>
  `).join("");

  document.getElementById("masterMandorList").innerHTML = masterData.mandors.map((m, i) => `
    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#F4F8F5] border border-[#056839]/20 text-[#056839] text-[11px] font-bold">
      ${m} <button onclick="deletePerson('mandor', ${i})" class="text-red-500 cursor-pointer">×</button>
    </span>
  `).join("");
}

function addPT() {
  const name = document.getElementById("newPtName").value.trim();
  if (!name) return;
  if (!masterData.orgs[name]) masterData.orgs[name] = {};
  document.getElementById("newPtName").value = "";
  saveStorage(); renderMasterUI(); showToast("PT ditambahkan");
}
function deletePT(pt) {
  if (!confirm(`Hapus ${pt}?`)) return;
  delete masterData.orgs[pt];
  saveStorage(); renderMasterUI();
}
function addAfdeling() {
  const pt = document.getElementById("mstSelectPtForAfd").value;
  const afd = document.getElementById("newAfdName").value.trim();
  if (!pt || !afd) return;
  if (!masterData.orgs[pt][afd]) masterData.orgs[pt][afd] = [];
  document.getElementById("newAfdName").value = "";
  saveStorage(); renderMasterUI(); showToast("Afdeling ditambahkan");
}
function deleteAfdeling(pt, afd) {
  delete masterData.orgs[pt][afd];
  saveStorage(); renderMasterUI();
}
function addBlok() {
  const val = document.getElementById("mstSelectAfdForBlok").value;
  const kode = document.getElementById("newBlokCode").value.trim().toUpperCase();
  const luas = parseFloat(document.getElementById("newBlokLuas").value) || 0;
  if (!val || !kode) return;
  const [pt, afd] = val.split("|||");
  masterData.orgs[pt][afd].push({ kode, luas });
  document.getElementById("newBlokCode").value = "";
  document.getElementById("newBlokLuas").value = "";
  saveStorage(); renderMasterUI(); showToast(`Blok ${kode} ditambahkan`);
}
function deleteBlok(pt, afd, idx) {
  masterData.orgs[pt][afd].splice(idx, 1);
  saveStorage(); renderMasterUI();
}
function addJob() {
  const nama = document.getElementById("newJobName").value.trim();
  const unit = document.getElementById("newJobUnit").value;
  if (!nama) return;
  masterData.jobs.push({ nama, unit });
  document.getElementById("newJobName").value = "";
  saveStorage(); renderMasterUI(); showToast("Pekerjaan ditambahkan");
}
function deleteJob(i) { masterData.jobs.splice(i, 1); saveStorage(); renderMasterUI(); }

function addUnit() {
  const u = document.getElementById("newUnitName").value.trim();
  if (!u || masterData.units.includes(u)) return;
  masterData.units.push(u);
  document.getElementById("newUnitName").value = "";
  saveStorage(); renderMasterUI(); showToast("Satuan ditambahkan");
}
function deleteUnit(i) { masterData.units.splice(i, 1); saveStorage(); renderMasterUI(); }

function addMaterial() {
  const jenis = document.getElementById("newMatType").value;
  const nama = document.getElementById("newMatName").value.trim();
  const unit = document.getElementById("newMatUnit").value.trim() || (jenis === "Pupuk" ? "Kg" : "Liter");
  if (!nama) return;
  masterData.materials.push({ nama, jenis, unit });
  document.getElementById("newMatName").value = "";
  document.getElementById("newMatUnit").value = "";
  saveStorage(); renderMasterUI(); showToast(`${jenis} "${nama}" ditambahkan`);
}
function deleteMaterial(i) { masterData.materials.splice(i, 1); saveStorage(); renderMasterUI(); }

function addPerson(role) {
  const inputId = role === "asisten" ? "newAsistenName" : "newMandorName";
  const val = document.getElementById(inputId).value.trim();
  if (!val) return;
  const arr = role === "asisten" ? masterData.asistens : masterData.mandors;
  if (!arr.includes(val)) arr.push(val);
  document.getElementById(inputId).value = "";
  saveStorage(); renderMasterUI(); showToast("Data personil ditambahkan");
}
function deletePerson(role, i) {
  const arr = role === "asisten" ? masterData.asistens : masterData.mandors;
  arr.splice(i, 1);
  saveStorage(); renderMasterUI();
}

function resetMasterToDefault() {
  if (!confirm("Kembalikan semua pengaturan database ke default?")) return;
  masterData = structuredClone(DEFAULT_MASTER);
  saveStorage(); renderMasterUI(); showToast("Database direset ke default");
}

// ==================== WHATSAPP REPORT ====================
function shareWhatsAppReport() {
  const tgl = document.getElementById("inpTanggal").value;
  const list = records.filter(r => r.tanggal === tgl);
  if (!list.length) return showToast(`Belum ada realisasi tanggal ${tgl}`, "⚠️");

  let totalHK = 0;
  const lines = list.map((r, i) => {
    totalHK += Number(r.hk || 0);
    const mat = formatMatBadge(r);
    return `${i + 1}. *${r.afdeling}* | Blok *${r.blok}*
   • ${r.pekerjaan}: *${Number(r.hasil).toLocaleString("id-ID")} ${r.satuan}* (${r.hk} HK)
   • Material: ${mat}
   • Mandor: ${r.mandor} (Ast: ${r.asisten})`;
  });

  const text =
    `*LAPORAN REALISASI PERAWATAN HARIAN*
` +
    `*PT KENCANA AGRI — PLASMA WANGGARASI*
` +
    `Tanggal: *${tgl}*
` +
    `------------------------------------
` +
    lines.join("

") +
    `
------------------------------------
` +
    `*Total Aktivitas:* ${list.length} Item
` +
    `*Total HK:* ${totalHK.toLocaleString("id-ID")} HK
` +
    `_KENCANA PASTI BISA!_`;

  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

// ==================== EXPORT EXCEL (HARIAN & BULANAN) ====================
function exportToExcel() {
  if (!records.length) return showToast("Belum ada data realisasi!", "⚠️");

  const wb = XLSX.utils.book_new();

  const wsHarian = XLSX.utils.json_to_sheet(records.map((r, i) => ({
    "No": i + 1,
    "Tanggal": r.tanggal,
    "Bulan": r.tanggal.substring(0, 7),
    "PT": r.pt,
    "Afdeling": r.afdeling,
    "Blok": r.blok,
    "Jenis Pekerjaan": r.pekerjaan,
    "Realisasi": Number(r.hasil),
    "Satuan": r.satuan,
    "HK": Number(r.hk),
    "Output/HK": r.hk > 0 ? Number((r.hasil / r.hk).toFixed(2)) : 0,
    "Material 1": r.mat1Nama,
    "Jumlah Mat 1": r.mat1Qty,
    "Satuan Mat 1": r.mat1Unit,
    "Material 2": r.mat2Nama,
    "Jumlah Mat 2": r.mat2Qty,
    "Satuan Mat 2": r.mat2Unit,
    "Mandor": r.mandor,
    "Asisten": r.asisten,
    "Keterangan": r.keterangan
  })));
  XLSX.utils.book_append_sheet(wb, wsHarian, "Realisasi_Harian");

  const blnMap = {};
  records.forEach(r => {
    const bln = r.tanggal.substring(0, 7);
    const key = `${bln}|||${r.afdeling}|||${r.pekerjaan}|||${r.satuan}`;
    if (!blnMap[key]) blnMap[key] = { "Bulan": bln, "Afdeling": r.afdeling, "Jenis Pekerjaan": r.pekerjaan, "Satuan": r.satuan, "Total Realisasi": 0, "Total HK": 0 };
    blnMap[key]["Total Realisasi"] += Number(r.hasil || 0);
    blnMap[key]["Total HK"] += Number(r.hk || 0);
  });
  const wsBulanan = XLSX.utils.json_to_sheet(Object.values(blnMap).map(x => ({
    ...x,
    "Rata-rata Out/HK": x["Total HK"] > 0 ? Number((x["Total Realisasi"] / x["Total HK"]).toFixed(2)) : 0
  })));
  XLSX.utils.book_append_sheet(wb, wsBulanan, "Rekap_Bulanan_Pekerjaan");

  const matBlnMap = {};
  records.forEach(r => {
    const bln = r.tanggal.substring(0, 7);
    [
      { nama: r.mat1Nama, jenis: r.mat1Jenis, qty: Number(r.mat1Qty || 0), unit: r.mat1Unit },
      { nama: r.mat2Nama, jenis: r.mat2Jenis, qty: Number(r.mat2Qty || 0), unit: r.mat2Unit }
    ].forEach(m => {
      if (m.nama && m.nama !== "-" && m.qty > 0) {
        const key = `${bln}|||${m.nama}|||${m.unit}`;
        if (!matBlnMap[key]) matBlnMap[key] = { "Bulan": bln, "Kategori": m.jenis, "Nama Material": m.nama, "Total Pemakaian": 0, "Satuan": m.unit };
        matBlnMap[key]["Total Pemakaian"] += m.qty;
      }
    });
  });
  const wsMatBulanan = XLSX.utils.json_to_sheet(Object.values(matBlnMap));
  XLSX.utils.book_append_sheet(wb, wsMatBulanan, "Rekap_Material_Bulanan");

  const tgl = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `Realisasi_Perawatan_Kencana_Wanggarasi_${tgl}.xlsx`);
  showToast("Excel Harian & Bulanan berhasil didownload!", "📥");
}

// ==================== GOOGLE SHEETS SYNC ====================
function saveWebhookUrl() {
  sheetConfig.url = document.getElementById("gsheetWebhookUrl").value.trim();
  sheetConfig.autoSync = document.getElementById("autoSyncCheck").checked;
  localStorage.setItem("kencana_gsheet_cfg_v3", JSON.stringify(sheetConfig));
  updateDashboardKPI();
  showToast("Konfigurasi Spreadsheet disimpan");
}

function toggleScriptGuide() {
  document.getElementById("appsScriptGuide").classList.toggle("hidden");
}

async function postRecordToWebhook(rec) {
  if (!sheetConfig.url) return;
  try {
    await fetch(sheetConfig.url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rec)
    });
  } catch (err) {
    console.error("Sync error:", err);
  }
}

async function syncAllToGoogleSheet() {
  if (!sheetConfig.url) {
    switchTab("master");
    return showToast("Masukkan URL Web App Google Script terlebih dahulu!", "⚠️");
  }
  if (!records.length) return showToast("Belum ada data untuk dikirim!", "⚠️");

  const btn = document.getElementById("btnSyncGsheet");
  btn.disabled = true;
  btn.textContent = `⏳ Mengirim ${records.length}...`;

  for (const r of records) {
    await postRecordToWebhook(r);
  }

  btn.disabled = false;
  btn.textContent = "☁️ Sync Google Sheet";
  showToast(`${records.length} data terkirim ke Google Sheet!`, "☁️");
}