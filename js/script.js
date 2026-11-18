
        /* THEME */

        const themeToggle = document.getElementById('theme-toggle');
        const mobileThemeToggle = document.getElementById('mobile-theme-toggle');

        const themeIcon = document.getElementById('theme-icon');
        const mobileThemeIcon = document.getElementById('mobile-theme-icon');

        function updateThemeIcons() {

            const isDark = document.documentElement.classList.contains('dark');

            if (isDark) {

                themeIcon.className = 'fa-solid fa-sun';
                mobileThemeIcon.className = 'fa-solid fa-sun';

            } else {

                themeIcon.className = 'fa-solid fa-moon';
                mobileThemeIcon.className = 'fa-solid fa-moon';

            }
        }


        function toggleTheme() {

            document.documentElement.classList.toggle('dark');

            const isDark =
                document.documentElement.classList.contains('dark');

            localStorage.setItem(
                'theme',
                isDark ? 'dark' : 'light'
            );

            updateThemeIcons();
        }


        if (localStorage.getItem('theme') === 'dark') {

            document.documentElement.classList.add('dark');

        } else if (
            !localStorage.getItem('theme') &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
        ) {

            document.documentElement.classList.add('dark');

        }


        updateThemeIcons();

        themeToggle.addEventListener('click', toggleTheme);
        mobileThemeToggle.addEventListener('click', toggleTheme);


        /* MENU MOBILE */

        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const menuIcon = document.getElementById('menu-icon');

        menuToggle.addEventListener('click', function () {

            mobileMenu.classList.toggle('open');

            if (mobileMenu.classList.contains('open')) {

                menuIcon.className = 'fa-solid fa-xmark';

            } else {

                menuIcon.className = 'fa-solid fa-bars';

            }

        });


        document.querySelectorAll('.mobile-link').forEach(link => {

            link.addEventListener('click', function () {

                mobileMenu.classList.remove('open');

                menuIcon.className = 'fa-solid fa-bars';

            });

        });


        /* WHATSAPP POPUP */

        const whatsappButton =
            document.getElementById('whatsapp-button');

        const whatsappPopup =
            document.getElementById('whatsapp-popup');

        whatsappButton.addEventListener('click', function () {

            whatsappPopup.classList.toggle('show');

        });


        document.addEventListener('click', function (event) {

            if (
                !whatsappPopup.contains(event.target) &&
                !whatsappButton.contains(event.target)
            ) {

                whatsappPopup.classList.remove('show');

            }

        });


        /* TOAST */

        const toast = document.getElementById('toast');
        const toastContent = document.getElementById('toast-content');

        let toastTimeout;

        function showToast(message) {

            toastContent.textContent = message;

            toast.classList.add('show');

            clearTimeout(toastTimeout);

            toastTimeout = setTimeout(function () {

                toast.classList.remove('show');

            }, 4000);
        }


        /* FORMULAIRE CONTACT */

        const contactForm =
            document.getElementById('contact-form');

        const submitButton =
            document.getElementById('submit-button');

        const submitText =
            document.getElementById('submit-text');

        const submitLoader =
            document.getElementById('submit-loader');


        function cleanInput(value) {

            return value
                .replace(/[<>]/g, '')
                .trim();

        }


        function isValidEmail(email) {

            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        }


        function containsDangerousCode(value) {

            const dangerousPattern =
                /<script|javascript:|onerror\s*=|onload\s*=|<iframe|<object|<embed/i;

            return dangerousPattern.test(value);

        }


        contactForm.addEventListener('submit', async function (event) {

            event.preventDefault();


            const nameInput =
                document.getElementById('name');

            const emailInput =
                document.getElementById('email');

            const messageInput =
                document.getElementById('message');


            const name =
                cleanInput(nameInput.value);

            const email =
                cleanInput(emailInput.value);

            const message =
                cleanInput(messageInput.value);


            nameInput.value = name;
            emailInput.value = email;
            messageInput.value = message;


            if (name.length < 2) {

                showToast('Veuillez entrer un nom valide.');

                nameInput.focus();

                return;
            }


            if (!isValidEmail(email)) {

                showToast('Veuillez entrer une adresse e-mail valide.');

                emailInput.focus();

                return;
            }


            if (message.length < 10) {

                showToast('Votre message doit contenir au moins 10 caractères.');

                messageInput.focus();

                return;
            }


            if (
                containsDangerousCode(name) ||
                containsDangerousCode(email) ||
                containsDangerousCode(message)
            ) {

                showToast('Votre message contient du contenu non autorisé.');

                return;
            }


            submitButton.disabled = true;

            submitText.textContent = 'Envoi en cours...';

            submitLoader.classList.remove('hidden');


            try {

                const formData =
                    new FormData(contactForm);

                const response =
                    await fetch(
                        'https://api.web3forms.com/submit',
                        {
                            method: 'POST',
                            body: formData
                        }
                    );


                const result =
                    await response.json();


                if (result.success) {

                    showToast('Message envoyé avec succès !');

                    contactForm.reset();

                } else {

                    showToast(
                        'Une erreur est survenue. Veuillez réessayer.'
                    );

                }

            } catch (error) {

                showToast(
                    'Impossible d’envoyer le message pour le moment.'
                );

            } finally {

                submitButton.disabled = false;

                submitText.textContent =
                    'Envoyer le message';

                submitLoader.classList.add('hidden');

            }

        });


        /* CAROUSEL EXPÉRIENCE */

        const experienceCarousel =
            document.getElementById('experience-carousel');

        const experienceTrack =
            document.getElementById('experience-track');

        const experiencePrev =
            document.getElementById('experience-prev');

        const experienceNext =
            document.getElementById('experience-next');


        let carouselOffset = 0;

        let isDragging = false;

        let startX = 0;

        let startOffset = 0;

        let animationFrame = null;

        let lastTime = null;

        let dragMoved = false;

        let isHoveringCarousel = false;


        /* LARGEUR D'UNE SÉRIE */

        function getOriginalSetWidth() {

            const cards =
                experienceTrack.querySelectorAll('.experience-card');

            if (cards.length < 4) {
                return 0;
            }


            let width = 0;


            for (let i = 0; i < 4; i++) {

                width +=
                    cards[i].offsetWidth + 24;

            }


            return width;

        }


        /* NORMALISATION DE LA POSITION */

        function normalizeCarouselPosition() {

            const setWidth =
                getOriginalSetWidth();


            if (!setWidth) {
                return;
            }


            while (carouselOffset <= -setWidth) {

                carouselOffset += setWidth;

            }


            while (carouselOffset > 0) {

                carouselOffset -= setWidth;

            }

        }


        /* UPDATE */

        function updateCarousel() {

            experienceTrack.style.transform =
                `translate3d(${carouselOffset}px, 0, 0)`;

        }


        /* ANIMATION AUTOMATIQUE */

        function animateCarousel(timestamp) {

            if (lastTime === null) {

                lastTime = timestamp;

            }


            const delta =
                timestamp - lastTime;

            lastTime = timestamp;


            if (
                !isDragging &&
                !isHoveringCarousel
            ) {

                /* Vitesse du carousel */
                carouselOffset -=
                    (delta * 28) / 1000;

            }


            normalizeCarouselPosition();

            updateCarousel();


            animationFrame =
                requestAnimationFrame(animateCarousel);

        }


        animationFrame =
            requestAnimationFrame(animateCarousel);


        /* PAUSE AU SURVOL */

        experienceCarousel.addEventListener(
            'mouseenter',
            function () {

                isHoveringCarousel = true;

            }
        );


        experienceCarousel.addEventListener(
            'mouseleave',
            function () {

                isHoveringCarousel = false;

            }
        );


        /* BOUTON PREVIOUS */

        experiencePrev.addEventListener(
            'click',
            function () {

                const card =
                    experienceTrack.querySelector(
                        '.experience-card'
                    );


                if (!card) {
                    return;
                }


                const cardWidth =
                    card.offsetWidth + 24;


                carouselOffset += cardWidth;

                normalizeCarouselPosition();

                updateCarousel();

                lastTime = performance.now();

            }
        );


        /* BOUTON NEXT */

        experienceNext.addEventListener(
            'click',
            function () {

                const card =
                    experienceTrack.querySelector(
                        '.experience-card'
                    );


                if (!card) {
                    return;
                }


                const cardWidth =
                    card.offsetWidth + 24;


                carouselOffset -= cardWidth;

                normalizeCarouselPosition();

                updateCarousel();

                lastTime = performance.now();

            }
        );


        /* SOURIS : DÉBUT DU GLISSEMENT */

        experienceCarousel.addEventListener(
            'mousedown',
            function (event) {

                /* Seulement clic gauche */
                if (event.button !== 0) {
                    return;
                }


                isDragging = true;

                dragMoved = false;

                startX = event.clientX;

                startOffset = carouselOffset;

                lastTime = performance.now();


                experienceCarousel.classList.add(
                    'dragging'
                );


                event.preventDefault();

            }
        );


        /* SOURIS : DÉPLACEMENT */

        window.addEventListener(
            'mousemove',
            function (event) {

                if (!isDragging) {
                    return;
                }


                const delta =
                    event.clientX - startX;


                if (Math.abs(delta) > 5) {

                    dragMoved = true;

                }


                carouselOffset =
                    startOffset + delta;


                normalizeCarouselPosition();

                updateCarousel();

            }
        );


        /* SOURIS : FIN DU GLISSEMENT */

        window.addEventListener(
            'mouseup',
            function () {

                if (!isDragging) {
                    return;
                }


                isDragging = false;


                experienceCarousel.classList.remove(
                    'dragging'
                );


                lastTime = performance.now();


                /* Empêche le clic juste après un vrai déplacement */
                setTimeout(function () {

                    dragMoved = false;

                }, 80);

            }
        );


        /* SÉCURITÉ SI LA SOURIS SORT DE LA PAGE */

        window.addEventListener(
            'blur',
            function () {

                if (isDragging) {

                    isDragging = false;

                    experienceCarousel.classList.remove(
                        'dragging'
                    );

                    lastTime = performance.now();

                }

            }
        );


        /* MOBILE / TOUCH */

        experienceCarousel.addEventListener(
            'touchstart',
            function (event) {

                if (!event.touches.length) {
                    return;
                }


                isDragging = true;

                dragMoved = false;

                startX =
                    event.touches[0].clientX;

                startOffset =
                    carouselOffset;

                lastTime =
                    performance.now();


                experienceCarousel.classList.add(
                    'dragging'
                );

            },
            {
                passive: true
            }
        );


        experienceCarousel.addEventListener(
            'touchmove',
            function (event) {

                if (
                    !isDragging ||
                    !event.touches.length
                ) {
                    return;
                }


                const currentX =
                    event.touches[0].clientX;


                const delta =
                    currentX - startX;


                if (Math.abs(delta) > 5) {

                    dragMoved = true;

                }


                carouselOffset =
                    startOffset + delta;


                normalizeCarouselPosition();

                updateCarousel();

            },
            {
                passive: true
            }
        );


        experienceCarousel.addEventListener(
            'touchend',
            function () {

                if (!isDragging) {
                    return;
                }


                isDragging = false;


                experienceCarousel.classList.remove(
                    'dragging'
                );


                lastTime =
                    performance.now();


                setTimeout(function () {

                    dragMoved = false;

                }, 80);

            }
        );


        experienceCarousel.addEventListener(
            'touchcancel',
            function () {

                isDragging = false;

                experienceCarousel.classList.remove(
                    'dragging'
                );

                lastTime =
                    performance.now();

            }
        );


        /* EMPÊCHER LE CLIC APRÈS UN GLISSEMENT */

        experienceCarousel.addEventListener(
            'click',
            function (event) {

                if (dragMoved) {

                    event.preventDefault();

                    event.stopPropagation();

                    dragMoved = false;

                }

            },
            true
        );


        /* RESIZE */

        window.addEventListener(
            'resize',
            function () {

                const setWidth =
                    getOriginalSetWidth();


                if (!setWidth) {
                    return;
                }


                normalizeCarouselPosition();

                updateCarousel();

            }
        );


        /* EMPÊCHER LA SÉLECTION DE TEXTE PENDANT LE DRAG */

        experienceCarousel.addEventListener(
            'dragstart',
            function (event) {

                event.preventDefault();

            }
        );

