import { Volume2, VolumeX, Mic, MicOff, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTextToSpeech, useSpeechToText } from '@/hooks/useSpeech';

export const TTSButton = ({ text, size = "default", className = "" }) => {
  const { toggle, isSpeaking } = useTextToSpeech();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size={size}
            onClick={() => toggle(text)}
            className={`tts-btn ${isSpeaking ? 'speaking' : ''} ${className}`}
            data-testid="tts-button"
            aria-label={isSpeaking ? "Stop reading" : "Read aloud"}
          >
            {isSpeaking ? (
              <VolumeX className="h-5 w-5" />
            ) : (
              <Volume2 className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isSpeaking ? "Stop reading" : "Read this aloud"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const STTButton = ({ onResult, size = "default", className = "" }) => {
  const { toggleListening, isListening, transcript, isSupported, error } = useSpeechToText();

  // Call onResult when transcript changes
  if (transcript && onResult) {
    onResult(transcript);
  }

  if (!isSupported) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size={size}
              disabled
              className={className}
              aria-label="Speech not supported"
            >
              <MicOff className="h-5 w-5 opacity-50" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Speech recognition not available</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={isListening ? "default" : "ghost"}
            size={size}
            onClick={toggleListening}
            className={`${isListening ? 'bg-secondary text-secondary-foreground animate-pulse-gentle' : ''} ${className}`}
            data-testid="stt-button"
            aria-label={isListening ? "Stop listening" : "Start speaking"}
          >
            {isListening ? (
              <Mic className="h-5 w-5" />
            ) : (
              <Mic className="h-5 w-5" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{error || (isListening ? "Listening... Click to stop" : "Click to speak")}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const HelpButton = ({ helpText, size = "default" }) => {
  const { toggle, isSpeaking } = useTextToSpeech();

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size={size}
            onClick={() => toggle(helpText)}
            className="gap-2"
            data-testid="help-button"
            aria-label="Get help"
          >
            <HelpCircle className="h-5 w-5" />
            <span>Help</span>
            {isSpeaking && <span className="text-xs">(Speaking...)</span>}
          </Button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>{helpText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Combined accessibility toolbar
export const AccessibilityToolbar = ({ pageHelp, className = "" }) => {
  const { toggle: toggleHelp, isSpeaking: isHelpSpeaking } = useTextToSpeech();

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => toggleHelp(pageHelp)}
              className={`h-12 w-12 rounded-full ${isHelpSpeaking ? 'bg-accent' : ''}`}
              data-testid="accessibility-help"
              aria-label="Page help"
            >
              <HelpCircle className="h-6 w-6" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Click to hear what this page is about</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default AccessibilityToolbar;
