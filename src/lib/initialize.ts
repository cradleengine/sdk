//@ts-nocheck

import suiProvider from './suiProvider.js';
import io from 'socket.io-client';

export function initializeProvider() {
  console.log('%c \nINITIALIZING CRADLE\n', 'background: #222; color: #2255f0');
  let sui_provider;
  if (window.sui) {
    sui_provider = window.sui;
  } else {
    sui_provider = new suiProvider();
    setGlobalProvider(sui_provider, window);
    initializeSocketConnection();
  }
  return sui_provider;
}

const generateRoomId = () => {
  return String(Date.now().toString(32) + Math.random().toString(16)).replace(
    /\./g,
    ''
  );
};

function initializeSocketConnection() {
  const newRoomId = generateRoomId();

  const suiSocket = io.connect(
    'https://cradle-mobile-microservice-production.up.railway.app/',
    {
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: Infinity,
    }
  );

  //Hook to Window
  window.suiRoomId = newRoomId;
  window.suiSocket = suiSocket;

  window.suiSocket.emit('joinRoom', { roomId: window.roomId });

  window.addEventListener('focus', (event) => {
    if (!window.suiSocket?.connected) {
      window.suiSocket.connect();
    }

    if (window.suiRoomId !== '') {
      window.suiSocket.emit('getLastMessageOnRoom', {
        roomId: window.suiRoomId,
      });
    }
  });
}

function setGlobalProvider(suiProvider, window) {
  window.sui = suiProvider;
}
