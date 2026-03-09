const revealTargets = Array.from(document.querySelectorAll('.hero, .panel, .card'));

revealTargets.forEach((element) => {
  element.setAttribute('data-reveal', '');
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.18,
    rootMargin: '0px 0px -6% 0px'
  }
);

revealTargets.forEach((element, index) => {
  element.style.transitionDelay = `${index * 80}ms`;
  observer.observe(element);
});
