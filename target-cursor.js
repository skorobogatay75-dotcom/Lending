/**
 * Target Cursor — vanilla JS (адаптировано для лендинга)
 * Требует GSAP: https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js
 */
(function () {
  const getContainingBlock = (element) => {
    let node = element?.parentElement;
    while (node && node !== document.documentElement) {
      const style = getComputedStyle(node);
      if (
        style.transform !== 'none' ||
        style.perspective !== 'none' ||
        style.filter !== 'none' ||
        style.willChange.includes('transform') ||
        style.willChange.includes('perspective') ||
        style.willChange.includes('filter') ||
        /paint|layout|strict|content/.test(style.contain)
      ) {
        return node;
      }
      node = node.parentElement;
    }
    return null;
  };

  const getContainingBlockOffset = (block) => {
    if (!block) return { x: 0, y: 0 };
    const rect = block.getBoundingClientRect();
    return { x: rect.left + block.clientLeft, y: rect.top + block.clientTop };
  };

  const isMobileDevice = () => {
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i;
    return (hasTouchScreen && isSmallScreen) || mobileRegex.test(userAgent.toLowerCase());
  };

  function initTargetCursor(options = {}) {
    if (typeof gsap === 'undefined') {
      console.warn('TargetCursor: GSAP не найден.');
      return null;
    }

    const {
      targetSelector = '.cursor-target',
      spinDuration = 2,
      hideDefaultCursor = true,
      hoverDuration = 0.2,
      parallaxOn = true
    } = options;

    if (isMobileDevice()) return null;

    const constants = { borderWidth: 3, cornerSize: 12 };

    const wrapper = document.createElement('div');
    wrapper.className = 'target-cursor-wrapper';
    wrapper.innerHTML = `
      <div class="target-cursor-dot"></div>
      <div class="target-cursor-corner corner-tl"></div>
      <div class="target-cursor-corner corner-tr"></div>
      <div class="target-cursor-corner corner-br"></div>
      <div class="target-cursor-corner corner-bl"></div>
    `;
    document.body.appendChild(wrapper);

    const dot = wrapper.querySelector('.target-cursor-dot');
    const corners = wrapper.querySelectorAll('.target-cursor-corner');

    let spinTl = null;
    let containingBlock = getContainingBlock(wrapper);
    let isActive = false;
    let targetCornerPositions = null;
    let activeStrength = { current: 0 };
    let tickerFn = null;
    let activeTarget = null;
    let currentLeaveHandler = null;
    let resumeTimeout = null;

    const originalCursor = document.body.style.cursor;

    if (hideDefaultCursor) {
      document.documentElement.classList.add('has-custom-cursor');
    }

    const moveCursor = (x, y) => {
      const { x: offsetX, y: offsetY } = getContainingBlockOffset(containingBlock);
      gsap.to(wrapper, {
        x: x - offsetX,
        y: y - offsetY,
        duration: 0.1,
        ease: 'power3.out'
      });
    };

    const getOffset = () => getContainingBlockOffset(containingBlock);

    const cleanupTarget = (target) => {
      if (currentLeaveHandler) {
        target.removeEventListener('mouseleave', currentLeaveHandler);
      }
      currentLeaveHandler = null;
    };

    const initialOffset = getOffset();
    gsap.set(wrapper, {
      xPercent: -50,
      yPercent: -50,
      x: window.innerWidth / 2 - initialOffset.x,
      y: window.innerHeight / 2 - initialOffset.y
    });

    const createSpinTimeline = () => {
      if (spinTl) spinTl.kill();
      spinTl = gsap
        .timeline({ repeat: -1 })
        .to(wrapper, { rotation: '+=360', duration: spinDuration, ease: 'none' });
    };

    createSpinTimeline();

    tickerFn = () => {
      if (!targetCornerPositions || !wrapper || !corners.length) return;
      if (activeStrength.current === 0) return;

      const strength = activeStrength.current;
      const cursorX = gsap.getProperty(wrapper, 'x');
      const cursorY = gsap.getProperty(wrapper, 'y');

      corners.forEach((corner, i) => {
        const currentX = gsap.getProperty(corner, 'x');
        const currentY = gsap.getProperty(corner, 'y');
        const targetX = targetCornerPositions[i].x - cursorX;
        const targetY = targetCornerPositions[i].y - cursorY;
        const finalX = currentX + (targetX - currentX) * strength;
        const finalY = currentY + (targetY - currentY) * strength;
        const duration = strength >= 0.99 ? (parallaxOn ? 0.2 : 0) : 0.05;

        gsap.to(corner, {
          x: finalX,
          y: finalY,
          duration,
          ease: duration === 0 ? 'none' : 'power1.out',
          overwrite: 'auto'
        });
      });
    };

    const moveHandler = (e) => {
      moveCursor(e.clientX, e.clientY);
      const under = document.elementFromPoint(e.clientX, e.clientY);
      const onDark = under && (under.closest('.contact') || under.closest('.footer'));
      wrapper.classList.toggle('target-cursor-wrapper--on-dark', Boolean(onDark));
    };

    const scrollHandler = () => {
      if (!activeTarget || !wrapper) return;
      const { x: offsetX, y: offsetY } = getOffset();
      const mouseX = gsap.getProperty(wrapper, 'x') + offsetX;
      const mouseY = gsap.getProperty(wrapper, 'y') + offsetY;
      const elementUnderMouse = document.elementFromPoint(mouseX, mouseY);
      const isStillOverTarget =
        elementUnderMouse &&
        (elementUnderMouse === activeTarget ||
          elementUnderMouse.closest(targetSelector) === activeTarget);
      if (!isStillOverTarget && currentLeaveHandler) {
        currentLeaveHandler();
      }
    };

    const mouseDownHandler = () => {
      gsap.to(dot, { scale: 0.7, duration: 0.3 });
      gsap.to(wrapper, { scale: 0.9, duration: 0.2 });
    };

    const mouseUpHandler = () => {
      gsap.to(dot, { scale: 1, duration: 0.3 });
      gsap.to(wrapper, { scale: 1, duration: 0.2 });
    };

    const enterHandler = (e) => {
      const allTargets = [];
      let current = e.target;
      while (current && current !== document.body) {
        if (current.matches(targetSelector)) allTargets.push(current);
        current = current.parentElement;
      }
      const target = allTargets[0] || null;
      if (!target || !wrapper || !corners.length) return;
      if (activeTarget === target) return;

      if (activeTarget) cleanupTarget(activeTarget);
      if (resumeTimeout) {
        clearTimeout(resumeTimeout);
        resumeTimeout = null;
      }

      activeTarget = target;
      corners.forEach((corner) => gsap.killTweensOf(corner));

      gsap.killTweensOf(wrapper, 'rotation');
      spinTl?.pause();
      gsap.set(wrapper, { rotation: 0 });

      const rect = target.getBoundingClientRect();
      const { borderWidth, cornerSize } = constants;
      const { x: offsetX, y: offsetY } = getOffset();
      const cursorX = gsap.getProperty(wrapper, 'x');
      const cursorY = gsap.getProperty(wrapper, 'y');

      targetCornerPositions = [
        { x: rect.left - borderWidth - offsetX, y: rect.top - borderWidth - offsetY },
        { x: rect.right + borderWidth - cornerSize - offsetX, y: rect.top - borderWidth - offsetY },
        { x: rect.right + borderWidth - cornerSize - offsetX, y: rect.bottom + borderWidth - cornerSize - offsetY },
        { x: rect.left - borderWidth - offsetX, y: rect.bottom + borderWidth - cornerSize - offsetY }
      ];

      isActive = true;
      gsap.ticker.add(tickerFn);

      gsap.to(activeStrength, {
        current: 1,
        duration: hoverDuration,
        ease: 'power2.out'
      });

      corners.forEach((corner, i) => {
        gsap.to(corner, {
          x: targetCornerPositions[i].x - cursorX,
          y: targetCornerPositions[i].y - cursorY,
          duration: 0.2,
          ease: 'power2.out'
        });
      });

      const leaveHandler = () => {
        gsap.ticker.remove(tickerFn);
        isActive = false;
        targetCornerPositions = null;
        gsap.set(activeStrength, { current: 0, overwrite: true });
        activeTarget = null;

        const { cornerSize: cs } = constants;
        const positions = [
          { x: -cs * 1.5, y: -cs * 1.5 },
          { x: cs * 0.5, y: -cs * 1.5 },
          { x: cs * 0.5, y: cs * 0.5 },
          { x: -cs * 1.5, y: cs * 0.5 }
        ];
        const tl = gsap.timeline();
        corners.forEach((corner, index) => {
          gsap.killTweensOf(corner);
          tl.to(
            corner,
            { x: positions[index].x, y: positions[index].y, duration: 0.3, ease: 'power3.out' },
            0
          );
        });

        resumeTimeout = setTimeout(() => {
          if (!activeTarget && wrapper && spinTl) {
            const currentRotation = gsap.getProperty(wrapper, 'rotation');
            const normalizedRotation = currentRotation % 360;
            spinTl.kill();
            spinTl = gsap
              .timeline({ repeat: -1 })
              .to(wrapper, { rotation: '+=360', duration: spinDuration, ease: 'none' });
            gsap.to(wrapper, {
              rotation: normalizedRotation + 360,
              duration: spinDuration * (1 - normalizedRotation / 360),
              ease: 'none',
              onComplete: () => spinTl?.restart()
            });
          }
          resumeTimeout = null;
        }, 50);

        cleanupTarget(target);
      };

      currentLeaveHandler = leaveHandler;
      target.addEventListener('mouseleave', leaveHandler);
    };

    const resizeHandler = () => {
      containingBlock = getContainingBlock(wrapper);
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseover', enterHandler, { passive: true });
    window.addEventListener('scroll', scrollHandler, { passive: true });
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('mousedown', mouseDownHandler);
    window.addEventListener('mouseup', mouseUpHandler);

    return {
      destroy() {
        gsap.ticker.remove(tickerFn);
        window.removeEventListener('mousemove', moveHandler);
        window.removeEventListener('mouseover', enterHandler);
        window.removeEventListener('scroll', scrollHandler);
        window.removeEventListener('resize', resizeHandler);
        window.removeEventListener('mousedown', mouseDownHandler);
        window.removeEventListener('mouseup', mouseUpHandler);
        if (activeTarget) cleanupTarget(activeTarget);
        spinTl?.kill();
        wrapper.remove();
        document.documentElement.classList.remove('has-custom-cursor');
        document.body.style.cursor = originalCursor;
      }
    };
  }

  window.initTargetCursor = initTargetCursor;

  const CURSOR_TARGET_SELECTORS = [
    '.btn',
    '.logo',
    '.nav a',
    '.service-card',
    '.help-card',
    '.portfolio-card',
    '.infinite-menu__action',
    '.faq-item',
    '.price-item',
    '.reviews-carousel__arrow',
    '.reviews-carousel__dot',
    '.hero__photo-wrap',
    '.about__frame',
    '.about__highlights',
    '.burger',
    '.check-grid li',
    '.step',
    '.vibecode__panel',
    '.contact__info a',
    '.booking-modal__close',
    '.booking-form__input',
    '.booking-form__consent'
  ];

  document.addEventListener('DOMContentLoaded', () => {
    CURSOR_TARGET_SELECTORS.forEach((selector) => {
      document.querySelectorAll(selector).forEach((el) => {
        el.classList.add('cursor-target');
      });
    });

    initTargetCursor({
      targetSelector: '.cursor-target',
      spinDuration: 2,
      hideDefaultCursor: true,
      hoverDuration: 0.2,
      parallaxOn: true
    });
  });
})();
