const ReportForm = (() => {
  
  const init = () => {
    // Initial EmailJS
    if (typeof emailjs !== 'undefined') {
      emailjs.init(CONFIG.EMAILJS.PUBLIC_KEY);
    }

    bindEvents();
  };

  // Falling confetti animation
  const triggerConfetti = () => {
    const colors = ['#6366F1', '#EC4899', '#10B981', '#FBBF24', '#EF4444', '#3B82F6'];
    const totalConfetti = 60;
    
    for (let i = 0; i < totalConfetti; i++) {
      const p = document.createElement('div');
      p.className = 'confetti-particle';
      
      const left = Math.floor(Math.random() * 100);
      const delay = (Math.random() * 1.5).toFixed(2);
      const size = Math.floor(Math.random() * 6) + 6;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      p.style.left = `${left}vw`;
      p.style.animationDelay = `${delay}s`;
      p.style.width = `${size}px`;
      p.style.height = `${size}px`;
      p.style.backgroundColor = color;
      p.style.borderRadius = Math.random() > 0.5 ? '50%' : '0%';
      
      document.body.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  };

  const bindEvents = () => {
    // Char counter for description
    const txtDeskripsi = document.getElementById('repDeskripsi');
    const lblCharCount = document.getElementById('repCharCount');
    if (txtDeskripsi && lblCharCount) {
      txtDeskripsi.addEventListener('input', () => {
        lblCharCount.textContent = `${txtDeskripsi.value.length} / 1000 karakter`;
      });
    }

    // Submit report form
    const reportForm = document.getElementById('formBullyingReport');
    if (reportForm) {
      reportForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check privacy consent
        const consentCheckbox = document.getElementById('repPrivacyConsent');
        if (!consentCheckbox || !consentCheckbox.checked) {
          window.showToast('Wajib menyetujui Kebijakan Privasi.', 'error');
          return;
        }

        const submitBtn = document.getElementById('btnSubmitReport');
        const btnText = submitBtn.querySelector('span');
        const btnSpinner = submitBtn.querySelector('.btn-spinner');

        // Compile payload
        const isAnonim = document.getElementById('repAnonim').checked;
        const genderEl = document.querySelector('input[name="repGender"]:checked');
        const bodyPayload = {
          namaPelapor: document.getElementById('repNama').value.trim(),
          emailPelapor: document.getElementById('repEmail').value.trim(),
          nomorHPPelapor: document.getElementById('repHP').value.trim(),
          anonim: isAnonim,
          tipeBullying: document.getElementById('repTipe').value,
          lokasi: document.getElementById('repLokasi').value,
          siapaPelaku: document.getElementById('repPelaku').value,
          deskripsi: document.getElementById('repDeskripsi').value.trim(),
          tanggalTerjadi: document.getElementById('repTanggal').value,
          berlangsungTerus: document.querySelector('input[name="repTerusMenerus"]:checked')?.value === 'true',
          bukti: {
            tipe: document.getElementById('repBuktiURL').value.trim() ? 'URL' : 'Tidak Ada',
            URL: document.getElementById('repBuktiURL').value.trim()
          }
        };

        try {
          submitBtn.disabled = true;
          if (btnText) btnText.classList.add('hidden');
          if (btnSpinner) btnSpinner.classList.remove('hidden');

          // Submit to backend API
          const res = await API.reports.createReport(bodyPayload);

          // Show success container
          reportForm.classList.add('hidden');
          const successScreen = document.getElementById('reportSuccessScreen');
          const trackingBox = document.getElementById('successTrackingNumber');
          
          if (successScreen) successScreen.classList.remove('hidden');
          if (trackingBox) trackingBox.textContent = res.trackingNumber;

          triggerConfetti();

          // Send email notification to admin via EmailJS
          sendEmailJSEmail(res.trackingNumber, bodyPayload);

          window.showToast('Laporan aduan Anda berhasil terkirim!', 'success');

        } catch (err) {
          window.showToast(err.message || 'Laporan gagal dikirim.', 'error');
        } finally {
          submitBtn.disabled = false;
          if (btnText) btnText.classList.remove('hidden');
          if (btnSpinner) btnSpinner.classList.add('hidden');
        }
      });
    }

    // Reset Form button action
    const btnReset = document.getElementById('btnResetReportForm');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (reportForm) {
          reportForm.reset();
          reportForm.classList.remove('hidden');
        }
        const successScreen = document.getElementById('reportSuccessScreen');
        if (successScreen) successScreen.classList.add('hidden');
        if (lblCharCount) lblCharCount.textContent = '0 / 1000 karakter';
      });
    }

    // Copy tracking number action
    const btnCopy = document.getElementById('btnCopyTracking');
    if (btnCopy) {
      btnCopy.addEventListener('click', () => {
        const trackingNum = document.getElementById('successTrackingNumber').textContent;
        navigator.clipboard.writeText(trackingNum).then(() => {
          window.showToast('Nomor tracking disalin ke clipboard!', 'success');
        }).catch(() => {
          window.showToast('Gagal menyalin otomatis.', 'error');
        });
      });
    }

    // Track status button action
    const btnTrack = document.getElementById('btnTrackReport');
    const trackInput = document.getElementById('trackInput');
    const trackResultBox = document.getElementById('trackResultBox');
    const trackErrorBox = document.getElementById('trackErrorBox');

    if (btnTrack && trackInput) {
      btnTrack.addEventListener('click', async () => {
        const queryVal = trackInput.value.trim().toUpperCase();
        
        if (trackResultBox) trackResultBox.classList.add('hidden');
        if (trackErrorBox) trackErrorBox.classList.add('hidden');

        if (!queryVal) {
          window.showToast('Masukkan nomor aduan terlebih dahulu.', 'warning');
          return;
        }

        try {
          btnTrack.disabled = true;
          btnTrack.textContent = 'Loading...';

          const report = await API.reports.getReportStatus(queryVal);
          
          // Render results
          document.getElementById('trackTipe').textContent = report.tipeBullying;
          document.getElementById('trackLokasi').textContent = report.lokasi;
          
          const badge = document.getElementById('trackBadge');
          if (badge) {
            badge.textContent = report.status;
            badge.className = 'status-pill';
            if (report.status === 'Diproses') badge.classList.add('status-processed');
            else if (report.status === 'Selesai') badge.classList.add('status-finished');
            else if (report.status === 'Ditolak') badge.classList.add('status-rejected');
            else badge.classList.add('status-received');
          }

          const dateEl = document.getElementById('trackDate');
          if (dateEl) {
            dateEl.textContent = new Date(report.createdAt).toLocaleDateString('id-ID', {
              year: 'numeric', month: 'long', day: 'numeric'
            });
          }

          document.getElementById('trackCatatan').textContent = report.catatan || 'Belum ada tanggapan/catatan tindak lanjut dari tim pendamping.';

          if (trackResultBox) trackResultBox.classList.remove('hidden');

        } catch (err) {
          if (trackErrorBox) {
            trackErrorBox.textContent = err.message || 'Gagal mencari status aduan.';
            trackErrorBox.classList.remove('hidden');
          }
        } finally {
          btnTrack.disabled = false;
          btnTrack.textContent = 'Cek';
        }
      });
    }
  };

  // EmailJS logic
  const sendEmailJSEmail = (trackingNumber, payload) => {
    if (typeof emailjs === 'undefined') {
      console.warn('EmailJS library is not loaded. Skipping email dispatch.');
      return;
    }

    const reportSummary = `
Laporan Aduan Baru:
- Nomor Tracking: ${trackingNumber}
- Nama Pelapor: ${payload.anonim ? "Pelapor Anonim" : payload.namaPelapor}
- Email Pelapor: ${payload.emailPelapor || '-'}
- No. HP Pelapor: ${payload.nomorHPPelapor || '-'}
- Tipe Bullying: ${payload.tipeBullying}
- Lokasi Kejadian: ${payload.lokasi}
- Siapa Pelaku: ${payload.siapaPelaku}
- Tanggal Kejadian: ${payload.tanggalTerjadi}
- Berlangsung Terus: ${payload.berlangsungTerus ? "Ya" : "Tidak"}
- Tipe Bukti: ${payload.bukti.tipe}
- URL Bukti: ${payload.bukti.URL || '-'}

Deskripsi Aduan:
"${payload.deskripsi}"

Status Laporan: Diterima (review 24 jam)
`;

    const templateParams = {
      // Standard EmailJS default placeholders
      from_name: payload.anonim ? "Pelapor Anonim" : payload.namaPelapor,
      to_name: "Admin Jaga Bersama",
      message: reportSummary,
      reply_to: payload.emailPelapor || "bagustrisubagio6@gmail.com",
      
      // Custom placeholders (just in case)
      to_email: "bagustrisubagio6@gmail.com",
      admin_email: "bagustrisubagio6@gmail.com",
      reporter_name: payload.anonim ? "Pelapor Anonim" : payload.namaPelapor,
      reporter_email: payload.emailPelapor,
      reporter_hp: payload.nomorHPPelapor,
      tracking_number: trackingNumber,
      tipe_bullying: payload.tipeBullying,
      lokasi: payload.lokasi,
      siapa_pelaku: payload.siapaPelaku,
      tanggal_terjadi: payload.tanggalTerjadi,
      berlangsung_terus: payload.berlangsungTerus ? "Ya" : "Tidak",
      deskripsi: payload.deskripsi,
      bukti_tipe: payload.bukti.tipe,
      bukti_url: payload.bukti.URL,
      status: "Diterima (review 24 jam)",

      // Additional variants
      nama: payload.anonim ? "Pelapor Anonim" : payload.namaPelapor,
      email: payload.emailPelapor,
      hp: payload.nomorHPPelapor
    };

    emailjs.send(
      CONFIG.EMAILJS.SERVICE_ID,
      CONFIG.EMAILJS.TEMPLATE_ID,
      templateParams
    ).then((response) => {
      console.log('Email sent successfully via EmailJS!', response.status, response.text);
    }, (err) => {
      console.error('EmailJS failed to deliver:', err);
    });
  };

  return {
    init
  };

})();

// Initialize form
document.addEventListener('DOMContentLoaded', () => {
  ReportForm.init();
});
