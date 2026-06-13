const Quiz = (() => {
  const questions = [
    {
      question: "Apa definisi paling tepat dari bullying (perundungan)?",
      options: [
        { key: "A", text: "Bercanda atau lelucon sesekali di antara teman dekat." },
        { key: "B", text: "Perilaku agresif berulang yang disengaja dengan ketidakseimbangan kekuatan." },
        { key: "C", text: "Kritik atau masukan tegas guru untuk membangun disiplin." }
      ],
      answer: "B",
      explanation: "Perundungan dicirikan oleh adanya unsur kesengajaan, berulang kali terjadi, serta adanya ketidakseimbangan kekuatan antara pelaku dan korban."
    },
    {
      question: "Tindakan di media sosial berikut yang termasuk cyberbullying adalah...",
      options: [
        { key: "A", text: "Menulis komentar kritik membangun atas karya seni teman." },
        { key: "B", text: "Mengirim pesan privat berisi kata-kata intimidasi dan menyebarkan rumor palsu secara online." },
        { key: "C", text: "Melakukan video call kelompok untuk belajar bersama." }
      ],
      answer: "B",
      explanation: "Mengintimidasi, meneror, menyebarkan rumor jahat, atau memicu persekusi online secara berulang adalah bentuk cyberbullying."
    },
    {
      question: "Jika Anda menyaksikan teman sekelas sedang dirundung secara fisik, tindakan pertama yang bijak adalah?",
      options: [
        { key: "A", text: "Segera melapor kepada guru/pihak berwenang terdekat untuk meminta bantuan." },
        { key: "B", text: "Merekam kejadian dengan ponsel dan langsung menyebarkannya di sosmed." },
        { key: "C", text: "Ikut menyoraki agar pelaku merasa diakui dan Anda terhindar dari perundungan." }
      ],
      answer: "A",
      explanation: "Langkah pertama yang paling aman dan mendidik adalah meminta pertolongan pihak berwenang seperti guru, guru BK, atau orang dewasa di sekitar."
    },
    {
      question: "Bullying secara sosial (relasional) dapat berupa...",
      options: [
        { key: "A", text: "Mengejek berat badan teman di depan umum." },
        { key: "B", text: "Mengabaikan chat grup sekolah sementara waktu." },
        { key: "C", text: "Menghasut kelompok pertemanan untuk mengabaikan dan mengucilkan seseorang." }
      ],
      answer: "C",
      explanation: "Perundungan sosial atau relasional merusak hubungan sosial korban melalui hasutan, fitnah, rumor palsu, atau pengucilan terencana."
    },
    {
      question: "Dampak psikologis jangka panjang yang sering dialami korban perundungan adalah...",
      options: [
        { key: "A", text: "Kecemasan berlebih (anxiety), depresi, dan penurunan rasa percaya diri." },
        { key: "B", text: "Kemampuan komunikasi meningkat pesat karena terbiasa menghadapi konflik." },
        { key: "C", text: "Trauma fisik instan yang langsung sembuh setelah kejadian." }
      ],
      answer: "A",
      explanation: "Secara klinis, korban bullying rentan mengalami trauma psikologis berkepanjangan seperti depresi, penarikan diri secara sosial, kecemasan, hingga keinginan menyakiti diri sendiri."
    }
  ];

  let currentIdx = 0;
  let userAnswers = {}; // Mapping of questionIndex -> selectedOptionKey

  const init = () => {
    currentIdx = 0;
    userAnswers = {};

    // Bind welcome screen start
    const btnStart = document.getElementById('btnStartQuiz');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        document.getElementById('quizWelcomeScreen').classList.add('hidden');
        document.getElementById('quizPlayScreen').classList.remove('hidden');
        renderQuestion();
      });
    }

    bindEvents();
  };

  const resetQuiz = () => {
    currentIdx = 0;
    userAnswers = {};
    const welcome = document.getElementById('quizWelcomeScreen');
    const play = document.getElementById('quizPlayScreen');
    const result = document.getElementById('quizResultScreen');
    const review = document.getElementById('quizReviewBox');

    if (welcome) welcome.classList.remove('hidden');
    if (play) play.classList.add('hidden');
    if (result) result.classList.add('hidden');
    if (review) review.classList.add('hidden');
  };

  const renderQuestion = () => {
    const q = questions[currentIdx];
    
    // Progress Label & Bar
    const lblProgress = document.getElementById('quizProgressLabel');
    const lblPercent = document.getElementById('quizProgressPercent');
    const barProgress = document.getElementById('quizProgressBar');
    const txtQuestion = document.getElementById('quizQuestionText');
    const answersBox = document.getElementById('quizAnswersBox');
    const btnNext = document.getElementById('btnQuizNext');
    const btnPrev = document.getElementById('btnQuizPrev');

    if (lblProgress) lblProgress.textContent = `Pertanyaan ${currentIdx + 1} dari ${questions.length}`;
    
    const percent = Math.round(((currentIdx + 1) / questions.length) * 100);
    if (lblPercent) lblPercent.textContent = `${percent}%`;
    if (barProgress) barProgress.style.width = `${percent}%`;

    // Question Text
    if (txtQuestion) txtQuestion.textContent = q.question;

    // Render Option buttons
    if (answersBox) {
      answersBox.innerHTML = '';
      q.options.forEach(opt => {
        const optionDiv = document.createElement('div');
        const isSelected = userAnswers[currentIdx] === opt.key;
        
        optionDiv.className = `stat-card radio-label ${isSelected ? 'selected-option' : ''}`;
        optionDiv.style.cursor = 'pointer';
        optionDiv.style.padding = '12px 16px';
        optionDiv.style.border = isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)';
        optionDiv.style.background = isSelected ? 'rgba(99, 102, 241, 0.05)' : 'var(--bg-primary)';
        optionDiv.style.transition = 'all 0.15s ease';

        optionDiv.innerHTML = `
          <input type="radio" name="quizOpt" value="${opt.key}" ${isSelected ? 'checked' : ''} style="cursor:pointer; width:16px; height:16px;">
          <span style="font-size:14px; font-weight:500;">${opt.key}) ${opt.text}</span>
        `;

        optionDiv.addEventListener('click', () => {
          userAnswers[currentIdx] = opt.key;
          
          // Re-render choices state
          document.querySelectorAll('#quizAnswersBox .radio-label').forEach(el => {
            el.style.border = '1px solid var(--border-color)';
            el.style.background = 'var(--bg-primary)';
          });
          optionDiv.style.border = '2px solid var(--color-primary)';
          optionDiv.style.background = 'rgba(99, 102, 241, 0.05)';
          const radio = optionDiv.querySelector('input');
          if (radio) radio.checked = true;

          if (btnNext) btnNext.disabled = false;
        });

        answersBox.appendChild(optionDiv);
      });
    }

    // Prev button state
    if (btnPrev) btnPrev.disabled = currentIdx === 0;

    // Next button state / Text
    if (btnNext) {
      btnNext.disabled = !userAnswers[currentIdx];
      btnNext.textContent = (currentIdx === questions.length - 1) ? 'Selesai' : 'Lanjut';
    }
  };

  const bindEvents = () => {
    const btnPrev = document.getElementById('btnQuizPrev');
    const btnNext = document.getElementById('btnQuizNext');
    const btnRestart = document.getElementById('btnQuizRestart');
    const btnReview = document.getElementById('btnQuizReview');
    const btnHideReview = document.getElementById('btnHideReview');

    if (btnPrev) {
      btnPrev.addEventListener('click', () => {
        if (currentIdx > 0) {
          currentIdx--;
          renderQuestion();
        }
      });
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => {
        if (currentIdx < questions.length - 1) {
          currentIdx++;
          renderQuestion();
        } else {
          showResults();
        }
      });
    }

    if (btnRestart) {
      btnRestart.addEventListener('click', () => {
        resetQuiz();
        document.getElementById('quizWelcomeScreen').classList.add('hidden');
        document.getElementById('quizPlayScreen').classList.remove('hidden');
        renderQuestion();
      });
    }

    if (btnReview) {
      btnReview.addEventListener('click', () => {
        const reviewBox = document.getElementById('quizReviewBox');
        if (reviewBox) reviewBox.classList.remove('hidden');
        renderReview();
      });
    }

    if (btnHideReview) {
      btnHideReview.addEventListener('click', () => {
        const reviewBox = document.getElementById('quizReviewBox');
        if (reviewBox) reviewBox.classList.add('hidden');
      });
    }
  };

  const showResults = () => {
    document.getElementById('quizPlayScreen').classList.add('hidden');
    
    const resultScreen = document.getElementById('quizResultScreen');
    if (resultScreen) resultScreen.classList.remove('hidden');

    // Calculate score
    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.answer) {
        correctCount++;
      }
    });

    const percent = Math.round((correctCount / questions.length) * 100);

    // Render results text
    const emojiEl = document.getElementById('quizResultEmoji');
    const textEl = document.getElementById('quizResultScoreText');
    const badgeEl = document.getElementById('quizBadgeCard');

    if (emojiEl) {
      emojiEl.textContent = percent >= 80 ? '🏆' : (percent >= 60 ? '👍' : '📖');
    }

    if (textEl) {
      textEl.textContent = `Anda menjawab ${correctCount} dari ${questions.length} skenario secara tepat (${percent}%).`;
    }

    if (badgeEl) {
      badgeEl.className = '';
      if (percent >= 80) {
        badgeEl.textContent = '🛡️ PENGHAMBAT BULLYING SEJATI';
        badgeEl.style.background = '#D1FAE5';
        badgeEl.style.color = '#065F46';
      } else if (percent >= 60) {
        badgeEl.textContent = '⚠️ PEMBELA ANTI-BULLYING';
        badgeEl.style.background = '#FEF3C7';
        badgeEl.style.color = '#92400E';
      } else {
        badgeEl.textContent = '📖 PERLU MEMBACA LAGI';
        badgeEl.style.background = '#FEE2E2';
        badgeEl.style.color = '#991B1B';
      }
      badgeEl.style.display = 'inline-block';
      badgeEl.style.padding = '8px 18px';
      badgeEl.style.borderRadius = '999px';
      badgeEl.style.fontWeight = '700';
      badgeEl.style.fontSize = '12px';
    }
  };

  const renderReview = () => {
    const listEl = document.getElementById('quizReviewList');
    if (!listEl) return;

    listEl.innerHTML = '';
    questions.forEach((q, idx) => {
      const userAns = userAnswers[idx];
      const isCorrect = userAns === q.answer;

      const card = document.createElement('div');
      card.style.background = 'var(--bg-primary)';
      card.style.padding = '18px';
      card.style.borderRadius = '8px';
      card.style.borderLeft = `5px solid ${isCorrect ? 'var(--color-success)' : 'var(--color-error)'}`;
      card.style.textAlign = 'left';

      const userOpt = q.options.find(o => o.key === userAns)?.text || 'Tidak dijawab';
      const correctOpt = q.options.find(o => o.key === q.answer).text;

      card.innerHTML = `
        <h5 style="margin-bottom:8px; font-size:15px; font-weight:600;">Skenario ${idx + 1}: ${q.question}</h5>
        <p style="font-size:13.5px; margin-bottom:4px;">Pilihan Anda: <strong style="color:${isCorrect ? 'var(--color-success)' : 'var(--color-error)'}">${userAns}) ${userOpt}</strong></p>
        ${!isCorrect ? `<p style="font-size:13.5px; margin-bottom:4px;">Kunci Jawaban: <strong style="color:var(--color-success)">${q.answer}) ${correctOpt}</strong></p>` : ''}
        <p style="font-size:13px; color:var(--text-secondary); margin-top:8px; background:var(--bg-secondary); padding:10px; border-radius:4px; font-style:italic;">
          💡 <strong>Penjelasan:</strong> ${q.explanation}
        </p>
      `;

      listEl.appendChild(card);
    });
  };

  return {
    init,
    resetQuiz
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  Quiz.init();
});
