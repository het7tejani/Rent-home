document.addEventListener('commonScriptsReady', () => {
    initializeHomePage();
});

function initializeHomePage() {
    // --- Testimonial Slider ---
    const slider = document.getElementById('testimonialSlider');
    const prevButton = document.getElementById('prevTestimonial');
    const nextButton = document.getElementById('nextTestimonial');

    if (slider && prevButton && nextButton) {
        let isDown = false;
        let startX;
        let scrollLeft;
        let cardOuterWidth = 0; // Includes card width + gap

        const calculateCardWidth = () => {
            const firstCard = slider.querySelector('.testimonial-card');
            if (firstCard) {
               const gap = parseFloat(getComputedStyle(slider).gap || '0');
               cardOuterWidth = firstCard.offsetWidth + gap;
            }
        };

        const updateNavButtons = () => {
            if (!cardOuterWidth) calculateCardWidth();
            if (!cardOuterWidth) return; // Still no card width, bail

            const currentScroll = slider.scrollLeft;
            const maxScroll = slider.scrollWidth - slider.clientWidth;
            
            prevButton.disabled = currentScroll < cardOuterWidth / 3; // Disable if very close to start
            nextButton.disabled = currentScroll >= (maxScroll - cardOuterWidth / 3); // Disable if very close to end
        };
        
        const smoothScrollTo = (targetScrollLeft) => {
            slider.scrollTo({
                left: targetScrollLeft,
                behavior: 'smooth'
            });
        };

        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.classList.add('active-drag');
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
            slider.style.scrollSnapType = 'none'; // Disable snap during drag for smoother manual control
            slider.style.scrollBehavior = 'auto'; // Disable smooth scroll during drag
        });

        slider.addEventListener('mouseleave', () => {
            if (!isDown) return;
            isDown = false;
            slider.classList.remove('active-drag');
            slider.style.scrollSnapType = 'x mandatory';
            slider.style.scrollBehavior = 'smooth';
            snapToNearestCard();
        });

        slider.addEventListener('mouseup', () => {
            if (!isDown) return;
            isDown = false;
            slider.classList.remove('active-drag');
            slider.style.scrollSnapType = 'x mandatory';
            slider.style.scrollBehavior = 'smooth';
            snapToNearestCard();
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 1.5; // Adjusted drag sensitivity (was 2)
            slider.scrollLeft = scrollLeft - walk;
            updateNavButtons(); // Update buttons during drag
        });
        
        const snapToNearestCard = () => {
            if (!cardOuterWidth) calculateCardWidth();
            if (!cardOuterWidth) return;

            const currentScroll = slider.scrollLeft;
            // Calculate the ideal scroll position based on the current scroll and card width
            const nearestCardIndex = Math.round(currentScroll / cardOuterWidth);
            let targetScroll = nearestCardIndex * cardOuterWidth;

            // Ensure targetScroll is within bounds
            targetScroll = Math.max(0, Math.min(targetScroll, slider.scrollWidth - slider.clientWidth));
            
            smoothScrollTo(targetScroll);
        };


        prevButton.addEventListener('click', () => {
            if (!cardOuterWidth) calculateCardWidth();
            if (!cardOuterWidth) return;
            // Calculate target scroll: current scroll minus one card width, ensuring it's not less than 0
            const targetScroll = Math.max(0, slider.scrollLeft - cardOuterWidth);
            smoothScrollTo(targetScroll);
        });

        nextButton.addEventListener('click', () => {
             if (!cardOuterWidth) calculateCardWidth();
             if (!cardOuterWidth) return;
            // Calculate target scroll: current scroll plus one card width, ensuring it's not more than max scroll
            const targetScroll = Math.min(slider.scrollWidth - slider.clientWidth, slider.scrollLeft + cardOuterWidth);
            smoothScrollTo(targetScroll);
        });
        
        let scrollTimeout;
        slider.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            if (!isDown) { // Only update for non-drag scrolls (programmatic, keyboard, snap)
                scrollTimeout = setTimeout(() => {
                    updateNavButtons();
                }, 150); // Delay to catch end of smooth scroll
            }
        });


        document.addEventListener('keydown', (e) => {
            if (document.activeElement === slider || slider.contains(document.activeElement) || 
                document.activeElement === prevButton || document.activeElement === nextButton) {
                if (e.key === 'ArrowLeft') {
                    e.preventDefault(); // Prevent page scroll
                    prevButton.click();
                } else if (e.key === 'ArrowRight') {
                    e.preventDefault(); // Prevent page scroll
                    nextButton.click();
                }
            }
        });
        
        slider.setAttribute('tabindex', '0');

        setTimeout(() => {
            calculateCardWidth();
            updateNavButtons();
        }, 300); // Increased delay slightly for complex layouts

        window.addEventListener('resize', () => { 
            calculateCardWidth();
            snapToNearestCard(); 
            updateNavButtons(); // Also update buttons on resize
        });
    }

    // --- Dream House Endless Scroller ---
    initializeDreamHouseScroller();
}


function initializeDreamHouseScroller() {
    const scrollerWrapper = document.querySelector('.house-scroller-wrapper');
    const scroller = document.querySelector('.house-scroller');

    if (!scrollerWrapper || !scroller) {
        // console.warn('Dream House Scroller elements not found.');
        return;
    }

    const originalCards = Array.from(scroller.children);
    if (originalCards.length === 0) {
        // console.warn('No cards found in Dream House Scroller.');
        return;
    }

    // Duplicate cards for seamless looping
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        scroller.appendChild(clone);
    });

    // Calculate the width of the original set of cards (which is now half of the scroller's content)
    // This needs to be done *after* clones are added and styles are applied.
    // We use a slight delay or requestAnimationFrame to ensure layout is calculated.
    requestAnimationFrame(() => {
        // The width of one full set of original items
        const originalScrollerContentWidth = scroller.scrollWidth / 2;
        scroller.style.setProperty('--original-scroller-width', `${originalScrollerContentWidth}px`);

        // Pause animation on hover
        scrollerWrapper.addEventListener('mouseenter', () => {
            scroller.style.animationPlayState = 'paused';
        });

        scrollerWrapper.addEventListener('mouseleave', () => {
            scroller.style.animationPlayState = 'running';
        });
    });
}
