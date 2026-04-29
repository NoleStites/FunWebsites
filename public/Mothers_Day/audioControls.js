const bindAudioSlides = () => {
    const audioSlides = document.querySelectorAll('.audioSlide');
    
    const playShape = "M8 5v14l11-7z";
    const pauseShape = "M6 19h4V5H6v14zm8-14v14h4V5h-4z";

    const stopAllOthers = (currentAudio) => {
        document.querySelectorAll('audio').forEach(otherAudio => {
            if (otherAudio !== currentAudio) {
                otherAudio.pause();
                const otherSlide = otherAudio.closest('.audioSlide');
                if (otherSlide) {
                    const otherIcon = otherSlide.querySelector('.playIcon');
                    otherIcon.setAttribute('d', playShape);
                }
            }
        });
    };

    audioSlides.forEach(slide => {
        const audio = slide.querySelector('audio');
        const playBtn = slide.querySelector('.playBtn');
        const restartBtn = slide.querySelector('.restartBtn');
        const icon = playBtn.querySelector('.playIcon');

        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                stopAllOthers(audio);
                audio.play();
                icon.setAttribute('d', pauseShape);
            } else {
                audio.pause();
                icon.setAttribute('d', playShape);
            }
        });

        restartBtn.addEventListener('click', () => {
            stopAllOthers(audio);
            audio.currentTime = 0;
            audio.play();
            icon.setAttribute('d', pauseShape);
        });

        audio.addEventListener('ended', () => {
            icon.setAttribute('d', playShape);
            audio.currentTime = 0;
        });
    });
};

window.addEventListener('load', bindAudioSlides);