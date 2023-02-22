//@ts-nocheck
const CONVERSION_FACTOR = 10 ** 9;

const getDomain = (siteURL) => {
  try {
    let URLObject = new URL(siteURL);
    return URLObject.hostname;
  } catch (e) {}
};

const generateDeeplink = (uniqueId, requestedMethod, params) => {
  return `cradlewallet://${uniqueId}?requestedMethod=${requestedMethod}&params=${JSON.stringify(
    params
  )}&metadata=${JSON.stringify(getSiteMetadata())}`;
};

const getSiteMetadata = () => {
  const siteUrl = window.location.origin;
  return {
    name: document.title,
    url: siteUrl,
    icon: "https://logo.clearbit.com/" + getDomain(siteUrl),
  };
};

const generateIframe = (method = "connectWallet") => {
  let frameSource;
  if (method === "connectWallet") {
    frameSource = `https://9ce370f062fa.ngrok.io/connect`; //Change to hosted
  } else {
    frameSource = `https://9ce370f062fa.ngrok.io/sign`; //Change to hosted
  }
  var newDiv = document.createElement("div");
  document.body.insertBefore(newDiv, document.body.firstElementChild);
  var iframe = document.createElement("iframe");
  let btn = document.createElement("button");
  btn.setAttribute("id", "exit");
  btn.innerHTML = "X";
  btn.onclick = function () {
    iframe.style.cssText = "display:none;";
    btn.style.cssText = "display:none;";
  };
  iframe.src = frameSource;
  iframe.setAttribute("id", "wallet");
  iframe.style.cssText =
    "border:1px solid;border-radius:8px;position:fixed;top:25px;right:25px;display:flex;" +
    "width:404px;height:560px;z-index:15000;";
  btn.style.cssText = `border: 0px;
  cursor:pointer;
  color:white;
  background: none;
  position: fixed;
  top: 40px;
  right: 400px;
  display: flex;
  z-index: 15000;`;
  newDiv.appendChild(iframe);
  newDiv.appendChild(btn);
  return iframe.contentWindow;
};

export function providerRequests(provider, args, callback = () => {}) {
  const walletApp = "https://9ce370f062fa.ngrok.io";
  window.suiSocket?.disconnect();
  return new Promise(async (resolve, reject) => {
    if (args.method === "connectWallet") {
      window.localStorage.clear();
      const stored_addr = window.localStorage.getItem("cradleAddress");
      if (stored_addr) {
        window.sui.selectedAddress = stored_addr;
        resolve(stored_addr);
        return;
      }
    }
    if (args.method === "disconnectWallet") {
      window.localStorage.removeItem("cradleAddress");
      window.sui.selectedAddress = null;
      window.sui.balance = 0;
      resolve(true);
      return;
    }
    let messageSender;
    if (provider.tab && args.method) {
      //Open a tab based on method, give it all the params it needs

      let walletTabWindow;
      if (args.method === "connectWallet") {
        walletTabWindow = window.open(walletApp + `/connect`, "_blank", "");
      } else {
        walletTabWindow = window.open(walletApp + `/sign`, "_blank", "");
      }
      messageSender = walletTabWindow;
      // const myWindow = window.open(walletApp + `/connect`, "_blank", "");
      // let data = {
      //   method: "connectWallet",
      //   callerOrigin: window.location.href,
      //   title: document.title,
      // };
      // myWindow.postMessage(JSON.stringify(data), walletApp);

      // //Need to know that tab is ready to receive messages
      // window.addEventListener("message", (e) => {
      //   if (e.origin != window.location.href) {
      //     console.log(e.data);
      //     const response = JSON.parse(e.data);
      //     console.log("RESP", response);
      //     switch (response.method) {
      //       case "readyIframeOpener":
      //         let data = {
      //           method: "connectWallet",
      //           callerOrigin: window.location.href,
      //           title: document.title,
      //         };
      //         myWindow.postMessage(JSON.stringify(data), walletApp);
      //         break;
      //       case "connectWalletResponseTab":
      //         window.sui.selectedAddress = response.response; //Don't do this if error
      //         resolve(response.response);
      //         myWindow.close()
      //         // window.localStorage.setItem(
      //         //   "cradleAddress",
      //         //   window.sui.selectedAddress
      //         // );
      //         break;
      //       case "closeWindow":
      //         myWindow.close();
      //         break;
      //     }
      //   }
      // });
    } else if (provider.iframe && args.method) {
      //Open iFrame
      const generatedIframe = generateIframe(args.method);
      messageSender = generatedIframe;
    }

    if (args.method && (provider.iframe || provider.tab)) {
      //Messaging Stream
      window.addEventListener("message", (e) => {
        if (e.origin != window.location.href) {
          const response = JSON.parse(e.data);
          let data;
          switch (response.method) {
            case "connectWalletReady":
              data = {
                method: "connectWallet",
                callerOrigin: window.location.href,
                title: document.title,
              };
              messageSender.postMessage(JSON.stringify(data), walletApp);
              break;
            case "connectWalletResponse":
              if ( provider.iframe ) {
                document.getElementById("wallet").style.cssText = "display:none;";
              } else if ( provider.tab ) {
                messageSender.close();
              }
              window.sui.selectedAddress = response.response; //Don't do this if error
              //Set in local storage
              resolve(response.response);
            case "signTransactionReady":
              data = {
                method: args.method,
                params: args.params,
              };    
              messageSender.postMessage(JSON.stringify(data), walletApp);          
              break;
            case "signTransactionResponse":
              if ( provider.iframe ) {
                document.getElementById("wallet").style.cssText = "display:none;";
              } else if ( provider.tab ) {
                messageSender.close();
              }
              resolve(response.response);
          }
        }
      });
    } else {
      const deepLink = generateDeeplink(
        window.suiRoomId,
        args.method,
        args.params
      );
      window.location.href = deepLink;
      // callback("PRE-SOCKET");
      window.suiSocket.on("messageToDapp", async (result) => {
        console.log("Message received", result);
        const { method, payload } = result;
        if (args.method === "paySui" && method === "paySuiResponse") {
          resolve(payload.txnHash);
        } else if (
          args.method === "connectWallet" &&
          method === "connectWalletResponse"
        ) {
          window.sui.selectedAddress = payload.address;
          if (!(args.params && args.params.persists === false)) {
            window.localStorage.setItem("cradleAddress", payload.address);
          }
          resolve(payload.address);
        } else if (
          args.method === "signAndExecute" &&
          method === "signAndExecuteResponse"
        ) {
          resolve(payload.txnHash);
        } else if (
          args.method === "moveCall" &&
          method === "moveCallResponse"
        ) {
          resolve(payload.txnHash);
        }
      });
    }
  });
}
