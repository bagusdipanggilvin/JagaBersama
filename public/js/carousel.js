const Carousel = (() => {
  let testimonialSlide = 0;
  let expertSlide = 0;
  let testimonialInterval = null;
  let expertInterval = null;

  const init = () => {
    bindTabEvents();
    initCarousel('testimonial');
    initCarousel('expert');
  };

  const bindTabEvents = () => {
    const btnTabTestimonial = document.getElementById('btnTabTestimonial');
    const btnTabExpert = document.getElementById('btnTabExpert');
    const carouselTestimonial = document.getElementById('carouselTestimonial');
    const carouselExpert = document.getElementById('carouselExpert');

    if (btnTabTestimonial && btnTabExpert && carouselTestimonial && carouselExpert) {
      btnTabTestimonial.addEventListener('click', () => {
        btnTabTestimonial.classList.add('active');
        btnTabExpert.classList.remove('active');
        carouselTestimonial.classList.remove('hidden');
        carouselExpert.classList.add('hidden');
        resetAndStartAuto('testimonial');
        pauseAuto('expert');
      });

      btnTabExpert.addEventListener('click', () => {
        btnTabExpert.classList.add('active');
        btnTabTestimonial.classList.remove('active');
        carouselExpert.classList.remove('hidden');
        carouselTestimonial.classList.add('hidden');
        resetAndStartAuto('expert');
        pauseAuto('testimonial');
      });
    }
  };

  const initCarousel = (type) => {
    const inner = document.getElementById(type === 'testimonial' ? 'innerTestimonial' : 'innerExpert');
    const prevBtn = document.getElementById(type === 'testimonial' ? 'prevTestimonial' : 'prevExpert');
    const nextBtn = document.getElementById(type === 'testimonial' ? 'nextTestimonial' : 'nextExpert');
    const indicatorsContainer = document.getElementById(type === 'testimonial' ? 'indicatorsTestimonial' : 'indicatorsExpert');
    const wrapper = document.getElementById(type === 'testimonial' ? 'carouselTestimonial' : 'carouselExpert');

    if (!inner) return;

    const slides = inner.querySelectorAll('.carousel-slide');
    const totalSlides = slides.length;

    const showSlide = (n) => {
      let currentSlide = type === 'testimonial' ? testimonialSlide : expertSlide;
      
      // Update index
      currentSlide = (n + totalSlides) % totalSlides;
      
      if (type === 'testimonial') {
        testimonialSlide = currentSlide;
      } else {
        expertSlide = currentSlide;
      }

      // Apply transform
      inner.style.transform = `translateX(-${currentSlide * 100}%)`;

      // Update Navigation Buttons (Disable if first/last as per prompt spec)
      // Spec: "Prev button: disable if slide 1, Next button: disable if last slide"
      if (prevBtn) prevBtn.disabled = currentSlide === 0;
      if (nextBtn) nextBtn.disabled = currentSlide === totalSlides - 1;

      // Update Indicators
      if (indicatorsContainer) {
        indicatorsContainer.querySelectorAll('.indicator-dot').forEach((dot, index) => {
          if (index === currentSlide) {
            dot.classList.add('active');
          } else {
            dot.classList.remove('active');
          }
        });
      }
    };

    // Bind navigation buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        let currentSlide = type === 'testimonial' ? testimonialSlide : expertSlide;
        if (currentSlide > 0) {
          showSlide(currentSlide - 1);
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        let currentSlide = type === 'testimonial' ? testimonialSlide : expertSlide;
        if (currentSlide < totalSlides - 1) {
          showSlide(currentSlide + 1);
        }
      });
    }

    // Bind indicators click
    if (indicatorsContainer) {
      indicatorsContainer.querySelectorAll('.indicator-dot').forEach((dot, index) => {
        dot.addEventListener('click', () => {
          showSlide(index);
        });
      });
    }

    // Initialize state
    showSlide(0);

    // Auto Advance every 5 seconds
    const startAuto = () => {
      stopAuto();
      const interval = setInterval(() => {
        let currentSlide = type === 'testimonial' ? testimonialSlide : expertSlide;
        // Spec says loop: infinite, but buttons disable on limits.
        // For auto-advance we loop back to 0 at the end.
        const nextIdx = (currentSlide + 1) % totalSlides;
        showSlide(nextIdx);
      }, 5000);

      if (type === 'testimonial') {
        testimonialInterval = interval;
      } else {
        expertInterval = interval;
      }
    };

    const stopAuto = () => {
      if (type === 'testimonial' && testimonialInterval) {
        clearInterval(testimonialInterval);
        testimonialInterval = null;
      } else if (type === 'expert' && expertInterval) {
        clearInterval(expertInterval);
        expertInterval = null;
      }
    };

    // Pause on Hover / Resume on Leave
    if (wrapper) {
      wrapper.addEventListener('mouseenter', stopAuto);
      wrapper.addEventListener('mouseleave', startAuto);
    }

    // Start only if active/visible
    if (type === 'testimonial') {
      startAuto();
    }
  };

  const resetAndStartAuto = (type) => {
    if (type === 'testimonial') {
      testimonialSlide = 0;
      const inner = document.getElementById('innerTestimonial');
      if (inner) inner.style.transform = 'translateX(0)';
      
      const prev = document.getElementById('prevTestimonial');
      const next = document.getElementById('nextTestimonial');
      if (prev) prev.disabled = true;
      if (next) next.disabled = false;
      
      const dots = document.getElementById('indicatorsTestimonial');
      if (dots) {
        dots.querySelectorAll('.indicator-dot').forEach((d, idx) => {
          if (idx === 0) d.classList.add('active');
          else d.classList.remove('active');
        });
      }

      // Restart auto timer
      initCarousel('testimonial');
    } else {
      expertSlide = 0;
      const inner = document.getElementById('innerExpert');
      if (inner) inner.style.transform = 'translateX(0)';
      
      const prev = document.getElementById('prevExpert');
      const next = document.getElementById('nextExpert');
      if (prev) prev.disabled = true;
      if (next) next.disabled = false;
      
      const dots = document.getElementById('indicatorsExpert');
      if (dots) {
        dots.querySelectorAll('.indicator-dot').forEach((d, idx) => {
          if (idx === 0) d.classList.add('active');
          else d.classList.remove('active');
        });
      }

      // Restart auto timer
      initCarousel('expert');
    }
  };

  const pauseAuto = (type) => {
    if (type === 'testimonial' && testimonialInterval) {
      clearInterval(testimonialInterval);
      testimonialInterval = null;
    } else if (type === 'expert' && expertInterval) {
      clearInterval(expertInterval);
      expertInterval = null;
    }
  };

  return {
    init
  };
})();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only init if Galeri elements exist
  if (document.getElementById('sec-galeri')) {
    Carousel.init();
  }
});
