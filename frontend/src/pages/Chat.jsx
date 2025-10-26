import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Trash2, User, Bot, Mic, MicOff } from 'lucide-react';
import wsService from '../services/websocket';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    const initChat = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await wsService.connect(token);
          setIsConnected(true);
          
          // Subscribe to chat messages
          wsService.subscribe('/user/queue/chat', (message) => {
            const data = JSON.parse(message.body);
            handleIncomingMessage(data);
          });
          
          // Welcome message
          setMessages([{
            content: "Hello! I'm your AI productivity assistant. How can I help you today?",
            sender: 'AI Assistant',
            timestamp: new Date().toISOString(),
            type: 'assistant'
          }]);
        } catch (error) {
          console.error('Failed to connect to WebSocket:', error);
          // Fallback to REST API
          setMessages([{
            content: "WebSocket connection failed. Using standard mode. How can I help you?",
            sender: 'AI Assistant',
            timestamp: new Date().toISOString(),
            type: 'assistant'
          }]);
        }
      }
    };

    initChat();

    // Setup speech recognition if available
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      wsService.disconnect();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleIncomingMessage = (data) => {
    setMessages(prev => [...prev, {
      ...data,
      type: 'assistant'
    }]);
    setIsSending(false);
  };

  const sendMessage = async () => {
    if (!input.trim() || isSending) return;

    const userMessage = {
      content: input,
      sender: user?.username || 'You',
      timestamp: new Date().toISOString(),
      type: 'user'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsSending(true);

    if (isConnected) {
      // Send via WebSocket
      wsService.sendChatMessage(input);
    } else {
      // Fallback to REST API
      try {
        const history = messages.slice(-10).map(m => 
          `${m.type === 'user' ? 'User' : 'Assistant'}: ${m.content}`
        );
        const response = await aiAPI.chat(input, history);
        
        setMessages(prev => [...prev, {
          content: response.data.response,
          sender: 'AI Assistant',
          timestamp: new Date().toISOString(),
          type: 'assistant'
        }]);
      } catch (error) {
        console.error('Error sending message:', error);
        setMessages(prev => [...prev, {
          content: 'Sorry, I encountered an error. Please try again.',
          sender: 'AI Assistant',
          timestamp: new Date().toISOString(),
          type: 'error'
        }]);
      } finally {
        setIsSending(false);
      }
    }
  };

  const clearChat = () => {
    if (isConnected) {
      wsService.clearChatHistory();
    }
    setMessages([{
      content: "Chat history cleared. How can I help you?",
      sender: 'AI Assistant',
      timestamp: new Date().toISOString(),
      type: 'assistant'
    }]);
  };

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const MessageBubble = ({ message }) => {
    const isUser = message.type === 'user';
    const isError = message.type === 'error';

    return (
      <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`flex items-start max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-500 ml-2' : 'bg-purple-500 mr-2'
          }`}>
            {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
          </div>
          <div>
            <div className={`rounded-lg px-4 py-2 ${
              isUser 
                ? 'bg-blue-500 text-white' 
                : isError 
                  ? 'bg-red-100 text-red-700 border border-red-300'
                  : 'bg-gray-100 text-gray-800'
            }`}>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            <p className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-md px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Sparkles className="w-6 h-6 text-purple-500 mr-2" />
              <h1 className="text-xl font-bold text-gray-900">AI Assistant</h1>
              <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                isConnected 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {isConnected ? 'Live' : 'Standard'}
              </span>
            </div>
            <button
              onClick={clearChat}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              title="Clear chat"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="px-6 py-4">
            {messages.length === 0 ? (
              <div className="text-center py-12">
                <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Start a conversation with your AI assistant</p>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <MessageBubble key={index} message={message} />
                ))}
                {isSending && (
                  <div className="flex justify-start mb-4">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-500 mr-2 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-gray-100 rounded-lg px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>
        </div>

        {/* Input Container */}
        <div className="bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleListening}
              className={`p-2 rounded-md transition-colors ${
                isListening 
                  ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSending}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isSending}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              <Send className="w-5 h-5" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
