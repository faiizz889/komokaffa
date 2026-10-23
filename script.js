document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // 1. Custom Dual Cursor & Magnetic Buttons
    const cursorDot = document.querySelector(".cursor-dot");
    const cursorRing = document.querySelector(".cursor-ring");
    const hoverTargets = document.querySelectorAll(".hover-target");

    window.addEventListener("mousemove", (e) => {
        gsap.to(cursorDot, { x: e.clientX, y: e.clientY, duration: 0.05 });
        gsap.to(cursorRing, { x: e.clientX, y: e.clientY, duration: 0.22, ease: "power2.out" });
    });

    hoverTargets.forEach((el) => {
        el.addEventListener("mouseenter", () => cursorRing.classList.add("active"));
        el.addEventListener("mouseleave", () => cursorRing.classList.remove("active"));
    });

    // Magnetic Button Effect
    document.querySelectorAll(".magnetic").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, { x: x * 0.28, y: y * 0.28, duration: 0.3, ease: "power2.out" });
        });
        btn.addEventListener("mouseleave", () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
        });
    });

    // 2. Sticky Header & Mobile Drawer
    const navbar = document.getElementById("navbar");
    const hamburger = document.querySelector(".hamburger");
    const mobileDrawer = document.querySelector(".mobile-drawer");

    window.addEventListener("scroll", () => {
        navbar.classList.toggle("scrolled", window.scrollY > 60);
    });

    hamburger.addEventListener("click", () => {
        const isOpen = hamburger.classList.toggle("open");
        mobileDrawer.classList.toggle("open", isOpen);
        hamburger.setAttribute("aria-expanded", isOpen);
    });

    document.querySelectorAll(".mobile-link").forEach((link) => {
        link.addEventListener("click", () => {
            hamburger.classList.remove("open");
            mobileDrawer.classList.remove("open");
        });
    });

    // 3. Slow-Zooming Cinematic Hero Slideshow
    const slides = document.querySelectorAll(".hero-slideshow .slide");
    let currentSlide = 0;
    setInterval(() => {
        slides[currentSlide].classList.remove("active");
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add("active");
    }, 5500);

    // 4. GSAP Hero & Scroll Animations
    gsap.from(".gsap-hero", {
        y: 45,
        opacity: 0,
        duration: 1.1,
        stagger: 0.18,
        ease: "power3.out",
        delay: 0.2
    });

    gsap.utils.toArray(".gsap-fade-up").forEach((el) => {
        gsap.from(el, {
            scrollTrigger: {
                trigger: el,
                start: "top 85%"
            },
            y: 40,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out"
        });
    });

    // Subtle Parallax on Embossed Branch Art
    gsap.to(".parallax-bg", {
        scrollTrigger: {
            trigger: ".vibe-section",
            start: "top bottom",
            end: "bottom top",
            scrub: 1
        },
        y: -90,
        rotation: 4
    });

    // 5. Review Slider Controls
    const reviewSlides = document.querySelectorAll(".review-slide");
    const reviewDots = document.querySelectorAll(".review-dot");

    reviewDots.forEach((dot) => {
        dot.addEventListener("click", () => {
            const index = Number(dot.dataset.slide);
            reviewSlides.forEach((s) => s.classList.remove("active"));
            reviewDots.forEach((d) => d.classList.remove("active"));
            reviewSlides[index].classList.add("active");
            dot.classList.add("active");
        });
    });

    // 6. Interactive Menu Filtering & Floating Dish Preview
    const filterBtns = document.querySelectorAll(".filter-btn");
    const menuRows = document.querySelectorAll(".menu-row");
    const menuPreview = document.getElementById("menuPreview");
    const previewInner = menuPreview.querySelector(".preview-inner");

    filterBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            filterBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const category = btn.dataset.filter;

            menuRows.forEach((row) => {
                const match = category === "all" || row.dataset.category === category;
                row.style.display = match ? "flex" : "none";
                if (match) {
                    gsap.fromTo(row, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35 });
                }
            });
        });
    });

    menuRows.forEach((row) => {
        row.addEventListener("mouseenter", () => {
            previewInner.style.backgroundImage = `url(${row.dataset.img})`;
            menuPreview.classList.add("visible");
        });
        row.addEventListener("mousemove", (e) => {
            gsap.to(menuPreview, {
                x: e.clientX + 140,
                y: e.clientY - 20,
                duration: 0.35,
                ease: "power2.out"
            });
        });
        row.addEventListener("mouseleave", () => {
            menuPreview.classList.remove("visible");
        });
    });

    // 7. Gallery Lightbox
    const lightbox = document.getElementById("lightbox");
    const lightboxImg = document.getElementById("lightboxImg");
    const lightboxCaption = document.getElementById("lightboxCaption");

    document.querySelectorAll(".masonry-item").forEach((item) => {
        item.addEventListener("click", () => {
            const img = item.querySelector("img");
            lightboxImg.src = img.src;
            lightboxCaption.textContent = item.dataset.caption || "";
            lightbox.classList.add("open");
        });
    });

    document.querySelector(".lightbox-close").addEventListener("click", () => {
        lightbox.classList.remove("open");
    });
    lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) lightbox.classList.remove("open");
    });

    // 8. Real-Time Form Validation & Reservation Confirmation
    const form = document.getElementById("reservationForm");
    const resDate = document.getElementById("resDate");
    resDate.min = new Date().toISOString().split("T")[0];

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        let valid = true;

        form.querySelectorAll("[required]").forEach((input) => {
            const group = input.closest(".form-group");
            if (!input.checkValidity()) {
                group.classList.add("invalid");
                valid = false;
            } else {
                group.classList.remove("invalid");
            }
        });

        if (!valid) return;

        const btnText = form.querySelector(".btn-text");
        btnText.textContent = "Securing Your Table...";

        setTimeout(() => {
            form.reset();
            btnText.textContent = "Confirm Table Request";
            const successBanner = document.getElementById("bookingSuccess");
            successBanner.classList.add("show");
            setTimeout(() => successBanner.classList.remove("show"), 6000);
        }, 900);
    });
});