(() => {
  'use strict';

  const DRAFT_KEY = 'inis.training.draft.v1';
  const RESULT_KEY = 'inis.training.result.v1';
  const RETURN_KEY = 'inis.training.hint-return.v1';
  const MAX_LENGTH = 1000;

  // Storage can be unavailable in private mode or when opening local files.
  const storage = {
    get(key) {
      try { return JSON.parse(sessionStorage.getItem(key)); }
      catch { return null; }
    },
    set(key, value) {
      try { sessionStorage.setItem(key, JSON.stringify(value)); }
      catch { /* The form remains usable without storage. */ }
    },
    remove(key) {
      try { sessionStorage.removeItem(key); }
      catch { /* Storage is optional for navigation. */ }
    }
  };

  const viewport = document.querySelector('.session-viewport');
  if (viewport) {
    const resize = () => {
      viewport.style.setProperty('--session-scale', Math.min(1, viewport.clientWidth / 390));
    };
    resize();
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(viewport);
    else window.addEventListener('resize', resize);
  }

  const header = `
    <header class="session-header">
      <a class="session-menu" href="menu.html" aria-label="Открыть меню">
        <img src="../images/icons/ic-menu.svg" alt="">
      </a>
      <h1>Симуляция интервью</h1>
      <a class="session-notifications" href="profile-4.html" aria-label="Уведомления">
        <img src="../images/icons/ic-bell.svg" alt="">
      </a>
    </header>`;

  const question = document.querySelector('[data-training-question]');
  if (question) {
    question.innerHTML = `${header}
      <div id="question-content">
        <div class="question-meta"><p>QA Engineer · Middle</p><p>Вопрос 3 из 10</p></div>
        <div class="question-progress" role="progressbar" aria-label="Прогресс сессии" aria-valuemin="0" aria-valuemax="10" aria-valuenow="3"></div>
        <p class="question-rag"><img src="../images/icons/ic-sparkle.svg" alt=""><span>RAG-контекст подключен</span></p>
        <section class="question-card" aria-labelledby="question-title">
          <p class="question-tag">API Testing</p>
          <h2 id="question-title">Чем отличаются методы<br>PUT и PATCH?</h2>
          <p class="question-instructions">Ответьте так, как на реальном<br>собеседовании.</p>
          <p class="question-time"><img src="../images/icons/ic-clock.svg" alt=""><time datetime="PT1M42S">01:42</time></p>
          <div class="question-separator" aria-hidden="true"></div>
          <a class="question-hint" id="hintb" href="training-question-2.html" aria-haspopup="dialog">
            <img src="../images/icons/ic-bulb.svg" alt="">Получить подсказку
          </a>
        </section>
        <form class="answer-form" id="answer-form" action="training-results.html" novalidate>
          <label class="answer-label" for="ans">Ваш ответ</label>
          <textarea class="answer-input" id="ans" name="answer" required maxlength="1000" aria-describedby="answer-count answer-error" placeholder="Введите ответ или нажмите на микрофон для голосового ввода..."></textarea>
          <p class="answer-counter" id="answer-count"><span id="cnt">0</span>/1000</p>
          <button class="answer-mic" type="button" id="micb" aria-label="Голосовой ввод" aria-pressed="false"><img src="../images/icons/ic-mic.svg" alt=""></button>
          <button class="answer-submit" type="submit" id="sendb"><img src="../images/icons/ic-plane.svg" alt="">Отправить ответ</button>
          <p class="answer-error" id="answer-error" role="alert" hidden></p>
        </form>
        <a class="session-finish" id="finish-session" href="training-results.html">Завершить сессию</a>
        <p class="session-status" id="session-status" role="status"></p>
      </div>`;

    const answer = document.getElementById('ans');
    const counter = document.getElementById('cnt');
    const error = document.getElementById('answer-error');
    const status = document.getElementById('session-status');
    const form = document.getElementById('answer-form');
    const hintLink = document.getElementById('hintb');
    const draft = storage.get(DRAFT_KEY);
    if (typeof draft?.answer === 'string') answer.value = draft.answer.slice(0, MAX_LENGTH);

    const setError = message => {
      error.textContent = message;
      error.hidden = !message;
      answer.setAttribute('aria-invalid', String(Boolean(message)));
      answer.setCustomValidity(message);
    };

    const saveDraft = () => {
      counter.textContent = answer.value.length;
      storage.set(DRAFT_KEY, {
        answer: answer.value,
        selectionStart: answer.selectionStart,
        selectionEnd: answer.selectionEnd
      });
    };

    const updateAnswer = () => {
      saveDraft();
      if (answer.value.length > MAX_LENGTH) setError('Ответ должен содержать не более 1000 символов.');
      else if (answer.value.trim()) setError('');
    };

    counter.textContent = answer.value.length;
    answer.addEventListener('input', updateAnswer);
    answer.addEventListener('blur', saveDraft);
    window.addEventListener('pagehide', saveDraft);
    answer.addEventListener('keydown', event => {
      if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        form.requestSubmit();
      }
    });

    let recognition = null;
    let listening = false;
    const mic = document.getElementById('micb');
    const stopListening = () => {
      if (recognition && listening) recognition.stop();
    };

    form.addEventListener('submit', event => {
      event.preventDefault();
      if (!answer.value.trim()) {
        setError('Введите ответ: поле не может быть пустым.');
        answer.focus();
        return;
      }
      if (answer.value.length > MAX_LENGTH) {
        setError('Ответ должен содержать не более 1000 символов.');
        answer.focus();
        return;
      }
      stopListening();
      saveDraft();
      storage.set(RESULT_KEY, { answer: answer.value.trim(), submitted: true });
      window.location.assign('training-results.html');
    });

    document.getElementById('finish-session').addEventListener('click', () => {
      stopListening();
      saveDraft();
      storage.set(RESULT_KEY, { answer: answer.value.trim(), submitted: false });
    });

    hintLink.addEventListener('click', () => {
      stopListening();
      saveDraft();
      storage.set(RETURN_KEY, true);
    });

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    mic.addEventListener('click', () => {
      if (!SpeechRecognition) {
        status.textContent = 'Голосовой ввод недоступен в этом браузере. Введите ответ с клавиатуры.';
        answer.focus();
        return;
      }
      if (listening) { stopListening(); return; }
      recognition = new SpeechRecognition();
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;
      recognition.continuous = false;
      recognition.onstart = () => {
        listening = true;
        mic.setAttribute('aria-pressed', 'true');
        status.textContent = 'Слушаю… Нажмите на микрофон, чтобы остановить запись.';
      };
      recognition.onresult = event => {
        const text = event.results[event.resultIndex][0].transcript;
        const separator = answer.value && !/\s$/.test(answer.value) ? ' ' : '';
        const next = answer.value + separator + text;
        answer.value = next.slice(0, MAX_LENGTH);
        updateAnswer();
        status.textContent = next.length > MAX_LENGTH
          ? 'Достигнут лимит 1000 символов. Проверьте распознанный ответ.'
          : 'Голосовой ввод завершён. Проверьте распознанный ответ.';
      };
      recognition.onerror = event => {
        status.textContent = event.error === 'not-allowed'
          ? 'Доступ к микрофону не разрешён. Введите ответ с клавиатуры.'
          : 'Не удалось распознать речь. Попробуйте ещё раз или введите ответ с клавиатуры.';
      };
      recognition.onend = () => {
        listening = false;
        mic.setAttribute('aria-pressed', 'false');
        if (status.textContent.startsWith('Слушаю')) status.textContent = 'Запись остановлена.';
      };
      try { recognition.start(); }
      catch { status.textContent = 'Не удалось включить микрофон. Введите ответ с клавиатуры.'; }
    });

    if (question.dataset.trainingQuestion === 'hint') {
      const overlay = document.createElement('div');
      overlay.className = 'hint-overlay';
      overlay.innerHTML = `
        <div class="hint-highlight" aria-hidden="true"><img src="../images/icons/ic-bulb.svg" alt="">Получить подсказку</div>
        <section class="hint-dialog" role="dialog" aria-modal="true" aria-labelledby="hint-title" aria-describedby="hint-copy">
          <h2 class="hint-heading" id="hint-title"><img src="../images/icons/ic-rag-hint.svg" alt="">RAG-подсказки</h2>
          <p class="hint-copy" id="hint-copy">Если вопрос вызывает затруднения,<br>нажмите сюда. Система подберёт<br>ориентир из базы знаний, не раскрывая<br>готовый ответ.</p>
          <a class="hint-dismiss" href="training-question-1.html">Понятно</a>
        </section>`;
      question.append(overlay);
      const dismiss = overlay.querySelector('.hint-dismiss');
      // Returning through history preserves the draft, focus and scroll position.
      const closeHint = event => {
        event?.preventDefault();
        const fromQuestion = document.referrer.endsWith('/training-question-1.html');
        if (fromQuestion && storage.get(RETURN_KEY) && window.history.length > 1) window.history.back();
        else window.location.replace('training-question-1.html');
      };
      const background = document.getElementById('question-content');
      background.inert = true;
      question.querySelector('.session-header').inert = true;
      dismiss.addEventListener('click', closeHint);
      overlay.addEventListener('click', event => {
        if (event.target === overlay) closeHint(event);
      });
      overlay.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeHint(event);
        if (event.key === 'Tab') { event.preventDefault(); dismiss.focus(); }
      });
      dismiss.focus({ preventScroll: true });
    } else {
      window.addEventListener('pageshow', () => {
        if (!storage.get(RETURN_KEY)) return;
        storage.remove(RETURN_KEY);
        const saved = storage.get(DRAFT_KEY);
        if (typeof saved?.answer === 'string') answer.value = saved.answer.slice(0, MAX_LENGTH);
        counter.textContent = answer.value.length;
        answer.setSelectionRange(saved?.selectionStart || 0, saved?.selectionEnd || 0);
        hintLink.focus({ preventScroll: true });
      });
    }
  }

  const results = document.querySelector('[data-training-results]');
  if (results) {
    document.getElementById('session-header-slot').innerHTML = header;
    const overlay = document.getElementById('review-overlay');
    const trigger = document.getElementById('review-answers');
    const close = document.getElementById('close-review');
    const result = storage.get(RESULT_KEY);
    // User input is always inserted as text, never interpreted as HTML.
    document.getElementById('review-answer').textContent = result?.answer || 'Ответ не был отправлен.';
    document.getElementById('review-status').textContent = result?.submitted
      ? 'Ответ отправлен.'
      : 'Сессия завершена без отправки ответа.';
    const content = document.getElementById('results-content');
    const setReview = open => {
      overlay.hidden = !open;
      content.inert = open;
      document.getElementById('session-header-slot').inert = open;
      (open ? close : trigger).focus({ preventScroll: true });
    };
    trigger.addEventListener('click', () => setReview(true));
    close.addEventListener('click', () => setReview(false));
    overlay.addEventListener('click', event => {
      if (event.target === overlay) setReview(false);
    });
    overlay.addEventListener('keydown', event => {
      if (event.key === 'Escape') setReview(false);
      if (event.key === 'Tab') { event.preventDefault(); close.focus(); }
    });
  }

  // A fresh training starts a fresh draft; navigating back from the hint does not.
  document.querySelectorAll('a[href="training-question-1.html"]').forEach(link => {
    if (question || results) return;
    link.addEventListener('click', () => {
      storage.remove(DRAFT_KEY);
      storage.remove(RESULT_KEY);
      storage.remove(RETURN_KEY);
    });
  });
})();
