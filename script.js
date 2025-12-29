 const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (!SpeechRecognition) {
            alert('Sorry! Your browser does not support Speech Recognition. Please use Chrome or Edge.');
        }

  
        const recognition = new SpeechRecognition();
        
      
        recognition.continuous = false; // Stop after one result
        recognition.interimResults = false; // Only final results
        recognition.lang = 'en-US'; // Default language is English
        
    
        const micButton = document.getElementById('micButton');
        const status = document.getElementById('status');
        const output = document.getElementById('output');
        
       
        let isListening = false;
       
        function speak(text, lang = 'en-US') {
           
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang;
            utterance.rate = 1.0; // Speech rate (0.1 to 10)
            utterance.pitch = 1.0; // Voice pitch (0 to 2)
            utterance.volume = 1.0; // Volume (0 to 1)
            
            window.speechSynthesis.speak(utterance);
        }

    
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

  
        function updateStatus(text, listening = false) {
            status.textContent = text;
            if (listening) {
                status.classList.add('listening');
            } else {
                status.classList.remove('listening');
            }
        }

      
        function processCommand(command) {
         
            const lowerCommand = command.toLowerCase();
            
          
            let response = '';
            let responseLang = 'en-US';

           
            if (lowerCommand.includes('hello') || lowerCommand.includes('hi jarvis') || 
                lowerCommand.includes('hey jarvis')) {
                response = 'Hello sir, ready for commands!';
            }
            
        
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
            
         
            else {
                response = "I didn't understand that command. Please try again or check available commands.";
            }

            // Display and speak the response
            if (response) {
                addJarvisMessage(response);
                speak(response, responseLang);
            }
        }

      
        recognition.onstart = function() {
            isListening = true;
            micButton.classList.add('active');
            updateStatus('🎤 Listening... Speak now!', true);
        };

     
        recognition.onresult = function(event) {
           
            const transcript = event.results[0][0].transcript;
            
           
            addUserMessage(transcript);
            updateStatus('Processing command...', false);
            
       
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