import React, { forwardRef } from 'react';

const ReactionPicker = forwardRef(({ onSelect }, ref) => {
  const emojis = ['😊', '😂', '❤️', '😢', '😡'];

  return (
    <div ref={ref} className="reaction-picker">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className="reaction-button"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
});

export default ReactionPicker;