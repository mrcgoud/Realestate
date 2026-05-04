'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useMapStore } from '@/store/mapStore'
import { useSearchStore } from '@/store/searchStore'
import { isMobileDevice, triggerHapticFeedback } from '@/lib/mobileUtils'

interface VoiceCommand {
  command: string
  action: string
  parameters?: any
  confidence: number
}

interface VoiceAssistantProps {
  onCommandExecuted?: (command: VoiceCommand) => void
  onSpeechResult?: (transcript: string, isFinal: boolean) => void
  onError?: (error: string) => void
}

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  onCommandExecuted,
  onSpeechResult,
  onError
}) => {
  const [isListening, setIsListening] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isSupported, setIsSupported] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)

  const { setViewport } = useMapStore()
  const { search, setFilters, results } = useSearchStore()

  // Check if speech recognition is supported
  useEffect(() => {
    const checkSupport = () => {
      const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition
      const speechSynthesis = 'speechSynthesis' in window

      setIsSupported(!!SpeechRecognition && speechSynthesis)
    }

    checkSupport()
  }, [])

  // Initialize speech recognition
  const initializeRecognition = useCallback(() => {
    if (!isSupported) return

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition

    if (recognitionRef.current) {
      recognitionRef.current.abort()
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
      triggerHapticFeedback('light')
    }

    recognition.onresult = (event) => {
      let finalTranscript = ''
      let interimTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalTranscript += result[0].transcript
        } else {
          interimTranscript += result[0].transcript
        }
      }

      const currentTranscript = finalTranscript || interimTranscript
      setTranscript(currentTranscript)

      onSpeechResult?.(currentTranscript, !!finalTranscript)

      if (finalTranscript) {
        processVoiceCommand(finalTranscript)
      }
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsListening(false)
      onError?.(`Speech recognition error: ${event.error}`)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognitionRef.current = recognition
  }, [isSupported, onSpeechResult, onError])

  // Initialize speech synthesis
  const initializeSynthesis = useCallback(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
    }
  }, [])

  // Speak text
  const speak = useCallback((text: string, options: SpeechSynthesisUtterance = {}) => {
    if (!synthRef.current) return

    // Cancel any ongoing speech
    synthRef.current.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    // Set default options
    utterance.rate = options.rate || 0.9
    utterance.pitch = options.pitch || 1
    utterance.volume = options.volume || 0.8
    utterance.lang = options.lang || 'en-US'

    // Set voice (prefer female voice for assistant)
    const voices = synthRef.current.getVoices()
    const preferredVoice = voices.find(voice =>
      voice.name.toLowerCase().includes('female') ||
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('alex')
    )
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    synthRef.current.speak(utterance)
  }, [])

  // Process voice command
  const processVoiceCommand = useCallback(async (command: string) => {
    setIsProcessing(true)

    try {
      const voiceCommand = parseVoiceCommand(command.toLowerCase().trim())

      if (voiceCommand) {
        await executeVoiceCommand(voiceCommand)
        onCommandExecuted?.(voiceCommand)

        // Provide audio feedback
        const response = getCommandResponse(voiceCommand)
        speak(response)
      } else {
        speak("I'm sorry, I didn't understand that command. Try saying 'find houses under $500k' or 'show me apartments'.")
      }
    } catch (error) {
      console.error('Voice command execution error:', error)
      speak("Sorry, I encountered an error processing your request.")
      onError?.('Command execution failed')
    } finally {
      setIsProcessing(false)
    }
  }, [onCommandExecuted, onError, speak])

  // Parse voice command
  const parseVoiceCommand = useCallback((command: string): VoiceCommand | null => {
    // Price-based search
    const priceMatch = command.match(/(?:find|show|search).*?(?:under|below|less than)?\s*\$?(\d+)(?:k|000)?/)
    if (priceMatch) {
      const price = parseInt(priceMatch[1]) * (command.includes('k') ? 1000 : 1)
      return {
        command,
        action: 'search_price',
        parameters: { maxPrice: price },
        confidence: 0.9
      }
    }

    // Property type search
    const typeMatches = {
      'houses?': 'house',
      'apartments?': 'apartment',
      'condos?': 'condo',
      'townhouses?': 'townhouse',
      'studios?': 'studio'
    }

    for (const [pattern, type] of Object.entries(typeMatches)) {
      if (command.match(new RegExp(`(?:find|show|search).*?${pattern}`))) {
        return {
          command,
          action: 'search_type',
          parameters: { propertyType: type },
          confidence: 0.85
        }
      }
    }

    // Bedroom search
    const bedroomMatch = command.match(/(\d+)\s*bed(?:room)?/)
    if (bedroomMatch) {
      const bedrooms = parseInt(bedroomMatch[1])
      return {
        command,
        action: 'search_bedrooms',
        parameters: { bedrooms },
        confidence: 0.9
      }
    }

    // Location search
    const locationMatch = command.match(/(?:in|near|around)\s+(.+)/)
    if (locationMatch) {
      return {
        command,
        action: 'search_location',
        parameters: { location: locationMatch[1].trim() },
        confidence: 0.8
      }
    }

    // Navigation commands
    if (command.includes('next') || command.includes('show next')) {
      return {
        command,
        action: 'navigate_next',
        confidence: 0.9
      }
    }

    if (command.includes('previous') || command.includes('show previous') || command.includes('go back')) {
      return {
        command,
        action: 'navigate_previous',
        confidence: 0.9
      }
    }

    // Favorites
    if (command.includes('favorite') || command.includes('save')) {
      return {
        command,
        action: 'add_favorite',
        confidence: 0.9
      }
    }

    // Help
    if (command.includes('help') || command.includes('what can you do')) {
      return {
        command,
        action: 'help',
        confidence: 1.0
      }
    }

    return null
  }, [])

  // Execute voice command
  const executeVoiceCommand = useCallback(async (voiceCommand: VoiceCommand) => {
    switch (voiceCommand.action) {
      case 'search_price':
        setFilters({ maxPrice: voiceCommand.parameters.maxPrice })
        await search()
        break

      case 'search_type':
        setFilters({ propertyType: voiceCommand.parameters.propertyType })
        await search()
        break

      case 'search_bedrooms':
        setFilters({ bedrooms: voiceCommand.parameters.bedrooms })
        await search()
        break

      case 'search_location':
        // This would need geocoding integration
        console.log('Location search:', voiceCommand.parameters.location)
        break

      case 'navigate_next':
        // Navigate to next property
        console.log('Navigate to next property')
        break

      case 'navigate_previous':
        // Navigate to previous property
        console.log('Navigate to previous property')
        break

      case 'add_favorite':
        // Add current property to favorites
        console.log('Add to favorites')
        break

      case 'help':
        // Show help
        break
    }
  }, [setFilters, search])

  // Get response for command
  const getCommandResponse = useCallback((command: VoiceCommand): string => {
    switch (command.action) {
      case 'search_price':
        return `Searching for properties under $${command.parameters.maxPrice.toLocaleString()}`

      case 'search_type':
        return `Finding ${command.parameters.propertyType}s for you`

      case 'search_bedrooms':
        return `Looking for ${command.parameters.bedrooms} bedroom properties`

      case 'search_location':
        return `Searching in ${command.parameters.location}`

      case 'navigate_next':
        return 'Showing next property'

      case 'navigate_previous':
        return 'Showing previous property'

      case 'add_favorite':
        return 'Added to your favorites'

      case 'help':
        return 'I can help you search for properties by price, type, bedrooms, or location. Try saying "find houses under $500k" or "show me 3 bedroom apartments"'

      default:
        return 'Command executed successfully'
    }
  }, [])

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      initializeRecognition()
    }

    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (error) {
        console.error('Failed to start speech recognition:', error)
        onError?.('Failed to start voice recognition')
      }
    }
  }, [isListening, initializeRecognition, onError])

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }, [isListening])

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }, [isListening, startListening, stopListening])

  // Initialize on mount
  useEffect(() => {
    if (isSupported) {
      initializeRecognition()
      initializeSynthesis()
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
    }
  }, [isSupported, initializeRecognition, initializeSynthesis])

  // Wake word detection (simplified)
  useEffect(() => {
    if (!isSupported || !isMobileDevice()) return

    const wakeWords = ['hey real estate', 'real estate', 'property finder']
    let wakeTimeout: NodeJS.Timeout

    const checkWakeWord = (transcript: string) => {
      const lowerTranscript = transcript.toLowerCase()
      if (wakeWords.some(word => lowerTranscript.includes(word))) {
        clearTimeout(wakeTimeout)
        speak('How can I help you find properties?')
        // Auto-start listening after wake word
        wakeTimeout = setTimeout(() => {
          startListening()
        }, 1000)
      }
    }

    // This would need continuous background listening
    // For now, it's triggered by explicit start
  }, [isSupported, speak, startListening])

  return {
    isListening,
    isProcessing,
    transcript,
    isSupported,
    startListening,
    stopListening,
    toggleListening,
    speak
  }
}

export default VoiceAssistant