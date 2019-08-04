const distFolderPath = 'content_scripts';

const body = document.body;


const script = document.createElement('script');
script.type = 'text/javascript';
script.src = chrome.extension.getURL(`${distFolderPath}/SteamAutoTrader.js`);

body.appendChild(script);


const style = document.createElement('link');
style.type = 'text/css';
style.rel = 'stylesheet';
style.href = chrome.extension.getURL(`${distFolderPath}/SteamAutoTrader.css`);

body.appendChild(style);