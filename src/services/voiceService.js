// voiceService.js - Voice Command Integration for Hands-Free Study Experience
// This service provides voice recognition and text-to-speech capabilities

export class VoiceService {
  constructor() {
    this.recognition = null;
    this.synthesis = window.speechSynthesis;
    this.isListening = false;
    this.isSpeaking = false;
    this.isSupported = this.checkSupport();
    this.commands = this.initializeCommands();
    this.currentContext = 'general';
    this.onCommandCallback = null;
    this.speechQueue = [];
    this.lastCommandTime = 0;
    this.commandCooldown = 2000; // 2 second cooldown between commands
    this.pauseListeningDuringTTS = true;
    this.enableTTSFeedback = true;
  }

  /**
   * Check if browser supports speech recognition and synthesis
   */
  checkSupport() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    return !!(SpeechRecognition && window.speechSynthesis);
  }

  /**
   * Initialize voice commands with natural language patterns
   */
  initializeCommands() {
    return {
      // Navigation commands
      navigation: [
        { patterns: ['go to dashboard', 'show dashboard', 'home'], action: 'navigate', target: 'dashboard' },
        { patterns: ['go to flashcards', 'show flashcards', 'study cards'], action: 'navigate', target: 'flashcards' },
        { patterns: ['start timer', 'pomodoro', 'go to timer'], action: 'navigate', target: 'pomodoro' },

        { patterns: ['show analytics', 'my stats', 'progress'], action: 'navigate', target: 'analytics' },
        { patterns: ['brain blurts', 'quick notes', 'notes'], action: 'navigate', target: 'blurts' }
      ],

      // Flashcard commands
      flashcards: [
        { patterns: ['create new card', 'add flashcard', 'new card'], action: 'create_flashcard' },
        { patterns: ['show answer', 'reveal answer', 'flip card'], action: 'show_answer' },
        { patterns: ['next card', 'skip card', 'continue'], action: 'next_card' },
        { patterns: ['mark easy', 'that was easy', 'easy'], action: 'mark_difficulty', difficulty: 'easy' },
        { patterns: ['mark medium', 'medium difficulty', 'medium'], action: 'mark_difficulty', difficulty: 'medium' },
        { patterns: ['mark hard', 'that was hard', 'difficult'], action: 'mark_difficulty', difficulty: 'hard' },
        { patterns: ['start review', 'begin study', 'study mode'], action: 'start_review' }
      ],

      // Timer commands
      timer: [
        { patterns: ['start timer', 'begin session', 'start'], action: 'start_timer' },
        { patterns: ['pause timer', 'stop timer', 'pause'], action: 'pause_timer' },
        { patterns: ['reset timer', 'restart timer', 'reset'], action: 'reset_timer' },
        { patterns: ['set timer to * minutes', 'timer * minutes'], action: 'set_timer' },
        { patterns: ['add study log', 'log session', 'save session'], action: 'add_study_log' }
      ],



      // General commands
      general: [
        { patterns: ['help', 'what can you do', 'commands'], action: 'show_help' },
        { patterns: ['read this', 'speak this', 'say this'], action: 'read_text' },
        { patterns: ['stop talking', 'be quiet', 'stop speaking'], action: 'stop_speaking' },
        { patterns: ['listen', 'voice mode', 'start listening'], action: 'start_listening' },
        { patterns: ['stop listening', 'voice off', 'stop'], action: 'stop_listening' }
      ]
    };
  }

  /**
   * Initialize speech recognition
   */
  initializeRecognition() {
    if (!this.isSupported) return false;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    this.recognition.continuous = true;
    this.recognition.interimResults = false;
    this.recognition.lang = 'en-US';
    this.recognition.maxAlternatives = 3;

    this.recognition.onstart = () => {
      this.isListening = true;
      this.speak("Voice commands activated. I'm listening.");
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onCommandCallback) {
        this.onCommandCallback({ type: 'listening_stopped' });
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.isListening = false;
      if (event.error === 'not-allowed') {
        this.speak("Microphone access denied. Please enable microphone permissions.");
      }
    };

    this.recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        const transcript = lastResult[0].transcript.toLowerCase().trim();
        
        // Prevent processing if we're currently speaking or in cooldown
        const now = Date.now();
        if (this.isSpeaking || (now - this.lastCommandTime) < this.commandCooldown) {
          console.log('Ignoring command during TTS or cooldown:', transcript);
          return;
        }
        
        // Filter out common TTS phrases that might be picked up
        if (this.isLikelyTTSEcho(transcript)) {
          console.log('Ignoring likely TTS echo:', transcript);
          return;
        }
        
        this.processCommand(transcript);
      }
    };

    return true;
  }

  /**
   * Start listening for voice commands
   */
  startListening(onCommand = null) {
    if (!this.isSupported) {
      alert('Voice commands are not supported in this browser. Please use Chrome or Edge.');
      return false;
    }

    if (!this.recognition) {
      this.initializeRecognition();
    }

    this.onCommandCallback = onCommand;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      return false;
    }
  }

  /**
   * Stop listening for voice commands
   */
  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.speak("Voice commands deactivated.");
    }
  }

  /**
   * Temporarily pause listening (without stopping completely)
   */
  pauseListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
      console.log('Voice recognition paused');
      
      if (this.onCommandCallback) {
        this.onCommandCallback({ type: 'listening_paused' });
      }
    }
  }

  /**
   * Resume listening after pause
   */
  resumeListening() {
    if (this.recognition && !this.isListening) {
      try {
        this.recognition.start();
        this.isListening = true;
        console.log('Voice recognition resumed');
        
        if (this.onCommandCallback) {
          this.onCommandCallback({ type: 'listening_resumed' });
        }
      } catch (error) {
        console.error('Error resuming speech recognition:', error);
        // If we can't resume, try to restart completely
        setTimeout(() => {
          this.startListening(this.onCommandCallback);
        }, 1000);
      }
    }
  }

  /**
   * Check if transcript is likely an echo from TTS
   */
  isLikelyTTSEcho(transcript) {
    const ttsKeywords = [
      'navigating to',
      'starting timer',
      'timer paused',
      'setting timer to',
      'showing answer',
      'marked as',
      'command executed',
      'voice commands activated',
      'voice commands deactivated',
      'excellent work',
      'keep practicing',
      'session complete'
    ];
    
    return ttsKeywords.some(keyword => transcript.includes(keyword));
  }

  /**
   * Process voice command and extract intent
   */
  processCommand(transcript) {
    console.log('Voice command received:', transcript);
    
    // Update last command time
    this.lastCommandTime = Date.now();

    // Find matching command
    const allCommands = Object.values(this.commands).flat();
    let bestMatch = null;
    let bestScore = 0;

    for (const command of allCommands) {
      for (const pattern of command.patterns) {
        const score = this.calculateSimilarity(transcript, pattern);
        if (score > bestScore && score > 0.6) { // Threshold for command recognition
          bestMatch = { ...command, pattern, score, transcript };
          bestScore = score;
        }
      }
    }

    if (bestMatch) {
      this.executeCommand(bestMatch);
    } else {
      // Try to extract numbers or specific entities
      const extractedCommand = this.extractSpecialCommands(transcript);
      if (extractedCommand) {
        this.executeCommand(extractedCommand);
      } else {
        this.speak("I didn't understand that command. Say 'help' to see available commands.");
        if (this.onCommandCallback) {
          this.onCommandCallback({ 
            type: 'command_not_recognized', 
            transcript,
            suggestions: this.getSuggestions(transcript)
          });
        }
      }
    }
  }

  /**
   * Calculate similarity between transcript and command pattern
   */
  calculateSimilarity(transcript, pattern) {
    // Handle wildcard patterns (e.g., "set timer to * minutes")
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '\\d+'), 'i');
      return regex.test(transcript) ? 0.9 : 0;
    }

    // Simple word overlap scoring
    const transcriptWords = transcript.split(' ');
    const patternWords = pattern.split(' ');
    
    let matches = 0;
    for (const word of patternWords) {
      if (transcriptWords.includes(word)) {
        matches++;
      }
    }

    return matches / patternWords.length;
  }

  /**
   * Extract special commands with parameters
   */
  extractSpecialCommands(transcript) {
    // Extract timer duration
    const timerMatch = transcript.match(/(?:set timer to|timer)\s+(\d+)\s+minutes?/i);
    if (timerMatch) {
      return {
        action: 'set_timer',
        duration: parseInt(timerMatch[1]),
        transcript
      };
    }

    // Extract subject for flashcard creation
    const subjectMatch = transcript.match(/(?:create|add|new)\s+(?:flashcard|card)\s+(?:for|about)\s+(.+)/i);
    if (subjectMatch) {
      return {
        action: 'create_flashcard',
        subject: subjectMatch[1].trim(),
        transcript
      };
    }

    return null;
  }

  /**
   * Execute recognized command
   */
  executeCommand(command) {
    if (this.onCommandCallback) {
      this.onCommandCallback({
        type: 'command_recognized',
        command: command.action,
        parameters: command,
        confidence: command.score || 0.8
      });
    }

    // Provide audio feedback
    switch (command.action) {
      case 'navigate':
        this.speak(`Navigating to ${command.target.replace('-', ' ')}`);
        break;
      case 'start_timer':
        this.speak("Starting timer");
        break;
      case 'pause_timer':
        this.speak("Timer paused");
        break;
      case 'set_timer':
        this.speak(`Setting timer to ${command.duration} minutes`);
        break;
      case 'show_answer':
        this.speak("Showing answer");
        break;
      case 'mark_difficulty':
        this.speak(`Marked as ${command.difficulty}`);
        break;
      case 'show_help':
        this.speakHelp();
        break;
      default:
        this.speak("Command executed");
    }
  }

  /**
   * Get command suggestions based on failed transcript
   */
  getSuggestions(transcript) {
    const suggestions = [];
    const words = transcript.split(' ');
    
    // Look for partial matches
    const allCommands = Object.values(this.commands).flat();
    for (const command of allCommands) {
      for (const pattern of command.patterns) {
        const patternWords = pattern.split(' ');
        const commonWords = words.filter(word => patternWords.includes(word));
        if (commonWords.length > 0) {
          suggestions.push(pattern);
        }
      }
    }

    return suggestions.slice(0, 3); // Return top 3 suggestions
  }

  /**
   * Text-to-speech functionality with proper listening management
   */
  speak(text, options = {}) {
    if (!this.synthesis || !this.enableTTSFeedback) return;

    // Cancel any ongoing speech
    this.synthesis.cancel();
    
    // Temporarily pause listening during TTS to prevent echo
    const wasListening = this.isListening;
    if (wasListening && this.pauseListeningDuringTTS) {
      this.pauseListening();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 0.9; // Slightly slower for better clarity
    utterance.pitch = options.pitch || 1.0;
    utterance.volume = options.volume || 0.7; // Slightly quieter to reduce mic pickup
    utterance.voice = options.voice || this.getPreferredVoice();

    // Set speaking state
    this.isSpeaking = true;

    utterance.onstart = () => {
      this.isSpeaking = true;
      console.log('TTS started, listening paused');
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      console.log('TTS ended');
      
      // Resume listening after a short delay to avoid picking up echo
      if (wasListening && this.pauseListeningDuringTTS) {
        setTimeout(() => {
          this.resumeListening();
        }, 500); // 500ms delay to ensure audio has cleared
      }
    };

    utterance.onerror = () => {
      this.isSpeaking = false;
      if (wasListening && this.pauseListeningDuringTTS) {
        this.resumeListening();
      }
    };

    this.synthesis.speak(utterance);
  }

  /**
   * Get preferred voice (female, English)
   */
  getPreferredVoice() {
    const voices = this.synthesis.getVoices();
    
    // Prefer female English voices
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.toLowerCase().includes('female')
    ) || voices.find(voice => 
      voice.lang.startsWith('en') && voice.name.toLowerCase().includes('zira')
    ) || voices.find(voice => 
      voice.lang.startsWith('en')
    );

    return preferredVoice || voices[0];
  }

  /**
   * Stop current speech
   */
  stopSpeaking() {
    if (this.synthesis) {
      this.synthesis.cancel();
      this.isSpeaking = false;
      
      // Resume listening if it was paused for TTS
      if (this.pauseListeningDuringTTS && this.onCommandCallback) {
        setTimeout(() => {
          this.resumeListening();
        }, 100);
      }
    }
  }

  /**
   * Speak help information
   */
  speakHelp() {
    const helpText = `
      Here are some commands you can use:
      Say "go to flashcards" to study cards.
      Say "start timer" to begin a pomodoro session.
      Say "show analytics" to view your progress.
      Say "create new card" to add a flashcard.
      Say "help" anytime for assistance.
    `;
    this.speak(helpText);
  }

  /**
   * Read flashcard content aloud
   */
  readFlashcard(front, back, readBoth = false) {
    if (readBoth) {
      this.speak(`Question: ${front}. Answer: ${back}`);
    } else {
      this.speak(front);
    }
  }

  /**
   * Announce study session results
   */
  announceSessionResults(results) {
    const { cardsReviewed, correctAnswers, sessionDuration } = results;
    const accuracy = Math.round((correctAnswers / cardsReviewed) * 100);
    
    const announcement = `
      Session complete! You reviewed ${cardsReviewed} cards in ${sessionDuration} minutes.
      Your accuracy was ${accuracy} percent. ${accuracy >= 80 ? 'Excellent work!' : 'Keep practicing!'}
    `;
    
    this.speak(announcement);
  }

  /**
   * Set current context for better command recognition
   */
  setContext(context) {
    this.currentContext = context;
  }

  /**
   * Get available commands for current context
   */
  getAvailableCommands() {
    const contextCommands = this.commands[this.currentContext] || [];
    const generalCommands = this.commands.general || [];
    return [...contextCommands, ...generalCommands];
  }

  /**
   * Check if voice features are supported
   */
  isVoiceSupported() {
    return this.isSupported;
  }

  /**
   * Get current listening status
   */
  getListeningStatus() {
    return {
      isListening: this.isListening,
      isSupported: this.isSupported,
      context: this.currentContext
    };
  }
}

// Export singleton instance
export const voiceService = new VoiceService();

// Export utility functions
export const startVoiceCommands = (onCommand) => voiceService.startListening(onCommand);
export const stopVoiceCommands = () => voiceService.stopListening();
export const speak = (text, options) => voiceService.speak(text, options);
export const readFlashcard = (front, back, readBoth) => voiceService.readFlashcard(front, back, readBoth);
export const isVoiceSupported = () => voiceService.isVoiceSupported();