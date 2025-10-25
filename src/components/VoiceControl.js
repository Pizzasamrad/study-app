import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, VolumeX, HelpCircle, Zap } from 'lucide-react';
import { voiceService, isVoiceSupported } from '../services/voiceService';

const VoiceControl = ({ 
  onNavigate, 
  onTimerControl, 
  onFlashcardAction,
  currentTab,
  flashcards,
  studyLogs 
}) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [showHelp, setShowHelp] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [enableTTS, setEnableTTS] = useState(true);

  useEffect(() => {
    setIsSupported(isVoiceSupported());
    voiceService.setContext(currentTab);
    
    // Configure TTS based on user preference
    voiceService.pauseListeningDuringTTS = enableTTS;
    voiceService.enableTTSFeedback = enableTTS;
  }, [currentTab, enableTTS]);

  const handleVoiceCommand = (commandData) => {
    setLastCommand(commandData);

    switch (commandData.type) {
      case 'command_recognized':
        executeCommand(commandData.command, commandData.parameters);
        break;
      case 'command_not_recognized':
        console.log('Command not recognized:', commandData.transcript);
        break;
      case 'listening_stopped':
        setIsListening(false);
        setIsPaused(false);
        break;
      case 'listening_paused':
        setIsPaused(true);
        break;
      case 'listening_resumed':
        setIsPaused(false);
        break;
    }
  };

  const executeCommand = (action, params) => {
    switch (action) {
      case 'navigate':
        onNavigate(params.target);
        break;
      
      case 'start_timer':
        onTimerControl('start');
        break;
      
      case 'pause_timer':
        onTimerControl('pause');
        break;
      
      case 'reset_timer':
        onTimerControl('reset');
        break;
      
      case 'set_timer':
        onTimerControl('set', params.duration);
        break;
      
      case 'create_flashcard':
        onFlashcardAction('create', params);
        break;
      
      case 'show_answer':
        onFlashcardAction('show_answer');
        break;
      
      case 'next_card':
        onFlashcardAction('next');
        break;
      
      case 'mark_difficulty':
        onFlashcardAction('mark_difficulty', params.difficulty);
        break;
      
      case 'start_review':
        onFlashcardAction('start_review');
        break;
      

      
      case 'show_help':
        setShowHelp(true);
        break;
      
      case 'stop_speaking':
        voiceService.stopSpeaking();
        setIsSpeaking(false);
        break;
      
      case 'read_text':
        // This would be implemented based on current context
        handleReadText();
        break;
    }
  };

  const toggleListening = () => {
    if (isListening) {
      voiceService.stopListening();
      setIsListening(false);
    } else {
      const success = voiceService.startListening(handleVoiceCommand);
      if (success) {
        setIsListening(true);
      }
    }
  };

  const handleReadText = () => {
    setIsSpeaking(true);
    
    // Read different content based on current tab
    switch (currentTab) {
      case 'dashboard':
        const stats = `You have ${flashcards.length} flashcards and ${studyLogs.length} study sessions logged.`;
        voiceService.speak(stats);
        break;
      
      case 'flashcards':
        if (flashcards.length > 0) {
          const reviewedCards = flashcards.filter(card => card.reviewCount > 0).length;
          const categories = [...new Set(flashcards.map(card => card.subject))];
          voiceService.speak(`You have ${flashcards.length} total cards with ${reviewedCards} studied. You have cards in ${categories.length} subjects: ${categories.join(', ')}.`);
        } else {
          voiceService.speak("You don't have any flashcards yet. Create some to start studying!");
        }
        break;
      
      case 'analytics':
        const totalTime = studyLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
        voiceService.speak(`Your total study time is ${totalTime} minutes across ${studyLogs.length} sessions.`);
        break;
      
      default:
        voiceService.speak(`You are currently on the ${currentTab.replace('-', ' ')} tab.`);
    }
    
    setTimeout(() => setIsSpeaking(false), 3000);
  };

  const getContextCommands = () => {
    const commands = voiceService.getAvailableCommands();
    return commands.slice(0, 6); // Show top 6 commands
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
        <div className="flex items-center space-x-2">
          <MicOff className="text-yellow-600" size={16} />
          <span className="text-sm text-yellow-800">
            Voice commands not supported in this browser
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Zap className="text-purple-600" size={20} />
          <h3 className="font-semibold text-gray-800">Voice Control</h3>
          {isListening && !isPaused && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-red-600">Listening...</span>
            </div>
          )}
          {isPaused && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-yellow-600">Paused (Speaking)</span>
            </div>
          )}
          {isSpeaking && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-blue-600">Speaking...</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setEnableTTS(!enableTTS)}
            className={`p-2 rounded-md transition-colors ${
              enableTTS 
                ? 'text-green-600 hover:bg-green-50' 
                : 'text-gray-400 hover:bg-gray-100'
            }`}
            title={enableTTS ? 'Disable voice feedback' : 'Enable voice feedback'}
          >
            {enableTTS ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100"
            title="Voice commands help"
          >
            <HelpCircle size={16} />
          </button>
          
          <button
            onClick={handleReadText}
            disabled={isSpeaking}
            className="p-2 text-blue-500 hover:text-blue-700 rounded-md hover:bg-blue-50 disabled:opacity-50"
            title="Read current page content"
          >
            {isSpeaking ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
          
          <button
            onClick={toggleListening}
            className={`p-2 rounded-md transition-colors ${
              isListening
                ? 'bg-red-100 text-red-600 hover:bg-red-200'
                : 'bg-green-100 text-green-600 hover:bg-green-200'
            }`}
            title={isListening ? 'Stop listening' : 'Start voice commands'}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
        </div>
      </div>

      {/* Last Command Feedback */}
      {lastCommand && lastCommand.type === 'command_recognized' && (
        <div className="bg-green-50 border border-green-200 rounded-md p-2 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-800">
              "{lastCommand.parameters.transcript}" → {lastCommand.command.replace('_', ' ')}
            </span>
          </div>
        </div>
      )}

      {lastCommand && lastCommand.type === 'command_not_recognized' && (
        <div className="bg-red-50 border border-red-200 rounded-md p-2 mb-3">
          <div className="text-sm text-red-800 mb-1">
            Command not recognized: "{lastCommand.transcript}"
          </div>
          {lastCommand.suggestions && lastCommand.suggestions.length > 0 && (
            <div className="text-xs text-red-600">
              Try: {lastCommand.suggestions.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Help Panel */}
      {showHelp && (
        <div className="border-t pt-3 mt-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">
            Available Commands for {currentTab.replace('-', ' ')}:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {getContextCommands().map((command, index) => (
              <div key={index} className="text-xs bg-gray-50 rounded px-2 py-1">
                "{command.patterns[0]}"
              </div>
            ))}
          </div>
          
          <div className="mt-3 text-xs text-gray-600">
            <strong>General commands:</strong> "help", "read this", "stop talking", "go to [tab name]"
            <br />
            <strong>Voice feedback:</strong> {enableTTS ? 'Enabled' : 'Disabled'} 
            <span className="text-gray-500 ml-1">
              (Click the {enableTTS ? 'volume' : 'muted'} icon to toggle)
            </span>
          </div>
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          onClick={() => executeCommand('show_help')}
          className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
        >
          Say "help"
        </button>
        
        {currentTab === 'flashcards' && (
          <>
            <button
              onClick={() => executeCommand('start_review')}
              className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded hover:bg-green-200"
            >
              Say "start review"
            </button>
            <button
              onClick={() => executeCommand('create_flashcard')}
              className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded hover:bg-purple-200"
            >
              Say "create new card"
            </button>
          </>
        )}
        
        {currentTab === 'pomodoro' && (
          <button
            onClick={() => executeCommand('start_timer')}
            className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded hover:bg-orange-200"
          >
            Say "start timer"
          </button>
        )}
        

      </div>
    </div>
  );
};

export default VoiceControl;