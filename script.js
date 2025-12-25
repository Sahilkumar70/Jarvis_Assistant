 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert('Sorry! Your browser does not support Speech Recognition. Please use Chrome or Edge.');
        }

        // Create recognition instance
        const recognition = new SpeechRecognition();
        
        // Configure recognition settings
        recognition.continuous = false; // Stop after one result
        recognition.interimResults = false; // Only final results
        recognition.lang = 'en-US'; // Default language is English
        
        // Get DOM elements
        const micButton = document.getElementById('micButton');
        const status = document.getElementById('status');
        const output = document.getElementById('output');
        
        // Variable to track if recognition is active
        let isListening = false;
        /**
         * Function to make JARVIS speak
         * @param {string} text - The text to speak
         * @param {string} lang - Language code ('en-US' or 'hi-IN')
         */
        function speak(text, lang = 'en-US') {
            // Create speech synthesis utterance
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 1.0; // Speech rate (0.1 to 10)
            utterance.pitch = 1.0; // Voice pitch (0 to 2)
            utterance.volume = 1.0; // Volume (0 to 1)
            
            // Speak the text
            window.speechSynthesis.speak(utterance);
        }

        /**
         * Add user message to output display
         * @param {string} text - The user's command
         */
        function addUserMessage(text) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message user-message';
            messageDiv.innerHTML = `
                <div class="message-label">You said</div>
                <div class="message-text">${text}</div>
            `;
            output.appendChild(messageDiv);
            output.scrollTop = output.scrollHeight; // Auto scroll to bottom
        }

        /**
         * Add JARVIS response to output display
         * @param {string} text - JARVIS's response
         */
        function addJarvisMessage(text) {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message jarvis-message';
            messageDiv.innerHTML = `
                <div class="message-label">JARVIS</div>
                <div class="message-text">${text}</div>
            `;
            output.appendChild(messageDiv);
            output.scrollTop = output.scrollHeight; // Auto scroll to bottom
        }

        /**
         * Update status display
         * @param {string} text - Status text
         * @param {boolean} listening - Whether currently listening
         */
        function updateStatus(text, listening = false) {
            status.textContent = text;
            if (listening) {
                status.classList.add('listening');
            } else {
                status.classList.remove('listening');
            }
        }

        // ============================================
        // COMMAND PROCESSING
        // ============================================
        
        /**
         * Process voice commands and execute actions
         * @param {string} command - The voice command received
         */
        function processCommand(command) {
            // Convert to lowercase for easier matching
            const lowerCommand = command.toLowerCase();
            
            // Variable to store JARVIS response
            let response = '';
            let responseLang = 'en-US';

            // ===== GREETING COMMANDS =====
            if (lowerCommand.includes('hello') || lowerCommand.includes('hi jarvis') || 
                lowerCommand.includes('hey jarvis')) {
                response = 'Hello sir, ready for commands!';
            }
            
            // ===== TIME COMMANDS (English & Hindi) =====
            else if (lowerCommand.includes('time') || lowerCommand.includes('समय') || 
                     lowerCommand.includes('time bata')) {
                const now = new Date();
                const hours = now.getHours();
                const minutes = now.getMinutes().toString().padStart(2, '0');
                const ampm = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 || 12;
                
                if (lowerCommand.includes('bata') || lowerCommand.includes('समय')) {
                    response = `समय है ${displayHours} बजकर ${minutes} मिनट ${ampm}`;
                    responseLang = 'hi-IN';
                } else {
                    response = `The time is ${displayHours}:${minutes} ${ampm}`;
                }
            }
            
            // ===== YOUTUBE COMMANDS (English & Hindi) =====
            else if (lowerCommand.includes('youtube') || lowerCommand.includes('यूट्यूब')) {
                window.open('https://www.youtube.com', '_blank');
                
                if (lowerCommand.includes('khol') || lowerCommand.includes('खोल')) {
                    response = 'YouTube खोल रहा हूं sir';
                    responseLang = 'hi-IN';
                } else {
                    response = 'Opening YouTube for you, sir';
                }
            }
            
            // ===== GOOGLE COMMANDS (English & Hindi) =====
            else if (lowerCommand.includes('google') || lowerCommand.includes('गूगल') || 
                     lowerCommand.includes('search kar')) {
                window.open('https://www.google.com', '_blank');
                
                if (lowerCommand.includes('search kar') || lowerCommand.includes('खोल')) {
                    response = 'Google खोल रहा हूं sir';
                    responseLang = 'hi-IN';
                } else {
                    response = 'Opening Google for you, sir';
                }
            }
            
            // ===== STOP COMMAND =====
            else if (lowerCommand.includes('stop') || lowerCommand.includes('band') || 
                     lowerCommand.includes('रुक')) {
                response = 'Stopping voice recognition. Click the button to start again.';
                stopListening();
            }
            
            // ===== UNKNOWN COMMAND =====
            else {
                response = "I didn't understand that command. Please try again or check available commands.";
            }

            // Display and speak the response
            if (response) {
                addJarvisMessage(response);
                speak(response, responseLang);
            }
        }

        // ============================================
        // RECOGNITION EVENT HANDLERS
        // ============================================
        
        /**
         * Called when speech recognition starts
         */
        recognition.onstart = function() {
            isListening = true;
            micButton.classList.add('active');
            updateStatus('🎤 Listening... Speak now!', true);
        };

        /**
         * Called when speech recognition gets a result
         */
        recognition.onresult = function(event) {
            // Get the transcript (what was heard)
            const transcript = event.results[0][0].transcript;
            
            // Display what user said
            addUserMessage(transcript);
            updateStatus('Processing command...', false);
            
            // Process the command
            setTimeout(() => {
                processCommand(transcript);
                updateStatus('Click the button and speak a command', false);
            }, 500);
        };

        /**
         * Called when speech recognition ends
         */
        recognition.onend = function() {
            isListening = false;
            micButton.classList.remove('active');
            
            // Only update status if not already showing another message
            if (status.textContent.includes('Listening')) {
                updateStatus('Click the button and speak a command', false);
            }
        };

        /**
         * Called when speech recognition encounters an error
         */
        recognition.onerror = function(event) {
            isListening = false;
            micButton.classList.remove('active');
            
            let errorMessage = 'Error occurred: ';
            
            switch(event.error) {
                case 'no-speech':
                    errorMessage += 'No speech detected. Please try again.';
                    break;
                case 'audio-capture':
                    errorMessage += 'Microphone not found. Please check your device.';
                    break;
                case 'not-allowed':
                    errorMessage += 'Microphone permission denied. Please allow microphone access.';
                    break;
                default:
                    errorMessage += event.error;
            }
            
            updateStatus(errorMessage, false);
            addJarvisMessage(errorMessage);
        };

        // ============================================
        // MICROPHONE BUTTON CLICK HANDLER
        // ============================================
        
        /**
         * Start/stop voice recognition when button is clicked
         */
        micButton.addEventListener('click', function() {
            if (isListening) {
                // Stop recognition if already listening
                recognition.stop();
                updateStatus('Stopped listening', false);
            } else {
                // Start recognition
                try {
                    recognition.start();
                } catch (error) {
                    console.error('Recognition error:', error);
                    updateStatus('Failed to start. Please try again.', false);
                }
            }
        });

        /**
         * Stop listening function
         */
        function stopListening() {
            if (isListening) {
                recognition.stop();
            }
            updateStatus('Voice recognition stopped', false);
        }

        // ============================================
        // KEYBOARD SHORTCUT (OPTIONAL)
        // ============================================
        
        /**
         * Press SPACE key to toggle microphone
         */
        document.addEventListener('keydown', function(event) {
            if (event.code === 'Space' && event.target === document.body) {
                event.preventDefault();
                micButton.click();
            }
        });

        // ============================================
        // INITIALIZATION
        // ============================================
        
        // Welcome message on page load
        console.log('%c🤖 JARVIS AI Assistant Initialized', 'color: #00d4ff; font-size: 20px; font-weight: bold;');
        console.log('%cPress the microphone button or SPACE key to start', 'color: #8a2be2; font-size: 14px;');
        
        // Speak welcome message
        setTimeout(() => {
            speak('Systems online. Ready to assist you, sir.');
        }, 1000);