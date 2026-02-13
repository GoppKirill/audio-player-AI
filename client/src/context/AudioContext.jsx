import React, { createContext, useContext } from 'react';

const AudioContext = createContext(null);

export const AudioProvider = ({ children, value }) => {
    return (
        <AudioContext.Provider value={value}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) {
        throw new Error('useAudio must be used within AudioProvider');
    }
    return context;
};