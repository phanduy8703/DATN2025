# MCP - AI CHATBOT

# Chạy Gemini MCP Client
1. test chat trên terminal

$env:GOOGLE_API_KEY="AIzaSyAersDweFBbVxZ004IbEJcVbyPGxJMZIJw"; python chat_with_gemini_mcp.py

2. API server với Flask để tương tác với web

$env:GOOGLE_API_KEY="AIzaSyAersDweFBbVxZ004IbEJcVbyPGxJMZIJw"; python chatbot_api.py

# Chạy MCP Server với kết nối PostgreSQL
python mcp_server.py --db-connection-string "postgresql://postgres:abc123!@160.250.246.78:5432/shophaui"