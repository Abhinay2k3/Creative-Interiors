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

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // 4.1 Remove active class from all filter buttons, add to current
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      // Query portfolio items dynamically since they are hydrated dynamically
      const currentPortfolioItems = document.querySelectorAll('.portfolio-item');

      // 4.2 Hide/Show items with soft animations
      currentPortfolioItems.forEach(item => {
        if (item.classList.contains('admin-add-project-card')) return;
        
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
     5. Portfolio Modal Lightbox (Dynamic Multi-Media Carousel)
     ------------------------------------------------------------------------ */
  const lightbox = document.getElementById('portfolio-lightbox');
  const lightboxImg = document.getElementById('lightbox-expanded-img');
  const lightboxCaption = document.getElementById('lightbox-image-caption');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const lightboxPrevBtn = document.getElementById('lightbox-prev-btn');
  const lightboxNextBtn = document.getElementById('lightbox-next-btn');

  let activeLightboxProject = null;
  let activeLightboxMediaIndex = 0;

  const openLightboxCarousel = (project, startIndex) => {
    activeLightboxProject = project;
    activeLightboxMediaIndex = startIndex || 0;
    updateLightboxCarouselMedia();
    
    lightbox.style.display = 'flex';
    lightbox.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => {
      lightbox.classList.add('active');
    });
  };

  const updateLightboxCarouselMedia = () => {
    if (!activeLightboxProject) return;
    const gallery = activeLightboxProject.gallery || [{ src: activeLightboxProject.image, type: activeLightboxProject.type }];
    
    // Bounds check
    if (activeLightboxMediaIndex < 0) activeLightboxMediaIndex = gallery.length - 1;
    if (activeLightboxMediaIndex >= gallery.length) activeLightboxMediaIndex = 0;
    
    const media = gallery[activeLightboxMediaIndex];
    const isVideo = media.type === 'video' || media.src.endsWith('.mp4') || media.src.includes('data:video');
    
    lightboxCaption.textContent = `${activeLightboxProject.category} — ${activeLightboxProject.title} (${activeLightboxMediaIndex + 1}/${gallery.length})`;
    
    const lightboxVideoContainer = document.getElementById('lightbox-video-container');
    const lightboxVideo = document.getElementById('lightbox-expanded-video');
    
    if (isVideo) {
      lightboxImg.style.display = 'none';
      if (lightboxVideoContainer) lightboxVideoContainer.style.display = 'block';
      if (lightboxVideo) {
        lightboxVideo.src = media.src;
        lightboxVideo.play();
      }
    } else {
      lightboxImg.style.display = 'block';
      if (lightboxVideoContainer) lightboxVideoContainer.style.display = 'none';
      if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.src = '';
      }
      lightboxImg.src = media.src;
      lightboxImg.alt = activeLightboxProject.title;
    }
    
    // Show navigation chevrons if gallery has more than 1 item
    if (lightboxPrevBtn && lightboxNextBtn) {
      if (gallery.length > 1) {
        lightboxPrevBtn.style.display = 'flex';
        lightboxNextBtn.style.display = 'flex';
      } else {
        lightboxPrevBtn.style.display = 'none';
        lightboxNextBtn.style.display = 'none';
      }
    }
  };

  const slideLightboxMedia = (direction) => {
    if (!activeLightboxProject) return;
    const gallery = activeLightboxProject.gallery || [{ src: activeLightboxProject.image, type: activeLightboxProject.type }];
    if (gallery.length <= 1) return;

    // Pause any playing video before sliding
    const lightboxVideo = document.getElementById('lightbox-expanded-video');
    if (lightboxVideo) {
      lightboxVideo.pause();
    }

    activeLightboxMediaIndex = (activeLightboxMediaIndex + direction + gallery.length) % gallery.length;
    updateLightboxCarouselMedia();
  };

  if (lightboxPrevBtn) lightboxPrevBtn.addEventListener('click', (e) => { e.stopPropagation(); slideLightboxMedia(-1); });
  if (lightboxNextBtn) lightboxNextBtn.addEventListener('click', (e) => { e.stopPropagation(); slideLightboxMedia(1); });

  const closeLightbox = () => {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    
    // Stop any playing video
    const lightboxVideo = document.getElementById('lightbox-expanded-video');
    if (lightboxVideo) {
      lightboxVideo.pause();
      lightboxVideo.src = '';
    }

    // Hide container after transition ends
    setTimeout(() => {
      if (!lightbox.classList.contains('active')) {
        lightbox.style.display = 'none';
        lightboxImg.src = '';
      }
    }, 400);
  };

  lightboxCloseBtn.addEventListener('click', closeLightbox);
  
  // Close lightbox on click outside the media
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) {
      closeLightbox();
    }
  });

  // Escape key to close modal & Arrow keys to navigate carousel
  document.addEventListener('keydown', (e) => {
    if (lightbox.classList.contains('active')) {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        slideLightboxMedia(-1);
      } else if (e.key === 'ArrowRight') {
        slideLightboxMedia(1);
      }
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
  
  if (newsletterForm) {
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
  }

  /* ------------------------------------------------------------------------
     10. Admin Portal Advanced Inline Editing & Ingestion System
     ------------------------------------------------------------------------ */
  
  // Track Admin Mode state
  let isAdminActive = false;

  // Audit Logs Helper
  const logSystemEvent = (detail) => {
    const time = new Date().toLocaleString();
    const raw = localStorage.getItem('creative_interiors_audit_log');
    const logs = raw ? JSON.parse(raw) : [];
    logs.unshift({ detail, time });
    localStorage.setItem('creative_interiors_audit_log', JSON.stringify(logs));
  };

  // Static Local Fallback Replica of config.json
  const DEFAULT_CONFIG = {
    forgot_password_question: "What is the name of the founder and CEO of Creative Interiors?",
    forgot_password_answer: "Balivada Ravi Kumar",
    password: "Srilavanya@23",
    contact: {
      address: "VIP Road, Siripuram, Visakhapatnam, Andhra Pradesh, India",
      phone: "+91 9866869316",
      email: "ravi.kumarultrafresh@gmail.com",
      instagram: "https://instagram.com/creative_interiors",
      pinterest: "https://pinterest.com/creative_interiors",
      linkedin: "https://linkedin.com/company/creative_interiors",
      facebook: "https://facebook.com/creative_interiors"
    },
    descriptions: {
      hero_title: "Crafting Spaces That Tell <span>Your Story</span>",
      hero_desc: "Bespoke interior architectural solutions tailored to blend luxury, comfort, and timeless modern style.",
      about_tag: "Our Firm",
      about_title: "Design with <span>Intention & Craft</span>",
      about_desc_1: "At Creative Interiors, we believe that design should transcend aesthetics. A space is a sanctuary, a reflection of individual identity, and a functional work of art.",
      about_desc_2: "Founded by CEO & Principal Designer Balivada Ravi Kumar, our Visakhapatnam-based firm brings together highly curated materials, meticulous layout planning, and organic modern textures to establish environments that feel both inspiring and deeply comforting.",
      footer_desc: "Founded by Balivada Ravi Kumar, our award-winning Visakhapatnam firm creates balanced, beautiful, and highly personalized spaces.",
      booking_title: "Schedule A <span>Consultation</span>",
      booking_desc: "Let's discuss your space. Fill out our detailed brief questionnaire to schedule a virtual or on-site consultation with our lead designers."
    },
    testimonials: [
      {
        quote: "Creative Interiors transformed our outdated villa in Rushikonda into a warm, sunlit modern sanctuary. They completely understood our vision, and the execution is flawless.",
        author: "Ananya & Rohan Sharma",
        role: "Homeowners, Rushikonda Villa"
      },
      {
        quote: "The design of our corporate office on VIP Road is a huge success. The team created an inspiring commercial workspace that our clients and partners rave about daily.",
        author: "Kabir Malhotra",
        role: "CEO, Malhotra & Partners"
      },
      {
        quote: "Their choice of organic, local materials and balanced layouts was absolutely flawless. The craftsmanship is of international standards.",
        author: "Priya Nair",
        role: "Principal Architect, Atelier 91"
      }
    ],
    slider: {
      before: "assets/before_slider.png",
      after: "assets/after_slider.png"
    },
    projects: [
      {
        id: "proj-living-room",
        category: "living",
        title: "Earthy Textures",
        image: "assets/portfolio_living.png",
        type: "image",
        gallery: [
          { "src": "assets/portfolio_living.png", "type": "image" },
          { "src": "https://assets.mixkit.co/videos/preview/mixkit-interior-of-a-modern-living-room-4819-large.mp4", "type": "video" }
        ]
      },
      {
        id: "proj-kitchen",
        category: "kitchen",
        title: "Japandi Elegance",
        image: "assets/portfolio_kitchen.png",
        type: "image",
        gallery: [
          { "src": "assets/portfolio_kitchen.png", "type": "image" }
        ]
      },
      {
        id: "proj-bedroom",
        category: "bedroom",
        title: "Serene Sanctuary",
        image: "assets/portfolio_bedroom.png",
        type: "image",
        gallery: [
          { "src": "assets/portfolio_bedroom.png", "type": "image" },
          { "src": "https://assets.mixkit.co/videos/preview/mixkit-modern-bedroom-interior-with-comfy-bed-and-plants-41976-large.mp4", "type": "video" }
        ]
      },
      {
        id: "proj-office",
        category: "office",
        title: "Aura Executive Lounge",
        image: "assets/portfolio_office.png",
        type: "image",
        gallery: [
          { "src": "assets/portfolio_office.png", "type": "image" },
          { "src": "https://assets.mixkit.co/videos/preview/mixkit-luxury-penthouse-or-office-lobby-interior-32868-large.mp4", "type": "video" }
        ]
      }
    ]
  };

  // Dynamic AJAX Database Hydration Engine
  const hydrateWebsite = () => {
    return new Promise((resolve) => {
      const saved = localStorage.getItem('creative_interiors_admin_content');
      
      const render = (data) => {
        // 1. Office Contact Values
        const addrEl = document.getElementById('contact-address-val');
        if (addrEl && data.contact?.address) addrEl.textContent = data.contact.address;
        
        const phoneEl = document.getElementById('contact-phone-val');
        if (phoneEl && data.contact?.phone) phoneEl.textContent = data.contact.phone;
        
        const emailEl = document.getElementById('contact-email-val');
        if (emailEl && data.contact?.email) emailEl.textContent = data.contact.email;

        // 2. Social Links mapping
        const instaEl = document.getElementById('social-link-instagram');
        if (instaEl && data.contact?.instagram) instaEl.setAttribute('href', data.contact.instagram);
        
        const pintEl = document.getElementById('social-link-pinterest');
        if (pintEl && data.contact?.pinterest) pintEl.setAttribute('href', data.contact.pinterest);
        
        const linkEl = document.getElementById('social-link-linkedin');
        if (linkEl && data.contact?.linkedin) linkEl.setAttribute('href', data.contact.linkedin);
        
        const faceEl = document.getElementById('social-link-facebook');
        if (faceEl && data.contact?.facebook) faceEl.setAttribute('href', data.contact.facebook);

        // 3. Main Site Descriptions
        const mainHeadline = document.getElementById('main-headline');
        if (mainHeadline && data.descriptions?.hero_title) mainHeadline.innerHTML = data.descriptions.hero_title;

        const subHeadline = document.getElementById('sub-headline');
        if (subHeadline && data.descriptions?.hero_desc) subHeadline.textContent = data.descriptions.hero_desc;

        const aboutTag = document.getElementById('about-tag');
        if (aboutTag && data.descriptions?.about_tag) aboutTag.textContent = data.descriptions.about_tag;

        const aboutTitle = document.getElementById('about-title');
        if (aboutTitle && data.descriptions?.about_title) aboutTitle.innerHTML = data.descriptions.about_title;

        const aboutDesc1 = document.getElementById('about-desc1-val');
        if (aboutDesc1 && data.descriptions?.about_desc_1) aboutDesc1.textContent = data.descriptions.about_desc_1;

        const aboutDesc2 = document.getElementById('about-desc2-val');
        if (aboutDesc2 && data.descriptions?.about_desc_2) aboutDesc2.textContent = data.descriptions.about_desc_2;

        const footerEl = document.getElementById('footer-firm-desc');
        if (footerEl && data.descriptions?.footer_desc) footerEl.textContent = data.descriptions.footer_desc;

        const bookingTitle = document.getElementById('booking-title-val');
        if (bookingTitle && data.descriptions?.booking_title) bookingTitle.innerHTML = data.descriptions.booking_title;

        const bookingDesc = document.getElementById('booking-desc-val');
        if (bookingDesc && data.descriptions?.booking_desc) bookingDesc.textContent = data.descriptions.booking_desc;

        // 4. Testimonials Success Stories
        data.testimonials?.forEach((test, idx) => {
          const slide = document.getElementById(`slide-${idx}`);
          if (slide) {
            const quoteEl = slide.querySelector('.testimonial-quote');
            const authorEl = slide.querySelector('.testimonial-author');
            const roleEl = slide.querySelector('.testimonial-role');
            if (quoteEl && test.quote) quoteEl.textContent = `"${test.quote.replace(/^"|"$/g, '')}"`;
            if (authorEl && test.author) authorEl.textContent = test.author;
            if (roleEl && test.role) roleEl.textContent = test.role;
          }
        });

        // 5. Before/After Transformation Slider Images
        const beforeImg = document.querySelector('.slider-img-before img');
        if (beforeImg && data.slider?.before) beforeImg.setAttribute('src', data.slider.before);
        const afterImg = document.querySelector('.slider-img-after img');
        if (afterImg && data.slider?.after) afterImg.setAttribute('src', data.slider.after);

        // 6. Portfolio Showcase Projects (Render dynamically inside #projects-grid)
        const gridContainer = document.getElementById('projects-grid');
        if (gridContainer && data.projects) {
          gridContainer.innerHTML = '';
          
          data.projects.forEach((proj) => {
            const isVideo = proj.type === 'video' || proj.image.endsWith('.mp4') || proj.image.includes('data:video');
            
            const card = document.createElement('div');
            card.className = `portfolio-item reveal active ${isVideo ? 'video-item' : ''}`;
            card.id = proj.id;
            card.setAttribute('data-category', proj.category);
            
            // Build overlay markup
            let overlayHTML = `
              <div class="portfolio-overlay">
                <span class="portfolio-item-cat">${proj.category}</span>
                <h3 class="portfolio-item-title">${proj.title}</h3>
                <div class="portfolio-item-plus"><ion-icon name="add-outline"></ion-icon></div>
              </div>
            `;
            
            // Thumb source selection
            let thumbSrc = proj.image;
            if (isVideo && (proj.image.startsWith('data:video') || proj.image.endsWith('.mp4'))) {
              thumbSrc = 'assets/portfolio_living.png'; // default placeholder
              if (proj.id.includes('bedroom')) thumbSrc = 'assets/portfolio_bedroom.png';
              if (proj.id.includes('kitchen')) thumbSrc = 'assets/portfolio_kitchen.png';
              if (proj.id.includes('office')) thumbSrc = 'assets/portfolio_office.png';
            }
            
            card.innerHTML = `
              <img src="${thumbSrc}" alt="${proj.title}" class="portfolio-img">
              ${overlayHTML}
            `;
            
            if (isVideo) {
              const playInd = document.createElement('div');
              playInd.className = 'video-play-indicator';
              playInd.innerHTML = '<ion-icon name="play-circle-outline"></ion-icon>';
              card.appendChild(playInd);
            }
            
            // If in Admin Mode, append a gold/red absolute delete button on the card
            if (isAdminActive) {
              const trashBtn = document.createElement('button');
              trashBtn.type = 'button';
              trashBtn.className = 'admin-grid-delete-btn';
              trashBtn.innerHTML = '<ion-icon name="trash-outline"></ion-icon>';
              trashBtn.title = 'Delete Project';
              trashBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete the project "${proj.title}"?`)) {
                  deleteProject(proj.id);
                }
              });
              card.appendChild(trashBtn);
            }
            
            // Open Lightbox carousel modal at index 0 on click
            card.addEventListener('click', () => {
              const currentSaved = localStorage.getItem('creative_interiors_admin_content');
              const currentData = currentSaved ? JSON.parse(currentSaved) : data;
              const freshProj = currentData.projects.find(p => p.id === proj.id) || proj;
              openLightboxCarousel(freshProj, 0);
            });
            
            gridContainer.appendChild(card);
          });
          
          // If in Admin Mode, append the glassmorphic "+ Add Project" card slot at the end
          if (isAdminActive) {
            const addCard = document.createElement('div');
            addCard.className = 'portfolio-item admin-add-project-card reveal active';
            addCard.innerHTML = `
              <div class="portfolio-add-project-inner">
                <ion-icon name="add-circle-outline"></ion-icon>
                <span>+ Add Project</span>
              </div>
            `;
            addCard.addEventListener('click', (e) => {
              e.preventDefault();
              openModal(dashboardModal);
              const imagesTabBtn = document.querySelector('[data-tab="tab-images"]');
              if (imagesTabBtn) imagesTabBtn.click();
              const creatorContainer = document.getElementById('admin-new-project-form-container');
              if (creatorContainer) {
                creatorContainer.style.display = 'block';
                creatorContainer.scrollIntoView({ behavior: 'smooth' });
                const titleInput = document.getElementById('new-proj-title');
                if (titleInput) titleInput.focus();
              }
            });
            gridContainer.appendChild(addCard);
          }
        }
      };

      if (saved) {
        try {
          const data = JSON.parse(saved);
          render(data);
          resolve(data);
        } catch (e) {
          console.error("Local config parse failed. Loading defaults.", e);
          localStorage.setItem('creative_interiors_admin_content', JSON.stringify(DEFAULT_CONFIG));
          render(DEFAULT_CONFIG);
          resolve(DEFAULT_CONFIG);
        }
      } else {
        // Fetch config.json dynamically
        fetch('./config.json')
          .then(res => res.json())
          .then(data => {
            localStorage.setItem('creative_interiors_admin_content', JSON.stringify(data));
            render(data);
            logSystemEvent("Initialized site configurations from server config.json file successfully");
            resolve(data);
          })
          .catch(err => {
            console.warn("AJAX fetch failed (CORS block under local file:// protocol). Hydrating static replica.", err);
            localStorage.setItem('creative_interiors_admin_content', JSON.stringify(DEFAULT_CONFIG));
            render(DEFAULT_CONFIG);
            logSystemEvent("Initialized site configurations from static fallback replica database successfully");
            resolve(DEFAULT_CONFIG);
          });
      }
    });
  };

  // Run Hydration instantly on load
  hydrateWebsite();

  // Reference elements
  const adminTrigger = document.getElementById('admin-portal-trigger');
  const loginModal = document.getElementById('admin-login-modal');
  const dashboardModal = document.getElementById('admin-dashboard-modal');
  const mediaModal = document.getElementById('admin-media-modal');
  
  const loginForm = document.getElementById('admin-login-form');
  const dashboardForm = document.getElementById('admin-dashboard-form');
  const mediaForm = document.getElementById('admin-media-form');
  
  const loginClose = document.getElementById('admin-login-close');
  const dashboardClose = document.getElementById('admin-dashboard-close');
  const mediaClose = document.getElementById('admin-media-close');
  const loginError = document.getElementById('admin-login-error');
  
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  // Floating Control Bar elements
  const adminControlBar = document.getElementById('admin-control-bar');
  const saveBtn = document.getElementById('admin-bar-save');
  const resetBtn = document.getElementById('admin-bar-reset');
  const exportBtn = document.getElementById('admin-bar-export');
  const logoutBtn = document.getElementById('admin-bar-logout');

  // Forgot password & security recovery elements
  const forgotPwLink = document.getElementById('admin-forgot-pw-link');
  const backToLogin = document.getElementById('admin-back-to-login');
  const loginContainer = document.getElementById('admin-login-container');
  const recoveryContainer = document.getElementById('admin-recovery-container');
  const recoveryForm = document.getElementById('admin-recovery-form');
  const recoveryQuestionLabel = document.getElementById('admin-recovery-question');
  const recoveryError = document.getElementById('admin-recovery-error');
  const recoverySuccess = document.getElementById('admin-recovery-success');
  const recoveredPassword = document.getElementById('admin-recovered-password');

  // Modal actions
  const openModal = (modal) => {
    if (!modal) return;
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = (modal) => {
    if (!modal) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    if (!loginModal.classList.contains('active') && 
        !dashboardModal.classList.contains('active') && 
        !mediaModal.classList.contains('active')) {
      document.body.style.overflow = '';
    }
  };

  // Bind Admin portal modal toggles
  if (adminTrigger) {
    adminTrigger.addEventListener('click', (e) => {
      e.preventDefault();
      openModal(loginModal);
      if (loginError) loginError.style.display = 'none';
      if (loginForm) loginForm.reset();
      
      // Reset recovery screen back to login screen initially
      if (loginContainer) loginContainer.style.display = 'block';
      if (recoveryContainer) recoveryContainer.style.display = 'none';
    });
  }

  if (loginClose) loginClose.addEventListener('click', () => closeModal(loginModal));
  if (dashboardClose) dashboardClose.addEventListener('click', () => closeModal(dashboardModal));
  if (mediaClose) mediaClose.addEventListener('click', () => closeModal(mediaModal));

  window.addEventListener('click', (e) => {
    if (e.target === loginModal) closeModal(loginModal);
    if (e.target === dashboardModal) closeModal(dashboardModal);
    if (e.target === mediaModal) closeModal(mediaModal);
  });

  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTab = btn.getAttribute('data-tab');
      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetContent = document.getElementById(targetTab);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Authenticate Admin credentials
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('admin-username').value.trim();
      const password = document.getElementById('admin-password').value;
      
      const saved = localStorage.getItem('creative_interiors_admin_content');
      const data = saved ? JSON.parse(saved) : DEFAULT_CONFIG;
      
      const targetUser = data.username || "admin";
      const targetPass = data.password || "Srilavanya@23";

      if (username === targetUser && password === targetPass) {
        closeModal(loginModal);
        enableAdminMode();
        logSystemEvent("Admin authentication successful");
      } else {
        if (loginError) loginError.style.display = 'block';
        logSystemEvent(`Admin login failed: Invalid credentials entered for user '${username}'`);
      }
    });
  }

  // Forgot password flow
  if (forgotPwLink) {
    forgotPwLink.addEventListener('click', (e) => {
      e.preventDefault();
      const saved = localStorage.getItem('creative_interiors_admin_content');
      const data = saved ? JSON.parse(saved) : DEFAULT_CONFIG;

      const question = data.forgot_password_question || "What is the name of the founder and CEO of Creative Interiors?";
      
      if (recoveryQuestionLabel) {
        recoveryQuestionLabel.innerHTML = `<strong>Security Question:</strong><br>${question}`;
      }

      if (recoveryError) recoveryError.style.display = 'none';
      if (recoverySuccess) recoverySuccess.style.display = 'none';
      if (recoveryForm) recoveryForm.reset();

      if (loginContainer) loginContainer.style.display = 'none';
      if (recoveryContainer) recoveryContainer.style.display = 'block';
      logSystemEvent("Password recovery security modal opened");
    });
  }

  if (backToLogin) {
    backToLogin.addEventListener('click', (e) => {
      e.preventDefault();
      if (recoveryContainer) recoveryContainer.style.display = 'none';
      if (loginContainer) loginContainer.style.display = 'block';
    });
  }

  if (recoveryForm) {
    recoveryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const ans = document.getElementById('admin-recovery-answer').value.trim().toLowerCase().replace(/\s+/g, ' ');
      
      const saved = localStorage.getItem('creative_interiors_admin_content');
      const data = saved ? JSON.parse(saved) : DEFAULT_CONFIG;
      
      const targetAns = (data.forgot_password_answer || "Balivada Ravi Kumar").trim().toLowerCase().replace(/\s+/g, ' ');
      const activePass = data.password || "Srilavanya@23";

      if (ans === targetAns) {
        if (recoveryError) recoveryError.style.display = 'none';
        if (recoverySuccess) {
          recoverySuccess.style.display = 'block';
          recoveredPassword.textContent = activePass;
        }
        logSystemEvent("Password recovery answer validated successfully");
      } else {
        if (recoveryError) recoveryError.style.display = 'block';
        if (recoverySuccess) recoverySuccess.style.display = 'none';
        logSystemEvent("Password recovery validation failed: Incorrect answer entered");
      }
    });
  }

  // Live Password confirm validation listener
  const editAdminPass = document.getElementById('edit-admin-password');
  const editAdminPassConf = document.getElementById('edit-admin-password-confirm');
  const passSyncMsg = document.getElementById('admin-password-sync-msg');

  const checkPasswordMatch = () => {
    if (!editAdminPass || !editAdminPassConf || !passSyncMsg) return;
    const p1 = editAdminPass.value;
    const p2 = editAdminPassConf.value;

    if (!p1 && !p2) {
      passSyncMsg.style.display = 'none';
      return;
    }

    passSyncMsg.style.display = 'block';
    if (p1 === p2) {
      passSyncMsg.className = 'password-match';
      passSyncMsg.textContent = '✓ Passwords match perfectly!';
    } else {
      passSyncMsg.className = 'password-mismatch';
      passSyncMsg.textContent = '✗ Passwords do not match yet.';
    }
  };

  if (editAdminPass) editAdminPass.addEventListener('input', checkPasswordMatch);
  if (editAdminPassConf) editAdminPassConf.addEventListener('input', checkPasswordMatch);

  // Enable visual Admin edit mode
  const enableAdminMode = () => {
    isAdminActive = true;
    document.body.classList.add('admin-mode-active');
    if (adminControlBar) adminControlBar.style.display = 'block';
    
    // Set text elements to contenteditable
    const textElements = [
      { id: 'main-headline', key: 'hero_title' },
      { id: 'sub-headline', key: 'hero_desc' },
      { id: 'about-tag', key: 'about_tag' },
      { id: 'about-title', key: 'about_title' },
      { id: 'about-desc1-val', key: 'about_desc_1' },
      { id: 'about-desc2-val', key: 'about_desc_2' },
      { id: 'contact-address-val', key: 'address' },
      { id: 'contact-phone-val', key: 'phone' },
      { id: 'contact-email-val', key: 'email' },
      { id: 'booking-title-val', key: 'booking_title' },
      { id: 'booking-desc-val', key: 'booking_desc' },
      { id: 'footer-firm-desc', key: 'footer_desc' }
    ];
    
    textElements.forEach(item => {
      const el = document.getElementById(item.id);
      if (el) {
        el.setAttribute('contenteditable', 'true');
      }
    });

    // Testimonial slides contenteditable
    document.querySelectorAll('.testimonial-slide').forEach(slide => {
      const quote = slide.querySelector('.testimonial-quote');
      const author = slide.querySelector('.testimonial-author');
      const role = slide.querySelector('.testimonial-role');
      if (quote) quote.setAttribute('contenteditable', 'true');
      if (author) author.setAttribute('contenteditable', 'true');
      if (role) role.setAttribute('contenteditable', 'true');
    });

    // Social icons editing button triggers
    document.querySelectorAll('.footer-socials a').forEach(a => {
      a.addEventListener('click', (e) => {
        if (isAdminActive) {
          e.preventDefault();
          openModal(dashboardModal);
          // Focus the contact tab and highlight the social links
          const contactTabBtn = document.querySelector('[data-tab="tab-contact"]');
          if (contactTabBtn) contactTabBtn.click();
          const instaInput = document.getElementById('edit-social-instagram');
          if (instaInput) instaInput.focus();
        }
      });
    });

    // Inject Media overlays
    injectMediaOverlays();
    
    // Fill Dashboard forms
    populateDashboardForms();

    // Open control modal instantly to greet admin
    openModal(dashboardModal);
    
    logSystemEvent("Admin edit mode activated visually");
  };

  // Exit Admin edit mode
  const disableAdminMode = () => {
    isAdminActive = false;
    document.body.classList.remove('admin-mode-active');
    if (adminControlBar) adminControlBar.style.display = 'none';
    
    // Remove contenteditable
    document.querySelectorAll('[contenteditable="true"]').forEach(el => {
      el.setAttribute('contenteditable', 'false');
    });

    // Clean overlays
    document.querySelectorAll('.admin-media-overlay').forEach(el => el.remove());
    logSystemEvent("Admin edit mode deactivated");
  };

  // Fill forms inside Dashboard
  const populateDashboardForms = () => {
    const saved = localStorage.getItem('creative_interiors_admin_content');
    const data = saved ? JSON.parse(saved) : DEFAULT_CONFIG;

    // Contact info & Socials
    document.getElementById('edit-address').value = data.contact?.address || '';
    document.getElementById('edit-phone').value = data.contact?.phone || '';
    document.getElementById('edit-email').value = data.contact?.email || '';
    document.getElementById('edit-social-instagram').value = data.contact?.instagram || '';
    document.getElementById('edit-social-pinterest').value = data.contact?.pinterest || '';
    document.getElementById('edit-social-linkedin').value = data.contact?.linkedin || '';
    document.getElementById('edit-social-facebook').value = data.contact?.facebook || '';

    // Testimonials
    data.testimonials?.forEach((test, idx) => {
      const q = document.getElementById(`edit-t${idx+1}-quote`);
      const a = document.getElementById(`edit-t${idx+1}-author`);
      const r = document.getElementById(`edit-t${idx+1}-role`);
      if (q) q.value = test.quote || '';
      if (a) a.value = test.author || '';
      if (r) r.value = test.role || '';
    });

    // Images
    document.getElementById('edit-slider-before').value = data.slider?.before || '';
    document.getElementById('edit-slider-after').value = data.slider?.after || '';
    
    // Dynamic Portfolio Projects Hydrator
    const projectsEditList = document.getElementById('admin-projects-edit-list');
    if (projectsEditList && data.projects) {
      projectsEditList.innerHTML = '';
      
      data.projects.forEach((proj) => {
        const item = document.createElement('div');
        item.className = 'admin-card';
        item.style.marginTop = '1rem';
        item.style.borderLeft = '4px solid var(--color-accent-gold)';
        
        // Gallery items
        const gallery = proj.gallery || [{ src: proj.image, type: proj.type }];
        let galleryHTML = '';
        
        gallery.forEach((gItem, gIdx) => {
          const isGVideo = gItem.type === 'video' || gItem.src.endsWith('.mp4') || gItem.src.includes('data:video');
          let thumbMarkup = '';
          if (isGVideo) {
            thumbMarkup = `
              <video src="${gItem.src}" muted></video>
              <div style="position: absolute; bottom: 2px; right: 2px; background: rgba(0,0,0,0.6); color: #fff; font-size: 0.6rem; padding: 1px 3px; border-radius: 2px; display: flex; align-items: center; gap: 2px;">
                <ion-icon name="videocam-outline"></ion-icon>
              </div>
            `;
          } else {
            thumbMarkup = `<img src="${gItem.src}" alt="Thumb">`;
          }
          
          galleryHTML += `
            <div class="admin-gallery-item-thumb">
              ${thumbMarkup}
              <button type="button" class="admin-gallery-item-delete" onclick="window.deleteGalleryItem('${proj.id}', ${gIdx})" title="Delete media">
                <ion-icon name="trash-outline"></ion-icon>
              </button>
            </div>
          `;
        });
        
        // Add Media Card slot
        galleryHTML += `
          <button type="button" class="admin-gallery-add-item-card" onclick="window.triggerGalleryMediaUpload('${proj.id}')" title="Add image or video file">
            <ion-icon name="add-outline"></ion-icon>
            <span>+ Media</span>
          </button>
        `;
        
        const isProjVideo = proj.type === 'video';
        
        item.innerHTML = `
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
            <h5 style="margin: 0; font-family: var(--font-serif); font-size: 1.15rem; color: var(--color-text-primary); font-weight: 500;">Project Details</h5>
            <button type="button" class="btn" style="background: none; border: none; color: #d9534f; cursor: pointer; padding: 0; min-width: auto; text-transform: none; letter-spacing: 0; font-size: 0.8rem; font-weight: 500; display: flex; align-items: center; gap: 4px;" onclick="window.deleteProject('${proj.id}')">
              <ion-icon name="trash-outline" style="font-size: 1rem;"></ion-icon> Delete Project
            </button>
          </div>
          
          <div class="admin-form-group">
            <label>Project Title</label>
            <input type="text" class="admin-input edit-proj-title" data-id="${proj.id}" value="${proj.title}" required>
          </div>
          
          <div class="admin-form-group-row" style="grid-template-columns: 1fr 1fr; gap: 1rem;">
            <div class="admin-form-group">
              <label>Category</label>
              <select class="admin-input edit-proj-cat" data-id="${proj.id}" style="padding: 0.85rem;">
                <option value="living" ${proj.category === 'living' ? 'selected' : ''}>Living Rooms</option>
                <option value="kitchen" ${proj.category === 'kitchen' ? 'selected' : ''}>Kitchens</option>
                <option value="bedroom" ${proj.category === 'bedroom' ? 'selected' : ''}>Bedrooms</option>
                <option value="office" ${proj.category === 'office' ? 'selected' : ''}>Commercial</option>
              </select>
            </div>
            
            <div class="admin-form-group">
              <label>Cover Media Type</label>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-top: 0.2rem;">
                <div class="option-box" style="border: 1px solid var(--color-border); padding: 0.6rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; background: var(--color-surface-white);">
                  <input type="radio" id="edit-proj-type-img-${proj.id}" name="edit-proj-type-${proj.id}" value="image" ${!isProjVideo ? 'checked' : ''} style="cursor: pointer;">
                  <label for="edit-proj-type-img-${proj.id}" style="cursor: pointer; margin: 0; font-size: 0.8rem; height: auto;">Image</label>
                </div>
                <div class="option-box" style="border: 1px solid var(--color-border); padding: 0.6rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; background: var(--color-surface-white);">
                  <input type="radio" id="edit-proj-type-vid-${proj.id}" name="edit-proj-type-${proj.id}" value="video" ${isProjVideo ? 'checked' : ''} style="cursor: pointer;">
                  <label for="edit-proj-type-vid-${proj.id}" style="cursor: pointer; margin: 0; font-size: 0.8rem; height: auto;">Video</label>
                </div>
              </div>
            </div>
          </div>
          
          <div class="admin-form-group" style="margin-top: 1rem;">
            <label>Cover Media Path or URL</label>
            <input type="text" class="admin-input edit-proj-img" data-id="${proj.id}" value="${proj.image}" required>
          </div>
          
          <div style="margin-top: 1.5rem;">
            <label style="display: block; font-weight: 500; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-secondary); margin-bottom: 0.5rem;">Sub-Gallery Media Manager</label>
            <div class="admin-gallery-list">
              ${galleryHTML}
            </div>
          </div>
        `;
        projectsEditList.appendChild(item);
      });
    }

    // Site Descriptions
    document.getElementById('edit-hero-title').value = data.descriptions?.hero_title || '';
    document.getElementById('edit-hero-desc').value = data.descriptions?.hero_desc || '';
    document.getElementById('edit-about-tag').value = data.descriptions?.about_tag || '';
    document.getElementById('edit-about-title').value = data.descriptions?.about_title || '';
    document.getElementById('edit-about-desc1').value = data.descriptions?.about_desc_1 || '';
    document.getElementById('edit-about-desc2').value = data.descriptions?.about_desc_2 || '';
    document.getElementById('edit-booking-title').value = data.descriptions?.booking_title || '';
    document.getElementById('edit-booking-desc').value = data.descriptions?.booking_desc || '';
    document.getElementById('edit-footer-desc').value = data.descriptions?.footer_desc || '';

    // Security
    document.getElementById('edit-admin-password').value = '';
    document.getElementById('edit-admin-password-confirm').value = '';
    if (passSyncMsg) passSyncMsg.style.display = 'none';

    document.getElementById('edit-security-question').value = data.forgot_password_question || '';
    document.getElementById('edit-security-answer').value = data.forgot_password_answer || '';

    // Hydrate Leads & Notification Log Tables
    hydrateNotificationLogs();
  };

  // Expose callbacks globally for dynamic uploader and managers
  window.deleteProject = (id) => {
    const saved = localStorage.getItem('creative_interiors_admin_content');
    const data = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    const index = data.projects.findIndex(p => p.id === id);
    if (index !== -1) {
      const proj = data.projects[index];
      data.projects.splice(index, 1);
      localStorage.setItem('creative_interiors_admin_content', JSON.stringify(data));
      hydrateWebsite();
      populateDashboardForms();
      logSystemEvent(`Portfolio project "${proj.title}" deleted manually`);
    }
  };

  window.deleteGalleryItem = (projectId, mediaIndex) => {
    const saved = localStorage.getItem('creative_interiors_admin_content');
    const data = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    const proj = data.projects.find(p => p.id === projectId);
    if (proj && proj.gallery && proj.gallery[mediaIndex]) {
      const item = proj.gallery[mediaIndex];
      proj.gallery.splice(mediaIndex, 1);
      localStorage.setItem('creative_interiors_admin_content', JSON.stringify(data));
      hydrateWebsite();
      populateDashboardForms();
      logSystemEvent(`Sub-gallery item [${item.type}] deleted from project "${proj.title}"`);
    }
  };

  window.triggerGalleryMediaUpload = (projectId) => {
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'file';
    hiddenInput.accept = 'image/*,video/*';
    hiddenInput.style.display = 'none';
    
    hiddenInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const saved = localStorage.getItem('creative_interiors_admin_content');
        const data = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        const proj = data.projects.find(p => p.id === projectId);
        if (proj) {
          if (!proj.gallery) proj.gallery = [];
          const type = file.type.startsWith('video') ? 'video' : 'image';
          proj.gallery.push({
            src: event.target.result,
            type: type
          });
          localStorage.setItem('creative_interiors_admin_content', JSON.stringify(data));
          hydrateWebsite();
          populateDashboardForms();
          logSystemEvent(`Uploaded new local sub-gallery asset to project "${proj.title}" successfully`);
        }
      };
      reader.onerror = () => {
        alert('Failed to read media file.');
      };
      reader.readAsDataURL(file);
    });
    
    document.body.appendChild(hiddenInput);
    hiddenInput.click();
    hiddenInput.remove();
  };

  // Populate dynamic lead notification tables
  const hydrateNotificationLogs = () => {
    // 1. Consultation Inquiries (Leads)
    const rawLeads = localStorage.getItem('creative_interiors_inquiries_log');
    const leads = rawLeads ? JSON.parse(rawLeads) : [];
    const leadsBody = document.querySelector('#inquiries-log-table tbody');
    
    if (leadsBody) {
      leadsBody.innerHTML = '';
      if (leads.length === 0) {
        leadsBody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--color-text-muted); font-style: italic;">No customer inquiry notifications logged yet.</td></tr>`;
      } else {
        leads.forEach((lead, idx) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="timestamp-col">${lead.time}</td>
            <td>
              <strong style="color: var(--color-text-primary); font-size: 0.9rem;">${lead.name}</strong><br>
              <a href="mailto:${lead.email}" style="color: var(--color-accent-gold); text-decoration: none;">${lead.email}</a><br>
              <span style="font-size: 0.8rem; color: var(--color-text-muted);">${lead.phone}</span>
            </td>
            <td>${lead.location}</td>
            <td><span style="background: rgba(197,168,128,0.15); color: var(--color-accent-gold-hover); padding: 2px 6px; font-size: 0.75rem; border-radius: 2px;">${lead.style}</span></td>
            <td><strong style="color: var(--color-text-primary);">${lead.budget}</strong></td>
            <td style="max-width: 200px; font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis;" title="${lead.message}">${lead.message}</td>
            <td class="action-col">
              <button type="button" class="delete-btn" data-type="lead" data-idx="${idx}" aria-label="Delete inquiry log"><ion-icon name="trash-outline"></ion-icon></button>
            </td>
          `;
          leadsBody.appendChild(row);
        });
      }
    }

    // 2. Newsletter Subscriptions
    const rawSubs = localStorage.getItem('creative_interiors_subscriptions_log');
    const subs = rawSubs ? JSON.parse(rawSubs) : [];
    const subsBody = document.querySelector('#subs-log-table tbody');

    if (subsBody) {
      subsBody.innerHTML = '';
      if (subs.length === 0) {
        subsBody.innerHTML = `<tr><td colspan="3" style="text-align: center; color: var(--color-text-muted); font-style: italic;">No newsletter subscription notifications logged.</td></tr>`;
      } else {
        subs.forEach((sub, idx) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="timestamp-col">${sub.time}</td>
            <td><a href="mailto:${sub.email}" style="color: var(--color-accent-gold); text-decoration: none;">${sub.email}</a></td>
            <td class="action-col">
              <button type="button" class="delete-btn" data-type="sub" data-idx="${idx}" aria-label="Delete subscription log"><ion-icon name="trash-outline"></ion-icon></button>
            </td>
          `;
          subsBody.appendChild(row);
        });
      }
    }

    // 3. System Audit logs
    const rawAudits = localStorage.getItem('creative_interiors_audit_log');
    const audits = rawAudits ? JSON.parse(rawAudits) : [];
    const auditsBody = document.querySelector('#audits-log-table tbody');

    if (auditsBody) {
      auditsBody.innerHTML = '';
      if (audits.length === 0) {
        auditsBody.innerHTML = `<tr><td colspan="2" style="text-align: center; color: var(--color-text-muted); font-style: italic;">No system logs recorded.</td></tr>`;
      } else {
        audits.forEach((aud) => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="timestamp-col">${aud.time}</td>
            <td style="color: var(--color-text-secondary); font-size: 0.8rem;">${aud.detail}</td>
          `;
          auditsBody.appendChild(row);
        });
      }
    }

    // Attach dynamic delete listeners
    document.querySelectorAll('.admin-log-table .delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const type = btn.getAttribute('data-type');
        const index = parseInt(btn.getAttribute('data-idx'), 10);
        deleteSingleLogItem(type, index);
      });
    });
  };

  // Delete single item from log
  const deleteSingleLogItem = (type, index) => {
    if (type === 'lead') {
      const raw = localStorage.getItem('creative_interiors_inquiries_log');
      const leads = raw ? JSON.parse(raw) : [];
      const item = leads[index];
      leads.splice(index, 1);
      localStorage.setItem('creative_interiors_inquiries_log', JSON.stringify(leads));
      logSystemEvent(`Inquiry lead from '${item?.name || 'Unknown'}' deleted manually`);
    } else if (type === 'sub') {
      const raw = localStorage.getItem('creative_interiors_subscriptions_log');
      const subs = raw ? JSON.parse(raw) : [];
      const item = subs[index];
      subs.splice(index, 1);
      localStorage.setItem('creative_interiors_subscriptions_log', JSON.stringify(subs));
      logSystemEvent(`Newsletter subscription for email '${item?.email || 'Unknown'}' deleted manually`);
    }
    hydrateNotificationLogs();
  };

  // Bind log clearing buttons
  const clearInqBtn = document.getElementById('admin-clear-inquiries');
  if (clearInqBtn) {
    clearInqBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all consultation inquiries?')) {
        localStorage.removeItem('creative_interiors_inquiries_log');
        logSystemEvent("All consultation inquiries cleared from logs");
        hydrateNotificationLogs();
      }
    });
  }

  const clearSubsBtn = document.getElementById('admin-clear-subs');
  if (clearSubsBtn) {
    clearSubsBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all newsletter subscriptions?')) {
        localStorage.removeItem('creative_interiors_subscriptions_log');
        logSystemEvent("All newsletter subscriptions cleared from logs");
        hydrateNotificationLogs();
      }
    });
  }

  const clearAuditsBtn = document.getElementById('admin-clear-audits');
  if (clearAuditsBtn) {
    clearAuditsBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to clear all audit trails?')) {
        localStorage.removeItem('creative_interiors_audit_log');
        logSystemEvent("Audit logs database cleared manually");
        hydrateNotificationLogs();
      }
    });
  }

  // Inline media overlays changing
  const injectMediaOverlays = () => {
    const mediaTargets = [
      { selector: '.hero-bg', key: 'hero_bg' },
      { selector: '.about-img-wrapper.primary', key: 'about_primary' },
      { selector: '.about-img-wrapper.secondary', key: 'about_secondary' },
      { selector: '.slider-img-before', key: 'slider_before' },
      { selector: '.slider-img-after', key: 'slider_after' }
    ];

    mediaTargets.forEach(target => {
      const container = document.querySelector(target.selector);
      if (!container) return;

      container.classList.add('admin-media-editable');
      if (container.querySelector('.admin-media-overlay')) return;

      const overlay = document.createElement('div');
      overlay.className = 'admin-media-overlay';
      overlay.innerHTML = `
        <button type="button" class="admin-media-btn">
          <ion-icon name="cloud-upload-outline"></ion-icon> Change Media
        </button>
      `;

      container.appendChild(overlay);

      overlay.querySelector('.admin-media-btn').addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        openMediaChanger(target);
      });
    });
  };

  // Media changer popup
  const openMediaChanger = (target) => {
    openModal(mediaModal);
    document.getElementById('edit-media-target-id').value = target.key;
    document.getElementById('edit-media-file').value = '';
    
    const saved = localStorage.getItem('creative_interiors_admin_content');
    const data = saved ? JSON.parse(saved) : DEFAULT_CONFIG;
    
    let currentPath = '';
    if (target.key === 'hero_bg') currentPath = data.descriptions?.hero_bg || '';
    else if (target.key === 'about_primary') currentPath = data.descriptions?.about_primary || '';
    else if (target.key === 'about_secondary') currentPath = data.descriptions?.about_secondary || '';
    else if (target.key === 'slider_before') currentPath = data.slider?.before || '';
    else if (target.key === 'slider_after') currentPath = data.slider?.after || '';

    const isVideo = currentPath.endsWith('.mp4') || currentPath.includes('data:video');
    if (isVideo) {
      document.getElementById('media-type-video').checked = true;
    } else {
      document.getElementById('media-type-image').checked = true;
    }
    
    document.getElementById('edit-media-url').value = currentPath.startsWith('data:') ? 'Local compressed asset active' : currentPath;
  };

  // Media changer form submit handler
  if (mediaForm) {
    mediaForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const targetKey = document.getElementById('edit-media-target-id').value;
      const sourceType = document.querySelector('input[name="media-source-type"]:checked').value;
      const fileInput = document.getElementById('edit-media-file');
      const urlInput = document.getElementById('edit-media-url');
      const file = fileInput.files[0];
      
      const applyAndSave = (srcVal) => {
        const saved = localStorage.getItem('creative_interiors_admin_content');
        const data = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_CONFIG));
        
        if (targetKey === 'hero_bg') data.descriptions.hero_bg = srcVal;
        else if (targetKey === 'about_primary') data.descriptions.about_primary = srcVal;
        else if (targetKey === 'about_secondary') data.descriptions.about_secondary = srcVal;
        else if (targetKey === 'slider_before') data.slider.before = srcVal;
        else if (targetKey === 'slider_after') data.slider.after = srcVal;
        
        localStorage.setItem('creative_interiors_admin_content', JSON.stringify(data));
        hydrateWebsite();
        closeModal(mediaModal);
        
        logSystemEvent(`Media asset '${targetKey}' updated successfully`);
        
        setTimeout(() => injectMediaOverlays(), 100);
      };
      
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          applyAndSave(event.target.result);
        };
        reader.onerror = () => {
          alert('Failed to read local file.');
        };
        reader.readAsDataURL(file);
      } else {
        const urlVal = urlInput.value.trim();
        if (urlVal && urlVal !== 'Local compressed asset active') {
          applyAndSave(urlVal);
        } else {
          alert('Please select a local file to upload or enter a web URL/relative path.');
        }
      }
    });
  }

  // Project creator handles inside Tab 3 Images
  const addProjectBtn = document.getElementById('admin-add-new-project-btn');
  const cancelProjectBtn = document.getElementById('admin-cancel-new-project');
  const submitProjectBtn = document.getElementById('admin-submit-new-project');
  const newProjectFormContainer = document.getElementById('admin-new-project-form-container');

  if (addProjectBtn && newProjectFormContainer) {
    addProjectBtn.addEventListener('click', () => {
      newProjectFormContainer.style.display = 'block';
      const titleInput = document.getElementById('new-proj-title');
      if (titleInput) titleInput.focus();
    });
  }

  if (cancelProjectBtn && newProjectFormContainer) {
    cancelProjectBtn.addEventListener('click', () => {
      newProjectFormContainer.style.display = 'none';
      document.getElementById('new-proj-title').value = '';
      document.getElementById('new-proj-image').value = '';
      document.getElementById('new-proj-type-image').checked = true;
    });
  }

  if (submitProjectBtn && newProjectFormContainer) {
    submitProjectBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const titleVal = document.getElementById('new-proj-title').value.trim();
      const catVal = document.getElementById('new-proj-category').value;
      const imgVal = document.getElementById('new-proj-image').value.trim() || 'assets/portfolio_living.png';
      const typeVal = document.querySelector('input[name="new-proj-media-type"]:checked').value;

      if (!titleVal) {
        alert('Please enter a valid title for the new project.');
        return;
      }

      const saved = localStorage.getItem('creative_interiors_admin_content');
      const data = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_CONFIG));

      const newProjId = 'proj-' + Date.now();
      const newProjObj = {
        id: newProjId,
        category: catVal,
        title: titleVal,
        image: imgVal,
        type: typeVal,
        gallery: [
          { src: imgVal, type: typeVal }
        ]
      };

      data.projects.push(newProjObj);
      localStorage.setItem('creative_interiors_admin_content', JSON.stringify(data));
      
      document.getElementById('new-proj-title').value = '';
      document.getElementById('new-proj-image').value = '';
      document.getElementById('new-proj-type-image').checked = true;
      newProjectFormContainer.style.display = 'none';

      hydrateWebsite();
      populateDashboardForms();
      
      logSystemEvent(`Created new portfolio project "${titleVal}" successfully`);
      alert(`Project "${titleVal}" added to portfolio showcase successfully!`);
    });
  }

  // Dashboard modal submission sync
  if (dashboardForm) {
    dashboardForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const saved = localStorage.getItem('creative_interiors_admin_content');
      const data = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_CONFIG));

      // 1. Check administrative password update
      const newPass = document.getElementById('edit-admin-password').value;
      const confirmPass = document.getElementById('edit-admin-password-confirm').value;
      
      if (newPass) {
        if (newPass === confirmPass) {
          data.password = newPass;
          logSystemEvent("Admin access password updated successfully");
        } else {
          alert("Passwords do not match. Please verify your new administrative password.");
          return;
        }
      }

      // 2. Sync Contact & Socials
      data.contact = {
        address: document.getElementById('edit-address').value.trim(),
        phone: document.getElementById('edit-phone').value.trim(),
        email: document.getElementById('edit-email').value.trim(),
        instagram: document.getElementById('edit-social-instagram').value.trim(),
        pinterest: document.getElementById('edit-social-pinterest').value.trim(),
        linkedin: document.getElementById('edit-social-linkedin').value.trim(),
        facebook: document.getElementById('edit-social-facebook').value.trim()
      };

      // 3. Sync Testimonials
      data.testimonials = [
        {
          quote: document.getElementById('edit-t1-quote').value.trim(),
          author: document.getElementById('edit-t1-author').value.trim(),
          role: document.getElementById('edit-t1-role').value.trim()
        },
        {
          quote: document.getElementById('edit-t2-quote').value.trim(),
          author: document.getElementById('edit-t2-author').value.trim(),
          role: document.getElementById('edit-t2-role').value.trim()
        },
        {
          quote: document.getElementById('edit-t3-quote').value.trim(),
          author: document.getElementById('edit-t3-author').value.trim(),
          role: document.getElementById('edit-t3-role').value.trim()
        }
      ];

      // 4. Sync Slider Images
      data.slider = {
        before: document.getElementById('edit-slider-before').value.trim(),
        after: document.getElementById('edit-slider-after').value.trim()
      };

      // 5. Dynamic Sync of Projects Metadata from inputs
      data.projects = data.projects.map(proj => {
        const titleInput = document.querySelector(`.edit-proj-title[data-id="${proj.id}"]`);
        const catSelect = document.querySelector(`.edit-proj-cat[data-id="${proj.id}"]`);
        const imgInput = document.querySelector(`.edit-proj-img[data-id="${proj.id}"]`);
        const typeSelect = document.querySelector(`input[name="edit-proj-type-${proj.id}"]:checked`);
        
        return {
          ...proj,
          title: titleInput ? titleInput.value.trim() : proj.title,
          category: catSelect ? catSelect.value : proj.category,
          image: imgInput ? imgInput.value.trim() : proj.image,
          type: typeSelect ? typeSelect.value : proj.type
        };
      });

      // 6. Sync Site Descriptions
      data.descriptions = {
        hero_title: document.getElementById('edit-hero-title').value.trim(),
        hero_desc: document.getElementById('edit-hero-desc').value.trim(),
        about_tag: document.getElementById('edit-about-tag').value.trim(),
        about_title: document.getElementById('edit-about-title').value.trim(),
        about_desc_1: document.getElementById('edit-about-desc1').value.trim(),
        about_desc_2: document.getElementById('edit-about-desc2').value.trim(),
        booking_title: document.getElementById('edit-booking-title').value.trim(),
        booking_desc: document.getElementById('edit-booking-desc').value.trim(),
        footer_desc: document.getElementById('edit-footer-desc').value.trim(),
        hero_bg: data.descriptions?.hero_bg || '',
        about_primary: data.descriptions?.about_primary || '',
        about_secondary: data.descriptions?.about_secondary || ''
      };

      // 7. Security Questions
      data.forgot_password_question = document.getElementById('edit-security-question').value.trim();
      data.forgot_password_answer = document.getElementById('edit-security-answer').value.trim();

      // Save database
      localStorage.setItem('creative_interiors_admin_content', JSON.stringify(data));
      
      // Hydrate views
      hydrateWebsite();
      
      logSystemEvent("Admin dashboard configuration updated successfully");
      
      closeModal(dashboardModal);
      alert('All website edits and settings applied successfully!');
    });
  }

  // Floating Control Bar Save sync (syncs contenteditable inline texts)
  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const saved = localStorage.getItem('creative_interiors_admin_content');
      const data = saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(DEFAULT_CONFIG));

      // Sync inline texts
      const textElements = [
        { id: 'main-headline', key: 'hero_title', parent: 'descriptions', isHTML: true },
        { id: 'sub-headline', key: 'hero_desc', parent: 'descriptions' },
        { id: 'about-tag', key: 'about_tag', parent: 'descriptions' },
        { id: 'about-title', key: 'about_title', parent: 'descriptions', isHTML: true },
        { id: 'about-desc1-val', key: 'about_desc_1', parent: 'descriptions' },
        { id: 'about-desc2-val', key: 'about_desc_2', parent: 'descriptions' },
        { id: 'booking-title-val', key: 'booking_title', parent: 'descriptions', isHTML: true },
        { id: 'booking-desc-val', key: 'booking_desc', parent: 'descriptions' },
        { id: 'footer-firm-desc', key: 'footer_desc', parent: 'descriptions' },
        
        { id: 'contact-address-val', key: 'address', parent: 'contact' },
        { id: 'contact-phone-val', key: 'phone', parent: 'contact' },
        { id: 'contact-email-val', key: 'email', parent: 'contact' }
      ];

      textElements.forEach(item => {
        const el = document.getElementById(item.id);
        if (el) {
          const val = item.isHTML ? el.innerHTML : el.textContent.trim();
          if (item.parent === 'descriptions') data.descriptions[item.key] = val;
          else if (item.parent === 'contact') data.contact[item.key] = val;
        }
      });

      // Testimonials inline sync
      document.querySelectorAll('.testimonial-slide').forEach((slide, index) => {
        const quote = slide.querySelector('.testimonial-quote');
        const author = slide.querySelector('.testimonial-author');
        const role = slide.querySelector('.testimonial-role');
        
        if (data.testimonials && data.testimonials[index]) {
          if (quote) data.testimonials[index].quote = quote.textContent.trim().replace(/^"|"$/g, '');
          if (author) data.testimonials[index].author = author.textContent.trim();
          if (role) data.testimonials[index].role = role.textContent.trim();
        }
      });

      localStorage.setItem('creative_interiors_admin_content', JSON.stringify(data));
      
      // Update form values in dashboard modal
      populateDashboardForms();
      
      logSystemEvent("Inline content modifications synchronized to database successfully");
      
      alert('All inline modifications saved successfully!');
    });
  }

  // Control bar Reset trigger
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Restore default localized configurations? This will clear all inline edits and security credentials.')) {
        localStorage.removeItem('creative_interiors_admin_content');
        logSystemEvent("Site configuration database hard-reset to factory defaults");
        location.reload();
      }
    });
  }

  // Portable JSON Export Config
  const exportDbBtn = document.getElementById('admin-export-db');
  if (exportDbBtn) {
    exportDbBtn.addEventListener('click', () => {
      if (saveBtn) saveBtn.click();
      
      const saved = localStorage.getItem('creative_interiors_admin_content');
      if (!saved) {
        alert('No custom edits found to export.');
        return;
      }

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(saved);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "creative_interiors_config.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      
      logSystemEvent("Configuration JSON database backup exported manually");
    });
  }

  // Backup Export trigger on the header bar
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (exportDbBtn) exportDbBtn.click();
    });
  }

  // Portable JSON Import backup config uploader
  const importFileEl = document.getElementById('admin-import-file');
  if (importFileEl) {
    importFileEl.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target.result);
          
          if (!parsed.contact || !parsed.descriptions || !parsed.testimonials) {
            alert("Invalid configuration file. The selected JSON does not match the database schema.");
            return;
          }

          localStorage.setItem('creative_interiors_admin_content', JSON.stringify(parsed));
          logSystemEvent("Database configurations successfully imported from uploaded backup JSON file");
          
          alert("Database configuration successfully imported! The page will now reload.");
          location.reload();
        } catch (err) {
          alert("Failed to parse JSON file. Please ensure it is a valid exported config file.");
        }
      };
      reader.readAsText(file);
    });
  }

  // Logout admin session
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Exit visual Admin Mode? Make sure you have clicked [Save Changes] first.')) {
        disableAdminMode();
        logSystemEvent("Admin session logged out manually");
      }
    });
  }

  // Capture Lead Consultation Form submissions into logs
  if (form) {
    form.addEventListener('submit', (e) => {
      const name = document.getElementById('client-name').value.trim();
      const email = document.getElementById('client-email').value.trim();
      const phone = document.getElementById('client-phone').value || 'Not provided';
      const location = document.getElementById('client-location').value || 'Not provided';
      const style = document.querySelector('input[name="aesthetic-style"]:checked').value;
      const budget = document.querySelector('input[name="budget-range"]:checked').value;
      const message = document.getElementById('client-message').value || 'Not provided';
      const time = new Date().toLocaleString();

      const raw = localStorage.getItem('creative_interiors_inquiries_log');
      const leads = raw ? JSON.parse(raw) : [];
      
      leads.unshift({ name, email, phone, location, style, budget, message, time });
      localStorage.setItem('creative_interiors_inquiries_log', JSON.stringify(leads));

      logSystemEvent(`Booking consultation lead inquiry received from '${name}' (${location})`);
    });
  }

  // Capture Newsletter subscriptions into logs
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', () => {
      const emailEl = newsletterForm.querySelector('.newsletter-input');
      if (emailEl && emailEl.value) {
        const email = emailEl.value.trim();
        const time = new Date().toLocaleString();

        const raw = localStorage.getItem('creative_interiors_subscriptions_log');
        const subs = raw ? JSON.parse(raw) : [];

        if (!subs.some(s => s.email.toLowerCase() === email.toLowerCase())) {
          subs.unshift({ email, time });
          localStorage.setItem('creative_interiors_subscriptions_log', JSON.stringify(subs));
        }

        logSystemEvent(`Newsletter subscription registered for email '${email}'`);
      }
    });
  }

});
