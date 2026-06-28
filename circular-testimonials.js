/**
 * Reviews carousel — vanilla JS, без внешних зависимостей
 */
(function () {
  const TESTIMONIALS = [
    {
      name: 'Елена',
      designation: 'Психолог, частная практика',
      photo: 'images/reviews/elena.jpg',
      accent: 'rose',
      was: 'публиковала контент хаотично, не понимала, что писать.',
      did: 'разработали контент-план на месяц с рубриками и темами.',
      result: 'появилась система, стала публиковать регулярно и получать больше откликов.'
    },
    {
      name: 'Ольга',
      designation: 'Коуч по карьере',
      photo: 'images/reviews/olga.jpg',
      accent: 'violet',
      was: 'тратила по 2–3 часа в день на однотипные вопросы в директе.',
      did: 'настроили GPT-агента для первичных ответов и сбора заявок.',
      result: 'освободилось время для работы с клиентами, заявки стали приходить стабильнее.'
    },
    {
      name: 'Марина',
      designation: 'Нутрициолог',
      photo: 'images/reviews/marina.jpg',
      accent: 'emerald',
      was: 'блог есть, подписчики есть, но заявок почти нет.',
      did: 'проанализировали аудиторию и выстроили воронку продаж.',
      result: 'понятный путь от поста до записи на консультацию, заявки выросли в 3 раза.'
    },
    {
      name: 'Ирина',
      designation: 'Репетитор английского',
      photo: 'images/reviews/irina.jpg',
      accent: 'amber',
      was: 'сложно объяснить, чем моя услуга отличается от других.',
      did: 'сформулировали оффер и создали лендинг с понятной структурой.',
      result: 'клиенты сразу понимают ценность, меньше возражений на консультации.'
    }
  ];

  function createSlide(item, index) {
    const slide = document.createElement('article');
    slide.className = 'reviews-carousel__slide';
    slide.dataset.index = String(index);
    slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');

    const designation = item.designation
      ? `<p class="reviews-carousel__role">${item.designation}</p>`
      : '';

    slide.innerHTML = `
      <header class="reviews-carousel__header">
        <div class="reviews-carousel__photo reviews-carousel__photo--${item.accent}" data-fallback="${item.name.charAt(0)}">
          <img
            class="reviews-carousel__photo-img"
            src="${item.photo}"
            alt="${item.name}"
            width="72"
            height="72"
            loading="${index === 0 ? 'eager' : 'lazy'}"
            decoding="async"
          >
        </div>
        <div class="reviews-carousel__meta">
          <h3 class="reviews-carousel__name">${item.name}</h3>
          ${designation}
        </div>
      </header>
      <div class="reviews-carousel__steps">
        <div class="reviews-carousel__step">
          <span class="reviews-carousel__label">Было</span>
          <p>${item.was}</p>
        </div>
        <div class="reviews-carousel__step">
          <span class="reviews-carousel__label">Что сделали</span>
          <p>${item.did}</p>
        </div>
        <div class="reviews-carousel__step reviews-carousel__step--result">
          <span class="reviews-carousel__label">Что изменилось</span>
          <p>${item.result}</p>
        </div>
      </div>
    `;

    return slide;
  }

  function bindPhotoFallbacks(root) {
    root.querySelectorAll('.reviews-carousel__photo-img').forEach((img) => {
      img.addEventListener('error', () => {
        const wrap = img.closest('.reviews-carousel__photo');
        if (!wrap || wrap.classList.contains('is-fallback')) return;
        wrap.classList.add('is-fallback');
        img.remove();
      }, { once: true });
    });
  }

  function initReviewsCarousel(root, testimonials = TESTIMONIALS, options = {}) {
    const autoplay = options.autoplay ?? true;
    const intervalMs = options.intervalMs ?? 6000;

    let activeIndex = 0;
    let autoplayTimer = null;
    let slides = [];

    root.className = 'reviews-carousel';
    root.innerHTML = `
      <div class="reviews-carousel__viewport">
        <div class="reviews-carousel__track" role="list"></div>
      </div>
      <div class="reviews-carousel__footer">
        <div class="reviews-carousel__dots" role="tablist" aria-label="Выбор отзыва"></div>
        <div class="reviews-carousel__nav">
          <button type="button" class="reviews-carousel__arrow reviews-carousel__arrow--prev cursor-target" aria-label="Предыдущий отзыв">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button type="button" class="reviews-carousel__arrow reviews-carousel__arrow--next cursor-target" aria-label="Следующий отзыв">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    `;

    const track = root.querySelector('.reviews-carousel__track');
    const dotsEl = root.querySelector('.reviews-carousel__dots');
    const prevBtn = root.querySelector('.reviews-carousel__arrow--prev');
    const nextBtn = root.querySelector('.reviews-carousel__arrow--next');

    slides = testimonials.map((item, index) => {
      const slide = createSlide(item, index);
      track.appendChild(slide);

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'reviews-carousel__dot cursor-target';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Отзыв ${index + 1}: ${item.name}, ${item.designation}`);
      dot.dataset.index = String(index);
      dot.addEventListener('click', () => goTo(index));
      dotsEl.appendChild(dot);

      return slide;
    });

    bindPhotoFallbacks(root);

    function updateSlides() {
      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });

      dotsEl.querySelectorAll('.reviews-carousel__dot').forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });
    }

    function goTo(index) {
      activeIndex = (index + testimonials.length) % testimonials.length;
      updateSlides();
      resetAutoplay();
    }

    function handleNext() {
      goTo(activeIndex + 1);
    }

    function handlePrev() {
      goTo(activeIndex - 1);
    }

    function resetAutoplay() {
      if (!autoplay) return;
      if (autoplayTimer) clearInterval(autoplayTimer);
      autoplayTimer = setInterval(handleNext, intervalMs);
    }

    function stopAutoplay() {
      if (autoplayTimer) clearInterval(autoplayTimer);
    }

    prevBtn.addEventListener('click', handlePrev);
    nextBtn.addEventListener('click', handleNext);

    root.addEventListener('mouseenter', stopAutoplay);
    root.addEventListener('mouseleave', resetAutoplay);
    root.addEventListener('focusin', stopAutoplay);
    root.addEventListener('focusout', resetAutoplay);

    const onKey = (e) => {
      if (!root.contains(document.activeElement) && document.activeElement !== document.body) return;
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', onKey);

    updateSlides();
    resetAutoplay();

    return {
      destroy() {
        stopAutoplay();
        window.removeEventListener('keydown', onKey);
      }
    };
  }

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('reviews-carousel');
    if (root) initReviewsCarousel(root);
  });
})();
