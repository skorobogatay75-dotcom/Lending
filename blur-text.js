/**
 * BlurText — vanilla JS (адаптация Motion BlurText для HTML-сайта)
 */
import { animate } from 'https://cdn.jsdelivr.net/npm/motion@11.15.0/+esm';

const buildKeyframes = (from, steps) => {
  const keys = new Set([...Object.keys(from), ...steps.flatMap((s) => Object.keys(s))]);
  const keyframes = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return keyframes;
};

function splitIntoSegments(text, animateBy) {
  if (animateBy === 'letters') {
    return [...text];
  }
  return text.split(' ').filter(Boolean);
}

function createBlurText(root, options = {}) {
  const {
    animateBy = 'letters',
    direction = 'top',
    delay = 80,
    threshold = 0.1,
    rootMargin = '0px',
    stepDuration = 0.35,
    onAnimationComplete
  } = options;

  const defaultFrom =
    direction === 'top'
      ? { filter: 'blur(10px)', opacity: 0, y: -50 }
      : { filter: 'blur(10px)', opacity: 0, y: 50 };

  const defaultTo = [
    {
      filter: 'blur(5px)',
      opacity: 0.5,
      y: direction === 'top' ? 5 : -5
    },
    { filter: 'blur(0px)', opacity: 1, y: 0 }
  ];

  const fromSnapshot = options.animationFrom ?? defaultFrom;
  const toSnapshots = options.animationTo ?? defaultTo;
  const stepCount = toSnapshots.length + 1;
  const totalDuration = stepDuration * (stepCount - 1);
  const times = Array.from({ length: stepCount }, (_, i) =>
    stepCount === 1 ? 0 : i / (stepCount - 1)
  );

  const originalHtml = root.innerHTML.trim();
  const lines = originalHtml.split(/<br\s*\/?>/i);

  root.innerHTML = '';
  root.classList.add('blur-text');

  const segments = [];

  lines.forEach((line, lineIndex) => {
    const lineEl = document.createElement('span');
    lineEl.className = 'blur-text__line';

    const parts = splitIntoSegments(line.trim(), animateBy);
    parts.forEach((part, partIndex) => {
      const span = document.createElement('span');
      span.className = 'blur-text__segment';
      span.style.display = 'inline-block';
      span.style.willChange = 'transform, filter, opacity';

      Object.assign(span.style, {
        filter: fromSnapshot.filter,
        opacity: String(fromSnapshot.opacity),
        transform: `translateY(${fromSnapshot.y}px)`
      });

      span.textContent = part === ' ' ? '\u00A0' : part;
      if (animateBy === 'words' && partIndex < parts.length - 1) {
        span.appendChild(document.createTextNode('\u00A0'));
      }

      lineEl.appendChild(span);
      segments.push(span);
    });

    root.appendChild(lineEl);
    if (lineIndex < lines.length - 1) {
      root.appendChild(document.createElement('br'));
    }
  });

  let completed = 0;

  const runAnimation = () => {
    const keyframes = buildKeyframes(fromSnapshot, toSnapshots);

    segments.forEach((span, index) => {
      animate(span, keyframes, {
        duration: totalDuration,
        times,
        delay: (index * delay) / 1000,
        ease: options.easing ?? 'easeOut'
      }).then(() => {
        completed += 1;
        if (completed === segments.length && typeof onAnimationComplete === 'function') {
          onAnimationComplete();
        }
      });
    });
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    segments.forEach((span) => {
      span.style.filter = 'blur(0px)';
      span.style.opacity = '1';
      span.style.transform = 'translateY(0px)';
    });
    return;
  }

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        runAnimation();
        observer.unobserve(root);
      }
    },
    { threshold, rootMargin }
  );

  observer.observe(root);
}

document.addEventListener('DOMContentLoaded', () => {
  const heroTitle = document.querySelector('.hero__title');
  if (!heroTitle) return;

  createBlurText(heroTitle, {
    animateBy: 'letters',
    direction: 'top',
    delay: 80,
    stepDuration: 0.35,
    threshold: 0.2
  });
});

export { createBlurText };
