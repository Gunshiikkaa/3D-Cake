import React, { useState, useEffect } from 'react';
import { Play, Volume2, VolumeX, Sliders, MessageCircle, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import CakeContainer from './components/CakeContainer';
import Customizer from './components/Customizer';
import { synth } from './components/AudioSynthesizer';

const DEFAULT_PHOTOS = [
  { 
    url: '/photo1.png', 
    caption: 'Happy Birthday!', 
    description: 'May your day be filled with sweet laughter and wonderful surprises!' 
  },
  { 
    url: '/photo2.png', 
    caption: 'Making Memories', 
    description: 'Cherishing all the sparklers and bright nights we share together.' 
  },
  { 
    url: '/photo3.png', 
    caption: 'Gifts of Love', 
    description: 'Unwrapping joy, health, and endless opportunities today!' 
  },
  { 
    url: '/photo4.png', 
    caption: 'Warm Glow', 
    description: 'Cozy evenings filled with lights, warmth, and beautiful conversations.' 
  },
  { 
    url: '/photo1.png', 
    caption: 'Sweet Bites', 
    description: 'A little sweetness to celebrate a life that is so incredibly wonderful.' 
  },
  { 
    url: '/photo2.png', 
    caption: 'Nostalgic Days', 
    description: 'Looking back at our beautiful snapshots and looking forward to making more.' 
  },
  { 
    url: '/photo3.png', 
    caption: 'Throw Confetti', 
    description: 'Celebrate your journey, your smile, and everything that makes you unique!' 
  },
  { 
    url: '/photo4.png', 
    caption: 'Under the Stars', 
    description: 'Wishing upon the brightest stars for your happiness in the coming year.' 
  }
];

const INITIAL_CONFIG = {
  name: 'Muskan',
  candleCount: 5,
  primaryColor: '#d15f7c', // Pink Frosting
  secondaryColor: '#ffffff', // Vanilla Cream
  standColor: '#e2e8f0', // Chrome Plate
  photos: DEFAULT_PHOTOS
};

export default function App() {
  const [stage, setStage] = useState('landing'); // 'landing', 'transitioning', 'interactive'
  const [config, setConfig] = useState(INITIAL_CONFIG);
  
  // Terminal log lines
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [shareAlert, setShareAlert] = useState(false);

  const logsToRun = [
    { text: '[*] Initializing Birthday Cake Engine v1.1.2...', type: 'cmd' },
    { text: '[*] Loading WebGL renderer context... done.', type: 'info' },
    { text: '[*] Baking procedural 3D cake layers... done.', type: 'info' },
    { text: '[*] Whipping vanilla cream frosting... done.', type: 'info' },
    { text: '[*] Adding cherries, blueberries, and candles... done.', type: 'info' },
    { text: '[*] Calibrating Web Audio music-box synthesizer... done.', type: 'info' },
    { text: '[*] System status: 100% baked and ready.', type: 'success' },
    { text: '[*] Click ENTER to ignite the celebration!', type: 'cmd' }
  ];

  // Decode config from URL hash if present on load
  useEffect(() => {
    try {
      const hash = window.location.hash;
      if (hash && hash.startsWith('#cfg=')) {
        const base64Data = hash.substring(5);
        // base64 decode and parse
        const decodedString = atob(base64Data);
        const parsedConfig = JSON.parse(decodedString);
        
        // Merge with initial config to ensure new fields are populated if missing
        if (parsedConfig && parsedConfig.name) {
          // Replace base64 urls with defaults if base64 got corrupted
          const validatedPhotos = Array.isArray(parsedConfig.photos)
            ? parsedConfig.photos.map((p, idx) => ({
                ...DEFAULT_PHOTOS[idx],
                ...p
              }))
            : DEFAULT_PHOTOS;
          
          setConfig({
            ...INITIAL_CONFIG,
            ...parsedConfig,
            photos: validatedPhotos
          });
        }
      }
    } catch (e) {
      console.warn("Could not parse shared configuration:", e);
    }
  }, []);

  // Run terminal console boot sequence
  useEffect(() => {
    if (stage !== 'landing') return;

    let logIndex = 0;
    setConsoleLogs([]);

    const logTimer = setInterval(() => {
      if (logIndex < logsToRun.length) {
        setConsoleLogs(prev => [...prev, logsToRun[logIndex]]);
        logIndex++;
      } else {
        clearInterval(logTimer);
      }
    }, 380);

    return () => clearInterval(logTimer);
  }, [stage]);

  // Transition from landing to celebration
  const handleEnterStage = () => {
    if (stage !== 'landing') return;

    setStage('transitioning');
    
    // Add transition terminal logs
    setConsoleLogs(prev => [
      ...prev,
      { text: '[*] Triggering celebration sequence...', type: 'cmd' },
      { text: '[*] Firing confetti cannons...', type: 'success' },
      { text: '[*] Activating 3D photo ring...', type: 'info' }
    ]);

    // Play synthesized music
    if (!isAudioMuted) {
      synth.start();
    }

    // Trigger initial confetti burst
    setTimeout(() => {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
    }, 200);

    // Continuous soft confetti drops
    const end = Date.now() + (2 * 1000);
    const interval = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval);
      confetti({
        particleCount: 15,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      });
      confetti({
        particleCount: 15,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      });
    }, 200);

    // Set to fully interactive after camera zoom completes
    setTimeout(() => {
      setStage('interactive');
    }, 2200);
  };

  // Toggle audio
  const handleToggleAudio = () => {
    if (isAudioMuted) {
      setIsAudioMuted(false);
      if (stage !== 'landing') {
        synth.start();
      }
    } else {
      setIsAudioMuted(true);
      synth.stop();
    }
  };

  // Reset default configuration
  const handleResetDefaults = () => {
    setConfig(INITIAL_CONFIG);
    window.location.hash = '';
  };

  // Generate shareable link
  const handleShareLink = () => {
    try {
      // Filter out base64 local files to avoid URL length limit
      const sanitizedPhotos = config.photos.map(p => {
        if (p.isLocalFile) {
          return { caption: p.caption, description: p.description, url: '' }; // empty url fallback
        }
        return p;
      });

      const configToShare = {
        ...config,
        photos: sanitizedPhotos
      };

      const jsonString = JSON.stringify(configToShare);
      const encoded = btoa(jsonString);
      
      const shareUrl = `${window.location.origin}${window.location.pathname}#cfg=${encoded}`;
      
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareAlert(true);
        setTimeout(() => setShareAlert(false), 3000);
      });
    } catch (e) {
      console.error("Failed to generate share link:", e);
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      
      {/* 3D WebGL Canvas Layer */}
      <CakeContainer
        stage={stage}
        config={config}
        onSelectPhoto={setSelectedPhoto}
      />

      {/* Background waves details */}
      <div className="decorations">
        <div className="decorations-wave"></div>
        <div className="decorations-wave"></div>
      </div>

      {/* LANDING PAGE UI CARD */}
      <div className={`landing-overlay ${stage !== 'landing' ? 'fade-out' : ''}`}>
        <div className="hero-content">
          <span className="hero-subtitle">Interactive 3D Experience</span>
          <h1 className="hero-title">
            HAPPY BIRTHDAY
            <span className="hero-name">{config.name}</span>
          </h1>

          {/* Console Boot Sequence */}
          <div className="terminal-console">
            <div className="terminal-header">
              <div className="terminal-dot dot-red"></div>
              <div className="terminal-dot dot-yellow"></div>
              <div className="terminal-dot dot-green"></div>
            </div>
            <div className="terminal-body">
              {consoleLogs.map((log, idx) => (
                <div key={idx} className={`console-line ${log.type}`}>
                  {log.text}
                </div>
              ))}
            </div>
          </div>

          <button className="enter-btn" onClick={handleEnterStage} disabled={stage !== 'landing'}>
            <Play size={20} fill="white" />
            ENTER THE CELEBRATION
          </button>
        </div>
      </div>

      {/* Main interactive guide instructions */}
      <div className={`stage-instructions ${stage === 'interactive' ? 'visible' : ''}`}>
        👆 Drag to rotate camera • Scroll to spin Polaroids • Click any memory
      </div>

      {/* FLOATING ACTION OVERLAY CONTROLS */}
      <div className="floating-controls">
        {/* Toggle Audio */}
        <button 
          className={`control-icon-btn ${!isAudioMuted ? 'active' : ''}`}
          onClick={handleToggleAudio}
          title={isAudioMuted ? "Unmute Music" : "Mute Music"}
        >
          {isAudioMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        {/* Discord / Chat credits button (Matching recording visual) */}
        <button 
          className="control-icon-btn" 
          onClick={() => {
            // Trigger fun confetti stream on click
            confetti({ particleCount: 30, spread: 40 });
          }}
          title="Send Love"
        >
          <MessageCircle size={20} />
        </button>
      </div>

      {/* TOGGLE CUSTOMIZER FLOATING DASHBOARD */}
      <button 
        className={`customizer-toggle-btn ${stage === 'interactive' ? 'visible' : ''}`}
        onClick={() => setIsCustomizerOpen(true)}
      >
        <Sliders size={18} />
        Decorate Cake
      </button>

      {/* GLASSMORPHIC CUSTOMIZER OVERLAY */}
      <Customizer
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        config={config}
        onChange={setConfig}
        onReset={handleResetDefaults}
        onShare={handleShareLink}
      />

      {/* POLAROID EXPANDED LIGHTBOX */}
      <div 
        className={`lightbox-overlay ${selectedPhoto ? 'open' : ''}`}
        onClick={() => setSelectedPhoto(null)}
      >
        <button className="lightbox-close-btn" onClick={() => setSelectedPhoto(null)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        
        {selectedPhoto && (
          <div className="polaroid-card" onClick={(e) => e.stopPropagation()}>
            <div className="polaroid-pin"></div>
            <div className="polaroid-card-img-container">
              <img 
                src={selectedPhoto.url || 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80'} 
                alt={selectedPhoto.caption} 
                className="polaroid-card-img" 
              />
            </div>
            <div className="polaroid-card-caption">{selectedPhoto.caption}</div>
            {selectedPhoto.description && (
              <div className="polaroid-card-desc">{selectedPhoto.description}</div>
            )}
          </div>
        )}
      </div>

      {/* SHARE COPY NOTIFICATION */}
      <div className={`share-alert ${shareAlert ? 'show' : ''}`}>
        <Sparkles size={18} style={{ color: '#f39c12' }} />
        <span>Share Link copied to clipboard!</span>
      </div>

    </div>
  );
}
