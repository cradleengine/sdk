//@ts-nocheck

import suiProvider from "./suiProvider.js";
import io from "socket.io-client";

const stores = {
  mobile: "https://play.google.com/store/apps/details?id=com.playcradle.wallet",
  web: "https://chrome.google.com/webstore/detail/cradle/ppgbdgcacdkfilmdgjlcmigpbnamdkip",
};

const checkMobile = () => {
  if (window.screen.width >= 600) {
    // do sth for desktop browsers
    return false;
  } 
  return true;
};

const appInstalled = () => {
  if ( checkMobile() && Math.random() < 0.5) {
    return true;
  }
  return false;
}

export function initializeProvider(flags) {
  console.log("%c \nINITIALIZING CRADLE\n", "background: #222; color: #2255f0");
  let sui_provider;
  if ((window.sui || window.cradle) && !flags.forceEmbedded) {
    //Extension Installed
    sui_provider = window.sui || window.cradle;
  } else if (appInstalled() && !flags.forceEmbedded) {
    sui_provider = new suiProvider();
    //Indicate deeplink
    setGlobalProvider(sui_provider, window);
    initializeSocketConnection();
  } else {
    //This should execute in a few cases
    //Dapp Initializes without any flags and nothing installed (since default is useEmbedded)
    //Dapp Initializes with forceEmbedded and something is installed
    //Dapp Initializes !forceEmbedded and !useEmbedded and nothing is installed(we'll just need to set a redirect now)
    //Nothing installed
    const isMobile = checkMobile();
    const isWeb = !checkMobile();
    const redirect = !flags.useEmbedded && !flags.forceEmbedded; //Nothing installed, useEmbedded toggled off
    const tab = isMobile;
    const iframe = isWeb;
    const store = isMobile ? stores.mobile : isWeb ? stores.web : ""; //map at mobile/web


    sui_provider = new suiProvider(redirect,tab,iframe,store);
    setGlobalProvider(sui_provider, window);
  }
  return sui_provider;
}

const generateRoomId = () => {
  return String(Date.now().toString(32) + Math.random().toString(16)).replace(
    /\./g,
    ""
  );
};

function initializeSocketConnection() {
  const newRoomId = generateRoomId();

  const suiSocket = io.connect(
    "https://cradle-mobile-microservice-production.up.railway.app/",
    {
      reconnectionDelay: 1000,
      reconnection: true,
      reconnectionAttempts: Infinity,
    }
  );

  //Hook to Window
  window.suiRoomId = newRoomId;
  window.suiSocket = suiSocket;

  window.suiSocket.emit("joinRoom", { roomId: window.roomId });

  window.addEventListener("focus", (event) => {
    if (!window.suiSocket?.connected) {
      window.suiSocket.connect();
    }

    if (window.suiRoomId !== "") {
      window.suiSocket.emit("getLastMessageOnRoom", {
        roomId: window.suiRoomId,
      });
    }
  });
}

function setGlobalProvider(suiProvider, window) {
  window.sui = suiProvider;
}
