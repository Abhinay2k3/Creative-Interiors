/* ==========================================================================
   CREATIVE INTERIORS - PREMIUM VANILLA JS LOGIC
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------------
     1. Scroll Progress & Header Scroll Styling
     ------------------------------------------------------------------------ */
  const header = document.getElementById('main-header');
  const scrollProgress = document.getElementById('scroll-progress');

  window.addEventListener('scroll', () => {
    // 1.1 Update Scroll Progress Bar
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = `${scrollPercent}%`;

    // 1.2 Update Sticky Header styling on scroll
    if (scrollTop > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  /* ------------------------------------------------------------------------
     2. Mobile Navigation Toggle
     ------------------------------------------------------------------------ */
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navList = document.getElementById('nav-list');
  const navLinks = document.querySelectorAll('.nav-link');

  const toggleMobileMenu = () => {
    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
    mobileMenuBtn.classList.toggle('active');
    navList.classList.toggle('active');
  };

  mobileMenuBtn.addEventListener('click', toggleMobileMenu);

  // Close navigation menu when a link is clicked
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navList.classList.contains('active')) {
        toggleMobileMenu();
      }
    });
  });

  /* ------------------------------------------------------------------------
     3. Scroll Reveal Animations (IntersectionObserver)
     ------------------------------------------------------------------------ */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        // Unobserve once revealed
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ------------------------------------------------------------------------
     4. Portfolio Filter Logic
     ------------------------------------------------------------------------ */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioItems = document.querySelectorAll('.portfolio-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 4.1 Remove active class from all filter buttons, add to current
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      // 4.2 Hide/Show items with soft animations
      portfolioItems.forEach(item => {
        const category = item.getAttribute('data-category');
        
        if (filterValue === 'all' || category === filterValue) {
          // Show item
          item.style.display = 'block';
          // Force layout recalculation for transition
          item.offsetHeight; 
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        } else {
          // Hide item
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          // Wait for transition to complete before setting display to none
          setTimeout(() => {
            if (item.style.opacity === '0') {
              item.style.display = 'none';
            }
          }, 400);
        }
      });
    });
  });

  /* ------------------------------------------------------------------------
     5. Portfolio Modal Lightbox
     ------------------------------------------------------------------------ */
  const lightbox = document.getElementById('portfolio-lightbox');
  const lightboxImg = document.getElementById('lightbox-expanded-img');
  const lightboxCaption = document.getElementById('lightbox-image-caption');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');

  // Attach event to items click
  portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('.portfolio-img');
      const title = item.querySelector('.portfolio-item-title').textContent;
      const category = item.querySelector('.portfolio-item-cat').textContent;

      // Set content & show
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightboxCaption.textContent = `${category} — ${title}`;
      
      lightbox.style.display = 'flex';
      lightbox.setAttribute('aria-hidden', 'false');
      // Wait one frame to trigger opacity transition
      requestAnimationFrame(() => {
        lightbox.classList.add('active');
      });
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    // Hide container after transition ends
    setTimeout(() => {
      if (!lightbox.classList.contains('active')) {
        lightbox.style.display = 'none';
        lightboxImg.src = '';
      }
    }, 400);
  };

  lightboxCloseBtn.addEventListener('click', closeLightbox);
  
  // Close lightbox on click outside the image
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Escape key to close modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });

  /* ------------------------------------------------------------------------
     6. Before/After Interactive Slider Drag Logic
     ------------------------------------------------------------------------ */
  const slider = document.getElementById('before-after-slider');
  const beforeContainer = document.getElementById('before-img-container');
  const dragHandle = document.getElementById('slider-drag-handle');

  let isDragging = false;

  const setSliderPosition = (xPos) => {
    const rect = slider.getBoundingClientRect();
    let position = (xPos - rect.left) / rect.width;
    
    // Boundary checks
    if (position < 0) position = 0;
    if (position > 1) position = 1;

    const percentage = position * 100;
    beforeContainer.style.width = `${percentage}%`;
    dragHandle.style.left = `${percentage}%`;
  };

  // Drag Event Handlers (Mouse & Touch)
  const onStart = (e) => {
    isDragging = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setSliderPosition(clientX);
  };

  const onMove = (e) => {
    if (!isDragging) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    setSliderPosition(clientX);
  };

  const onEnd = () => {
    isDragging = false;
  };

  // Event Listeners
  dragHandle.addEventListener('mousedown', onStart);
  slider.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onEnd);

  // Touch Support
  dragHandle.addEventListener('touchstart', onStart);
  slider.addEventListener('touchmove', onMove);
  window.addEventListener('touchend', onEnd);

  /* ------------------------------------------------------------------------
     7. Testimonials Slider/Carousel
     ------------------------------------------------------------------------ */
  const track = document.getElementById('testimonial-slider-track');
  const slides = Array.from(track.children);
  const dotsContainer = document.getElementById('testimonial-dots-container');
  const dots = Array.from(dotsContainer.children);
  let currentIndex = 0;
  let autoSlideTimer = null;

  const updateSlide = (index) => {
    // 7.1 Slide Track Transition
    track.style.transform = `translateX(-${index * 100}%)`;
    
    // 7.2 Update active classes on slides
    slides.forEach((slide, i) => {
      if (i === index) {
        slide.classList.add('active');
      } else {
        slide.classList.remove('active');
      }
    });

    // 7.3 Update active classes on dots
    dots.forEach((dot, i) => {
      if (i === index) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    });

    currentIndex = index;
  };

  const startAutoSlide = () => {
    stopAutoSlide();
    autoSlideTimer = setInterval(() => {
      let nextIndex = (currentIndex + 1) % slides.length;
      updateSlide(nextIndex);
    }, 6000);
  };

  const stopAutoSlide = () => {
    if (autoSlideTimer) {
      clearInterval(autoSlideTimer);
    }
  };

  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
      const index = parseInt(e.target.getAttribute('data-index'), 10);
      updateSlide(index);
      startAutoSlide(); // Reset auto-slide timer
    });
  });

  // Start initially
  startAutoSlide();

  /* ------------------------------------------------------------------------
     8. Consultation Booking Form Handling
     ------------------------------------------------------------------------ */
  const form = document.getElementById('consultation-form');
  const successCard = document.getElementById('form-success-card');
  const successResetBtn = document.getElementById('success-reset-btn');

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Collect data
    const name = document.getElementById('client-name').value;
    const email = document.getElementById('client-email').value;
    const phone = document.getElementById('client-phone').value || 'Not provided';
    const location = document.getElementById('client-location').value || 'Not provided';
    const style = document.querySelector('input[name="aesthetic-style"]:checked').value;
    const budget = document.querySelector('input[name="budget-range"]:checked').value;
    const message = document.getElementById('client-message').value || 'Not provided';

    console.log('--- Inquiry Received ---');
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    console.log(`Phone: ${phone}`);
    console.log(`Location: ${location}`);
    console.log(`Style Preferred: ${style}`);
    console.log(`Budget Level: ${budget}`);
    console.log(`Message: ${message}`);

    // Trigger SMTP Send via SmtpJS
    if (window.Email) {
      Email.send({
        SecureToken: "YOUR_SMTPJS_SECURE_TOKEN", // Obtain a secure token from smtpjs.com or configure Host, Username, Password
        To: 'hello@creativeinteriors.in',
        From: 'hello@creativeinteriors.in', // SMTP hosts usually require the From email to match their verified domain
        Subject: `Consultation Inquiry from ${name} (${location})`,
        Body: `
          <h3>New Consultation Inquiry</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p><strong>Aesthetic:</strong> ${style}</p>
          <p><strong>Budget Range:</strong> ${budget}</p>
          <p><strong>Brief:</strong> ${message}</p>
        `
      }).then(
        status => console.log('SMTP transmission status:', status)
      ).catch(
        error => console.error('SMTP transmission error:', error)
      );
    } else {
      console.warn('SmtpJS library not loaded. Dispatch simulated.');
    }

    // Transition elements: Hide Form, Show Success Card
    form.style.display = 'none';
    successCard.style.display = 'flex';
  });

  successResetBtn.addEventListener('click', () => {
    // Reset form inputs
    form.reset();
    
    // Set default checks
    document.getElementById('style-minimalist').checked = true;
    document.getElementById('budget-level1').checked = true;

    // Transition elements back
    successCard.style.display = 'none';
    form.style.display = 'block';
  });

  /* ------------------------------------------------------------------------
     9. Newsletter Subscription
     ------------------------------------------------------------------------ */
  const newsletterForm = document.getElementById('newsletter-form-action');
  
  newsletterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = newsletterForm.querySelector('.newsletter-input');
    const btn = newsletterForm.querySelector('.newsletter-btn');
    
    if (input.value) {
      console.log(`Newsletter Subscriber: ${input.value}`);
      
      // Feedback to user
      input.disabled = true;
      input.value = "Thank you for subscribing!";
      btn.style.color = 'var(--color-surface-white)';
      btn.innerHTML = '<ion-icon name="checkmark-outline"></ion-icon>';
    }
  });

});
