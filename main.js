(function () {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const header = document.querySelector("[data-header]");
  const progress = document.querySelector("[data-scroll-progress]");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const siteNav = document.querySelector("[data-site-nav]");

  function updateScrollState() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    if (progress) {
      progress.style.width = `${Math.min(100, Math.max(0, ratio * 100))}%`;
    }
    if (header) {
      header.classList.toggle("is-scrolled", window.scrollY > 18);
    }
  }

  window.addEventListener("scroll", updateScrollState, { passive: true });
  updateScrollState();

  if (navToggle && siteNav) {
    navToggle.addEventListener("click", () => {
      const isOpen = siteNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
    });

    siteNav.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        siteNav.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Open navigation");
      }
    });
  }

  const revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add("is-visible"));
  }

  const counters = document.querySelectorAll("[data-counter]");
  function animateCounter(element) {
    const target = Number(element.getAttribute("data-counter") || "0");
    const suffix = target === 2 ? "+" : target === 90 ? "%" : "";
    const duration = 1100;
    const start = performance.now();

    function tick(now) {
      const progressRatio = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progressRatio, 3);
      element.textContent = `${Math.round(target * eased)}${suffix}`;
      if (progressRatio < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((counter) => counterObserver.observe(counter));
  } else {
    counters.forEach(animateCounter);
  }

  const typingTarget = document.querySelector("[data-typing]");
  if (typingTarget && !prefersReducedMotion) {
    let phrases = [];
    try {
      phrases = JSON.parse(typingTarget.getAttribute("data-typing") || "[]");
    } catch (error) {
      phrases = [typingTarget.textContent || ""];
    }

    let phraseIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function typeLoop() {
      const phrase = phrases[phraseIndex] || "";
      typingTarget.textContent = phrase.slice(0, charIndex);

      if (!deleting && charIndex < phrase.length) {
        charIndex += 1;
        setTimeout(typeLoop, 42);
        return;
      }

      if (!deleting && charIndex === phrase.length) {
        deleting = true;
        setTimeout(typeLoop, 1450);
        return;
      }

      if (deleting && charIndex > 0) {
        charIndex -= 1;
        setTimeout(typeLoop, 24);
        return;
      }

      deleting = false;
      phraseIndex = (phraseIndex + 1) % phrases.length;
      setTimeout(typeLoop, 280);
    }

    typeLoop();
  }

  const contactForm = document.querySelector("[data-contact-form]");
  if (contactForm) {
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const formData = new FormData(contactForm);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const message = String(formData.get("message") || "").trim();
      const subject = encodeURIComponent(`Portfolio inquiry from ${name || "visitor"}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${message}`);
      window.location.href = `mailto:rajsingh.be.vtu@gmail.com?subject=${subject}&body=${body}`;
    });
  }

  const canvas = document.getElementById("neural-canvas");
  if (!canvas || prefersReducedMotion) {
    return;
  }

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    return;
  }

  let width = 0;
  let height = 0;
  let particles = [];
  const palette = ["99,230,226", "255,93,214", "255,209,102", "163,255,111"];

  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const count = Math.max(38, Math.min(86, Math.floor((width * height) / 21000)));
    particles = Array.from({ length: count }, (_, index) => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: 1.1 + Math.random() * 1.9,
      color: palette[index % palette.length]
    }));
  }

  function drawParticles() {
    ctx.clearRect(0, 0, width, height);

    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < -20) particle.x = width + 20;
      if (particle.x > width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = height + 20;
      if (particle.y > height + 20) particle.y = -20;
    });

    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 150) {
          const alpha = (1 - distance / 150) * 0.22;
          ctx.strokeStyle = `rgba(${a.color}, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    particles.forEach((particle) => {
      ctx.fillStyle = `rgba(${particle.color}, 0.74)`;
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.r, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(drawParticles);
  }

  window.addEventListener("resize", resizeCanvas, { passive: true });
  resizeCanvas();
  drawParticles();
}());
