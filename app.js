// ==================== RESET & HAPUS DATA REKAPAN ====================
function resetFilteredRecords() {
  const filtered = getFilteredRecords();
  if (!filtered.length) return showToast("Tidak ada data pada filter ini untuk dihapus.", "⚠️");
  if (!confirm(`Hapus ${filtered.length} data realisasi yang sedang tampil di rekapan ini?`)) return;

  const idsToDelete = new Set(filtered.map(r => r.id));
  records = records.filter(r => !idsToDelete.has(r.id));
  saveStorage();
  renderRecentFeed();
  renderRekapAll();
  updateDashboardKPI();
  showToast(`${idsToDelete.size} data rekapan periode ini berhasil dihapus!`, "🧹");
}

function resetAllRecords() {
  if (!records.length) return showToast("Catatan rekapan sudah kosong.", "⚠️");
  if (!confirm(`PERINGATAN: Hapus SEMUA (${records.length}) data realisasi dari catatan rekapan? Database PT, Blok & Mandor tetap aman.`)) return;

  records = [];
  saveStorage();
  renderRecentFeed();
  renderRekapAll();
  updateDashboardKPI();
  showToast("Semua catatan rekapan berhasil di-reset!", "🗑️");
}

// ==================== LAPORAN WA CRASH PROGRAM (KHUSUS PRUNING & TEBAS GAWANGAN) ====================
function shareWhatsAppReport() {
  const tgl = document.getElementById("inpTanggal").value;
  const dayList = records.filter(r => r.tanggal === tgl);

  // Saring khusus pekerjaan Pruning dan Tebas Gawangan saja
  const crashList = dayList.filter(r => {
    const job = (r.pekerjaan || "").toLowerCase();
    return job.includes("pruning") || job.includes("tunas") || job.includes("tebas") || job.includes("gawangan");
  });

  if (!crashList.length) {
    return showToast(`Tidak ada data Pruning / Tebas Gawangan pada tanggal ${tgl}`, "⚠️");
  }

  // Ambil nama Afdeling singkat (contoh: "Plasma BSP - AFD 4" -> "BSP" atau sesuai pilihan)
  const sampleAfd = crashList[0].afdeling || "BSP";
  const afdLabel = sampleAfd.toUpperCase().includes("BSP") ? "BSP" : sampleAfd;

  // Format tanggal DD-MM-YYYY
  const partsTgl = tgl.split("-");
  const tglFormatted = partsTgl.length === 3 ? `${partsTgl[2]}-${partsTgl[1]}-${partsTgl[0]}` : tgl;

  // Kelompokkan rincian berdasarkan Jenis Pekerjaan (Pruning & Tebas Gawangan)
  const grouped = {};
  let totalHK = 0;

  crashList.forEach(r => {
    totalHK += Number(r.hk || 0);
    if (!grouped[r.pekerjaan]) grouped[r.pekerjaan] = [];
    grouped[r.pekerjaan].push(r);
  });

  let rincianText = "";
  let idxJob = 1;
  Object.entries(grouped).forEach(([jobName, items]) => {
    let subHasil = 0;
    let subHK = 0;
    const satuan = items[0].satuan || "";

    rincianText += `*${idxJob}. ${jobName}*\n`;
    items.forEach(item => {
      subHasil += Number(item.hasil || 0);
      subHK += Number(item.hk || 0);
      const outTk = item.hk > 0 ? (item.hasil / item.hk).toFixed(2) : "0.00";
      rincianText += `   • Blok *${item.blok}* : *${Number(item.hasil).toLocaleString("id-ID")} ${item.satuan}* (${item.hk} HK | Out/TK: ${outTk}) — Mandor: ${item.mandor}\n`;
    });
    rincianText += `   _Subtotal ${jobName}: ${subHasil.toLocaleString("id-ID")} ${satuan} (${subHK} HK)_\n\n`;
    idxJob++;
  });

  const text =
    `*Laporan Realisasi Crash Program*\n` +
    `Afdeling : *${afdLabel}*\n` +
    `Tanggal : *${tglFormatted}*\n\n` +
    rincianText.trim() +
    `\n\n*Total Tenaga Kerja (HK) : ${totalHK.toLocaleString("id-ID")} HK*`;

  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
}

// ==================== EXPORT EXCEL ELEGAN HORIZONTAL ====================
function exportToExcel() {
  if (!records.length) return showToast("Belum ada data realisasi untuk diexport!", "⚠️");
  if (typeof XLSX === "undefined") return showToast("Library Excel sedang dimuat, pastikan internet aktif!", "⚠️");

  const wb = XLSX.utils.book_new();

  // Susunan Horizontal Lengkap
  const headers = [
    "No", "Tanggal", "Bulan", "PT", "Afdeling", "Blok",
    "Jenis Pekerjaan", "Realisasi", "Satuan", "HK", "Output / TK",
    "Material 1", "Dosis 1", "Unit 1", "Material 2", "Dosis 2", "Unit 2",
    "Mandor", "Asisten", "Keterangan"
  ];

  const rows = records.map((r, i) => [
    i + 1,
    r.tanggal,
    r.tanggal ? r.tanggal.substring(0, 7) : "",
    r.pt,
    r.afdeling,
    r.blok,
    r.pekerjaan,
    Number(r.hasil || 0),
    r.satuan,
    Number(r.hk || 0),
    r.hk > 0 ? Number((r.hasil / r.hk).toFixed(2)) : 0,
    r.mat1Nama || "-",
    Number(r.mat1Qty || 0),
    r.mat1Unit || "-",
    r.mat2Nama || "-",
    Number(r.mat2Qty || 0),
    r.mat2Unit || "-",
    r.mandor || "-",
    r.asisten || "-",
    r.keterangan || "-"
  ]);

  const wsData = [
    ["LAPORAN REALISASI PERAWATAN KEBUN — PT KENCANA AGRI (PLASMA WANGGARASI)"],
    [],
    headers,
    ...rows
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Merge judul atas horizontal
  ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }];

  // Styling Warna Elegan (Hijau Kencana #056839 & Emas #A6891B)
  const titleStyle = {
    font: { bold: true, sz: 13, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "044E2B" } },
    alignment: { horizontal: "left", vertical: "center" }
  };
  const headerStyle = {
    font: { bold: true, sz: 10, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "056839" } },
    alignment: { horizontal: "center", vertical: "center" },
    border: {
      top: { style: "thin", color: { rgb: "044E2B" } },
      bottom: { style: "medium", color: { rgb: "A6891B" } },
      left: { style: "thin", color: { rgb: "044E2B" } },
      right: { style: "thin", color: { rgb: "044E2B" } }
    }
  };

  if (ws["A1"]) ws["A1"].s = titleStyle;

  for (let c = 0; c < headers.length; c++) {
    const hdrCell = XLSX.utils.encode_cell({ r: 2, c });
    if (ws[hdrCell]) ws[hdrCell].s = headerStyle;

    for (let r = 0; r < rows.length; r++) {
      const cellRef = XLSX.utils.encode_cell({ r: r + 3, c });
      if (ws[cellRef]) {
        ws[cellRef].s = {
          font: { sz: 10, color: { rgb: "1E293B" }, bold: (c === 5 || c === 7 || c === 10) },
          fill: { fgColor: { rgb: r % 2 === 0 ? "F4F8F5" : "FFFFFF" } },
          alignment: { horizontal: (c === 0 || c === 1 || c === 2 || c === 5 || c === 8) ? "center" : (typeof rows[r][c] === "number" ? "right" : "left"), vertical: "center" },
          border: {
            top: { style: "thin", color: { rgb: "CBD5E1" } },
            bottom: { style: "thin", color: { rgb: "CBD5E1" } },
            left: { style: "thin", color: { rgb: "CBD5E1" } },
            right: { style: "thin", color: { rgb: "CBD5E1" } }
          }
        };
      }
    }
  }

  // Lebar kolom horizontal otomatis
  ws["!cols"] = [
    { wch: 5 }, { wch: 12 }, { wch: 10 }, { wch: 26 }, { wch: 20 }, { wch: 12 },
    { wch: 30 }, { wch: 12 }, { wch: 9 }, { wch: 10 }, { wch: 12 },
    { wch: 24 }, { wch: 10 }, { wch: 8 }, { wch: 24 }, { wch: 10 }, { wch: 8 },
    { wch: 18 }, { wch: 16 }, { wch: 28 }
  ];

  XLSX.utils.book_append_sheet(wb, ws, "Realisasi_Horizontal");

  const tgl = new Date().toISOString().split("T")[0];
  XLSX.writeFile(wb, `REALISASI_RAWAT_Kencana_${tgl}.xlsx`);
  showToast("Excel elegan horizontal berhasil diunduh!", "📥");
}
