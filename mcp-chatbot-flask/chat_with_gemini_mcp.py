"""
Enhanced MCP-enabled chat with Gemini (SDK version).
This script provides a command-line interface to chat with Gemini and use MCP tools.
"""

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

import requests # For calling the MCP server
import os
import json

# --- Configuration ---
# IMPORTANT: Set your Google API Key here or as an environment variable
try:
    GOOGLE_API_KEY = os.environ["GOOGLE_API_KEY"]
except KeyError:
    # Fallback to a hardcoded API key if environment variable not set
    GOOGLE_API_KEY = "AIzaSyAersDweFBbVxZ004IbEJcVbyPGxJMZIJw"
    print("⚠️ Using hardcoded API key. For production, use environment variable.")
    # Không exit nếu dùng key mặc định

# Configure the SDK based on which one is being used
if USING_NEW_SDK:
    # New SDK approach
    CLIENT = genai.Client(api_key=GOOGLE_API_KEY)
else:
    # Legacy SDK approach
    genai.configure(api_key=GOOGLE_API_KEY)

MODEL_NAME = "gemini-1.5-flash-latest" # Changed to a valid and reliable model
MCP_SERVER_URL = "http://localhost:5003" # URL of your local mcp_server.py

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
                type=getattr(genai.protos.Type, prop_config["type"].upper()),
                description=prop_config.get("description", "")
            )
        
        schema = genai.protos.Schema(
            type=genai.protos.Type.OBJECT,
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

# --- Helper to call MCP Server ---
def call_mcp_tool_executor(tool_name, params):
    print(f"🤖 ChatApp: Calling MCP Server to execute '{tool_name}' with params: {params}")
    try:
        response = requests.post(
            f"{MCP_SERVER_URL}/mcp/execute",
            json={"tool_name": tool_name, "parameters": params}
        )
        response.raise_for_status() # Raise HTTPError for bad responses (4xx or 5xx)
        mcp_response_data = response.json()
        print(f"MCP Server Response: {json.dumps(mcp_response_data, indent=2)}")
        return mcp_response_data.get("result") # Return just the 'result' part of the MCP response
    except requests.exceptions.RequestException as e:
        print(f"🛑 ChatApp: Error calling MCP server for tool '{tool_name}': {e}")
        if e.response is not None:
            print(f"MCP Server Error Response Body: {e.response.text}")
            try: # Try to parse error from MCP server if JSON
                return e.response.json().get("result", {"error": f"MCP Server HTTP Error: {e.response.status_code}"})
            except json.JSONDecodeError:
                return {"error": f"MCP Server HTTP Error: {e.response.status_code} - {e.response.text}"}
        return {"error": f"Failed to connect to MCP server: {str(e)}"}
    except Exception as e_json: # Catch potential JSON parsing errors from successful requests
        print(f"🛑 ChatApp: Error parsing JSON response from MCP server for tool '{tool_name}': {e_json}")
        return {"error": f"Could not parse MCP server response: {str(e_json)}"}

# --- Main Chat Logic ---
def run_chat():
    print(f"Interacting with {MODEL_NAME} using MCP tools. Type 'quit' to exit.")
    print(f"Using {'New SDK (google.genai)' if USING_NEW_SDK else 'Legacy SDK (google.generativeai)'}")
    print("Gemini has a tool to retrieve comprehensive customer information.")
    print("You can access detailed customer profiles, orders, cart items, and more with the get_customer_info tool.\n")

    # Define the system message
    system_message_text = """
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

The execute_update tool allows you to perform INSERT, UPDATE, or DELETE operations on the database when needed.

Your interactions with the database are secured and monitored. When you use these tools, you're using secure external tools that handle the actual database interactions.
These tools validate that all operations are safe and prevent potentially dangerous operations.

VERY IMPORTANT: When a user asks for information that requires using a tool, you MUST directly execute the tool WITHOUT asking for confirmation or explaining your intention to use it first. Execute the tool immediately and provide the information to the user.

For example, if the user says "Lấy thông tin khách hàng có ID 17", DO NOT respond with "Tôi sẽ sử dụng công cụ get_customer_info". Instead, you should directly call the get_customer_info tool with the parameter 17 and then present the information to the user.

To effectively help with database queries and operations, follow these steps:
1. Understand the user's request fully, especially if it relates to customer information or database updates.
2. Determine if the request requires interacting with the database.
3. If the user wants customer information, directly call the get_customer_info tool with the appropriate customer_id.
4. If the user needs to update, insert, or delete data, directly call the execute_update tool with the correct SQL query.
5. Process the tool's result and use it to complete the user's request (e.g., explain customer information, confirm data was updated).
6. If you need any clarification about what the user is asking, don't hesitate to ask questions.

Your goal is to assist users with database tasks by intelligently using the available database tools without requiring them to explicitly tell you which tool to use for every database operation.
"""

    # Initialize the model
    if USING_NEW_SDK:
        # New SDK
        model = CLIENT.models.get_model(MODEL_NAME)
        chat = model.start_chat()

        # Add system message
        if system_message_text.strip():
            chat.send_message({"role": "user", "parts": ["Set the system instructions"]})
            chat.send_message({"role": "model", "parts": ["I'll follow the system instructions. What are they?"]})
            chat.send_message({"role": "user", "parts": [system_message_text]})
            chat.send_message({"role": "model", "parts": ["I'll follow these instructions."]})
    else:
        # Legacy SDK approach
        model = genai.GenerativeModel(MODEL_NAME, tools=GEMINI_TOOLS)
        # For Legacy SDK, we need to set up the chat and history manually
        # First create the chat without system message
        chat = model.start_chat()
        
        # Then send a system message as the first message
        if system_message_text.strip():
            # First add the system message
            system_msg_response = chat.send_message(system_message_text)
            # Add a placeholder acknowledgment so user's first message starts fresh
            _ = chat.send_message("I understand and I'll follow these instructions.")
    
    # Automatically fetch all products at the start of the chat
    print(f"\n🔄 Automatically fetching all products...")
    products_result = call_mcp_tool_executor("get_all_products", {})
    
    # For the legacy SDK, we can't send function_response without a preceding function call
    # So we'll just send a summary of the products as regular text
    if products_result and "formatted_products" in products_result:
        print(f"✅ Product information retrieved successfully.\n")
        
        # Create a more detailed summary of products to send to Gemini
        formatted_products = products_result.get("formatted_products", "")
        product_summary = f"The following products are available in the store:\n\n{formatted_products}\n\nUse this product information to assist the customer."
        
        # Send the product information as regular text
        _ = chat.send_message(product_summary)
    
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

    while True:
        user_input = input("You: ")
        if user_input.lower() == 'quit':
            print("Exiting chat.")
            break

        if not user_input.strip():
            continue
            
        # Check if the user input is a direct tool call command (for backward compatibility)
        is_direct_tool_call = False
        tool_name = None
        tool_args = None
        
        # Parse direct tool calls like 'get_customer_info 17'
        parts = user_input.strip().split(maxsplit=1)
        if len(parts) > 0 and parts[0] in [tool['name'] for tool in TOOLS_CONFIG]:
            is_direct_tool_call = True
            tool_name = parts[0]
            # Parse the argument (assuming it's just a customer_id or similar simple parameter)
            if len(parts) > 1:
                if tool_name == 'get_customer_info':
                    tool_args = {'customer_id': parts[1]}
                elif tool_name == 'execute_update':
                    tool_args = {'query': parts[1]}
        
        try:
            print("🤖 Gemini is thinking...")
            
            # If it's a direct tool call, execute it directly without involving Gemini
            if is_direct_tool_call:
                print(f"🔧 Executing tool directly: '{tool_name}' with arguments: {tool_args}")
                tool_execution_result = call_mcp_tool_executor(tool_name, tool_args)
                
                if tool_execution_result is None:
                    print(f"❌ Error: MCP tool execution failed to return data.")
                    continue
                
                # Send the direct tool result to Gemini for interpretation
                if USING_NEW_SDK:
                    response = chat.send_message({
                        "function_response": {
                            "name": tool_name,
                            "response": tool_execution_result
                        }
                    })
                    if hasattr(response, 'text') and response.text:
                        print(f"Gemini: {response.text}")
                    else:
                        print("Gemini: (No text response after tool use, this might indicate an issue or completion of action)")
                else:
                    response = chat.send_message(
                        genai.protos.Part(
                            function_response=genai.protos.FunctionResponse(
                                name=tool_name,
                                response=tool_execution_result
                            )
                        )
                    )
                    if hasattr(response.candidates[0].content.parts[0], 'text') and response.candidates[0].content.parts[0].text:
                        print(f"Gemini: {response.candidates[0].content.parts[0].text}")
                    else:
                        print("Gemini: (No text response after tool use, this might indicate an issue or completion of action)")
                continue
            
            # Send message to Gemini
            response = chat.send_message(user_input)
            
            # First check if we got a text response before checking for function calls
            text_response = None
            if USING_NEW_SDK and hasattr(response, 'text') and response.text:
                text_response = response.text
            elif not USING_NEW_SDK and hasattr(response.candidates[0].content.parts[0], 'text') and response.candidates[0].content.parts[0].text:
                text_response = response.candidates[0].content.parts[0].text
            
            # If we have a text response, check if it mentions a tool that should be automatically executed
            if text_response:
                auto_tool_name, auto_tool_args = extract_tool_call(text_response)
                if auto_tool_name and auto_tool_args:
                    print(f"🔄 Automatically executing detected tool: '{auto_tool_name}' with arguments: {auto_tool_args}")
                    auto_tool_result = call_mcp_tool_executor(auto_tool_name, auto_tool_args)
                    
                    if auto_tool_result is None:
                        print(f"❌ Error: Automatic tool execution failed.")
                    else:
                        print(f"⚙️ Sending automatic tool result back to Gemini")
                        # Send the automatic tool result to Gemini for interpretation
                        if USING_NEW_SDK:
                            response = chat.send_message({
                                "function_response": {
                                    "name": auto_tool_name,
                                    "response": auto_tool_result
                                }
                            })
                        else:
                            response = chat.send_message(
                                genai.protos.Part(
                                    function_response=genai.protos.FunctionResponse(
                                        name=auto_tool_name,
                                        response=auto_tool_result
                                    )
                                )
                            )
                        # Update text_response after automatic tool execution
                        if USING_NEW_SDK and hasattr(response, 'text') and response.text:
                            text_response = response.text
                        elif not USING_NEW_SDK and hasattr(response.candidates[0].content.parts[0], 'text') and response.candidates[0].content.parts[0].text:
                            text_response = response.candidates[0].content.parts[0].text
            
            # Handle potential function calls from Gemini based on SDK version
            if USING_NEW_SDK:
                # For the new SDK
                while hasattr(response, 'functions') and response.functions:
                    function_call = response.functions[0]
                    tool_name = function_call.name
                    tool_args = function_call.args
                    
                    print(f"✨ Gemini wants to use tool: '{tool_name}' with arguments: {tool_args}")
                    
                    # Automatically execute the tool
                    tool_execution_result = call_mcp_tool_executor(tool_name, tool_args)
                    
                    if tool_execution_result is None:
                        tool_execution_result = {"error": "MCP tool execution failed to return data."}
                    
                    print(f"⚙️ ChatApp: Sending tool result back to Gemini: {tool_execution_result}")
                    
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
            
            else:
                # For the legacy SDK
                while hasattr(response.candidates[0].content.parts[0], 'function_call') and response.candidates[0].content.parts[0].function_call.name:
                    fc = response.candidates[0].content.parts[0].function_call
                    tool_name = fc.name
                    tool_args = {key: value for key, value in fc.args.items()}
                    
                    print(f"✨ Gemini wants to use tool: '{tool_name}' with arguments: {tool_args}")
                    
                    # Automatically execute the tool
                    tool_execution_result = call_mcp_tool_executor(tool_name, tool_args)
                    
                    if tool_execution_result is None:
                        tool_execution_result = {"error": "MCP tool execution failed to return data."}
                    
                    print(f"⚙️ ChatApp: Sending tool result back to Gemini: {tool_execution_result}")
                    
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
            
            # Final response display after all tool executions
            if text_response:
                print(f"Gemini: {text_response}")
            else:
                if USING_NEW_SDK and hasattr(response, 'text') and response.text:
                    print(f"Gemini: {response.text}")
                elif not USING_NEW_SDK and hasattr(response.candidates[0].content.parts[0], 'text') and response.candidates[0].content.parts[0].text:
                    print(f"Gemini: {response.candidates[0].content.parts[0].text}")
                else:
                    print("Gemini: (No text response after tool use, this might indicate an issue or completion of action)")

        except Exception as e:
            print(f"🛑 An error occurred: {e}")
            import traceback
            traceback.print_exc()

if __name__ == '__main__':
    run_chat()
