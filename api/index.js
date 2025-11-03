// Vercel serverless function entry point
// This file is required for Vercel to handle API routes

// Import the built Express app from the dist directory
let app = null;

async function initApp() {
  if (!app) {
    try {
      // Dynamic import of the built server
      const serverModule = await import("../dist/index.js");
      app = serverModule.default || serverModule.app || serverModule;
      
      // If app is not an Express app, throw an error
      if (!app || typeof app !== 'function') {
        throw new Error("Failed to load Express app from dist/index.js");
      }
    } catch (error) {
      console.error("Error loading server:", error);
      throw error;
    }
  }
  return app;
}

// Export the handler for Vercel
module.exports = async (req, res) => {
  try {
    const expressApp = await initApp();
    
    // Handle the request through Express
    expressApp(req, res);
  } catch (error) {
    console.error("Error handling request:", error);
    res.status(500).json({ 
      error: "Internal server error", 
      message: error.message 
    });
  }
};

