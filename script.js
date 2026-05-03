// Complete Swiper configuration with header, sections, and footer
let swiper = null;
let headerData = {};
let sectionsData = [];
let footerData = {};
let timerInterval = null;

// Function to load all JSON configurations
async function loadAllConfigurations() {
    try {
        document.getElementById('loading').style.display = 'block';

        // Load header configuration
        const headerResponse = await fetch('./header-config.json');
        const headerConfig = await headerResponse.json();
        headerData = headerConfig.header;

        // Load sections configuration
        const sectionsResponse = await fetch('./sections-config.json');
        const sectionsConfig = await sectionsResponse.json();
        sectionsData = sectionsConfig.sections;

        // Load footer configuration
        const footerResponse = await fetch('./footer-config.json');
        const footerConfig = await footerResponse.json();
        footerData = footerConfig.footer;

        return {
            header: headerData,
            sections: sectionsData,
            footer: footerData
        };
    } catch (error) {
        console.error('Error loading configurations:', error);
        return {
            header: {},
            sections: [],
            footer: {}
        };
    } finally {
        document.getElementById('loading').style.display = 'none';
    }
}

// Function to calculate elapsed time from timestamp
function calculateElapsedTime(startTimestamp) {
    const now = Math.floor(Date.now() / 1000);
    const elapsed = now - startTimestamp;

    if (elapsed < 0) {
        return {
            years: 0,
            months: 0,
            days: 0,
            hours: 0,
            minutes: 0,
            seconds: 0
        };
    }

    const years = Math.floor(elapsed / (365 * 24 * 3600));
    const months = Math.floor((elapsed % (365 * 24 * 3600)) / (30 * 24 * 3600));
    const days = Math.floor((elapsed % (30 * 24 * 3600)) / (24 * 3600));
    const hours = Math.floor((elapsed % (24 * 3600)) / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;

    return { years, months, days, hours, minutes, seconds };
}

// Function to update timer display
function updateTimer() {
    if (!footerData.startTimestamp) return;

    const elapsed = calculateElapsedTime(footerData.startTimestamp);

    const timerElements = {
        years: document.getElementById('timer-years'),
        months: document.getElementById('timer-months'),
        days: document.getElementById('timer-days'),
        hours: document.getElementById('timer-hours'),
        minutes: document.getElementById('timer-minutes'),
        seconds: document.getElementById('timer-seconds')
    };

    // Update each timer element if it exists
    Object.keys(timerElements).forEach(key => {
        if (timerElements[key]) {
            timerElements[key].textContent = elapsed[key];
        }
    });
}

// Function to start timer updates
function startTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    updateTimer();
    timerInterval = setInterval(updateTimer, 1000);
}

// Function to stop timer
function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// Function to get responsive background image URL
function getResponsiveBackgroundImage(headerConfig) {
    const isMobile = window.innerWidth <= 768;

    if (isMobile && headerConfig.mobileBackgroundImage) {
        return headerConfig.mobileBackgroundImage;
    }

    return headerConfig.backgroundImage;
}

// Function to generate HTML for header slide
function generateHeaderHTML(headerConfig) {
    const backgroundImage = getResponsiveBackgroundImage(headerConfig);

    return `
        <div class="swiper-slide swiper-slide-header" style="background-image: url('${backgroundImage}')">
            <div class="header-content">
                <h1 class="header-heading">${headerConfig.heading}</h1>
                <p class="header-subheading">${headerConfig.subheading}</p>
            </div>
        </div>
    `;
}

// Function to generate HTML for a regular slide
function generateSlideHTML(section, index) {
    return `
        <div class="swiper-slide ${section.id}">
            <div class="swiper-image" 
                 data-swiper-parallax-y="${section.left.parallaxY}"
                 style="background-image: url('${section.left.backgroundImage}')">
                <div class="swiper-image-inner swiper-image-left">
                    <h1>${section.left.title}</h1>
                    <p>${section.left.subtitle}</p>
                </div>
            </div>
            <div class="swiper-image" 
                 data-swiper-parallax-y="${section.right.parallaxY}"
                 style="background-image: url('${section.right.backgroundImage}')">
                <div class="swiper-image-inner swiper-image-right">
                    <p class="paragraph">${section.right.content}</p>
                </div>
            </div>
        </div>
    `;
}

// Function to generate HTML for footer slide
function generateFooterHTML(footerConfig) {
    return `
        <div class="swiper-slide swiper-slide-footer" style="background-image: url('${footerConfig.backgroundImage}')">
            <div class="footer-content">
                <h1 class="footer-heading">${footerConfig.heading}</h1>
                <p class="footer-subheading">${footerConfig.subheading}</p>
                <div class="timer-container">
                    <div class="timer-display">
                        <div class="timer-row">
                            <span class="timer-label">Years</span>
                            <span class="timer-value" id="timer-years">0</span>
                        </div>
                        <div class="timer-row">
                            <span class="timer-label">Months</span>
                            <span class="timer-value" id="timer-months">0</span>
                        </div>
                        <div class="timer-row">
                            <span class="timer-label">Days</span>
                            <span class="timer-value" id="timer-days">0</span>
                        </div>
                        <div class="timer-row">
                            <span class="timer-label">Hours</span>
                            <span class="timer-value" id="timer-hours">0</span>
                        </div>
                        <div class="timer-row">
                            <span class="timer-label">Minutes</span>
                            <span class="timer-value" id="timer-minutes">0</span>
                        </div>
                        <div class="timer-row">
                            <span class="timer-label">Seconds</span>
                            <span class="timer-value" id="timer-seconds">0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Function to render all slides: header + sections + footer
function renderAllSlides(header, sections, footer) {
    const swiperWrapper = document.getElementById('swiper-wrapper');
    swiperWrapper.innerHTML = '';

    // Add header slide first
    if (header && Object.keys(header).length > 0) {
        swiperWrapper.innerHTML += generateHeaderHTML(header);
    }

    // Add regular sections
    sections.forEach((section, index) => {
        swiperWrapper.innerHTML += generateSlideHTML(section, index);
    });

    // Add footer slide last
    if (footer && Object.keys(footer).length > 0) {
        swiperWrapper.innerHTML += generateFooterHTML(footer);
    }
}

// Function to check if it's a mobile device
function isMobileDevice() {
    return window.innerWidth <= 768;
}

// Function to initialize Swiper
function initSwiper() {
    const isMobile = isMobileDevice();

    swiper = new Swiper(".swiper-container", {
        direction: isMobile ? "horizontal" : "vertical",
        loop: false,
        grabCursor: true,
        speed: 1000,
        parallax: true,
        autoplay: false,
        effect: "slide",
        mousewheelControl: !isMobile,
        touchRatio: 1,
        threshold: 10,
        shortSwipes: true,
        longSwipesRatio: 0.5,
        // Responsive breakpoints
        breakpoints: {
            768: {
                direction: "vertical",
                mousewheelControl: true,
                parallax: true
            },
            0: {
                direction: "horizontal",
                mousewheelControl: false,
                parallax: true
            }
        },
        // Swiper event callbacks
        onSlideChangeStart: function (swiper) {
            // Start timer when footer slide becomes active
            const activeSlide = swiper.slides[swiper.activeIndex];
            if (activeSlide && activeSlide.classList.contains('swiper-slide-footer')) {
                setTimeout(startTimer, 200);
            }
        },
        onSlideChangeEnd: function (swiper) {
            // Continue timer for footer slide
            const activeSlide = swiper.slides[swiper.activeIndex];
            if (!activeSlide || !activeSlide.classList.contains('swiper-slide-footer')) {
                // Timer continues running in background
            }
        }
    });

    return swiper;
}

// Function to update header background image on resize
function updateHeaderBackgroundImage() {
    const headerSlide = document.querySelector('.swiper-slide-header');
    if (headerSlide && headerData && Object.keys(headerData).length > 0) {
        const newBackgroundImage = getResponsiveBackgroundImage(headerData);
        headerSlide.style.backgroundImage = `url('${newBackgroundImage}')`;
    }
}

// Function to initialize the entire application
async function initApp() {
    try {
        // Load all configurations
        const config = await loadAllConfigurations();

        if (config.sections.length === 0) {
            console.error('No sections loaded');
            return;
        }

        // Render all slides
        renderAllSlides(config.header, config.sections, config.footer);

        // Initialize Swiper after DOM is ready
        setTimeout(() => {
            initSwiper();
            // Start timer immediately so it runs in background
            if (config.footer && config.footer.startTimestamp) {
                startTimer();
            }
        }, 100);

    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

// Handle window resize
let resizeTimeout;
window.addEventListener('resize', function () {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function () {
        if (swiper) {
            swiper.destroy(true, true);
        }

        // Update header background image for new screen size
        updateHeaderBackgroundImage();

        // Re-render slides with current data
        if (sectionsData.length > 0) {
            renderAllSlides(headerData, sectionsData, footerData);
            setTimeout(() => {
                initSwiper();
                // Restart timer after resize
                if (footerData && footerData.startTimestamp) {
                    startTimer();
                }
            }, 100);
        }
    }, 250);
});

// Clean up timer when page unloads
window.addEventListener('beforeunload', function () {
    stopTimer();
});

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    initApp();
});

// Fallback for older browsers
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Export functions for potential external use
window.SwiperApp = {
    loadAllConfigurations,
    renderAllSlides,
    initSwiper,
    startTimer,
    stopTimer,
    updateTimer,
    updateHeaderBackgroundImage,
    getHeaderData: () => headerData,
    getSectionsData: () => sectionsData,
    getFooterData: () => footerData
};