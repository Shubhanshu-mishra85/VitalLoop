/* =========================================================
   VITAL LOOP — VOICE SUPPORT
   File: js/voice.js
   ========================================================= */

(function () {
    "use strict";

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

    let recognition = null;
    let isListening = false;

    /* -------------------------------------------------------
       Browser Support
       ------------------------------------------------------- */

    function isRecognitionSupported() {
        return Boolean(SpeechRecognition);
    }

    function isSpeechSupported() {
        return Boolean(
            window.speechSynthesis
        );
    }

    /* -------------------------------------------------------
       Status
       ------------------------------------------------------- */

    function updateStatus(message) {
        document
            .querySelectorAll(
                "[data-voice-status]"
            )
            .forEach(function (element) {
                element.textContent = message;
            });
    }

    function updateButtons() {
        document
            .querySelectorAll(
                "[data-voice-start]"
            )
            .forEach(function (button) {
                button.classList.toggle(
                    "is-listening",
                    isListening
                );

                button.setAttribute(
                    "aria-pressed",
                    String(isListening)
                );

                button.setAttribute(
                    "aria-label",
                    isListening
                        ? "Stop voice input"
                        : "Start voice input"
                );
            });
    }

    /* -------------------------------------------------------
       Recognition Setup
       ------------------------------------------------------- */

    function createRecognition() {
        if (!isRecognitionSupported()) {
            updateStatus(
                "Voice input is not supported in this browser."
            );

            return null;
        }

        const instance =
            new SpeechRecognition();

        instance.continuous = false;
        instance.interimResults = true;
        instance.maxAlternatives = 1;

        instance.lang =
            document.documentElement.lang === "hi"
                ? "hi-IN"
                : "en-IN";

        instance.onstart = function () {
            isListening = true;

            updateStatus(
                "Listening… Please speak."
            );

            updateButtons();
        };

        instance.onresult = function (event) {
            let finalText = "";
            let interimText = "";

            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {
                const transcript =
                    event.results[i][0].transcript;

                if (
                    event.results[i].isFinal
                ) {
                    finalText += transcript;
                } else {
                    interimText += transcript;
                }
            }

            const text =
                finalText || interimText;

            if (text) {
                setVoiceResult(text);
            }
        };

        instance.onerror = function (event) {
            isListening = false;

            updateButtons();

            const errors = {
                "not-allowed":
                    "Microphone permission was not allowed.",
                "no-speech":
                    "No speech was detected. Please try again.",
                "audio-capture":
                    "No microphone was detected.",
                "network":
                    "Voice service is currently unavailable."
            };

            updateStatus(
                errors[event.error] ||
                "Voice input could not be completed."
            );
        };

        instance.onend = function () {
            isListening = false;

            updateButtons();

            if (
                !document.querySelector(
                    "[data-voice-error]"
                )
            ) {
                updateStatus(
                    "Voice input ready."
                );
            }
        };

        return instance;
    }

    /* -------------------------------------------------------
       Put Voice Result Into Input
       ------------------------------------------------------- */

    function setVoiceResult(text) {
        const input =
            document.querySelector(
                "[data-voice-input]"
            ) ||
            document.querySelector(
                'input[type="search"]'
            ) ||
            document.querySelector(
                ".search-input"
            );

        if (input) {
            input.value = text;

            input.dispatchEvent(
                new Event("input", {
                    bubbles: true
                })
            );

            input.dispatchEvent(
                new Event("change", {
                    bubbles: true
                })
            );
        }

        document
            .querySelectorAll(
                "[data-voice-result]"
            )
            .forEach(function (element) {
                element.textContent = text;
            });

        updateStatus(
            "Voice input received."
        );
    }

    /* -------------------------------------------------------
       Start Voice Input
       ------------------------------------------------------- */

    function startListening() {
        if (!isRecognitionSupported()) {
            updateStatus(
                "Voice input is not supported in this browser."
            );

            return;
        }

        if (isListening) {
            stopListening();
            return;
        }

        recognition =
            createRecognition();

        if (!recognition) return;

        try {
            recognition.start();
        } catch (error) {
            updateStatus(
                "Voice input could not be started."
            );
        }
    }

    /* -------------------------------------------------------
       Stop Voice Input
       ------------------------------------------------------- */

    function stopListening() {
        if (
            recognition &&
            isListening
        ) {
            try {
                recognition.stop();
            } catch (error) {
                // Recognition already stopped.
            }
        }

        isListening = false;
        updateButtons();
    }

    /* -------------------------------------------------------
       Text To Speech
       ------------------------------------------------------- */

    function speak(text) {
        if (!isSpeechSupported()) {
            return false;
        }

        if (!text || !String(text).trim()) {
            return false;
        }

        window.speechSynthesis.cancel();

        const utterance =
            new SpeechSynthesisUtterance(
                String(text)
            );

        const language =
            document.documentElement
                .getAttribute("data-language") ||
            "en";

        utterance.lang =
            language === "hi"
                ? "hi-IN"
                : "en-IN";

        utterance.rate = 0.95;
        utterance.pitch = 1;
        utterance.volume = 1;

        window.speechSynthesis.speak(
            utterance
        );

        return true;
    }

    /* -------------------------------------------------------
       Stop Speech
       ------------------------------------------------------- */

    function stopSpeaking() {
        if (
            window.speechSynthesis
        ) {
            window.speechSynthesis.cancel();
        }
    }

    /* -------------------------------------------------------
       Button Setup
       ------------------------------------------------------- */

    function setupControls() {
        document
            .querySelectorAll(
                "[data-voice-start]"
            )
            .forEach(function (button) {
                button.addEventListener(
                    "click",
                    startListening
                );
            });

        document
            .querySelectorAll(
                "[data-voice-speak]"
            )
            .forEach(function (button) {
                button.addEventListener(
                    "click",
                    function () {
                        const selector =
                            button.getAttribute(
                                "data-voice-speak"
                            );

                        let text = "";

                        if (selector) {
                            const target =
                                document.querySelector(
                                    selector
                                );

                            if (target) {
                                text =
                                    target.innerText ||
                                    target.textContent ||
                                    "";
                            }
                        } else {
                            text =
                                button.innerText ||
                                button.textContent ||
                                "";
                        }

                        speak(text);
                    }
                );
            });

        document
            .querySelectorAll(
                "[data-voice-stop]"
            )
            .forEach(function (button) {
                button.addEventListener(
                    "click",
                    stopSpeaking
                );
            });
    }

    /* -------------------------------------------------------
       Initialise
       ------------------------------------------------------- */

    function init() {
        setupControls();

        if (
            !isRecognitionSupported()
        ) {
            document
                .querySelectorAll(
                    "[data-voice-start]"
                )
                .forEach(function (button) {
                    button.setAttribute(
                        "aria-disabled",
                        "true"
                    );
                });
        }

        updateButtons();
    }

    /* -------------------------------------------------------
       Public API
       ------------------------------------------------------- */

    window.VitalLoopVoice = {
        start: startListening,
        stop: stopListening,
        speak: speak,
        stopSpeaking: stopSpeaking,
        supported:
            isRecognitionSupported()
    };

    if (
        document.readyState ===
        "loading"
    ) {
        document.addEventListener(
            "DOMContentLoaded",
            init
        );
    } else {
        init();
    }

})();
