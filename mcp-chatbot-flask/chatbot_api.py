"""
Gemini MCP Chatbot API

This Flask API allows you to interact with the Gemini MCP chatbot via HTTP requests
instead of using a terminal interface.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
import os
import json
import re

# Try to import the latest recommended Google GenAI SDK first
try:
    import google.genai as genai
    print("Using new SDK: google.genai")
    USING_NEW_SDK = True
except ImportError:
    # Fall back to legacy SDK if needed
    try:
        import google.generativeai as genai
        print("Using legacy SDK: google.generativeai")
        USING_NEW_SDK = False
    except ImportError:
        print("Error: Neither 'google-genai' nor 'google-generativeai' packages are installed.")
        print("Please install one of these packages using pip:")
        print("pip install google-genai  # Recommended new SDK")
        print("  or")
        print("pip install google-generativeai  # Legacy SDK")
        exit(1)

import requests  # For calling the MCP server

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# --- Configuration ---
# IMPORTANT: Set your Google API Key here or as an environment variable
try:
    GOOGLE_API_KEY = os.environ["GOOGLE_API_KEY"]
except KeyError:
    # Fallback to a hardcoded API key if environment variable not set
    GOOGLE_API_KEY = "AIzaSyAersDweFBbVxZ004IbEJcVbyPGxJMZIJw"
    print("⚠️ Using hardcoded API key. For production, use environment variable.")

# Configure the SDK based on which one is being used
if USING_NEW_SDK:
    # New SDK approach
    CLIENT = genai.Client(api_key=GOOGLE_API_KEY)
else:
    # Legacy SDK approach
    genai.configure(api_key=GOOGLE_API_KEY)

MODEL_NAME = "gemini-1.5-flash-latest"  # Changed to a valid and reliable model
MCP_SERVER_URL = "http://localhost:5003"  # URL of your local mcp_server.py

# Define tools as a list of dictionaries for flexibility across both SDKs
TOOLS_CONFIG = [
    {
        "name": "get_customer_info",
        "description": "Retrieves comprehensive information about a customer including profile, orders, cart, and behavior data.",
        "parameters": {
            "type": "object",
            "properties": {
                "customer_id": {
                    "type": "string",
                    "description": "ID of the customer to retrieve information for"
                }
            },
            "required": ["customer_id"]
        }
    },
    {
        "name": "get_all_products",
        "description": "Retrieves all products from the database.",
        "parameters": {
            "type": "object",
            "properties": {},
            "required": []
        }
    },
    {
        "name": "execute_update",
        "description": "Executes an INSERT, UPDATE, or DELETE query on the PostgreSQL database.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": "SQL query to execute (INSERT, UPDATE, or DELETE)"
                },
                "params": {
                    "type": "object",
                    "description": "Optional parameters for the query"
                }
            },
            "required": ["query"]
        }
    }
]

# Convert TOOLS_CONFIG to the format needed by the SDK
if USING_NEW_SDK:
    # For the new SDK
    function_declarations = []
    for tool_config in TOOLS_CONFIG:
        # Convert each tool configuration
        function_declarations.append({
            "name": tool_config["name"],
            "description": tool_config["description"],
            "parameters": {
                "type": tool_config["parameters"]["type"].upper(),
                "properties": {
                    k: {
                        "type": v["type"].upper(),
                        "description": v.get("description", "")
                    } for k, v in tool_config["parameters"]["properties"].items()
                },
                "required": tool_config["parameters"].get("required", [])
            }
        })
    GEMINI_TOOLS = [{
        "function_declarations": function_declarations
    }]
else:
    # For the legacy SDK
    function_declarations = []
    for tool_config in TOOLS_CONFIG:
        properties = {}
        for prop_name, prop_config in tool_config["parameters"]["properties"].items():
            properties[prop_name] = genai.protos.Schema(
                type=prop_config["type"].upper(),
                description=prop_config.get("description", "")
            )
        
        schema = genai.protos.Schema(
            type=tool_config["parameters"]["type"].upper(),
            properties=properties,
            required=tool_config["parameters"].get("required", [])
        )
        
        func_decl = genai.protos.FunctionDeclaration(
            name=tool_config["name"],
            description=tool_config["description"],
            parameters=schema
        )
        function_declarations.append(func_decl)
    
    GEMINI_TOOLS = genai.protos.Tool(
        function_declarations=function_declarations
    )

# Define the system message
SYSTEM_MESSAGE_TEXT = """
You are an AI assistant augmented with special tools that allow you to interact with a PostgreSQL database.

IMPORTANT: Product information is automatically loaded at the start of each conversation. You already have all product data available as context, including product IDs, names, descriptions, prices, and inventory details. Refer to this existing context when responding to customer queries about products.

The get_customer_info tool lets you access detailed information about a customer by providing their customer ID. When this tool is used, it will return a comprehensive report including:

- Customer profile information (name, email, phone, etc.)
- Current items in their shopping cart
- Order history and details
- Products purchased in each order
- User behavior patterns and actions
- Product reviews written by the customer
- Wishlist items
- And other customer-related data

The execute_update tool allows you to modify the database by sending SQL queries (INSERT, UPDATE, DELETE). This is useful when you need to update customer records, process orders, adjust inventory, etc.

Your interactions with the database are secured and monitored. When you use these tools, you're using secure external tools that handle the actual database interactions.
These tools validate that all operations are safe and prevent potentially dangerous operations.

VERY IMPORTANT: When a user asks for information that requires using a tool, you MUST directly execute the tool WITHOUT asking for confirmation or explaining your intention to use it first. Execute the tool immediately and provide the information to the user.

For example, if the user says "Lấy thông tin khách hàng có ID 17", DO NOT respond with "Tôi sẽ sử dụng công cụ get_customer_info". Instead, you should directly call the get_customer_info tool with the parameter 17 and then present the information to the user.

To effectively help with database queries and operations, follow these steps:
1. Understand the user's request fully, especially if it relates to customer information or database updates.
2. If the user's request involves database operations, identify which MCP tool to use.
3. If the user wants customer information, directly call the get_customer_info tool with the appropriate customer_id.
4. If the user needs to update, insert, or delete data, directly call the execute_update tool with the correct SQL query.
5. Process the tool's result and use it to complete the user's request (e.g., explain customer information, confirm data was updated).
6. If you need any clarification about what the user is asking, don't hesitate to ask questions.

Your goal is to assist users with database tasks by intelligently using the available database tools without requiring them to explicitly tell you which tool to use for every database operation.
"""

# Store active chat sessions
active_sessions = {}

# --- Helper function to call MCP Server ---
def call_mcp_tool_executor(tool_name, params):
    """Call the MCP Server's execute endpoint with the specified tool and parameters."""
    try:
        print(f"🤖 ChatApp: Calling MCP Server to execute '{tool_name}' with params: {params}")
        mcp_response = requests.post(
            f"{MCP_SERVER_URL}/mcp/execute",
            json={"tool_name": tool_name, "parameters": params},
            timeout=10
        )
        
        # Handle HTTP errors
        if mcp_response.status_code != 200:
            print(f"❌ MCP Server returned error {mcp_response.status_code}: {mcp_response.text}")
            return {"error": f"MCP Server error {mcp_response.status_code}: {mcp_response.text}"}
            
        result = mcp_response.json()
        # The 'result' key contains the actual tool execution result
        return result.get("result", {})
        
    except Exception as e:
        print(f"❌ Error calling MCP server: {e}")
        return {"error": f"Failed to call MCP server: {str(e)}"}

# Helper function to check if a response text mentions a tool call
def extract_tool_call(text):
    # Import re for regex matching
    import re
    
    for tool_config in TOOLS_CONFIG:
        tool_name = tool_config["name"]
        
        # Check for common patterns like "I'll use tool_name" or "Using tool_name" or just the tool name
        if f"use {tool_name}" in text.lower() or f"using {tool_name}" in text.lower() or f"{tool_name}" in text.lower():
            # First look for patterns like "customer ID X" or "ID X" or "ID: X"
            id_patterns = [r"customer\s+id\s+(\d+)", r"customer\s*id:\s*(\d+)", r"id\s+(\d+)", r"id:\s*(\d+)"]
            
            for pattern in id_patterns:
                match = re.search(pattern, text, re.IGNORECASE)
                if match:
                    param_value = match.group(1)
                    if tool_name == "get_customer_info":
                        return tool_name, {"customer_id": param_value}
            
            # If no ID pattern found, look for any number in the text
            numbers = re.findall(r"\d+", text)
            if numbers and tool_name == "get_customer_info":
                return tool_name, {"customer_id": numbers[0]}
    
    return None, None

# --- API Routes ---
@app.route('/api/sessions', methods=['POST'])
def create_session():
    """
    Create a new chat session with Gemini
    Optional: Pass customer_id to preload customer info at session start
    """
    data = request.json or {}
    session_id = str(uuid.uuid4())
    
    try:
        # Initialize model and chat
        if USING_NEW_SDK:
            # New SDK
            model = CLIENT.models.get_model(MODEL_NAME)
            chat = model.start_chat()

            # Add system message
            if SYSTEM_MESSAGE_TEXT.strip():
                chat.send_message({"role": "user", "parts": ["Set the system instructions"]})
                chat.send_message({"role": "model", "parts": ["I'll follow the system instructions. What are they?"]})
                chat.send_message({"role": "user", "parts": [SYSTEM_MESSAGE_TEXT]})
                chat.send_message({"role": "model", "parts": ["I'll follow these instructions."]})
        else:
            # Legacy SDK approach
            model = genai.GenerativeModel(MODEL_NAME, tools=GEMINI_TOOLS)
            # For Legacy SDK, we need to set up the chat and history manually
            # First create the chat without system message
            chat = model.start_chat()
            
            # Then send a system message as the first message
            if SYSTEM_MESSAGE_TEXT.strip():
                # First add the system message
                system_msg_response = chat.send_message(SYSTEM_MESSAGE_TEXT)
                # Add a placeholder acknowledgment so user's first message starts fresh
                _ = chat.send_message("I understand and I'll follow these instructions.")
        
        # Store the chat session
        active_sessions[session_id] = {
            "chat": chat,
            "last_activity": import_time(),
            "messages": []
        }
        
        # Automatically fetch all products at the start of the chat
        products_result = call_mcp_tool_executor("get_all_products", {})
        
        response_message = "Chat session created successfully"
        
        # If products were loaded successfully, send them to the model
        if products_result and "formatted_products" in products_result:
            formatted_products = products_result.get("formatted_products", "")
            product_summary = f"The following products are available in the store:\n\n{formatted_products}\n\nUse this product information to assist the customer."
            
            # Send the product information as regular text
            _ = chat.send_message(product_summary)
            response_message += " with product data preloaded"
            
            # Update session with info about preloaded data
            active_sessions[session_id]["preloaded_data"] = {"products": True}
        
        # Optionally preload customer info if customer_id is provided
        customer_id = data.get("customer_id")
        if customer_id:
            customer_result = call_mcp_tool_executor("get_customer_info", {"customer_id": str(customer_id)})
            
            if customer_result and "customer_info" in customer_result:
                customer_summary = f"The following customer information has been preloaded:\n\n{customer_result['customer_info']}\n\nUse this customer information to assist with the request."
                
                # Send the customer information as regular text
                _ = chat.send_message(customer_summary)
                response_message += " and customer data preloaded"
                
                # Update session with info about preloaded data
                active_sessions[session_id]["preloaded_data"] = active_sessions[session_id].get("preloaded_data", {})
                active_sessions[session_id]["preloaded_data"]["customer"] = True
                active_sessions[session_id]["customer_id"] = customer_id
        
        return jsonify({
            "session_id": session_id,
            "message": response_message,
            "status": "success"
        })
        
    except Exception as e:
        print(f"Error creating session: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Failed to create chat session: {str(e)}",
            "status": "error"
        }), 500

@app.route('/api/sessions/<session_id>/messages', methods=['POST'])
def send_message(session_id):
    """Send a message to an existing chat session"""
    if session_id not in active_sessions:
        return jsonify({
            "error": "Session not found. Create a new session first.",
            "status": "error"
        }), 404
    
    data = request.json
    if not data or 'message' not in data:
        return jsonify({
            "error": "Message is required",
            "status": "error"
        }), 400
    
    user_message = data['message']
    session = active_sessions[session_id]
    chat = session["chat"]
    
    try:
        # Add user message to session history
        session["messages"].append({"role": "user", "content": user_message})
        
        # Check if the user input is a direct tool call command
        is_direct_tool_call = False
        tool_name = None
        tool_args = None
        
        # Parse direct tool calls like 'get_customer_info 17'
        parts = user_message.strip().split(maxsplit=1)
        if len(parts) > 0 and parts[0] in [tool['name'] for tool in TOOLS_CONFIG]:
            is_direct_tool_call = True
            tool_name = parts[0]
            # Parse the argument (assuming it's just a customer_id or similar simple parameter)
            if len(parts) > 1:
                if tool_name == 'get_customer_info':
                    tool_args = {'customer_id': parts[1]}
                elif tool_name == 'execute_update':
                    tool_args = {'query': parts[1]}
        
        # Process based on whether it's a direct tool call or normal message
        responses = []
        
        if is_direct_tool_call:
            # Execute tool directly without involving Gemini
            tool_execution_result = call_mcp_tool_executor(tool_name, tool_args)
            
            if tool_execution_result is None:
                return jsonify({
                    "error": "MCP tool execution failed to return data.",
                    "status": "error"
                }), 500
            
            # Send the direct tool result to Gemini for interpretation
            if USING_NEW_SDK:
                response = chat.send_message({
                    "function_response": {
                        "name": tool_name,
                        "response": tool_execution_result
                    }
                })
                text_response = response.text if hasattr(response, 'text') else None
            else:
                response = chat.send_message(
                    genai.protos.Part(
                        function_response=genai.protos.FunctionResponse(
                            name=tool_name,
                            response=tool_execution_result
                        )
                    )
                )
                text_response = response.candidates[0].content.parts[0].text if (
                    hasattr(response.candidates[0].content.parts[0], 'text')
                ) else None
            
            # Store the tool result and model's interpretation
            responses.append({
                "type": "tool_result",
                "tool_name": tool_name,
                "tool_args": tool_args,
                "result": tool_execution_result
            })
            
            if text_response:
                responses.append({
                    "type": "ai_message",
                    "content": text_response
                })
                session["messages"].append({"role": "assistant", "content": text_response})
                
        else:
            # Regular message processing
            response = chat.send_message(user_message)
            
            # First check if we got a text response before checking for function calls
            text_response = None
            if USING_NEW_SDK and hasattr(response, 'text') and response.text:
                text_response = response.text
            elif not USING_NEW_SDK and hasattr(response.candidates[0].content.parts[0], 'text') and response.candidates[0].content.parts[0].text:
                text_response = response.candidates[0].content.parts[0].text
            
            # Store the initial response
            if text_response:
                responses.append({
                    "type": "ai_message",
                    "content": text_response
                })
                session["messages"].append({"role": "assistant", "content": text_response})
            
            # Check if the response mentions a tool that should be automatically executed
            if text_response:
                auto_tool_name, auto_tool_args = extract_tool_call(text_response)
                if auto_tool_name and auto_tool_args:
                    # Automatically execute the detected tool
                    auto_tool_result = call_mcp_tool_executor(auto_tool_name, auto_tool_args)
                    
                    if auto_tool_result is not None:
                        # Store the tool execution result
                        responses.append({
                            "type": "tool_result",
                            "tool_name": auto_tool_name,
                            "tool_args": auto_tool_args,
                            "result": auto_tool_result
                        })
                        
                        # Send the automatic tool result to Gemini for interpretation
                        if USING_NEW_SDK:
                            response = chat.send_message({
                                "function_response": {
                                    "name": auto_tool_name,
                                    "response": auto_tool_result
                                }
                            })
                            follow_up_response = response.text if hasattr(response, 'text') else None
                        else:
                            response = chat.send_message(
                                genai.protos.Part(
                                    function_response=genai.protos.FunctionResponse(
                                        name=auto_tool_name,
                                        response=auto_tool_result
                                    )
                                )
                            )
                            follow_up_response = response.candidates[0].content.parts[0].text if (
                                hasattr(response.candidates[0].content.parts[0], 'text')
                            ) else None
                        
                        # Store the follow-up response
                        if follow_up_response:
                            responses.append({
                                "type": "ai_message",
                                "content": follow_up_response
                            })
                            session["messages"].append({"role": "assistant", "content": follow_up_response})
            
            # Handle function calls from Gemini
            if USING_NEW_SDK:
                # For the new SDK
                while hasattr(response, 'functions') and response.functions:
                    function_call = response.functions[0]
                    tool_name = function_call.name
                    tool_args = function_call.args
                    
                    # Automatically execute the tool
                    tool_execution_result = call_mcp_tool_executor(tool_name, tool_args)
                    
                    if tool_execution_result is None:
                        tool_execution_result = {"error": "MCP tool execution failed to return data."}
                    
                    # Store the tool execution result
                    responses.append({
                        "type": "tool_result",
                        "tool_name": tool_name,
                        "tool_args": tool_args,
                        "result": tool_execution_result
                    })
                    
                    # Send the tool's result back to Gemini
                    response = chat.send_message({
                        "function_response": {
                            "name": tool_name,
                            "response": tool_execution_result
                        }
                    })
                    
                    # Update text_response after tool execution
                    if hasattr(response, 'text') and response.text:
                        text_response = response.text
                        responses.append({
                            "type": "ai_message",
                            "content": text_response
                        })
                        session["messages"].append({"role": "assistant", "content": text_response})
            
            else:
                # For the legacy SDK
                while hasattr(response.candidates[0].content.parts[0], 'function_call') and response.candidates[0].content.parts[0].function_call.name:
                    fc = response.candidates[0].content.parts[0].function_call
                    tool_name = fc.name
                    tool_args = {key: value for key, value in fc.args.items()}
                    
                    # Automatically execute the tool
                    tool_execution_result = call_mcp_tool_executor(tool_name, tool_args)
                    
                    if tool_execution_result is None:
                        tool_execution_result = {"error": "MCP tool execution failed to return data."}
                    
                    # Store the tool execution result
                    responses.append({
                        "type": "tool_result",
                        "tool_name": tool_name,
                        "tool_args": tool_args,
                        "result": tool_execution_result
                    })
                    
                    # Send the tool's result back to Gemini
                    response = chat.send_message(
                        genai.protos.Part(
                            function_response=genai.protos.FunctionResponse(
                                name=tool_name,
                                response=tool_execution_result
                            )
                        )
                    )
                    
                    # Update text_response after tool execution
                    if hasattr(response.candidates[0].content.parts[0], 'text') and response.candidates[0].content.parts[0].text:
                        text_response = response.candidates[0].content.parts[0].text
                        responses.append({
                            "type": "ai_message",
                            "content": text_response
                        })
                        session["messages"].append({"role": "assistant", "content": text_response})
        
        # Update session's last activity timestamp
        session["last_activity"] = import_time()
        
        return jsonify({
            "session_id": session_id,
            "responses": responses,
            "status": "success"
        })
        
    except Exception as e:
        print(f"Error processing message: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "error": f"Failed to process message: {str(e)}",
            "status": "error"
        }), 500

@app.route('/api/sessions/<session_id>', methods=['GET'])
def get_session(session_id):
    """Get information about a specific chat session"""
    if session_id not in active_sessions:
        return jsonify({
            "error": "Session not found",
            "status": "error"
        }), 404
    
    session = active_sessions[session_id]
    
    return jsonify({
        "session_id": session_id,
        "messages": session["messages"],
        "last_activity": session["last_activity"],
        "preloaded_data": session.get("preloaded_data", {}),
        "status": "success"
    })

@app.route('/api/sessions', methods=['GET'])
def list_sessions():
    """List all active chat sessions"""
    sessions_info = {}
    for session_id, session in active_sessions.items():
        sessions_info[session_id] = {
            "last_activity": session["last_activity"],
            "message_count": len(session["messages"]),
            "preloaded_data": session.get("preloaded_data", {})
        }
    
    return jsonify({
        "sessions": sessions_info,
        "count": len(sessions_info),
        "status": "success"
    })

@app.route('/api/sessions/<session_id>', methods=['DELETE'])
def delete_session(session_id):
    """Delete a chat session"""
    if session_id not in active_sessions:
        return jsonify({
            "error": "Session not found",
            "status": "error"
        }), 404
    
    del active_sessions[session_id]
    
    return jsonify({
        "message": f"Session {session_id} deleted successfully",
        "status": "success"
    })

# Helper function to get current time
def import_time():
    from datetime import datetime
    return datetime.now().isoformat()

# Add a simple health check endpoint
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "healthy",
        "version": "1.0.0",
        "sdk_version": "new" if USING_NEW_SDK else "legacy"
    })

if __name__ == '__main__':
    print(f"Starting Gemini MCP Chatbot API Server...")
    print(f"Using {'new' if USING_NEW_SDK else 'legacy'} Google GenAI SDK")
    app.run(host='0.0.0.0', port=5004, debug=True)
