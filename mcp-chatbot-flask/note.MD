# Chạy Gemini MCP Client
$env:GOOGLE_API_KEY="AIzaSyAersDweFBbVxZ004IbEJcVbyPGxJMZIJw"; python chat_with_gemini_mcp.py

$env:GOOGLE_API_KEY="AIzaSyAersDweFBbVxZ004IbEJcVbyPGxJMZIJw"; python chatbot_api.py

# Chạy MCP Server với kết nối PostgreSQL
python mcp_server.py --db-connection-string "postgresql://postgres:abc123!@160.250.246.78:5432/shophaui"