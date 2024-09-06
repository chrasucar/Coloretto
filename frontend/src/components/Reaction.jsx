import React from 'react';

const ReactionPicker = ({ onSelect }) => {

  const emojis = ['😊', '😂', '❤️', '😢', '😡'];

  return (
    <div className="reaction-picker">
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
};

export default ReactionPicker;
