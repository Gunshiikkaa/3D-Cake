import React, { useRef } from 'react';
import { Upload, Share2, Sparkles, RotateCcw, Camera, Check } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Pink Frosting', value: '#d15f7c' },
  { name: 'Lavender Velvet', value: '#9b59b6' },
  { name: 'Rich Chocolate', value: '#4a2c2a' },
  { name: 'Matcha Cream', value: '#8ea86d' },
  { name: 'Ocean Breeze', value: '#2980b9' },
  { name: 'Sunny Lemon', value: '#f1c40f' }
];

const PRESET_STANDS = [
  { name: 'Chrome Plate', value: '#e2e8f0' },
  { name: 'Royal Gold', value: '#d4af37' },
  { name: 'Rose Gold', value: '#b76e79' },
  { name: 'Pitch Dark', value: '#2c3e50' }
];

export default function Customizer({
  isOpen,
  onClose,
  config,
  onChange,
  onReset,
  onShare
}) {
  const fileInputRefs = useRef([]);

  const handleTextChange = (field, val) => {
    onChange({ ...config, [field]: val });
  };

  const handleColorChange = (field, val) => {
    onChange({ ...config, [field]: val });
  };

  const handlePhotoUrlChange = (idx, url) => {
    const updatedPhotos = [...config.photos];
    updatedPhotos[idx] = { ...updatedPhotos[idx], url };
    onChange({ ...config, photos: updatedPhotos });
  };

  const handlePhotoCaptionChange = (idx, caption) => {
    const updatedPhotos = [...config.photos];
    updatedPhotos[idx] = { ...updatedPhotos[idx], caption };
    onChange({ ...config, photos: updatedPhotos });
  };

  const handlePhotoDescChange = (idx, description) => {
    const updatedPhotos = [...config.photos];
    updatedPhotos[idx] = { ...updatedPhotos[idx], description };
    onChange({ ...config, photos: updatedPhotos });
  };

  const handleFileUpload = (idx, e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      const updatedPhotos = [...config.photos];
      updatedPhotos[idx] = { 
        ...updatedPhotos[idx], 
        url: dataUrl,
        isLocalFile: true // flag that this is base64
      };
      onChange({ ...config, photos: updatedPhotos });
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = (idx) => {
    if (fileInputRefs.current[idx]) {
      fileInputRefs.current[idx].click();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={`customizer-panel ${isOpen ? 'open' : ''}`}>
      <div className="customizer-header">
        <h2 className="customizer-title">Decorate Your Site</h2>
        <button className="close-btn" onClick={onClose} aria-label="Close Customizer">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
        {/* 1. General Config */}
        <div className="customizer-section">
          <h3 className="section-title">General Info</h3>
          <div className="input-group">
            <label className="input-label">Birthday Person's Name</label>
            <input
              type="text"
              className="text-input"
              value={config.name}
              onChange={(e) => handleTextChange('name', e.target.value)}
              placeholder="e.g. MS. ANTUKIM"
            />
          </div>
          <div className="input-group">
            <label className="input-label">Candle Count: {config.candleCount}</label>
            <input
              type="range"
              min="1"
              max="10"
              value={config.candleCount}
              onChange={(e) => handleTextChange('candleCount', parseInt(e.target.value))}
              style={{ accentColor: '#d15f7c', cursor: 'pointer' }}
            />
          </div>
        </div>

        {/* 2. Cake Colors */}
        <div className="customizer-section">
          <h3 className="section-title">Cake Decoration</h3>
          
          <div className="input-group">
            <label className="input-label">Frosting Flavor</label>
            <div className="color-picker-grid">
              {PRESET_COLORS.map((col) => (
                <div
                  key={col.value}
                  className={`color-option ${config.primaryColor === col.value ? 'selected' : ''}`}
                  style={{ backgroundColor: col.value }}
                  onClick={() => handleColorChange('primaryColor', col.value)}
                  title={col.name}
                />
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Stand Pedestal Metal</label>
            <div className="color-picker-grid">
              {PRESET_STANDS.map((col) => (
                <div
                  key={col.value}
                  className={`color-option ${config.standColor === col.value ? 'selected' : ''}`}
                  style={{ backgroundColor: col.value }}
                  onClick={() => handleColorChange('standColor', col.value)}
                  title={col.name}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 3. Photo Carousel Config */}
        <div className="customizer-section">
          <h3 className="section-title">Polaroid Gallery (Max 8 Photos)</h3>
          <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '-0.4rem', lineHeight: '1.4' }}>
            To share custom photos via link, paste public web URLs. Local file uploads work in this browser session.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '8px' }}>
            {config.photos.map((photo, idx) => (
              <div key={idx} style={{ 
                background: 'rgba(255,255,255,0.4)', 
                border: '1px solid rgba(0,0,0,0.06)', 
                padding: '0.8rem', 
                borderRadius: '12px',
                display: 'flex',
                gap: '0.8rem'
              }}>
                {/* Image slot / trigger */}
                <div 
                  className="photo-slot"
                  onClick={() => triggerFileInput(idx)}
                  style={{ width: '80px', height: '80px', flexShrink: 0 }}
                >
                  {photo.url ? (
                    <img src={photo.url} alt={`preview ${idx}`} className="photo-slot-preview" />
                  ) : (
                    <div className="photo-slot-empty">
                      <Camera size={18} />
                      <span>Upload</span>
                    </div>
                  )}
                  <span className="photo-slot-num">{idx + 1}</span>
                  <input
                    type="file"
                    accept="image/*"
                    ref={el => fileInputRefs.current[idx] = el}
                    onChange={(e) => handleFileUpload(idx, e)}
                    style={{ display: 'none' }}
                  />
                </div>

                {/* Text configuration inputs */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flexGrow: 1 }}>
                  <input
                    type="text"
                    className="text-input"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                    value={photo.caption}
                    onChange={(e) => handlePhotoCaptionChange(idx, e.target.value)}
                    placeholder="Photo Title / Date"
                  />
                  <input
                    type="text"
                    className="text-input"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                    value={photo.isLocalFile ? '[Loaded Local File]' : photo.url}
                    disabled={photo.isLocalFile}
                    onChange={(e) => handlePhotoUrlChange(idx, e.target.value)}
                    placeholder="Web Image URL http://..."
                  />
                  <input
                    type="text"
                    className="text-input"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem' }}
                    value={photo.description || ''}
                    onChange={(e) => handlePhotoDescChange(idx, e.target.value)}
                    placeholder="Short description / memory text"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="customizer-actions">
        <button className="btn-secondary" onClick={onReset}>
          <RotateCcw size={16} style={{ marginRight: '6px' }} />
          Reset Defaults
        </button>
        <button className="btn-primary" onClick={onShare}>
          <Share2 size={16} />
          Copy Share Link
        </button>
      </div>
    </div>
  );
}
