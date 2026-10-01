const navToggle = document.querySelector('.nav-toggle');
const mainNav = document.querySelector('.main-nav');

navToggle?.addEventListener('click', () => {
  const open = mainNav.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

document.querySelectorAll('.main-nav a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav?.classList.remove('is-open');
    navToggle?.setAttribute('aria-expanded', 'false');
  });
});

document.querySelectorAll('.faq-question').forEach(button => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const wasOpen = item.classList.contains('is-open');

    document.querySelectorAll('.faq-item').forEach(other => {
      other.classList.remove('is-open');
      other.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
    });

    if (!wasOpen) {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
    }
  });
});

const heroVisual = document.querySelector('.hero-visual');
const heroFrame = heroVisual?.querySelector('.visual-frame--large');
const heroCards = heroVisual ? [...heroVisual.querySelectorAll('.floating-card')] : [];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroVisual && heroFrame && !reduceMotion) {
  heroVisual.addEventListener('pointermove', event => {
    const bounds = heroVisual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    heroFrame.style.setProperty('--hero-shift-x', `${(x * 12).toFixed(1)}px`);
    heroFrame.style.setProperty('--hero-shift-y', `${(y * 10).toFixed(1)}px`);
    heroCards.forEach((card, index) => {
      const direction = index % 2 === 0 ? 1 : -1;
      card.style.setProperty('--card-shift-x', `${(x * 9 * direction).toFixed(1)}px`);
      card.style.setProperty('--card-shift-y', `${(y * 8 * direction).toFixed(1)}px`);
    });
  }, { passive: true });

  const resetHeroShift = () => {
    heroFrame.style.setProperty('--hero-shift-x', '0px');
    heroFrame.style.setProperty('--hero-shift-y', '0px');
    heroCards.forEach(card => {
      card.style.setProperty('--card-shift-x', '0px');
      card.style.setProperty('--card-shift-y', '0px');
    });
  };
  heroVisual.addEventListener('pointerleave', resetHeroShift, { passive: true });
  heroVisual.addEventListener('pointercancel', resetHeroShift, { passive: true });
}

const typedHeadline = document.querySelector('.hero-title-typing');
if (typedHeadline && !reduceMotion) {
  const phrases = [
    'استعداد را شکوفا کن!',
    'هوشمندانه رشد کن!',
    'با قصه‌ها یاد بگیر!',
    'خلاقانه تجربه کن!'
  ];
  const typeSpeed = 105;
  const eraseSpeed = 55;
  const phrasePause = 1650;
  const nextPause = 450;
  let phraseIndex = 0;
  let characterIndex = phrases[0].length;
  let deleting = false;

  const typeNextCharacter = () => {
    const phrase = phrases[phraseIndex];
    if (!deleting) {
      characterIndex++;
      typedHeadline.textContent = phrase.slice(0, characterIndex);
      if (characterIndex >= phrase.length) {
        deleting = true;
        window.setTimeout(typeNextCharacter, phrasePause);
        return;
      }
      window.setTimeout(typeNextCharacter, typeSpeed);
      return;
    }

    characterIndex--;
    typedHeadline.textContent = phrase.slice(0, characterIndex);
    if (characterIndex <= 0) {
      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      window.setTimeout(typeNextCharacter, nextPause);
      return;
    }
    window.setTimeout(typeNextCharacter, eraseSpeed);
  };

  window.setTimeout(typeNextCharacter, phrasePause);
}
