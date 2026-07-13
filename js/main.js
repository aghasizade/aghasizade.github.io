/**
 * Professional Portfolio Interactions
 * Author: Cline
 */

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initScrollAnimations();
    initSkillBars();
    initContactForm();
    initLanguageSwitcher();
});

function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    const header = document.querySelector('.header');

    // Mobile Menu Toggle
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                if (navLinks && navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                }

                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Header Scroll Effect
    window.addEventListener('scroll', () => {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
}

function initSkillBars() {
    const progressBars = document.querySelectorAll('.progress');
    const skillsSection = document.getElementById('skills');

    if (!skillsSection || progressBars.length === 0) return;

    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                progressBars.forEach(bar => {
                    const width = bar.getAttribute('data-width');
                    bar.style.width = width;
                });
                observer.unobserve(entry.target); // Animate only once
            }
        });
    }, observerOptions);

    observer.observe(skillsSection);
}

function initScrollAnimations() {
    // Simple Reveal Animation for sections
    const sections = document.querySelectorAll('.section');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'all 0.8s ease-out';
        revealObserver.observe(section);
    });
}

function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const currentLang = document.documentElement.getAttribute('lang') || 'fa';

            // Simple loading state
            const btn = contactForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = currentLang === 'fa' ? 'در حال ارسال...' : 'Sending...';
            btn.disabled = true;

            const formAction = contactForm.getAttribute('action');

            // Check if Formspree ID is configured
            if (!formAction || formAction.includes('your_form_id')) {
                // Fallback for local testing when Formspree is not configured
                setTimeout(() => {
                    alert(currentLang === 'fa'
                        ? '⚠️ توجه: فرم Formspree پیکربندی نشده است.\n\nبرای فعال‌سازی:\n1. به formspree.io بروید\n2. یک فرم جدید بسازید\n3. شناسه فرم را در index.html جایگزین کنید.\n\n(این پیام فقط هنگام تست محلی نمایش داده می‌شود.)'
                        : '⚠️ Formspree is not configured.\n\nTo activate:\n1. Go to formspree.io\n2. Create a new form\n3. Replace the form ID in index.html\n\n(This message only shows during local testing.)');
                    btn.innerText = originalText;
                    btn.disabled = false;
                }, 800);
                return;
            }

            try {
                const formData = new FormData(contactForm);
                const response = await fetch(formAction, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    alert(currentLang === 'fa'
                        ? '✅ پیام شما با موفقیت ارسال شد!\n\nممنون از تماس شما. به زودی پاسخ می‌دهیم.'
                        : '✅ Your message has been sent successfully!\n\nThank you for contacting us. We will get back to you soon.');
                    btn.innerText = currentLang === 'fa' ? '✓ ارسال شد' : '✓ Sent';
                    btn.style.background = '#22c55e';
                    contactForm.reset();
                    setTimeout(() => {
                        btn.innerText = originalText;
                        btn.style.background = '';
                        btn.disabled = false;
                    }, 3000);
                } else {
                    throw new Error('خطا در ارسال فرم');
                }
            } catch (error) {
                alert(currentLang === 'fa'
                    ? '❌ خطا در ارسال پیام. لطفاً دوباره تلاش کنید یا از طریق ایمیل تماس بگیرید.\n\nM99MASH@GMAIL.COM'
                    : '❌ Failed to send message. Please try again or email us directly.\n\nM99MASH@GMAIL.COM');
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }
}

// ==========================================
// Translation Dictionary & Language Switcher
// ==========================================
const translations = {
    fa: {
        // Navbar
        "nav-about": "درباره من",
        "nav-skills": "تخصص‌ها",
        "nav-exp": "سوابق شغلی",
        "nav-edu": "تحصیلات",
        "nav-serv": "خدمات",
        "nav-contact": "تماس",

        // Hero
        "hero-title": "سلام، من <span class=\"highlight\">مرتضی آقاسی زاده</span> هستم",
        "hero-subtitle": "مدیر برنامه‌ریزی، تحلیلگر آماری و مشاور ارشد رسانه‌های دیجیتال",
        "hero-desc": "تلفیق تفکر تحلیلی آماری با هنر گرافیک، تدوین و هوش مصنوعی برای ارتقای فرآیندهای مدرن سازمانی با بیش از ۱۵ سال سابقه فعالیت در سازمان‌های حاکمیتی و بخش خصوصی.",
        "hero-btn-contact": "همکاری با من",
        "hero-btn-services": "مشاهده خدمات",
        "hero-btn-resume": "<i class=\"fas fa-download\"></i> دانلود رزومه",
        "hero-profile-tag": "متخصص هوشمندسازی و تحلیل داده",

        // About
        "about-title": "درباره من",
        "about-p1": "من به عنوان مدیر و کارشناس ارشد برنامه‌ریزی و تحلیلگر آماری، سابقه گسترده‌ای در سازمان‌های بزرگ شهری و حاکمیتی دارم. ویژگی متمایز من، توانایی تلفیق ابزارهای پیشرفته گرافیک، تدوین و هوش مصنوعی با تحلیل‌های آماری دقیق است.",
        "about-p2": "در حوزه‌های هوشمندسازی، مدیریت کیفیت و سیستم‌های امنیتی (به ویژه در گروه صبا صنعت)، راهکارهای نوین بصری و اتوماسیون هوشمند را پیاده‌سازی کرده‌ام تا بهره‌وری سازمانی را به حداکثر برسانم.",
        "detail-email": "m99mash@gmail.com",
        "detail-phone": "۰۹۱۵۷۲۵۵۰۴۵ | ۰۹۳۵۲۲۶۲۶۴۷",
        "detail-loc": "مشهد، ایران",

        // Skills
        "skills-title": "تخصص‌ها و توانمندی‌ها",
        "cat-media": "رسانه و گرافیک",
        "skill-1": "طراحی هویت بصری و اینفوگرافیک (Photoshop)",
        "skill-2": "تدوین ویدیو و جلوه‌های بصری (Premiere)",
        "skill-3": "سناریونویسی و نظارت کیفی پروژه‌های هنری",
        "cat-ai": "هوش مصنوعی و اتوماسیون",
        "skill-4": "معماری ایجنت‌های هوشمند (Multi-Agent)",
        "skill-5": "مدیریت مدل‌های زبانی (OpenRouter, Llama, Hermes)",
        "skill-6": "اتوماسیون اداری مبتنی بر AI",
        "cat-sec": "سیستم‌های حفاظتی",
        "skill-7": "طراحی و اجرای CCTV تحت شبکه (IP)",
        "skill-8": "پردازش تصویر و AI Video Analytics",
        "skill-9": "راه‌اندازی اتاق‌های مانیتورینگ هوشمند",
        "cat-stat": "آمار و مدیریت کیفیت",
        "skill-10": "تحلیل آماری (SPSS, R, Minitab)",
        "skill-11": "پیاده‌سازی ISO 9001 و نظام 5S",
        "skill-12": "تحلیل داده‌های کلان و داشبوردسازی",

        // Experience
        "exp-title": "سوابق شغلی و اجرایی",
        "exp-1-title": "مشاور هنری، رسانه‌های دیجیتال و پروژه‌های حفاظتی",
        "exp-1-comp": "گروه صبا صنعت (sabasanatgroup.ir)",
        "exp-1-desc": "مدیریت هویت بصری برند، نظارت بر کمپین‌های محتوایی و اجرای شبکه‌های نظارت تصویری هوشمند بر پایه پردازش تصویر.",
        "exp-2-title": "کارشناس برنامه‌ریزی",
        "exp-2-comp": "آستان قدس رضوی",
        "exp-2-date": "۱۰ سال سابقه",
        "exp-2-desc": "تدوین شاخص‌های ارزیابی عملکرد، فرآیندهای برنامه‌ریزی کلان و تحلیل مصور داده‌های سازمانی.",
        "exp-3-title": "مدیر برنامه‌ریزی",
        "exp-3-comp": "شرکت سرمایه‌گذاری ستاوند – شهرداری منطقه دو مشهد",
        "exp-3-date": "۹ سال سابقه",
        "exp-3-desc": "مدیریت استراتژیک و برنامه‌ریزی عملیاتی در سطح منطقه شهری.",
        "exp-4-title": "کارشناس تحلیل و مدیریت آمار (فاوا)",
        "exp-4-comp": "معاونت برنامه‌ریزی شهرداری مشهد",
        "exp-4-date": "۲ سال سابقه",
        "exp-4-desc": "تحلیل داده‌های کلان شهری و توسعه سیستم‌های اطلاعاتی سازمان فاوا.",
        "exp-5-title": "کارشناس ایزو (ISO) و 5S",
        "exp-5-comp": "شهرداری منطقه ۷ مشهد",
        "exp-5-date": "۱ سال سابقه",
        "exp-5-desc": "پیاده‌سازی نظام آراستگی (5S) و مستندسازی استانداردهای اداری.",
        "exp-6-title": "مشاور رسمی آماری",
        "exp-6-comp": "شرکت بهره‌برداری قطار شهری مشهد",
        "exp-6-date": "۲ سال سابقه",
        "exp-6-desc": "ارائه مشاوره‌های تخصصی آماری برای بهینه‌سازی عملیات حمل و نقل شهری.",
        "exp-7-title": "مدرس دانشگاه و دوره‌های سازمانی",
        "exp-7-comp": "دانشگاه پیام نور و مراکز ارگانیک",
        "exp-7-desc": "تدریس آمار، ریاضی، نرم‌افزارهای تحلیلی، تولید محتوای دیجیتال و هوش مصنوعی مولد.",

        // Education
        "edu-title": "سوابق تحصیلی",
        "edu-1-deg": "کارشناسی ارشد آمار استنباطی",
        "edu-1-uni": "دانشگاه پیام نور مشهد",
        "edu-2-deg": "کارشناسی آمار",
        "edu-2-uni": "دانشگاه فردوسی مشهد",

        // Services
        "serv-title": "خدمات تخصصی",
        "serv-1-title": "رسانه‌های دیجیتال",
        "serv-1-desc": "مشاوره برندینگ، طراحی هویت بصری، سناریونویسی و تدوین حرفه‌ای ویدیوهای معرفی دستاوردها و تیزرهای صنعتی.",
        "serv-2-title": "تحول دیجیتال و AI",
        "serv-2-desc": "استقرار مدل‌های هوش مصنوعی و طراحی ایجنت‌های اختصاصی برای اتوماسیون کارهای اداری و تولید محتوای هوشمند.",
        "serv-3-title": "سیستم‌های حفاظتی",
        "serv-3-desc": "مهندسی، تأمین و اجرای شبکه‌های نظارت تصویری (CCTV) مجهز به آنالیز هوشمند تصاویر (Saba Sanat).",
        "serv-4-title": "مدیریت کیفیت و آمار",
        "serv-4-desc": "مدیریت چرخه داده، داشبوردسازی راهبردی و استقرار استانداردهای ایزو و نظام آراستگی 5S.",

        // Contact
        "cont-title": "تماس با من",
        "cont-email": "ایمیل",
        "cont-phone": "تلفن",
        "cont-loc": "موقعیت",
        "cont-social-title": "ارتباط در شبکه‌های اجتماعی",
        "form-name": "نام شما",
        "form-email": "ایمیل شما",
        "form-subj": "موضوع",
        "form-msg": "پیام شما",
        "form-btn": "ارسال پیام",
        "footer-copy": "تمامی حقوق محفوظ است. مرتضی آقاسی زاده &copy; ۱۴۰۳"
    },
    en: {
        // Navbar
        "nav-about": "About Me",
        "nav-skills": "Skills",
        "nav-exp": "Experience",
        "nav-edu": "Education",
        "nav-serv": "Services",
        "nav-contact": "Contact",

        // Hero
        "hero-title": "Hi, I am <span class=\"highlight\">Morteza Aghasizadeh</span>",
        "hero-subtitle": "Planning Director, Statistical Analyst & Digital Media Consultant",
        "hero-desc": "Combining advanced statistical analysis with graphic design, video editing, and AI integration to elevate organizational performance. Over 15 years of impactful experience in government and private sectors.",
        "hero-btn-contact": "Work with Me",
        "hero-btn-services": "My Services",
        "hero-btn-resume": "<i class=\"fas fa-download\"></i> Download Resume",
        "hero-profile-tag": "AI Automation & Data Analyst Specialist",

        // About
        "about-title": "About Me",
        "about-p1": "As a senior planning manager and statistical analyst, I have an extensive track record of working with major metropolitan and government organizations. My distinct strength is merging analytical precision with state-of-the-art media tools and artificial intelligence.",
        "about-p2": "In the fields of smart automation, quality management, and advanced surveillance (particularly at Saba Sanat Group), I design and deploy visual and automated systems that dramatically increase productivity.",
        "detail-email": "m99mash@gmail.com",
        "detail-phone": "+98 915 725 5045 | +98 935 226 2647",
        "detail-loc": "Mashhad, Iran",

        // Skills
        "skills-title": "Expertise & Skills",
        "cat-media": "Media & Graphics",
        "skill-1": "Visual Branding & Infographic Design (Photoshop)",
        "skill-2": "Video Editing & Post-Production (Premiere Pro)",
        "skill-3": "Creative Art Direction & Scriptwriting",
        "cat-ai": "Artificial Intelligence & Automation",
        "skill-4": "Multi-Agent Smart Architecture Design",
        "skill-5": "LLM & API Orchestration (OpenRouter, Llama, Hermes)",
        "skill-6": "AI-Powered Administrative Automation",
        "cat-sec": "Protective Systems",
        "skill-7": "IP-Based Network CCTV Engineering & Deployment",
        "skill-8": "Computer Vision & AI Video Analytics",
        "skill-9": "Smart Surveillance Control Room Setup",
        "cat-stat": "Statistics & Quality Management",
        "skill-10": "Advanced Statistical Computing (SPSS, R, Minitab)",
        "skill-11": "ISO 9001 Standards & 5S Workplace Organization",
        "skill-12": "Big Data Analytics & Strategic Dashboarding",

        // Experience
        "exp-title": "Professional Experience",
        "exp-1-title": "Art Director, Digital Media & Security Systems Consultant",
        "exp-1-comp": "Saba Sanat Group (sabasanatgroup.ir)",
        "exp-1-desc": "Directing brand visual identity, supervising digital campaigns, and designing computer-vision-based IP camera surveillance systems.",
        "exp-2-title": "Senior Planning Specialist",
        "exp-2-comp": "Astan Quds Razavi",
        "exp-2-date": "10 Years of Experience",
        "exp-2-desc": "Developing key performance indicators (KPIs), long-term strategic plans, and data visualization dashboards for leadership.",
        "exp-3-title": "Planning Director",
        "exp-3-comp": "Satavand Investment Co. – Mashhad Municipality Dist. 2",
        "exp-3-date": "9 Years of Experience",
        "exp-3-desc": "Leading strategic planning and urban development operations at metropolitan scales.",
        "exp-4-title": "Statistical Analytics & ICT Specialist",
        "exp-4-comp": "ICT Organization of Mashhad Municipality",
        "exp-4-date": "2 Years of Experience",
        "exp-4-desc": "Analyzing urban big data and architecting municipal statistical information systems.",
        "exp-5-title": "ISO & 5S Quality Management Specialist",
        "exp-5-comp": "Mashhad Municipality Dist. 7",
        "exp-5-date": "1 Year of Experience",
        "exp-5-desc": "Implementing 5S system and documenting business process standards to achieve organizational efficiency.",
        "exp-6-title": "Official Statistical Consultant",
        "exp-6-comp": "Mashhad Urban Railway Operation Co.",
        "exp-6-date": "2 Years of Experience",
        "exp-6-desc": "Providing specialized statistical models to optimize urban railway transit lines.",
        "exp-7-title": "University Lecturer & Corporate Trainer",
        "exp-7-comp": "Payame Noor University & Executive Training Centers",
        "exp-7-desc": "Teaching Statistics, Mathematics, Analytical Software, Digital Content Production, and Generative AI Applications.",

        // Education
        "edu-title": "Education Background",
        "edu-1-deg": "M.Sc. in Inferential Statistics",
        "edu-1-uni": "Payame Noor University of Mashhad",
        "edu-2-deg": "B.Sc. in Statistics",
        "edu-2-uni": "Ferdowsi University of Mashhad",

        // Services
        "serv-title": "Core Services",
        "serv-1-title": "Digital Media & Branding",
        "serv-1-desc": "Branding strategy, identity design, scriptwriting, and high-end video editing for industrial promos and corporate achievements.",
        "serv-2-title": "Digital Transformation & AI",
        "serv-2-desc": "Deploying generative AI tools and specialized smart agents to automate workflows and optimize marketing.",
        "serv-3-title": "Security Engineering",
        "serv-3-desc": "Designing, sourcing, and implementing enterprise network CCTV infrastructure with smart image processing algorithms.",
        "serv-4-title": "Quality & Statistical Consulting",
        "serv-4-desc": "Big data management, strategic dashboarding, and auditing ISO 9001 and 5S lean systems.",

        // Contact
        "cont-title": "Get in Touch",
        "cont-email": "Email",
        "cont-phone": "Phone",
        "cont-loc": "Location",
        "cont-social-title": "Connect on Social Media",
        "form-name": "Your Name",
        "form-email": "Your Email",
        "form-subj": "Subject",
        "form-msg": "Your Message",
        "form-btn": "Send Message",
        "footer-copy": "All Rights Reserved. Morteza Aghasizadeh &copy; 2026"
    }
};

function initLanguageSwitcher() {
    const switcher = document.getElementById('langSwitcher');
    const langText = document.getElementById('langText');
    if (!switcher || !langText) return;

    // Load saved language or default to 'fa'
    let currentLang = localStorage.getItem('preferredLang') || 'fa';
    setLanguage(currentLang);

    switcher.addEventListener('click', () => {
        currentLang = currentLang === 'fa' ? 'en' : 'fa';
        setLanguage(currentLang);
        localStorage.setItem('preferredLang', currentLang);
    });

    function setLanguage(lang) {
        document.documentElement.setAttribute('lang', lang);
        document.documentElement.setAttribute('dir', lang === 'fa' ? 'rtl' : 'ltr');
        langText.innerText = lang === 'fa' ? 'EN' : 'FA';

        // Translate text elements
        document.querySelectorAll('[data-i18n]').forEach(elem => {
            const key = elem.getAttribute('data-i18n');
            if (translations[lang] && translations[lang][key]) {
                elem.innerHTML = translations[lang][key];
            }
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(elem => {
            const key = elem.getAttribute('data-i18n-placeholder');
            if (translations[lang] && translations[lang][key]) {
                elem.setAttribute('placeholder', translations[lang][key]);
            }
        });
        
        // Re-trigger skill animation to ensure compatibility
        const progressBars = document.querySelectorAll('.progress');
        progressBars.forEach(bar => {
            bar.style.width = '0';
        });
        setTimeout(() => {
            progressBars.forEach(bar => {
                const width = bar.getAttribute('data-width');
                bar.style.width = width;
            });
        }, 100);
    }
}

// ==========================================
// 3D Animated Canvas Background (Three.js)
// ==========================================
function initThreeBackground() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas || typeof THREE === 'undefined') return;

    // Scene Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;

    // Renderer Setup
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Particle Configuration
    const particleCount = 120;
    const connectionDistance = 18;
    const particles = [];
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    // Create particles with random positions and colors (cyan/indigo theme)
    for (let i = 0; i < particleCount; i++) {
        const x = (Math.random() - 0.5) * 60;
        const y = (Math.random() - 0.5) * 40;
        const z = (Math.random() - 0.5) * 30;

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;

        // Mix between cyan (#38bdf8) and indigo (#6366f1)
        const colorMix = Math.random();
        if (colorMix > 0.5) {
            colors[i * 3] = 0.22; colors[i * 3 + 1] = 0.74; colors[i * 3 + 2] = 0.97; // Cyan
        } else {
            colors[i * 3] = 0.39; colors[i * 3 + 1] = 0.40; colors[i * 3 + 2] = 0.94; // Indigo
        }

        particles.push({
            x: x, y: y, z: z,
            vx: (Math.random() - 0.5) * 0.02,
            vy: (Math.random() - 0.5) * 0.02,
            vz: (Math.random() - 0.5) * 0.01
        });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Create a soft glow texture for particles
    const spriteCanvas = document.createElement('canvas');
    spriteCanvas.width = 64;
    spriteCanvas.height = 64;
    const ctx = spriteCanvas.getContext('2d');
    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    const spriteTexture = new THREE.CanvasTexture(spriteCanvas);

    // Points Material
    const pointsMaterial = new THREE.PointsMaterial({
        size: 0.35,
        vertexColors: true,
        map: spriteTexture,
        transparent: true,
        opacity: 0.05,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const particleSystem = new THREE.Points(particleGeometry, pointsMaterial);
    scene.add(particleSystem);

    // Line Geometry for connections
    const lineMaxCount = particleCount * 4; // Max possible lines
    const lineGeometry = new THREE.BufferGeometry();
    const linePositions = new Float32Array(lineMaxCount * 6); // 2 vertices per line, 3 coords each
    const lineColors = new Float32Array(lineMaxCount * 6);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    lineGeometry.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
    lineGeometry.setDrawRange(0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.025,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    const lineSystem = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineSystem);

    // Mouse tracking for parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotX = 0;
    let currentRotY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // Animation Loop
    let frameCount = 0;
    function animate() {
        requestAnimationFrame(animate);
        frameCount++;

        // Update particle positions (drift effect)
        const posAttr = particleGeometry.getAttribute('position');
        for (let i = 0; i < particleCount; i++) {
            particles[i].x += particles[i].vx;
            particles[i].y += particles[i].vy;
            particles[i].z += particles[i].vz;

            // Boundary wrapping
            if (particles[i].x > 30) particles[i].x = -30;
            if (particles[i].x < -30) particles[i].x = 30;
            if (particles[i].y > 20) particles[i].y = -20;
            if (particles[i].y < -20) particles[i].y = 20;
            if (particles[i].z > 15) particles[i].z = -15;
            if (particles[i].z < -15) particles[i].z = 15;

            posAttr.array[i * 3] = particles[i].x;
            posAttr.array[i * 3 + 1] = particles[i].y;
            posAttr.array[i * 3 + 2] = particles[i].z;
        }
        posAttr.needsUpdate = true;

        // Update connections (only every 2nd frame for performance)
        if (frameCount % 2 === 0) {
            let lineIndex = 0;
            const maxLines = lineMaxCount;
            const posArray = posAttr.array;

            for (let i = 0; i < particleCount && lineIndex < maxLines; i++) {
                for (let j = i + 1; j < particleCount && lineIndex < maxLines; j++) {
                    const dx = posArray[i * 3] - posArray[j * 3];
                    const dy = posArray[i * 3 + 1] - posArray[j * 3 + 1];
                    const dz = posArray[i * 3 + 2] - posArray[j * 3 + 2];
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

                    if (dist < connectionDistance) {
                        const opacity = 1 - (dist / connectionDistance);
                        const idx = lineIndex * 6;

                        // Line positions
                        linePositions[idx] = posArray[i * 3];
                        linePositions[idx + 1] = posArray[i * 3 + 1];
                        linePositions[idx + 2] = posArray[i * 3 + 2];
                        linePositions[idx + 3] = posArray[j * 3];
                        linePositions[idx + 4] = posArray[j * 3 + 1];
                        linePositions[idx + 5] = posArray[j * 3 + 2];

                        // Line colors (average of connected particles)
                        lineColors[idx] = 0.22; lineColors[idx + 1] = 0.74; lineColors[idx + 2] = 0.97;
                        lineColors[idx + 3] = 0.22; lineColors[idx + 4] = 0.74; lineColors[idx + 5] = 0.97;

                        // Apply opacity via alpha is not directly supported by LineBasicMaterial,
                        // so we use a slightly different approach: dim the color
                        const r = Math.floor(56 + opacity * 100);
                        const g = Math.floor(189 + opacity * 50);
                        const b = Math.floor(248);
                        lineColors[idx] = r / 255; lineColors[idx + 1] = g / 255; lineColors[idx + 2] = b / 255;
                        lineColors[idx + 3] = r / 255; lineColors[idx + 4] = g / 255; lineColors[idx + 5] = b / 255;

                        lineIndex++;
                    }
                }
            }

            // Set draw range
            lineGeometry.setDrawRange(0, lineIndex * 2);
            lineGeometry.attributes.position.needsUpdate = true;
            lineGeometry.attributes.color.needsUpdate = true;
        }

        // Smooth parallax rotation
        targetRotX = mouseY * 0.3;
        targetRotY = mouseX * 0.3;
        currentRotX += (targetRotX - currentRotX) * 0.02;
        currentRotY += (targetRotY - currentRotY) * 0.02;

        // Apply rotation to the entire scene group
        particleSystem.rotation.x = currentRotX * 0.5;
        particleSystem.rotation.y = currentRotY * 0.5;
        lineSystem.rotation.x = particleSystem.rotation.x;
        lineSystem.rotation.y = particleSystem.rotation.y;

        // Gentle auto-rotation
        particleSystem.rotation.z += 0.0003;
        lineSystem.rotation.z = particleSystem.rotation.z;

        renderer.render(scene, camera);
    }

    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Initialize 3D background after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initThreeBackground, 500); // Slight delay for Three.js to load
});
