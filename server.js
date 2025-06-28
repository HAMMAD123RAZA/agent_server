const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const fetch = require('node-fetch'); // You might need to install this: npm install node-fetch@2
const { handleCrudOperations } = require('./crud.js'); // Adjust path as needed

const app = express();
const server = http.createServer(app);

// Configure CORS for Socket.IO
// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:5173", // Your React app URL
//     methods: ["GET", "POST"],
//     allowedHeaders: ["*"],
//     credentials: true
//   }
// });

// // Middleware
// app.use(cors({
//   origin: "http://localhost:5173", // Your React app URL
//   credentials: true
// }));
app.use(cors({
  origin: (origin, callback) => {
    callback(null, true); // Allow all origins
  },
  credentials: true
}));

const io = socketIo(server, {
  cors: {
    origin: (origin, callback) => {
      callback(null, true); // Allow all origins
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});


app.use(express.json());
// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

app.get('/getAllData', handleCrudOperations);           // GET all documents
app.post('/createData', handleCrudOperations);          // POST create document
app.get('/getDataById/:id', handleCrudOperations);      // GET document by ID
app.put('/updateData/:id', handleCrudOperations);       // PUT update document
app.patch('/patchData/:id', handleCrudOperations);      // PATCH partial update
app.delete('/deleteData/:id', handleCrudOperations);    

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // Handle user message and get AI response
  socket.on('user-message', async (data) => {
    console.log('Received user message from:', socket.id);
    
    try {
      const { messages, temperature, model, agentConfig } = data;
      
      // Make API call to your AI service
      const aiResponse = await getAIResponse(messages, temperature, model, agentConfig);
      
      // Send AI response back to client
      socket.emit('ai-response', { response: aiResponse });
      console.log('AI response sent to:', socket.id);
      
    } catch (error) {
      console.error('Error processing user message:', error);
      socket.emit('error', { 
        message: 'Failed to get AI response', 
        error: error.message 
      });
    }
  });

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

  // Handle any errors
  socket.on('error', (error) => {
    console.error('Socket error for client', socket.id, ':', error);
  });
});

// Function to get AI response
async function getAIResponse(messages, temperature = 0.7, model = 'google/gemini-flash-1.5', agentConfig = {}) {
  try {
    const response = await fetch('http://localhost:5173/AiApi', { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'agent-config': JSON.stringify(agentConfig)
      },
      body: JSON.stringify({
        messages,
        temperature,
        model
      })
    });
    console.log('server api res:',response)

console.log(`hit the api from here line 86`,messages,temperature,model )
console.log('Received audio URL in message:', messages.find(m => m.audioUrl)?.audioUrl);

    if (!response.ok) {
      throw new Error(`AI API responded with status: ${response.status}`);
    }

    console.log(`hit the api from here 2 line 90`,response)

    const data = await response.json();
    return data.response;

  } catch (error) {
    console.error('Error calling AI API:', error);
    
    // Option 2: Direct API call (example with OpenRouter or similar)
    /*
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.YOUR_SITE_URL,
          'X-Title': process.env.YOUR_SITE_NAME,
        },
        body: JSON.stringify({
          model: model,
          messages: messages,
          temperature: temperature,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API responded with status: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (fallbackError) {
      console.error('Fallback API also failed:', fallbackError);
      throw new Error('All AI API calls failed');
    }
    */

    // Fallback response
    return "I apologize, but I'm having trouble processing your request right now. Please try again.";
  }
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Express error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports=app