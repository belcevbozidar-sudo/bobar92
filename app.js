document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. HEADER SCROLL STATE
       ========================================================================== */
    const header = document.querySelector('.main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    /* ==========================================================================
       2. MOBILE MENU TOGGLE
       ========================================================================== */
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobLinks = document.querySelectorAll('.mob-link');

    if (menuToggle && mobileMenu) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is active
            if (mobileMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when a link is clicked
        mobLinks.forEach(link => {
            link.addEventListener('click', () => {
                menuToggle.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    /* ==========================================================================
       3. NAVIGATION ACTIVE LINKS STATE
       ========================================================================== */
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.desktop-nav .nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (pageYOffset >= (sectionTop - 120)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').slice(1) === current) {
                link.classList.add('active');
            }
        });
    });

    /* ==========================================================================
       4. ANIMATED STAT COUNTERS (COUNT-UP)
       ========================================================================== */
    const statNums = document.querySelectorAll('.feat-num');
    
    const runCounters = () => {
        statNums.forEach(counter => {
            const valAttr = counter.getAttribute('data-val');
            // If it's a specific string like I-V or a number
            if (valAttr === '1') {
                counter.innerText = 'I-V';
                return;
            }
            
            const target = parseInt(valAttr, 10);
            if (isNaN(target)) return;
            
            let count = 0;
            const duration = 2000; // 2 seconds
            const stepTime = Math.max(Math.floor(duration / target), 15);
            
            const timer = setInterval(() => {
                count += Math.ceil(target / (duration / stepTime));
                if (count >= target) {
                    counter.innerText = target + '+';
                    clearInterval(timer);
                } else {
                    counter.innerText = count + '+';
                }
            }, stepTime);
        });
    };

    // IntersectionObserver to run stats animations only when visible
    const statsObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                runCounters();
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.querySelector('.hero-features');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    /* ==========================================================================
       5. INTERACTIVE COST ESTIMATOR LOGIC
       ========================================================================== */
    const calcService = document.getElementById('calc-service');
    const calcArea = document.getElementById('calc-area');
    const areaVal = document.getElementById('area-val');
    const materialBtns = document.querySelectorAll('.material-btn');
    const priceDisplay = document.getElementById('calc-result-price');
    const timeDisplay = document.getElementById('calc-result-time');
    const calcSendCta = document.getElementById('calc-send-cta');
    
    let activeMultiplier = 1.0;

    // Update Slider Label
    if (calcArea && areaVal) {
        calcArea.addEventListener('input', (e) => {
            areaVal.innerText = e.target.value;
            calculateEstimate();
        });
    }

    // Material Toggles
    materialBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            materialBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            activeMultiplier = parseFloat(btn.getAttribute('data-multiplier'));
            calculateEstimate();
        });
    });

    if (calcService) {
        calcService.addEventListener('change', calculateEstimate);
    }

    function calculateEstimate() {
        if (!calcService || !calcArea || !priceDisplay || !timeDisplay) return;

        const selectedOption = calcService.options[calcService.selectedIndex];
        const basePrice = parseFloat(selectedOption.getAttribute('data-price'));
        const baseTimeMonths = parseFloat(selectedOption.getAttribute('data-time'));
        
        const area = parseInt(calcArea.value, 10);
        
        // Price calculation: area * base_price * material_multiplier
        let totalPrice = area * basePrice * activeMultiplier;
        
        // Format price to Bulgarian Lev currency format
        const formattedPrice = new Intl.NumberFormat('bg-BG', {
            style: 'currency',
            currency: 'BGN',
            maximumFractionDigits: 0
        }).format(totalPrice);
        
        priceDisplay.innerText = formattedPrice;

        // Dynamic time estimation adjustment based on square meters
        let calculatedTime = baseTimeMonths;
        if (area > 250) {
            calculatedTime *= 1.4; // Large area takes longer
        } else if (area < 50) {
            calculatedTime *= 0.8; // Small area takes less time
        }
        
        // Format time display text
        let timeText = '';
        if (calculatedTime < 1) {
            timeText = '1-2 седмици';
        } else {
            const minTime = Math.floor(calculatedTime);
            const maxTime = Math.ceil(calculatedTime + 1);
            timeText = `${minTime}-${maxTime} месеца`;
        }
        
        timeDisplay.innerText = timeText;
    }

    // Initialize calculator
    calculateEstimate();

    // "Заяви безплатен оглед" Lead Integration
    if (calcSendCta) {
        calcSendCta.addEventListener('click', () => {
            const selectedOption = calcService.options[calcService.selectedIndex];
            const serviceLabel = selectedOption.text;
            const area = calcArea.value;
            const activeMatTitle = document.querySelector('.material-btn.active .mat-title').innerText;
            const totalEstimatedPrice = priceDisplay.innerText;
            const estimatedTime = timeDisplay.innerText;

            // Get Form elements
            const formService = document.getElementById('form-service');
            const formMessage = document.getElementById('form-message');
            const contactSection = document.getElementById('contact');

            if (formService) {
                formService.value = calcService.value;
            }

            if (formMessage) {
                formMessage.value = `Здравейте,\n\nИскам да заявя безплатен оглед за следния проект, конфигуриран от калкулатора:\n` +
                                   `- Услуга: ${serviceLabel}\n` +
                                   `- Площ: ${area} м²\n` +
                                   `- Клас материали: ${activeMatTitle}\n` +
                                   `- Ориентировъчна цена: ${totalEstimatedPrice}\n` +
                                   `- Ориентировъчен срок: ${estimatedTime}\n\n` +
                                   `Моля да се свържете с мен на посочения телефон за потвърждение на удобен ден за оглед.`;
            }

            // Smooth scroll to contact form
            if (contactSection) {
                contactSection.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    /* ==========================================================================
       6. PORTFOLIO / GALLERY CATEGORY FILTER
       ========================================================================== */
    const filterBtns = document.querySelectorAll('#gallery-filters .filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from buttons, add to current
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                // Animate Out
                item.style.opacity = '0';
                item.style.transform = 'scale(0.8)';
                
                setTimeout(() => {
                    if (filterValue === 'all' || category === filterValue) {
                        item.classList.remove('hidden');
                        // Animate In
                        setTimeout(() => {
                            item.style.opacity = '1';
                            item.style.transform = 'scale(1)';
                        }, 50);
                    } else {
                        item.classList.add('hidden');
                    }
                }, 300);
            });
        });
    });

    /* ==========================================================================
       7. CONTACT FORM VALIDATION & SIMULATION
       ========================================================================== */
    const contactForm = document.getElementById('main-contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm && formFeedback) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const name = document.getElementById('form-name').value.trim();
            const phone = document.getElementById('form-phone').value.trim();
            const email = document.getElementById('form-email').value.trim();
            const message = document.getElementById('form-message').value.trim();
            const submitBtn = document.getElementById('form-submit-btn');

            // Button Loading State
            submitBtn.disabled = true;
            submitBtn.innerText = 'Изпращане...';

            // Simulate server request delay
            setTimeout(() => {
                // Pre-validate
                if (name && phone && message) {
                    formFeedback.className = 'form-feedback success';
                    formFeedback.innerHTML = `Благодарим Ви, <strong>${name}</strong>! Вашето запитване за оглед беше изпратено успешно до <strong>info@bobar92.com</strong>.<br>Инж. Димитър Манасиев или член на екипа ни ще се свърже с Вас на телефон <strong>${phone}</strong> в рамките на следващия работен час.`;
                    
                    // Clear form inputs
                    contactForm.reset();
                    // Reset estimator calculation in case they submit again
                    if (calcArea) calcArea.value = 100;
                    if (areaVal) areaVal.innerText = 100;
                    calculateEstimate();
                } else {
                    formFeedback.className = 'form-feedback error';
                    formFeedback.innerText = 'Моля, попълнете всички задължителни полета (*), преди да изпратите запитването.';
                }
                
                submitBtn.disabled = false;
                submitBtn.innerText = 'Изпрати Запитване';
                
                // Scroll to feedback message smoothly
                formFeedback.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 1200);
        });
    }
});
