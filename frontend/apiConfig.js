let baseUrl;
let socketUrl;

if (import.meta.env.VITE_NODE_ENV === "production") {
  baseUrl = "https://simple-chat-app-6yeb.onrender.com";
  socketUrl = "wss://simple-chat-app-6yeb.onrender.com";
} else {

  // baseUrl = "http://165.22.6.221:4001";
  // socketUrl = "ws://165.22.6.221:4001";
  baseUrl = "http://localhost:4001";
  socketUrl = "ws://localhost:4001";
}

export { baseUrl, socketUrl };
