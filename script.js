/**
 * ============================================================================
 * KOMO by KAFFA — Master Interactive Architecture (script.js)
 * Crafted by @zyrac__ | Zero-Glitch, 60FPS & Fully Responsive
 * ============================================================================
 * MODULES INCLUDED:
 * 01. Core Utilities & Responsive Breakpoint Helpers
 * 02. Zero-Glitch Sliding Navbar Pill, Scroll Progress & IST Clock
 * 03. Sculpted Stone Monolith Logo (3D Tilt & 2700K Halo Tracking)
 * 04. Mobile & Tablet Architectural Sheet Drawer
 * 05. Minimalist Custom Cursor & Magnetic Buttons (Desktop Pointer Only)
 * 06. Section 1: Hero Kinetic 5-Slice Accordion Deck & Video Controller
 * 07. Section 2: 19-Item Interactive Menu & "Amdavadi Honesty Mode"
 * 08. Section 3: Sculptural Atelier, Morphing Cutouts, 2700K Dimmer & Lightbox
 * 09. Section 4: 12 PM – 1 AM Sanctuary Dial & 3D Sandstone Coaster Flipper
 * 10. Section 5: Visual Sanctuary Booking, 7-Day Date Strip & Live Table Pass
 * 11. Footer: @zyrac__ Studio Colophon Spotlight & GSAP Scroll Reveals
 * ============================================================================
 */

document.addEventListener("DOMContentLoaded", () => {
    // Register GSAP ScrollTrigger safely
    if (typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined") {
        gsap.registerPlugin(ScrollTrigger);
    }

    // ========================================================================
    // 01. CORE UTILITIES & RESPONSIVE HELPERS
    // ========================================================================
    const isFinePointer = () => window.matchMedia("(pointer: fine)").matches;
    const isDesktop = () => window.innerWidth > 960;
    const isTabletOrAbove = () => window.innerWidth > 768;


    // ========================================================================
    // 02. ZERO-GLITCH SLIDING NAVBAR PILL, SCROLL PROGRESS & IST CLOCK
    // ========================================================================
    const siteHeader = document.getElementById("siteHeader");
    const navTrack = document.getElementById("navTrack");
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    const mobileLinks = Array.from(document.querySelectorAll(".m-nav-link"));
    const navPill = document.getElementById("navPill");
    const navScrollProgress = document.getElementById("navScrollProgress");
    const sections = Array.from(document.querySelectorAll(".page-section"));

    // Mutex lock prevents scroll-spy from jittering during click-initiated smooth scrolls
    let isClickScrolling = false;
    let scrollUnlockTimer = null;

    function syncNavPill(activeLink, animate = true) {
        if (!activeLink || !navPill || !navTrack) return;

        const targetWidth = activeLink.offsetWidth;
        const targetLeft = activeLink.offsetLeft;

        navPill.style.transition = animate
            ? "transform 0.36s cubic-bezier(0.22, 1, 0.36, 1), width 0.36s cubic-bezier(0.22, 1, 0.36, 1)"
            : "none";

        navPill.style.width = `${targetWidth}px`;
        navPill.style.transform = `translate3d(${targetLeft}px, 0, 0)`;

        if (!animate) {
            void navPill.offsetWidth; // Force reflow
            navPill.style.transition = "";
        }
    }

    function setActiveSection(sectionId, animate = true) {
        const targetDesktopLink = navLinks.find((l) => l.dataset.section === sectionId);
        if (targetDesktopLink) {
            navLinks.forEach((l) => l.classList.remove("active"));
            targetDesktopLink.classList.add("active");
            syncNavPill(targetDesktopLink, animate);
        }

        mobileLinks.forEach((m) => {
            m.classList.toggle("active", m.dataset.section === sectionId);
        });
    }

    // Initialize Pill on DOM Ready & after Google Fonts finish loading
    const initialActive = document.querySelector(".nav-link.active") || navLinks[0];
    syncNavPill(initialActive, false);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            const current = document.querySelector(".nav-link.active") || navLinks[0];
            syncNavPill(current, false);
        });
    }

    // Recalculate pill geometry automatically on any viewport/container resize
    if (typeof ResizeObserver !== "undefined" && navTrack) {
        const trackObserver = new ResizeObserver(() => {
            const current = document.querySelector(".nav-link.active") || navLinks[0];
            syncNavPill(current, false);
        });
        trackObserver.observe(navTrack);
    }

    // Desktop Navbar Click Handler with Scroll-Lock Mutex
    navLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
            const sectionId = link.dataset.section;
            const targetSection = document.getElementById(sectionId);
            if (!targetSection) return;

            e.preventDefault();
            isClickScrolling = true;
            clearTimeout(scrollUnlockTimer);

            setActiveSection(sectionId, true);

            const headerOffset = 82;
            const targetY = targetSection.getBoundingClientRect().top + window.scrollY - headerOffset;
            window.scrollTo({ top: targetY, behavior: "smooth" });

            scrollUnlockTimer = setTimeout(() => {
                isClickScrolling = false;
            }, 850);
        });
    });

    // 60FPS RAF-Throttled Scroll Spy & Progress Hairline
    let scrollTicking = false;
    function onWindowScroll() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;

        if (siteHeader) {
            siteHeader.classList.toggle("is-compact", scrollY > 40);
        }
        if (navScrollProgress) {
            navScrollProgress.style.transform = `scaleX(${progress})`;
        }

        if (!isClickScrolling && sections.length) {
            const triggerPoint = scrollY + window.innerHeight * 0.34;
            let currentSectionId = sections[0].id;

            for (const sec of sections) {
                if (sec.offsetTop <= triggerPoint) {
                    currentSectionId = sec.id;
                }
            }
            setActiveSection(currentSectionId, true);
        }

        scrollTicking = false;
    }

    window.addEventListener(
        "scroll",
        () => {
            if (!scrollTicking) {
                window.requestAnimationFrame(onWindowScroll);
                scrollTicking = true;
            }
        },
        { passive: true }
    );

    // Live Ahmedabad (IST) Store Status & Clock
    function updateAhmedabadClock() {
        const clockEl = document.getElementById("amdavadClock");
        const dotEl = document.getElementById("storeStatusDot");
        if (!clockEl) return;

        try {
            const now = new Date();
            const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const hours = istTime.getHours();
            const isOpen = hours >= 11 || hours < 1; // 11:00 AM to 01:00 AM
            const timeStr = istTime.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });

            clockEl.textContent = isOpen
                ? `AMD ${timeStr} · Open til 1 AM`
                : `AMD ${timeStr} · Opens 11 AM`;

            if (dotEl) dotEl.classList.toggle("closed", !isOpen);
        } catch (_) {
            clockEl.textContent = "AMD · Open til 1 AM";
        }
    }
    updateAhmedabadClock();
    setInterval(updateAhmedabadClock, 30000);

// ========================================================================
    // 03. PROCEDURAL 3D STONE MONOLITH LOGO (DYNAMIC SVG LIGHT AZIMUTH & TILT)
    // ========================================================================
    const komoStoneLogo = document.getElementById("komoStoneLogo");
    const monolithBoulder = document.getElementById("monolithBoulder");
    const svgStoneLight = document.getElementById("svgStoneLight");

    if (komoStoneLogo && monolithBoulder) {
        komoStoneLogo.addEventListener("mousemove", (e) => {
            if (!isFinePointer()) return;
            const rect = monolithBoulder.getBoundingClientRect();
            const normX = (e.clientX - rect.left) / rect.width - 0.5;
            const normY = (e.clientY - rect.top) / rect.height - 0.5;

            // Subtle 3D sculptural tilt
            const tiltY = normX * 14;
            const tiltX = normY * -14;
            monolithBoulder.style.transform = `perspective(520px) rotateX(${tiltX.toFixed(1)}deg) rotateY(${tiltY.toFixed(1)}deg) scale(1.035)`;

            // Dynamically shift the SVG 3D stone relief light angle
            if (svgStoneLight) {
                const angle = Math.round(235 + normX * 70);
                svgStoneLight.setAttribute("azimuth", String(angle));
            }
        });

        komoStoneLogo.addEventListener("mouseleave", () => {
            monolithBoulder.style.transform = "perspective(520px) rotateX(0deg) rotateY(0deg) scale(1)";
            if (svgStoneLight) {
                svgStoneLight.setAttribute("azimuth", "235");
            }
        });
    }
    // ========================================================================
    // 04. MOBILE & TABLET ARCHITECTURAL SHEET DRAWER
    // ========================================================================
    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileBackdrop = document.getElementById("mobileBackdrop");

    function toggleMobileMenu(forceState) {
        if (!menuToggle || !mobileMenu) return;
        const shouldOpen =
            typeof forceState === "boolean"
                ? forceState
                : !mobileMenu.classList.contains("open");

        menuToggle.classList.toggle("open", shouldOpen);
        mobileMenu.classList.toggle("open", shouldOpen);
        menuToggle.setAttribute("aria-expanded", String(shouldOpen));
        mobileMenu.setAttribute("aria-hidden", String(!shouldOpen));
        document.body.style.overflow = shouldOpen ? "hidden" : "";
    }

    menuToggle?.addEventListener("click", () => toggleMobileMenu());
    mobileBackdrop?.addEventListener("click", () => toggleMobileMenu(false));

    mobileLinks.forEach((mLink) => {
        mLink.addEventListener("click", (e) => {
            const sectionId = mLink.dataset.section;
            const targetSection = document.getElementById(sectionId);
            toggleMobileMenu(false);

            if (targetSection) {
                e.preventDefault();
                isClickScrolling = true;
                clearTimeout(scrollUnlockTimer);
                setActiveSection(sectionId, true);

                const targetY = targetSection.getBoundingClientRect().top + window.scrollY - 76;
                window.scrollTo({ top: targetY, behavior: "smooth" });

                scrollUnlockTimer = setTimeout(() => {
                    isClickScrolling = false;
                }, 850);
            }
        });
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileMenu?.classList.contains("open")) {
            toggleMobileMenu(false);
        }
    });


    // ========================================================================
    // 05. MINIMALIST CUSTOM CURSOR & MAGNETIC BUTTONS (DESKTOP POINTER ONLY)
    // ========================================================================
    const customCursor = document.getElementById("customCursor");
    const cursorText = document.getElementById("cursorText");

    if (customCursor && typeof gsap !== "undefined" && isFinePointer()) {
        const xTo = gsap.quickTo(customCursor, "x", { duration: 0.14, ease: "power3.out" });
        const yTo = gsap.quickTo(customCursor, "y", { duration: 0.14, ease: "power3.out" });

        window.addEventListener("mousemove", (e) => {
            xTo(e.clientX);
            yTo(e.clientY);
        }, { passive: true });
    }

    // Event delegation so dynamically created elements (like menu cards) automatically trigger cursor states
    document.addEventListener("mouseover", (e) => {
        if (!isFinePointer() || !customCursor || !cursorText) return;
        const target = e.target.closest("[data-cursor]");
        if (target) {
            cursorText.textContent = target.dataset.cursor || "";
            customCursor.classList.add("active");
        }
    });

    document.addEventListener("mouseout", (e) => {
        if (!isFinePointer() || !customCursor || !cursorText) return;
        const target = e.target.closest("[data-cursor]");
        if (target) {
            cursorText.textContent = "";
            customCursor.classList.remove("active");
        }
    });

    // Magnetic Button Pull
    document.querySelectorAll(".magnetic").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
            if (!isFinePointer() || typeof gsap === "undefined") return;
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.22;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.22;
            gsap.to(btn, { x, y, duration: 0.25, ease: "power2.out" });
        });
        btn.addEventListener("mouseleave", () => {
            if (typeof gsap === "undefined") return;
            gsap.to(btn, { x: 0, y: 0, duration: 0.45, ease: "power2.out" });
        });
    });


    // ========================================================================
    // 06. SECTION 1: HERO KINETIC 5-SLICE ACCORDION DECK & VIDEO CONTROLLER
    // ========================================================================
    const deckSlices = Array.from(document.querySelectorAll(".deck-slice"));
    const cafeReelVideo = document.getElementById("cafeReelVideo");
    const videoSoundBtn = document.getElementById("videoSoundBtn");

    if (cafeReelVideo) {
        cafeReelVideo.play().catch(() => {});
    }

    function activateHeroSlice(targetSlice) {
        if (!targetSlice) return;
        deckSlices.forEach((s) => s.classList.remove("active"));
        targetSlice.classList.add("active");

        const hasVideo = targetSlice.querySelector("video");
        if (hasVideo && cafeReelVideo) {
            cafeReelVideo.play().catch(() => {});
        } else if (cafeReelVideo) {
            cafeReelVideo.pause();
        }
    }

    deckSlices.forEach((slice) => {
        slice.addEventListener("mouseenter", () => {
            if (isTabletOrAbove() && isFinePointer()) {
                activateHeroSlice(slice);
            }
        });
        slice.addEventListener("click", () => {
            activateHeroSlice(slice);
        });
    });

    if (videoSoundBtn && cafeReelVideo) {
        videoSoundBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            cafeReelVideo.muted = !cafeReelVideo.muted;
            videoSoundBtn.textContent = cafeReelVideo.muted ? "Muted" : "Sound On";
        });
    }


    // ========================================================================
    // 07. SECTION 2: 19-ITEM INTERACTIVE MENU & "AMDAVADI HONESTY MODE"
    // ========================================================================
    const menuCatalog = [
        // Popular (6)
        { title: "Mezze Platter", price: "₹890", cat: "popular", badge: "Most Ordered", desc: "House truffle hummus, smoky muhammara, crisp herb falafel, pickled olives & warm wood-fired pita.", meme: "Ordered ‘for the table’ so everyone feels healthy before demolishing a Fondue pot.", img: "https://images.unsplash.com/photo-1541514321650-3ce48eb909bc?auto=format&fit=crop&q=80&w=900" },
        { title: "Vegetable Pizza with Mozzarella", price: "₹780", cat: "popular", badge: "Wood-Fired", desc: "Hand-stretched sourdough crust, San Marzano tomatoes, fresh buffalo mozzarella & basil.", meme: "An Amdavadi table without at least one extra-cheese pizza is legally incomplete.", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=900" },
        { title: "Chilli Cheese Dimsum", price: "₹540", cat: "popular", badge: "Popular", desc: "Translucent steamed crystal parcels filled with molten aged cheddar and bird's eye chili.", meme: "Proof that if you put molten cheese and green chili inside anything, Ahmedabad will make it a bestseller.", img: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&q=80&w=900" },
        { title: "Edamame Truffle Dimsum", price: "₹590", cat: "popular", badge: "Chef Signature", desc: "Silky steamed edamame puree infused with aromatic Italian white truffle oil.", meme: "What the friend who just returned from a Europe trip insists on ordering for the group.", img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=900" },
        { title: "French Vanilla Latte", price: "₹320", cat: "popular", badge: "Kaffa Roastery", desc: "Single-origin Kaffa espresso balanced with velvety micro-foam and Madagascar vanilla.", meme: "Fuel for 2-hour startup brainstorming sessions that start at 10:30 PM.", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=900" },
        { title: "Cheese Fondue", price: "₹850", cat: "popular", badge: "Table Classic", desc: "Warm bubbling pot of Swiss Gruyère & Emmental served with herbed sourdough croutons.", meme: "Because regular cheese wasn’t enough—we needed a literal swimming pool of melted cheese.", img: "https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&q=80&w=900" },

        // Dimsum & Bao (3)
        { title: "Chilli Cheese Dimsum", price: "₹540", cat: "dimsum", badge: "Popular", desc: "Steamed translucent dumplings packed with spicy molten cheese & house chili oil.", meme: "Disappears from the bamboo steamer in 12 seconds flat.", img: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&q=80&w=900" },
        { title: "Edamame Truffle Dimsum", price: "₹590", cat: "dimsum", badge: "Popular", desc: "Delicate crystal skin piped with whipped edamame and black truffle aroma.", meme: "Tastes like luxury; pronouncing it correctly earns you +10 Bodakdev points.", img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=900" },
        { title: "Sweet Chilli Cottage Cheese Bao", price: "₹510", cat: "dimsum", badge: "Fluffy Bao", desc: "Cloud-soft lotus leaf buns stuffed with crispy glazed paneer, scallions & sesame.", meme: "Paneer Chilli upgraded with a passport and a first-class ticket.", img: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=900" },

        // Bistro & Mains (7)
        { title: "Thai Curry with Blue Pea Fried Rice", price: "₹740", cat: "bistro", badge: "5/5 Reviewed", desc: "Fragrant lemongrass coconut curry paired with butterfly-pea flower jasmine rice.", meme: "So photogenic and comforting that even your dada-dadi would approve.", img: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&q=80&w=900" },
        { title: "Avocado Burrata on Toast", price: "₹680", cat: "bistro", badge: "Artisanal Tartine", desc: "Charred country sourdough crowned with smashed Hass avocado, whole burrata & chili crisp.", meme: "Peak Sunday brunch energy after a morning walk on Sindhu Bhavan Road.", img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=900" },
        { title: "Nachos Grande", price: "₹560", cat: "bistro", badge: "Crowd Pleaser", desc: "Crisp house corn tortilla chips layered with warm queso, pico de gallo, jalapeños & sour cream.", meme: "The universal peace treaty while the table argues over what main course to order.", img: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&q=80&w=900" },
        { title: "Sriracha Paneer Chilli", price: "₹520", cat: "bistro", badge: "Spicy Wok", desc: "Wok-tossed artisanal cottage cheese glazed in smoky house sriracha and bell peppers.", meme: "When the group says ‘let’s try Italian tonight’ and still orders Paneer Chilli.", img: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?auto=format&fit=crop&q=80&w=900" },
        { title: "Peri Peri French Fries", price: "₹340", cat: "bistro", badge: "Table Staple", desc: "Hand-cut crispy potato fries dusted with fiery African peri-peri spice & truffle dip.", meme: "Ordered for the friend who said ‘I’m full, I won’t eat anything’ and then eats 80% of the basket.", img: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&q=80&w=900" },
        { title: "Vegetable Pizza with Mozzarella", price: "₹780", cat: "bistro", badge: "Wood-Fired", desc: "Blistered Neapolitan sourdough crust with garden toppings and fresh mozzarella.", meme: "Wood-fired perfection that beats every delivery box in West Ahmedabad.", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=900" },
        { title: "Cheese Fondue", price: "₹850", cat: "bistro", badge: "Popular", desc: "Melted Swiss cheese pot served with toasted garlic-herb sourdough cubes.", meme: "Rule #1: Don't drop your bread cube in the pot.", img: "https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&q=80&w=900" },

        // Coffee & Brews (6)
        { title: "French Vanilla Latte", price: "₹320", cat: "coffee", badge: "Popular", desc: "Signature Kaffa Arabica espresso with steamed organic milk and pure vanilla bean.", meme: "Warm hug in a cup while sitting under 2700K cove lights.", img: "https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&q=80&w=900" },
        { title: "Tiramisu Latte", price: "₹360", cat: "coffee", badge: "Dessert Brew", desc: "Mascarpone-infused latte dusted with Valrhona cocoa and savoiardi notes.", meme: "When you can't decide between coffee and dessert, so you drink both.", img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=900" },
        { title: "Cranberry Cold Brew", price: "₹340", cat: "coffee", badge: "18-Hr Steep", desc: "Slow-steeped dark roast poured over ruby cranberry reduction and sparkling tonic.", meme: "Ahmedabad’s favorite mocktail-disguised-as-specialty-coffee.", img: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=900" },
        { title: "Mocha Choco Chip Frappe", price: "₹380", cat: "coffee", badge: "Indulgent", desc: "Rich blended coffee with Belgian dark chocolate chips and whipped cream.", meme: "Technically 70% milkshake, 30% coffee, 100% happiness.", img: "https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&q=80&w=900" },
        { title: "Classic Cold Coffee", price: "₹310", cat: "coffee", badge: "Kaffa Icon", desc: "Thick, frothy chilled Arabica coffee crafted in the legendary Kaffa tradition.", meme: "The undefeated champion against 42°C Ahmedabad afternoons.", img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=900" },
        { title: "Lemon Iced Tea", price: "₹260", cat: "coffee", badge: "Refresher", desc: "Brisk Assam black tea shaken with fresh lemon zest and garden mint.", meme: "For the one non-coffee drinker in the friend group.", img: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&q=80&w=900" },

        // Desserts (2)
        { title: "Lotus Biscoff Cheesecake", price: "₹480", cat: "dessert", badge: "Bestseller", desc: "Creamy baked cheesecake with caramelized Belgian speculoos spread & crust.", meme: "‘We’ll just split one slice’ — famous last words before ordering a second plate.", img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=900" },
        { title: "Mango Sticky Rice Matcha", price: "₹420", cat: "dessert", badge: "Fusion Craft", desc: "Ceremonial Uji matcha layered with sweet coconut sticky rice and ripe mango.", meme: "Keri-ras obsession meets Japanese matcha aesthetics.", img: "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&q=80&w=900" }
    ];

    let isMemeMode = false;
    let activeCategory = "popular";

    const menuCardsGrid = document.getElementById("menuCardsGrid");
    const inspectImg = document.getElementById("inspectImg");
    const inspectBadge = document.getElementById("inspectBadge");
    const inspectTitle = document.getElementById("inspectTitle");
    const inspectPrice = document.getElementById("inspectPrice");
    const inspectDesc = document.getElementById("inspectDesc");
    const inspectMemeText = document.getElementById("inspectMemeText");
    const memeModeToggle = document.getElementById("memeModeToggle");
    const memeStatusText = document.getElementById("memeStatusText");

    function updateMenuInspector(item) {
        if (!item) return;
        if (inspectImg) inspectImg.src = item.img;
        if (inspectBadge) inspectBadge.textContent = item.badge;
        if (inspectTitle) inspectTitle.textContent = item.title;
        if (inspectPrice) inspectPrice.textContent = item.price;
        if (inspectDesc) inspectDesc.textContent = item.desc;
        if (inspectMemeText) inspectMemeText.textContent = `“${item.meme}”`;
    }

    function renderMenuCards(cat) {
        if (!menuCardsGrid) return;
        menuCardsGrid.innerHTML = "";
        const items = menuCatalog.filter((i) => i.cat === cat);

        items.forEach((item, index) => {
            const card = document.createElement("div");
            card.className = `menu-item-card ${index === 0 ? "selected" : ""}`;
            card.setAttribute("data-cursor", "Inspect");
            card.innerHTML = `
                <div class="m-card-head">
                    <h4>${item.title}</h4>
                    <span class="m-card-price">${item.price}</span>
                </div>
                <p class="m-card-sub">${isMemeMode ? "💬 " + item.meme : item.desc}</p>
            `;

            const handleSelect = () => {
                menuCardsGrid.querySelectorAll(".menu-item-card").forEach((c) => c.classList.remove("selected"));
                card.classList.add("selected");
                updateMenuInspector(item);
            };

            card.addEventListener("mouseenter", () => {
                if (isFinePointer()) handleSelect();
            });
            card.addEventListener("click", handleSelect);
            menuCardsGrid.appendChild(card);
        });

        if (items[0]) updateMenuInspector(items[0]);
    }

    renderMenuCards(activeCategory);

    document.querySelectorAll(".cat-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".cat-tab").forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            activeCategory = tab.dataset.cat;
            renderMenuCards(activeCategory);
        });
    });

    memeModeToggle?.addEventListener("click", () => {
        isMemeMode = !isMemeMode;
        memeModeToggle.classList.toggle("active", isMemeMode);
        memeModeToggle.setAttribute("aria-pressed", String(isMemeMode));
        if (memeStatusText) memeStatusText.textContent = isMemeMode ? "ON" : "OFF";
        renderMenuCards(activeCategory);
    });


    // ========================================================================
    // 08. SECTION 3: SCULPTURAL ATELIER, MORPHING CUTOUTS, DIMMER & LIGHTBOX
    // ========================================================================
    const atelier = document.getElementById("sculpturalAtelier");
    const specimenRows = Array.from(document.querySelectorAll(".specimen-row"));
    const filmThumbs = Array.from(document.querySelectorAll(".film-thumb"));
    const carvedWindowWell = document.getElementById("carvedWindowWell");
    const alcoveMainImg = document.getElementById("alcoveMainImg");
    const alcoveCode = document.getElementById("alcoveCode");
    const alcoveMaterialText = document.getElementById("alcoveMaterialText");
    const alcoveSwatchDot = document.getElementById("alcoveSwatchDot");
    const alcoveTitle = document.getElementById("alcoveTitle");
    const alcoveNote = document.getElementById("alcoveNote");
    const coveLightSlider = document.getElementById("coveLightSlider");
    const kelvinReadout = document.getElementById("kelvinReadout");

    const lightboxModal = document.getElementById("lightboxModal");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCaption = document.getElementById("lightboxCaption");
    const lightboxClose = document.getElementById("lightboxClose");

    let currentSpecIdx = 0;

    function selectSpecimen(index) {
        if (!specimenRows.length) return;
        currentSpecIdx = (index + specimenRows.length) % specimenRows.length;
        const row = specimenRows[currentSpecIdx];

        specimenRows.forEach((r, i) => r.classList.toggle("active", i === currentSpecIdx));
        filmThumbs.forEach((t, i) => t.classList.toggle("active", i === currentSpecIdx));

        if (carvedWindowWell && row.dataset.shape) {
            carvedWindowWell.style.borderRadius = row.dataset.shape;
        }

        if (alcoveMainImg) {
            alcoveMainImg.style.opacity = "0.25";
            setTimeout(() => {
                alcoveMainImg.onerror = () => {
                    if (row.dataset.fallback) alcoveMainImg.src = row.dataset.fallback;
                };
                alcoveMainImg.src = row.dataset.src;
                alcoveMainImg.style.opacity = "1";
            }, 130);
        }

        if (alcoveCode) alcoveCode.textContent = row.dataset.code || "";
        if (alcoveMaterialText) alcoveMaterialText.textContent = row.dataset.material || "";
        if (alcoveSwatchDot) alcoveSwatchDot.style.background = row.dataset.swatch || "#D9CBB8";
        if (alcoveTitle) alcoveTitle.textContent = row.dataset.title || "";
        if (alcoveNote) alcoveNote.textContent = row.dataset.note || "";
    }

    specimenRows.forEach((row, idx) => {
        row.addEventListener("mouseenter", () => {
            if (isDesktop() && isFinePointer()) selectSpecimen(idx);
        });
        row.addEventListener("click", () => selectSpecimen(idx));
    });

    filmThumbs.forEach((thumb, idx) => {
        thumb.addEventListener("click", () => selectSpecimen(idx));
    });

    document.getElementById("prevSpecimen")?.addEventListener("click", () => {
        selectSpecimen(currentSpecIdx - 1);
    });
    document.getElementById("nextSpecimen")?.addEventListener("click", () => {
        selectSpecimen(currentSpecIdx + 1);
    });

    // Interactive 2700K Cove Light Dimmer Slider
    if (coveLightSlider && atelier) {
        coveLightSlider.addEventListener("input", (e) => {
            const val = Number(e.target.value);
            const alpha = (val / 100).toFixed(2);
            atelier.style.setProperty("--cove-alpha", alpha);
            if (kelvinReadout) kelvinReadout.textContent = `2700K · ${val}%`;
            if (alcoveMainImg) {
                alcoveMainImg.style.filter = `brightness(${(0.8 + (val / 100) * 0.25).toFixed(2)})`;
            }
        });
    }

    // 3D Sculptural Parallax on Carved Window Well (Desktop Only)
    if (carvedWindowWell) {
        carvedWindowWell.addEventListener("mousemove", (e) => {
            if (!isFinePointer()) return;
            const rect = carvedWindowWell.getBoundingClientRect();
            const rotY = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
            const rotX = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
            carvedWindowWell.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        });
        carvedWindowWell.addEventListener("mouseleave", () => {
            carvedWindowWell.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
        });
    }

    // Unified Lightbox Controller
    function openLightbox(src, caption) {
        if (!lightboxModal || !lightboxImage) return;
        lightboxImage.src = src;
        if (lightboxCaption) lightboxCaption.textContent = caption || "";
        lightboxModal.classList.add("open");
        lightboxModal.setAttribute("aria-hidden", "false");
    }

    function closeLightbox() {
        if (!lightboxModal) return;
        lightboxModal.classList.remove("open");
        lightboxModal.setAttribute("aria-hidden", "true");
    }

    carvedWindowWell?.addEventListener("click", () => {
        if (!alcoveMainImg) return;
        const cap = `${alcoveCode?.textContent || ""} — ${alcoveTitle?.textContent || ""}: ${alcoveNote?.textContent || ""}`;
        openLightbox(alcoveMainImg.src, cap);
    });

    lightboxClose?.addEventListener("click", closeLightbox);
    lightboxModal?.addEventListener("click", (e) => {
        if (e.target === lightboxModal) closeLightbox();
    });
    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightboxModal?.classList.contains("open")) {
            closeLightbox();
        }
    });


    // ========================================================================
    // 09. SECTION 4: 12 PM – 1 AM SANCTUARY DIAL & 3D COASTER FLIPPER
    // ========================================================================
    const dialBtns = Array.from(document.querySelectorAll(".dial-btn"));
    const chronicleImg = document.getElementById("chronicleImg");
    const chronicleTimeBadge = document.getElementById("chronicleTimeBadge");
    const chronicleTag = document.getElementById("chronicleTag");
    const chronicleHeadline = document.getElementById("chronicleHeadline");
    const chronicleOrder = document.getElementById("chronicleOrder");

    dialBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            dialBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");

            if (chronicleImg) {
                chronicleImg.style.opacity = "0.28";
                setTimeout(() => {
                    chronicleImg.onerror = () => {
                        if (btn.dataset.fallback) chronicleImg.src = btn.dataset.fallback;
                    };
                    chronicleImg.src = btn.dataset.img;
                    chronicleImg.style.opacity = "1";
                }, 130);
            }

            if (chronicleTimeBadge) chronicleTimeBadge.textContent = btn.dataset.time || "";
            if (chronicleTag) chronicleTag.textContent = btn.dataset.tag || "";
            if (chronicleHeadline) chronicleHeadline.textContent = btn.dataset.headline || "";
            if (chronicleOrder) chronicleOrder.textContent = btn.dataset.order || "";
        });
    });

    // 3D Sandstone Coaster Deck (Amdavadi Table Lore)
    const coasterLoreData = [
        {
            tag: "#01 PARKING LORE",
            quote: "“Your friend says <em>‘Bas 5 minute, Pakwan cross karyu.’</em> Order the Peri Peri Fries now—they are still hunting for parking behind Rajpath Club.”",
            sub: "Verified by 99% of West Ahmedabad groups"
        },
        {
            tag: "#02 POTTERY WALL RULE",
            quote: "“If you didn’t take a portrait in front of the <em>backlit terracotta pottery alcove</em> or the sculpted stone KOMO sign, did you even visit Bodakdev?”",
            sub: "2700K Cove Light = Zero Filter Needed"
        },
        {
            tag: "#03 BISCOFF DIPLOMACY",
            quote: "“Every table orders one <em>Lotus Biscoff Cheesecake</em> with four spoons, and within 40 seconds it turns into a polite cold war over the last crust bite.”",
            sub: "Pro Tip: Just order two slices upfront"
        },
        {
            tag: "#04 THE 11:30 PM DRIVE",
            quote: "“Starts as a casual <em>‘chalo coffee piva’</em> drive; ends at 12:45 AM with a Wood-Fired Pizza, Truffle Dimsum, and three new startup ideas.”",
            sub: "Open Daily Until 01:00 AM"
        }
    ];

    let coasterIdx = 0;
    const activeCoasterCard = document.getElementById("activeCoasterCard");
    const coasterDeckTrigger = document.getElementById("coasterDeckTrigger");
    const coasterCounter = document.getElementById("coasterCounter");
    const coasterTag = document.getElementById("coasterTag");
    const coasterQuote = document.getElementById("coasterQuote");
    const coasterSub = document.getElementById("coasterSub");
    const coasterDots = Array.from(document.querySelectorAll(".c-dot"));

    function showCoaster(nextIndex) {
        if (!activeCoasterCard) return;
        coasterIdx = (nextIndex + coasterLoreData.length) % coasterLoreData.length;
        const item = coasterLoreData[coasterIdx];

        activeCoasterCard.classList.add("flipping");
        coasterDots.forEach((d, i) => d.classList.toggle("active", i === coasterIdx));

        setTimeout(() => {
            if (coasterCounter) coasterCounter.textContent = `COASTER 0${coasterIdx + 1} / 04`;
            if (coasterTag) coasterTag.textContent = item.tag;
            if (coasterQuote) coasterQuote.innerHTML = item.quote;
            if (coasterSub) coasterSub.textContent = item.sub;
            activeCoasterCard.classList.remove("flipping");
        }, 170);
    }

    coasterDeckTrigger?.addEventListener("click", () => {
        showCoaster(coasterIdx + 1);
    });

    coasterDots.forEach((dot, idx) => {
        dot.addEventListener("click", (e) => {
            e.stopPropagation();
            showCoaster(idx);
        });
    });


   // ========================================================================
    // 10. SECTION 5: INTERACTIVE TABLE SOMMELIER & LIVE WALK-IN CROWD RADAR
    // ========================================================================
    const moodPairings = {
        midnight: {
            est: "~₹900 / person (for 2)",
            verdict: "“The undefeated 11:30 PM Bodakdev trio—molten dimsum, blistered sourdough pizza, and a Biscoff finale.”",
            dishes: [
                { title: "Chilli Cheese Dimsum", price: "₹540", img: "https://images.unsplash.com/photo-1496116218417-1a781b1c416c?auto=format&fit=crop&q=80&w=600" },
                { title: "Wood-Fired Mozzarella Pizza", price: "₹780", img: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80&w=600" },
                { title: "Lotus Biscoff Cheesecake", price: "₹480", img: "https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&q=80&w=600" }
            ]
        },
        date: {
            est: "~₹845 / person (for 2)",
            verdict: "“Designed for the backlit pottery alcove—aromatic white truffle dumplings, blue-pea Thai curry, and tiramisu espresso.”",
            dishes: [
                { title: "Edamame Truffle Dimsum", price: "₹590", img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=600" },
                { title: "Thai Curry & Blue Pea Rice", price: "₹740", img: "https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?auto=format&fit=crop&q=80&w=600" },
                { title: "Tiramisu Latte", price: "₹360", img: "https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&q=80&w=600" }
            ]
        },
        feast: {
            est: "~₹1,150 / person (Group Share)",
            verdict: "“Built for the 16-seater timber table—start with wood-fired pita & hummus, dip into Swiss fondue, and cool down with Kaffa cold coffee.”",
            dishes: [
                { title: "Signature Mezze Platter", price: "₹890", img: "https://images.unsplash.com/photo-1541514321650-3ce48eb909bc?auto=format&fit=crop&q=80&w=600" },
                { title: "Classic Swiss Cheese Fondue", price: "₹850", img: "https://images.unsplash.com/photo-1548340748-6d2b7d7da280?auto=format&fit=crop&q=80&w=600" },
                { title: "Classic Cold Coffee", price: "₹310", img: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&q=80&w=600" }
            ]
        },
        work: {
            est: "~₹680 / person (Solo / Duo)",
            verdict: "“Acoustic stucco calm, fast Wi-Fi energy, creamy burrata sourdough, and an 18-hour steeped Cranberry Cold Brew.”",
            dishes: [
                { title: "Avocado Burrata on Toast", price: "₹680", img: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&q=80&w=600" },
                { title: "Peri Peri French Fries", price: "₹340", img: "https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&q=80&w=600" },
                { title: "Cranberry Cold Brew", price: "₹340", img: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&q=80&w=600" }
            ]
        }
    };

    const moodPills = Array.from(document.querySelectorAll(".mood-pill"));
    const trioCards = Array.from(document.querySelectorAll(".trio-dish-card"));
    const pairingEstTag = document.getElementById("pairingEstTag");
    const sommelierVerdict = document.getElementById("sommelierVerdict");
    const copyPairingBtn = document.getElementById("copyPairingBtn");
    const copyPairingText = document.getElementById("copyPairingText");
    let currentMoodKey = "midnight";

    function selectTableMood(moodKey) {
        const data = moodPairings[moodKey];
        if (!data) return;
        currentMoodKey = moodKey;

        moodPills.forEach((p) => p.classList.toggle("active", p.dataset.mood === moodKey));
        trioCards.forEach((c) => c.classList.add("dealing"));

        setTimeout(() => {
            data.dishes.forEach((dish, i) => {
                const idx = i + 1;
                const imgEl = document.getElementById(`trioImg${idx}`);
                const titleEl = document.getElementById(`trioTitle${idx}`);
                const priceEl = document.getElementById(`trioPrice${idx}`);
                if (imgEl) imgEl.src = dish.img;
                if (titleEl) titleEl.textContent = dish.title;
                if (priceEl) priceEl.textContent = dish.price;
            });

            if (pairingEstTag) pairingEstTag.textContent = data.est;
            if (sommelierVerdict) sommelierVerdict.textContent = data.verdict;
            if (copyPairingText) copyPairingText.textContent = "Save Order to Phone 📋";
            trioCards.forEach((c) => c.classList.remove("dealing"));
        }, 160);
    }

    moodPills.forEach((pill) => {
        pill.addEventListener("click", () => selectTableMood(pill.dataset.mood));
    });

    // 1-Tap Copy Curated Order to Phone Clipboard
    copyPairingBtn?.addEventListener("click", () => {
        const data = moodPairings[currentMoodKey];
        if (!data) return;
        const textToCopy = `KOMO by KAFFA Order (${data.est}):\n1. ${data.dishes[0].title} (${data.dishes[0].price})\n2. ${data.dishes[1].title} (${data.dishes[1].price})\n3. ${data.dishes[2].title} (${data.dishes[2].price})\n📍 Behind Rajpath Club, Bodakdev`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(textToCopy).catch(() => {});
        }
        if (copyPairingText) {
            copyPairingText.textContent = "Copied to Clipboard ✓";
            setTimeout(() => {
                copyPairingText.textContent = "Save Order to Phone 📋";
            }, 3000);
        }
    });

    // Live Ahmedabad Hour Walk-In Crowd Radar
    function syncWalkinRadar() {
        const waitTextEl = document.getElementById("crowdWaitText");
        const statusLabel = document.getElementById("walkinStatusLabel");
        const radarBars = Array.from(document.querySelectorAll(".r-bar"));
        if (!waitTextEl) return;

        try {
            const now = new Date();
            const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const hr = ist.getHours();

            let activeIdx = 0;
            let waitMsg = "Instant Walk-In Seating · Zero Wait";

            if (hr >= 1 && hr < 11) {
                if (statusLabel) statusLabel.textContent = "OPENS AT 11:00 AM";
                waitMsg = "Currently Closed · Opens 11 AM";
                activeIdx = 0;
            } else if (hr >= 11 && hr < 15) {
                activeIdx = 0;
                waitMsg = "Calm Midday Vaults · Instant Seating";
            } else if (hr >= 15 && hr < 18) {
                activeIdx = 1;
                waitMsg = "Afternoon Coffee Flow · Zero Wait";
            } else if (hr >= 18 && hr < 20) {
                activeIdx = 2;
                waitMsg = "Golden Hour Lively Vibe · ~5 Min Wait";
            } else if (hr >= 20 && hr < 23) {
                activeIdx = 3;
                waitMsg = "Peak Dinner Energy · ~10–15 Min Wait";
            } else {
                activeIdx = 4;
                waitMsg = "Late-Night Bistro Vibe · Instant Seating";
            }

            waitTextEl.textContent = waitMsg;
            radarBars.forEach((b, i) => b.classList.toggle("active", i === activeIdx));
        } catch (_) {}
    }
    syncWalkinRadar();


    // ========================================================================
    // 11. FOOTER: @zyrac__ COLOPHON SPOTLIGHT & GSAP SCROLL REVEALS
    // ========================================================================
    const zyracColophon = document.getElementById("zyracColophon");

    if (zyracColophon) {
        const updateZyracSpotlight = (clientX, clientY) => {
            const rect = zyracColophon.getBoundingClientRect();
            zyracColophon.style.setProperty("--zx", `${(clientX - rect.left).toFixed(0)}px`);
            zyracColophon.style.setProperty("--zy", `${(clientY - rect.top).toFixed(0)}px`);
        };

        zyracColophon.addEventListener("mousemove", (e) => {
            updateZyracSpotlight(e.clientX, e.clientY);
        }, { passive: true });

        zyracColophon.addEventListener("touchmove", (e) => {
            if (e.touches[0]) {
                updateZyracSpotlight(e.touches[0].clientX, e.touches[0].clientY);
            }
        }, { passive: true });
    }

    // Gentle Hardware-Accelerated Scroll Reveal for Section Blocks
    if (typeof gsap !== "undefined") {
        gsap.utils.toArray(".reveal-item").forEach((el) => {
            gsap.from(el, {
                scrollTrigger: {
                    trigger: el,
                    start: "top 88%",
                    once: true
                },
                y: 20,
                opacity: 0,
                duration: 0.7,
                ease: "power2.out"
            });
        });
    }
});