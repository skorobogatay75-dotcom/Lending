(function () {
  let lastFocus = null;

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function getConfig() {
    return window.BOOKING_CONFIG || {};
  }

  function getApiUrl() {
    const config = getConfig();
    return config.apiUrl || '/api/telegram';
  }

  function validateEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function validatePhone(value) {
    const digits = value.replace(/\D/g, '');
    return digits.length >= 10;
  }

  function openModal(modal) {
    lastFocus = document.activeElement;
    modal.classList.add('is-open');
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    const firstInput = modal.querySelector('.booking-form__input');
    if (firstInput) {
      requestAnimationFrame(() => firstInput.focus());
    }
  }

  function closeModal(modal) {
    modal.classList.remove('is-open');
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lastFocus && typeof lastFocus.focus === 'function') {
      lastFocus.focus();
    }
  }

  function resetForm(modal) {
    const form = $('.booking-form', modal);
    const success = $('.booking-modal__success', modal);
    const error = $('.booking-form__error', modal);
    const submitBtn = form ? form.querySelector('[type="submit"]') : null;

    if (form) {
      form.reset();
      form.hidden = false;
      form.querySelectorAll('.booking-form__input.is-invalid').forEach((el) => {
        el.classList.remove('is-invalid');
      });
    }

    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = submitBtn.dataset.defaultText || 'Отправить заявку';
    }

    if (success) success.hidden = true;
    if (error) error.hidden = true;
  }

  function showError(form, message) {
    const error = $('.booking-form__error', form);
    if (!error) return;
    error.textContent = message;
    error.hidden = false;
  }

  function showSuccess(modal, form) {
    form.hidden = true;
    const success = $('.booking-modal__success', modal);
    if (success) success.hidden = false;
  }

  async function handleSubmit(modal, form) {
    const error = $('.booking-form__error', form);
    if (error) error.hidden = true;

    const nameInput = form.elements.name;
    const emailInput = form.elements.email;
    const phoneInput = form.elements.phone;
    const consentInput = form.elements.consent;
    const submitBtn = form.querySelector('[type="submit"]');

    [nameInput, emailInput, phoneInput].forEach((input) => {
      input.classList.remove('is-invalid');
    });

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();

    if (!name) {
      nameInput.classList.add('is-invalid');
      showError(form, 'Укажите ваше имя.');
      nameInput.focus();
      return;
    }

    if (!validateEmail(email)) {
      emailInput.classList.add('is-invalid');
      showError(form, 'Укажите корректный e-mail.');
      emailInput.focus();
      return;
    }

    if (!validatePhone(phone)) {
      phoneInput.classList.add('is-invalid');
      showError(form, 'Укажите номер телефона — не менее 10 цифр.');
      phoneInput.focus();
      return;
    }

    if (!consentInput.checked) {
      showError(form, 'Необходимо согласие на обработку персональных данных.');
      consentInput.focus();
      return;
    }

    if (submitBtn) {
      if (!submitBtn.dataset.defaultText) {
        submitBtn.dataset.defaultText = submitBtn.textContent;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';
    }

    try {
      const response = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          phone,
          consent: true
        })
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.error || 'Request failed');
      }

      showSuccess(modal, form);
    } catch (err) {
      showError(
        form,
        `Не удалось отправить заявку. Напишите в Telegram: @mariaskorobogatayAI`
      );
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = submitBtn.dataset.defaultText || 'Отправить заявку';
      }
    }
  }

  function initBookingModal() {
    const modal = document.getElementById('booking-modal');
    if (!modal) return;

    const form = $('.booking-form', modal);

    document.addEventListener('click', (e) => {
      const trigger = e.target.closest('[data-booking-open]');
      if (!trigger) return;
      e.preventDefault();
      resetForm(modal);
      openModal(modal);
    });

    modal.querySelectorAll('[data-booking-close]').forEach((el) => {
      el.addEventListener('click', () => {
        closeModal(modal);
        resetForm(modal);
      });
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal(modal);
        resetForm(modal);
      }
    });

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        handleSubmit(modal, form);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initBookingModal);
})();
