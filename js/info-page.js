document.addEventListener('DOMContentLoaded', () => {
    const animateCountUp = (element) => {
        const target = parseInt(element.dataset.target, 10);
        if (isNaN(target)) {
            console.error("Invalid data-target for count-up:", element.dataset.target, element);
            element.textContent = element.dataset.target; // Display original if not a number
            return;
        }

        const duration = 2000; // Animation duration in milliseconds
        const frameDuration = 1000 / 60; // 60 frames per second
        const totalFrames = Math.round(duration / frameDuration);
        let frame = 0;
        let currentCount = 0;

        // Initial display (optional, can be 0 from HTML)
        element.textContent = currentCount.toLocaleString();

        const counter = setInterval(() => {
            frame++;
            const progress = frame / totalFrames;
            // Ease outQuad function for smoother animation: progress * (2 - progress)
            const easedProgress = progress * (2 - progress);
            currentCount = Math.round(target * easedProgress);

            element.textContent = currentCount.toLocaleString();

            if (frame === totalFrames) {
                clearInterval(counter);
                element.textContent = target.toLocaleString(); // Ensure final value is exact
            }
        }, frameDuration);
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const statNumbersInSection = entry.target.querySelectorAll('.stat-number');
                statNumbersInSection.forEach(statNum => {
                    if (!statNum.dataset.animated) {
                        animateCountUp(statNum);
                        statNum.dataset.animated = 'true'; // Mark as animated
                    }
                });
                // Optionally, unobserve the parent section if animation should only run once per page load
                // observer.unobserve(entry.target); 
            }
        });
    };

    const statsSection = document.querySelector('.about-us-stats');

    if (statsSection) {
        const observerOptions = {
            root: null, // Observing relative to the viewport
            rootMargin: '0px',
            threshold: 0.1 // Trigger when 10% of the element is visible
        };
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        observer.observe(statsSection);
    } else {
        // Fallback if the .about-us-stats wrapper isn't found,
        // try to animate any .stat-number elements directly (less ideal for performance).
        console.warn('.about-us-stats section not found for IntersectionObserver. Animating all .stat-number elements directly if visible.');
        const allStatNumbers = document.querySelectorAll('.stat-number');
        allStatNumbers.forEach(statNum => {
            // This simple fallback won't respect scroll-into-view without an observer on each or a parent
            // For now, it will animate them if the script runs and they exist.
            // A more robust fallback would involve checking visibility of each.
            if (!statNum.dataset.animated) {
                 // A simple check if it's somewhat in view (very basic)
                const rect = statNum.getBoundingClientRect();
                if (rect.top < window.innerHeight && rect.bottom >= 0) {
                    animateCountUp(statNum);
                    statNum.dataset.animated = 'true';
                }
            }
        });
    }
});
