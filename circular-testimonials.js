/**
 * Circular Testimonials — vanilla JS (адаптация для HTML-сайта)
 */
import { animate } from 'https://cdn.jsdelivr.net/npm/motion@11.15.0/+esm';

const TESTIMONIALS = [
  {
    quote:
      'Было: публиковала контент хаотично, не понимала, что писать. Что сделали: разработали контент-план на месяц с рубриками и темами. Что изменилось: появилась система, стала публиковать регулярно и получать больше откликов.',
    name: 'Психолог',
    designation: 'частная практика',
    src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=900&auto=format&fit=crop&q=80'
  },
  {
    quote:
      'Было: тратила по 2–3 часа в день на однотипные вопросы в директе. Что сделали: настроили GPT-агента для первичных ответов и сбора заявок. Что изменилось: освободилось время для работы с клиентами, заявки стали приходить стабильнее.',
    name: 'Коуч по карьере',
    designation: '',
    src: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=900&auto=format&fit=crop&q=80'
  },
  {
    quote:
      'Было: блог есть, подписчики есть, но заявок почти нет. Что сделали: проанализировали аудиторию и выстроили воронку продаж. Что изменилось: понятный путь от поста до записи на консультацию, заявки выросли в 3 раза.',
    name: 'Нутрициолог',
    designation: '',
    src: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=900&auto=format&fit=crop&q=80'
  },
  {
    quote:
      'Было: сложно объяснить, чем моя услуга отличается от других. Что сделали: сформулировали оффер и создали лендинг с понятной структурой. Что изменилось: клиенты сразу понимают ценность, меньше возражений на консультации.',
    name: 'Репетитор английского',
    designation: '',
    src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=900&auto=format&fit=crop&q=80'
  }
];

function calculateGap(width) {
  const minWidth = 1024;
  const maxWidth = 1456;
  const minGap = 60;
  const maxGap = 86;
  if (width <= minWidth) return minGap;
  if (width >= maxWidth) return Math.max(minGap, maxGap + 0.06018 * (width - maxWidth));
  return minGap + (maxGap - minGap) * ((width - minWidth) / (maxWidth - minWidth));
}

function getImageStyle(index, activeIndex, length, containerWidth) {
  const gap = calculateGap(containerWidth);
  const maxStickUp = gap * 0.8;
  const isActive = index === activeIndex;
  const isLeft = (activeIndex - 1 + length) % length === index;
  const isRight = (activeIndex + 1) % length === index;
  const transition = 'all 0.8s cubic-bezier(.4,2,.3,1)';

  if (isActive) {
    return {
      zIndex: '3',
      opacity: '1',
      pointerEvents: 'auto',
      transform: 'translateX(0px) translateY(0px) scale(1) rotateY(0deg)',
      transition
    };
  }
  if (isLeft) {
    return {
      zIndex: '2',
      opacity: '1',
      pointerEvents: 'auto',
      transform: `translateX(-${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(15deg)`,
      transition
    };
  }
  if (isRight) {
    return {
      zIndex: '2',
      opacity: '1',
      pointerEvents: 'auto',
      transform: `translateX(${gap}px) translateY(-${maxStickUp}px) scale(0.85) rotateY(-15deg)`,
      transition
    };
  }
  return {
    zIndex: '1',
    opacity: '0',
    pointerEvents: 'none',
    transform: 'translateX(0px) translateY(0px) scale(0.8) rotateY(0deg)',
    transition
  };
}

function animateQuoteWords(container, text) {
  container.innerHTML = '';
  const words = text.split(' ');
  words.forEach((word, i) => {
    const span = document.createElement('span');
    span.className = 'circular-testimonials__word';
    span.textContent = word;
    container.appendChild(span);
    if (i < words.length - 1) {
      container.appendChild(document.createTextNode('\u00A0'));
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      span.style.opacity = '1';
      span.style.filter = 'none';
      span.style.transform = 'none';
      return;
    }

    animate(
      span,
      { filter: ['blur(10px)', 'blur(0px)'], opacity: [0, 1], y: [5, 0] },
      { duration: 0.22, ease: 'easeInOut', delay: 0.025 * i }
    );
  });
}

function initCircularTestimonials(root, testimonials = TESTIMONIALS, options = {}) {
  const autoplay = options.autoplay ?? true;
  const intervalMs = options.intervalMs ?? 5000;
  let activeIndex = 0;
  let autoplayTimer = null;
  let containerWidth = 900;

  root.innerHTML = `
    <div class="circular-testimonials__grid">
      <div class="circular-testimonials__images" aria-hidden="true"></div>
      <div class="circular-testimonials__content">
        <div class="circular-testimonials__text">
          <h3 class="circular-testimonials__name"></h3>
          <p class="circular-testimonials__designation"></p>
          <blockquote class="circular-testimonials__quote"></blockquote>
        </div>
        <div class="circular-testimonials__nav">
          <button type="button" class="circular-testimonials__arrow circular-testimonials__arrow--prev cursor-target" aria-label="Предыдущий отзыв">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <button type="button" class="circular-testimonials__arrow circular-testimonials__arrow--next cursor-target" aria-label="Следующий отзыв">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      </div>
    </div>
  `;

  const imagesEl = root.querySelector('.circular-testimonials__images');
  const nameEl = root.querySelector('.circular-testimonials__name');
  const designationEl = root.querySelector('.circular-testimonials__designation');
  const quoteEl = root.querySelector('.circular-testimonials__quote');
  const prevBtn = root.querySelector('.circular-testimonials__arrow--prev');
  const nextBtn = root.querySelector('.circular-testimonials__arrow--next');
  const textWrap = root.querySelector('.circular-testimonials__text');

  const images = testimonials.map((item, index) => {
    const img = document.createElement('img');
    img.className = 'circular-testimonials__image';
    img.src = item.src;
    img.alt = item.name;
    img.loading = index === 0 ? 'eager' : 'lazy';
    img.dataset.index = String(index);
    imagesEl.appendChild(img);
    return img;
  });

  function measureWidth() {
    if (imagesEl) containerWidth = imagesEl.offsetWidth || 900;
  }

  function updateImages() {
    images.forEach((img, index) => {
      const style = getImageStyle(index, activeIndex, testimonials.length, containerWidth);
      Object.assign(img.style, style);
    });
  }

  function updateContent(animate = true) {
    const item = testimonials[activeIndex];
    nameEl.textContent = item.name;
    designationEl.textContent = item.designation;

    if (!animate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      quoteEl.textContent = item.quote;
      return;
    }

    textWrap.style.opacity = '0';
    textWrap.style.transform = 'translateY(12px)';

    requestAnimationFrame(() => {
      animateQuoteWords(quoteEl, item.quote);
      animate(
        textWrap,
        { opacity: [0, 1], y: [12, 0] },
        { duration: 0.35, ease: 'easeOut' }
      );
    });
  }

  function goTo(index) {
    activeIndex = (index + testimonials.length) % testimonials.length;
    updateImages();
    updateContent();
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

  prevBtn.addEventListener('click', handlePrev);
  nextBtn.addEventListener('click', handleNext);

  const onKey = (e) => {
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'ArrowRight') handleNext();
  };
  window.addEventListener('keydown', onKey);

  const onResize = () => {
    measureWidth();
    updateImages();
  };
  window.addEventListener('resize', onResize);

  measureWidth();
  updateImages();
  updateContent(false);
  resetAutoplay();

  return {
    destroy() {
      if (autoplayTimer) clearInterval(autoplayTimer);
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    }
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('reviews-carousel');
  if (root) initCircularTestimonials(root);
});

export { initCircularTestimonials, TESTIMONIALS };
