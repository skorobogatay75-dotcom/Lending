(function () {
  const PORTFOLIO_ITEMS = [
    {
      tag: 'GPT-агенты',
      title: 'GPT-агенты',
      description: 'Копирайтер мощных продающих текстов для экспертов и бизнеса.',
      image: 'images/portfolio/gpt-copywriter.png',
      alt: 'GPT-агент — Копирайтер мощных продающих текстов'
    },
    {
      tag: 'Лендинги',
      title: 'Лендинги',
      description: 'Страницы с понятной структурой и продающими текстами.',
      image: 'images/лендинг.png',
      alt: 'Лендинг для экспертов'
    },
    {
      tag: 'Контент-планы',
      title: 'Контент-план на 7 дней',
      description: 'Подробная таблица: форматы, темы, хуки и лид-магниты.',
      image: 'images/portfolio/content-plan-7days.png',
      alt: 'Контент-план на 7 дней'
    },
    {
      tag: 'Контент-планы',
      title: 'Прогрев на 5 дней',
      description: 'Таблица прогрева: темы, эмоции и призывы к действию.',
      image: 'images/portfolio/content-warmup-5days.png',
      alt: 'Таблица прогрева на 5 дней'
    },
    {
      tag: 'Стратегии',
      title: 'Маркетинговые стратегии',
      description: 'Воронки продаж и путь клиента от знакомства до заявки.',
      image: 'images/Маркетинговая стратегия 2.png',
      alt: 'Маркетинговая стратегия'
    },
    {
      tag: 'Нейровизуал',
      title: 'Нейровизуал',
      description: 'AI-изображения для соцсетей, сайта и рекламных материалов.',
      image: 'images/Нейрофотосессия.png',
      alt: 'Нейровизуал и нейрофотосессия'
    },
    {
      tag: 'Боты',
      title: 'Копирайтер для Telegram',
      description: 'Посты, картинки и публикации — прямо в мессенджере.',
      image: 'images/portfolio/telegram-copywriter-bot.png',
      alt: 'Telegram-бот — Копирайтер для Скоробогатой Марии'
    },
    {
      tag: 'Приложения',
      title: 'Запись на консультацию',
      description: 'Форма для сбора заявок: имя, телефон, e-mail.',
      image: 'images/applications/consultation-form.png',
      alt: 'Форма записи на консультацию'
    },
    {
      tag: 'Приложения',
      title: 'Генератор идей для постов',
      description: 'Контент-ассистент: идеи постов, сторис и план на неделю.',
      image: 'images/applications/content-assistant.png',
      alt: 'Генератор идей для постов'
    },
    {
      tag: 'Приложения',
      title: 'Семейный бюджет',
      description: 'Калькулятор доходов и расходов с сохранением в браузере.',
      image: 'images/applications/family-budget.png',
      alt: 'Семейный бюджет — калькулятор'
    }
  ];

  function renderInfo(item) {
    return `
      <span class="portfolio-carousel__tag">${item.tag}</span>
      <h3 class="portfolio-carousel__title">${item.title}</h3>
      <p class="portfolio-carousel__desc">${item.description}</p>
    `;
  }

  function createSlide(item, index) {
    const slide = document.createElement('article');
    slide.className = 'portfolio-carousel__slide';
    slide.dataset.index = String(index);
    slide.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
    slide.setAttribute('aria-label', item.title);

    slide.innerHTML = `
      <div class="portfolio-carousel__media">
        <img
          class="portfolio-carousel__image"
          src="${item.image}"
          alt="${item.alt}"
          width="640"
          height="400"
          loading="${index === 0 ? 'eager' : 'lazy'}"
          decoding="async"
        >
      </div>
    `;

    return slide;
  }

  function initPortfolioCarousel(root, items = PORTFOLIO_ITEMS, options = {}) {
    const autoplay = options.autoplay ?? true;
    const intervalMs = options.intervalMs ?? 7000;

    let activeIndex = 0;
    let autoplayTimer = null;
    let slides = [];

    root.className = 'portfolio-carousel';
    root.innerHTML = `
      <div class="portfolio-carousel__frame">
        <div class="portfolio-carousel__viewport">
          <div class="portfolio-carousel__track" role="list"></div>
        </div>
      </div>
      <div class="portfolio-carousel__catalog"></div>
      <div class="portfolio-carousel__info" aria-live="polite"></div>
      <div class="portfolio-carousel__footer">
        <div class="portfolio-carousel__dots" role="tablist" aria-label="Выбор проекта"></div>
        <div class="portfolio-carousel__nav">
          <button type="button" class="portfolio-carousel__arrow portfolio-carousel__arrow--prev cursor-target" aria-label="Предыдущий проект">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button type="button" class="portfolio-carousel__arrow portfolio-carousel__arrow--next cursor-target" aria-label="Следующий проект">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    `;

    const track = root.querySelector('.portfolio-carousel__track');
    const infoEl = root.querySelector('.portfolio-carousel__info');
    const dotsEl = root.querySelector('.portfolio-carousel__dots');
    const prevBtn = root.querySelector('.portfolio-carousel__arrow--prev');
    const nextBtn = root.querySelector('.portfolio-carousel__arrow--next');
    const catalogSlot = root.querySelector('.portfolio-carousel__catalog');
    const catalogEl = document.querySelector('.portfolio__cta');

    if (catalogSlot && catalogEl) {
      catalogSlot.appendChild(catalogEl);
    }

    slides = items.map((item, index) => {
      const slide = createSlide(item, index);
      track.appendChild(slide);

      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'portfolio-carousel__dot cursor-target';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-label', `Проект ${index + 1}: ${item.title}`);
      dot.dataset.index = String(index);
      dot.addEventListener('click', () => goTo(index));
      dotsEl.appendChild(dot);

      return slide;
    });

    function updateSlides() {
      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });

      dotsEl.querySelectorAll('.portfolio-carousel__dot').forEach((dot, index) => {
        const isActive = index === activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      infoEl.innerHTML = renderInfo(items[activeIndex]);
    }

    function goTo(index) {
      activeIndex = (index + items.length) % items.length;
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

    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    });

    updateSlides();
    resetAutoplay();
  }

  document.addEventListener('DOMContentLoaded', () => {
    const root = document.getElementById('portfolio-carousel');
    if (root) initPortfolioCarousel(root);
  });
})();
