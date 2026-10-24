document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

   // =========================================================================
    // 1. ZERO-GLITCH SLIDING NAVBAR PILL + SCROLL PROGRESS + COFFEE EMBLEM SPIN
    // =========================================================================
    const siteHeader = document.getElementById("siteHeader");
    const navTrack = document.getElementById("navTrack");
    const navLinks = Array.from(document.querySelectorAll(".nav-link"));
    const mobileLinks = Array.from(document.querySelectorAll(".m-nav-link"));
    const navPill = document.getElementById("navPill");
    const navScrollProgress = document.getElementById("navScrollProgress");
    const coffeeEmblem = document.querySelector(".coffee-emblem");
    const sections = Array.from(document.querySelectorAll(".page-section"));

    // Mutex lock prevents IntersectionObserver from fighting click-initiated smooth scrolls
    let isClickScrolling = false;
    let scrollUnlockTimer = null;

    function syncNavPill(activeLink, animate = true) {
        if (!activeLink || !navPill || !navTrack) return;

        // Use offsetLeft & offsetWidth relative to .nav-track (100% immune to scroll/transform glitches)
        const targetWidth = activeLink.offsetWidth;
        const targetLeft = activeLink.offsetLeft;

        if (!animate) {
            navPill.style.transition = "none";
        } else {
            navPill.style.transition =
                "transform 0.36s cubic-bezier(0.22, 1, 0.36, 1), width 0.36s cubic-bezier(0.22, 1, 0.36, 1)";
        }

        navPill.style.width = `${targetWidth}px`;
        navPill.style.transform = `translate3d(${targetLeft}px, 0, 0)`;

        if (!animate) {
            // Force reflow so subsequent transitions stay silky
            void navPill.offsetWidth;
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

    // Initialize position immediately + after Google Fonts finish rendering
    const initialActive = document.querySelector(".nav-link.active") || navLinks[0];
    syncNavPill(initialActive, false);

    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
            const current = document.querySelector(".nav-link.active") || navLinks[0];
            syncNavPill(current, false);
        });
    }

    // Keep pill pixel-accurate on any window or track resize
    if (typeof ResizeObserver !== "undefined" && navTrack) {
        const trackObserver = new ResizeObserver(() => {
            const current = document.querySelector(".nav-link.active") || navLinks[0];
            syncNavPill(current, false);
        });
        trackObserver.observe(navTrack);
    }

    // Click handler with scroll-lock mutex so the pill glides straight to the clicked tab
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

            // Release mutex once smooth scroll settles
            scrollUnlockTimer = setTimeout(() => {
                isClickScrolling = false;
            }, 850);
        });
    });

    // Scroll-Spy via RAF-throttled scroll listener (more deterministic than multi-threshold IntersectionObserver)
    let scrollTicking = false;
    function onWindowScroll() {
        const scrollY = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(scrollY / docHeight, 1) : 0;

        // 1. Compact header state & 1px espresso progress bar
        siteHeader.classList.toggle("is-compact", scrollY > 40);
        if (navScrollProgress) {
            navScrollProgress.style.transform = `scaleX(${progress})`;
        }

        // 2. Subtle coffee bean emblem rotation synced with scroll
        if (coffeeEmblem) {
            coffeeEmblem.style.transform = `rotate(${scrollY * 0.08}deg)`;
        }

        // 3. Determine active section if not currently locked by a click scroll
        if (!isClickScrolling) {
            const triggerPoint = scrollY + window.innerHeight * 0.32;
            let currentSectionId = sections[0]?.id || "home";

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

    // Live Ahmedabad (IST) Store Status & Clock inside Navbar
    function updateAhmedabadClock() {
        const clockEl = document.getElementById("amdavadClock");
        const dotEl = document.getElementById("storeStatusDot");
        if (!clockEl) return;

        try {
            const now = new Date();
            const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
            const hours = istTime.getHours();
            // KOMO is open from 11:00 AM until 1:00 AM daily
            const isOpen = hours >= 11 || hours < 1;
            const timeStr = istTime.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
            });

            clockEl.textContent = isOpen
                ? `AMD ${timeStr} · Open til 1 AM`
                : `AMD ${timeStr} · Opens 11 AM`;

            if (dotEl) dotEl.classList.toggle("closed", !isOpen);
        } catch (err) {
            clockEl.textContent = "AMD · Open til 1 AM";
        }
    }
    updateAhmedabadClock();
    setInterval(updateAhmedabadClock, 30000);

    // =========================================================================
    // 2. MOBILE & TABLET ARCHITECTURAL DRAWER (WITH BACKDROP & ESC KEY)
    // =========================================================================
    const menuToggle = document.getElementById("menuToggle");
    const mobileMenu = document.getElementById("mobileMenu");
    const mobileBackdrop = document.getElementById("mobileBackdrop");

    function toggleMobileMenu(forceState) {
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

    if (menuToggle) {
        menuToggle.addEventListener("click", () => toggleMobileMenu());
    }
    if (mobileBackdrop) {
        mobileBackdrop.addEventListener("click", () => toggleMobileMenu(false));
    }

    mobileLinks.forEach((mLink) => {
        mLink.addEventListener("click", (e) => {
            const sectionId = mLink.dataset.section;
            const targetSection = document.getElementById(sectionId);
            toggleMobileMenu(false);

            if (targetSection) {
                e.preventDefault();
                setActiveSection(sectionId, true);
                const targetY = targetSection.getBoundingClientRect().top + window.scrollY - 76;
                window.scrollTo({ top: targetY, behavior: "smooth" });
            }
        });
    });

    window.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && mobileMenu.classList.contains("open")) {
            toggleMobileMenu(false);
        }
    });

    // =========================================================================
    // 3. MINIMALIST ARCHITECTURAL CURSOR & MAGNETIC BUTTONS
    // =========================================================================
    const customCursor = document.getElementById("customCursor");
    const cursorText = document.getElementById("cursorText");

    window.addEventListener("mousemove", (e) => {
        gsap.to(customCursor, { x: e.clientX, y: e.clientY, duration: 0.12, ease: "power2.out" });
    });

    function bindCursorTargets() {
        document.querySelectorAll("[data-cursor]").forEach((el) => {
            el.addEventListener("mouseenter", () => {
                cursorText.textContent = el.dataset.cursor;
                customCursor.classList.add("active");
            });
            el.addEventListener("mouseleave", () => {
                cursorText.textContent = "";
                customCursor.classList.remove("active");
            });
        });
    }
    bindCursorTargets();

    document.querySelectorAll(".magnetic").forEach((btn) => {
        btn.addEventListener("mousemove", (e) => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.2;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.2;
            gsap.to(btn, { x, y, duration: 0.25 });
        });
        btn.addEventListener("mouseleave", () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.4, ease: "power2.out" });
        });
    });

    // =========================================================================
    // 4. HERO KINETIC ACCORDION DECK (HOVER / TAP TO EXPAND + VIDEO PLAYBACK)
    // =========================================================================
    const deckSlices = document.querySelectorAll(".deck-slice");
    const cafeReelVideo = document.getElementById("cafeReelVideo");
    const videoSoundBtn = document.getElementById("videoSoundBtn");

    // Ensure the video starts playing immediately on load
    if (cafeReelVideo) {
        cafeReelVideo.play().catch(() => {});
    }

    function activateSlice(slice) {
        deckSlices.forEach((s) => s.classList.remove("active"));
        slice.classList.add("active");

        // Keep video playing when active, pause when collapsed to save battery
        const hasVideo = slice.querySelector("video");
        if (hasVideo && cafeReelVideo) {
            cafeReelVideo.play().catch(() => {});
        } else if (cafeReelVideo) {
            cafeReelVideo.pause();
        }
    }

    deckSlices.forEach((slice) => {
        // Desktop: Smooth expand on hover
        slice.addEventListener("mouseenter", () => {
            if (window.innerWidth > 768) activateSlice(slice);
        });
        // Mobile, Tablet & Desktop: Expand on tap/click
        slice.addEventListener("click", () => activateSlice(slice));
    });

    // Optional Mute/Unmute Pill inside the Video Slice
    if (videoSoundBtn && cafeReelVideo) {
        videoSoundBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            cafeReelVideo.muted = !cafeReelVideo.muted;
            videoSoundBtn.textContent = cafeReelVideo.muted ? "Muted" : "Sound On";
        });
    }
    // =========================================================================
    // 5. 19-ITEM INTERACTIVE MENU + "AMDAVADI HONESTY MODE" MEME TRANSLATOR
    // =========================================================================
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
        { title: "Edamame Truffle Dimsum", price: "₹590", cat: "dimsum", badge: "Popular", desc: "Delicate crystal skin piped with whipped edamame and black truffle aroma.", meme: "Tastes like luxury, pronouncing it correctly earns you +10 Bodakdev points.", img: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&q=80&w=900" },
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

    function updateInspector(item) {
        inspectImg.src = item.img;
        inspectBadge.textContent = item.badge;
        inspectTitle.textContent = item.title;
        inspectPrice.textContent = item.price;
        inspectDesc.textContent = item.desc;
        inspectMemeText.textContent = `“${item.meme}”`;
    }

    function renderMenu(cat) {
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

            const selectDish = () => {
                document.querySelectorAll(".menu-item-card").forEach((c) => c.classList.remove("selected"));
                card.classList.add("selected");
                updateInspector(item);
            };
            card.addEventListener("mouseenter", selectDish);
            card.addEventListener("click", selectDish);
            menuCardsGrid.appendChild(card);
        });

        if (items[0]) updateInspector(items[0]);
        bindCursorTargets();
    }

    renderMenu(activeCategory);

    document.querySelectorAll(".cat-tab").forEach((tab) => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".cat-tab").forEach((t) => t.classList.remove("active"));
            tab.classList.add("active");
            activeCategory = tab.dataset.cat;
            renderMenu(activeCategory);
        });
    });

    // Amdavadi Meme Mode Toggle
    memeModeToggle.addEventListener("click", () => {
        isMemeMode = !isMemeMode;
        memeModeToggle.classList.toggle("active", isMemeMode);
        memeModeToggle.setAttribute("aria-pressed", isMemeMode);
        memeStatusText.textContent = isMemeMode ? "ON" : "OFF";
        renderMenu(activeCategory);
    });

   // =========================================================================
    // 6. SCULPTURAL ATELIER: MORPHING ALCOVE CUTOUT + 2700K COVE LIGHT DIMMER
    // =========================================================================
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

    let currentSpecIdx = 0;

    function selectSpecimen(index) {
        if (!specimenRows.length) return;
        currentSpecIdx = (index + specimenRows.length) % specimenRows.length;
        const row = specimenRows[currentSpecIdx];

        specimenRows.forEach((r, i) => r.classList.toggle("active", i === currentSpecIdx));
        filmThumbs.forEach((t, i) => t.classList.toggle("active", i === currentSpecIdx));

        // Morph the carved plaster cutout silhouette organically
        if (carvedWindowWell && row.dataset.shape) {
            carvedWindowWell.style.borderRadius = row.dataset.shape;
        }

        // Cross-fade the local folder photo with fallback protection
        if (alcoveMainImg) {
            alcoveMainImg.style.opacity = "0.25";
            setTimeout(() => {
                alcoveMainImg.onerror = () => {
                    if (row.dataset.fallback) alcoveMainImg.src = row.dataset.fallback;
                };
                alcoveMainImg.src = row.dataset.src;
                alcoveMainImg.style.opacity = "1";
            }, 140);
        }

        if (alcoveCode) alcoveCode.textContent = row.dataset.code;
        if (alcoveMaterialText) alcoveMaterialText.textContent = row.dataset.material;
        if (alcoveSwatchDot) alcoveSwatchDot.style.background = row.dataset.swatch;
        if (alcoveTitle) alcoveTitle.textContent = row.dataset.title;
        if (alcoveNote) alcoveNote.textContent = row.dataset.note;
    }

    specimenRows.forEach((row, idx) => {
        row.addEventListener("mouseenter", () => {
            if (window.innerWidth > 960) selectSpecimen(idx);
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
            if (kelvinReadout) {
                kelvinReadout.textContent = `2700K · ${val}%`;
            }
            if (alcoveMainImg) {
                alcoveMainImg.style.filter = `brightness(${0.8 + (val / 100) * 0.25})`;
            }
        });
    }

    // Subtle 3D Sculptural Parallax on the Carved Window Well
    if (carvedWindowWell) {
        carvedWindowWell.addEventListener("mousemove", (e) => {
            const rect = carvedWindowWell.getBoundingClientRect();
            const rotY = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
            const rotX = ((e.clientY - rect.top) / rect.height - 0.5) * -8;
            carvedWindowWell.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        });
        carvedWindowWell.addEventListener("mouseleave", () => {
            carvedWindowWell.style.transform = "perspective(800px) rotateX(0deg) rotateY(0deg)";
        });
    }

    // Fullscreen Lightbox Trigger when clicking the Carved Alcove Window
    const lightboxModal = document.getElementById("lightboxModal");
    const lightboxImage = document.getElementById("lightboxImage");
    const lightboxCaption = document.getElementById("lightboxCaption");

    function openAlcoveLightbox() {
        if (!lightboxModal || !alcoveMainImg) return;
        lightboxImage.src = alcoveMainImg.src;
        lightboxCaption.textContent = `${alcoveCode?.textContent || ""} — ${alcoveTitle?.textContent || ""}: ${alcoveNote?.textContent || ""}`;
        lightboxModal.classList.add("open");
    }

    carvedWindowWell?.addEventListener("click", openAlcoveLightbox);
    document.getElementById("lightboxClose")?.addEventListener("click", () => {
        lightboxModal.classList.remove("open");
    });
    lightboxModal?.addEventListener("click", (e) => {
        if (e.target === lightboxModal) lightboxModal.classList.remove("open");
    });
    // =========================================================================
    // 7. STORY CHAPTER TABS & RESERVATION LIVE BILL ESTIMATOR
    // =========================================================================
    document.querySelectorAll(".chapter-item").forEach((chap) => {
        chap.addEventListener("click", () => {
            document.querySelectorAll(".chapter-item").forEach((c) => c.classList.remove("active"));
            chap.classList.add("active");
        });
    });

    const partyBtns = document.querySelectorAll("#partySizeSelector .seg-opt");
    const zoneBtns = document.querySelectorAll("#seatingZoneSelector .seg-opt");
    const liveSpendEstimate = document.getElementById("liveSpendEstimate");

    partyBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            partyBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            const count = Number(btn.dataset.guests);
            const min = (count * 800).toLocaleString("en-IN");
            const max = (count * 1400).toLocaleString("en-IN");
            liveSpendEstimate.textContent = `₹${min} – ₹${max} est. for ${count} Guests (₹800–1,800/person)`;
        });
    });

    zoneBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            zoneBtns.forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
        });
    });

    // Default Date to Today
    const guestDate = document.getElementById("guestDate");
    guestDate.valueAsDate = new Date();
    guestDate.min = new Date().toISOString().split("T")[0];

    const reservationForm = document.getElementById("reservationForm");
    const reservationFeedback = document.getElementById("reservationFeedback");

    reservationForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (!reservationForm.checkValidity()) {
            reservationForm.reportValidity();
            return;
        }

        const name = document.getElementById("guestName").value;
        const guests = document.querySelector("#partySizeSelector .active").textContent;
        const zone = document.querySelector("#seatingZoneSelector .active").dataset.zone;
        const timeSel = document.getElementById("guestTime");
        const timeText = timeSel.options[timeSel.selectedIndex].text;
        const btnLabel = document.getElementById("submitBtnLabel");

        btnLabel.textContent = "Confirming Table...";
        setTimeout(() => {
            btnLabel.textContent = "Confirm Table Request";
            document.getElementById("feedbackTitle").textContent = `Reserved for ${name} (${guests})`;
            document.getElementById("feedbackDetails").textContent = `${zone} · ${timeText} · Rajpath Rangoli Rd`;
            reservationFeedback.classList.add("show");
            reservationForm.reset();
            guestDate.valueAsDate = new Date();
        }, 600);
    });

    // Subtle Scroll Reveal
    gsap.utils.toArray(".reveal-item").forEach((el) => {
        gsap.from(el, {
            scrollTrigger: { trigger: el, start: "top 88%" },
            y: 22,
            opacity: 0,
            duration: 0.75,
            ease: "power2.out"
        });
    });

    // =========================================================================
    // SCULPTED STONE LOGO: 3D TILT & INTERACTIVE LED HALO LIGHT TRACKING
    // =========================================================================
    const komoStoneLogo = document.getElementById("komoStoneLogo");
    const stoneBoulder = komoStoneLogo?.querySelector(".stone-boulder");

    if (komoStoneLogo && stoneBoulder) {
        komoStoneLogo.addEventListener("mousemove", (e) => {
            const rect = stoneBoulder.getBoundingClientRect();
            const relX = ((e.clientX - rect.left) / rect.width) * 100;
            const relY = ((e.clientY - rect.top) / rect.height) * 100;

            // Shift the internal 2700K backlight glow toward the cursor
            stoneBoulder.style.setProperty("--halo-x", `${relX.toFixed(1)}%`);
            stoneBoulder.style.setProperty("--halo-y", `${relY.toFixed(1)}%`);

            // Subtle 3D sculptural tilt
            const tiltY = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
            const tiltX = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
            stoneBoulder.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.03)`;
        });

        komoStoneLogo.addEventListener("mouseleave", () => {
            stoneBoulder.style.setProperty("--halo-x", "50%");
            stoneBoulder.style.setProperty("--halo-y", "50%");
            stoneBoulder.style.transform = "rotateX(0deg) rotateY(0deg) scale(1)";
        });
    }
});