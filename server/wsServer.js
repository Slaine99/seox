const ws = require("ws");
const jwt = require("jsonwebtoken");
const Message = require("./models/messageModel");
const { User } = require("./models/userModel");
const axios = require("axios");
const FormData = require("form-data");
const Conversation = require("./models/conversationModel"); // Import the Conversation model

const createWebSocketServer = (server) => {
  const wss = new ws.WebSocketServer({ server });


  wss.on("connection", (connection) => {
    connection.on("message", async (message) => {
      const data = JSON.parse(message);
    
      if (data.type === "audio") {
        try {
          // Decode base64 audio to buffer
          const audioBuffer = Buffer.from(data.data, "base64");
    
          // Transcribe audio
          const transcription = await transcribeAudio(audioBuffer);
    
          // Send transcription back to the client
          connection.send(
            JSON.stringify({
              type: "transcription",
              data: transcription || "Sorry, I couldn't understand that.",
            })
          );
        } catch (error) {
          console.error("Error processing audio:", error);
          connection.send(
            JSON.stringify({
              type: "error",
              data: "Failed to process your audio.",
            })
          );
        }
      }
    });
    
  });
  
  wss.on("connection", (connection, req) => {
    const notifyAboutOnlinePeople = async () => {
      const onlineUsers = await Promise.all(
        Array.from(wss.clients).map(async (client) => {
          const { userId, username } = client;
          const user = await User.findById(userId);
          const avatarLink = user ? user.avatarLink : null;

          return {
            userId,
            username,
            avatarLink,
          };
        })
      );

      [...wss.clients].forEach((client) => {
        client.send(
          JSON.stringify({
            online: onlineUsers,
          })
        );
      });
    };

    connection.isAlive = true;

    connection.timer = setInterval(() => {
      connection.ping();
      connection.deathTimer = setTimeout(() => {
        connection.isAlive = false;
        clearInterval(connection.timer);
        connection.terminate();
        notifyAboutOnlinePeople();
        console.log("Connection closed due to inactivity");
      }, 1000);
    }, 5000);

    connection.on("pong", () => {
      clearTimeout(connection.deathTimer);
    });

    const cookies = req.headers.cookie;

    if (cookies) {
      const tokenString = cookies
        .split(";")
        .find((str) => str.startsWith("authToken="));

      if (tokenString) {
        const token = tokenString.split("=")[1];
        jwt.verify(token, process.env.JWTPRIVATEKEY, {}, (err, userData) => {
          if (err) console.log(err);

          const { _id, firstName, lastName } = userData;
          connection.userId = _id;
          connection.username = `${firstName} ${lastName}`;
        });
      }
    }

    // Initialize session management variables
    connection.session = null;
    connection.messageIndex = 0;

    connection.on("message", async (message) => {
      const messageData = JSON.parse(message.toString());
      const { recipient, text, audio, sessionName } = messageData;

      if (audio) {
        // Handle audio via Whisper
        try {
          const transcription = await transcribeAudio(Buffer.from(audio, 'base64'));

          if (transcription) {
            // Send the transcription as the user's message
            connection.send(
              JSON.stringify({
                sender: connection.userId,
                text: transcription,
                recipient: recipient,
                _id: Date.now(),
              })
            );

            // Send transcription to GPT for a response
            const gptResponse = await getGPTResponse(transcription);

            connection.send(
              JSON.stringify({
                sender: "Dr Jeff",
                text: gptResponse,
                recipient: connection.userId,
                _id: Date.now(),
              })
            );
          } else {
            connection.send(
              JSON.stringify({
                sender: "Dr Jeff",
                text: "Sorry, I couldn't understand that.",
                recipient: connection.userId,
                _id: Date.now(),
              })
            );
          }
        } catch (error) {
          console.error("Error processing audio:", error);
          connection.send(
            JSON.stringify({
              sender: "Dr Jeff",
              text: "Sorry, I couldn't process your audio message.",
              recipient: connection.userId,
              _id: Date.now(),
            })
          );
        }
      } else if (recipient === "group-awareness" && sessionName) {
        // Initialize the group awareness session
        connection.session = await Conversation.findOne({ session_name: sessionName });
        connection.messageIndex = 0;
        sendNextMessages(connection);
      } else if (recipient === "group-awareness") {
        // Handle user response in Group Awareness session
        saveAndForwardMessage(connection, recipient, text);
        sendNextMessages(connection);
      } else {
        // Normal message processing and saving to the database
        try {
          const msgDoc = await Message.create({
            sender: connection.userId,
            recipient,
            text,
          });

          [...wss.clients].forEach((client) => {
            if (client.userId === recipient) {
              client.send(
                JSON.stringify({
                  sender: connection.username,
                  text,
                  id: msgDoc._id,
                })
              );
            }
          });
        } catch (error) {
          console.error("Error saving message:", error);
        }
      }
    });

    notifyAboutOnlinePeople();
  });

  const sendNextMessages = (connection) => {
    const { session, messageIndex } = connection;
    if (session && messageIndex < session.conversation.length) {
      for (let i = 0; i < 3 && messageIndex + i < session.conversation.length; i++) {
        const message = session.conversation[messageIndex + i];
        connection.send(
          JSON.stringify({
            sender: message.speaker,
            text: message.text,
            recipient: connection.userId,
            _id: Date.now(),
          })
        );
      }
      connection.messageIndex += 3;
    }
  };

  const saveAndForwardMessage = async (connection, recipient, text) => {
    try {
      const msgDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
      });

      [...wss.clients].forEach((client) => {
        if (client.userId === recipient) {
          client.send(
            JSON.stringify({
              sender: connection.username,
              text,
              id: msgDoc._id,
            })
          );
        }
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };
};

const transcribeAudio = async (audioBuffer) => {
  try {
    const formData = new FormData();
    formData.append("file", audioBuffer, {
      filename: "recording.wav",
      contentType: "audio/wav",
    });
    formData.append("model", "whisper-1"); // Specify the model

    const response = await axios.post(
      "https://api.openai.com/v1/audio/transcriptions",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          ...formData.getHeaders(), // Use FormData headers
        },
      }
    );

    return response.data.text;
  } catch (error) {
    console.error("Error transcribing audio:", error.response?.data || error.message);
    return null;
  }
};


const getGPTResponse = async (message) => {
  try {
    const response = await axios.post("http://localhost:4001/api/gpt/gpt", {
      message,
    });
    return response.data.response;
  } catch (error) {
    console.error("Error fetching GPT response:", error);
    return "Sorry, I'm having trouble understanding right now.";
  }
};

module.exports = createWebSocketServer;
