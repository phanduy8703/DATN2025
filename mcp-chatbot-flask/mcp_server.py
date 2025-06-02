from flask import Flask, request, jsonify
import json
import argparse
import logging
import psycopg2
from psycopg2 import sql
from psycopg2.extras import RealDictCursor

# Configure basic logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

app = Flask(__name__)

# Route Flask logs to the basicConfig setup
app.logger.setLevel(logging.INFO)

# --- Determine Database Connection ---
def get_db_connection_string():
    parser = argparse.ArgumentParser(description="MCP Server for PostgreSQL Database Access.")
    parser.add_argument(
        "--db-connection-string",
        type=str,
        help="PostgreSQL connection string (e.g., postgresql://username:password@localhost/dbname)"
    )
    args = parser.parse_args()

    # 1. From Command-line argument
    if args.db_connection_string:
        app.logger.info(f"Using database connection from command-line argument")
        return args.db_connection_string

    # 2. From Environment Variable
    env_conn = os.environ.get("MCP_POSTGRES_CONNECTION")
    if env_conn:
        app.logger.info(f"Using database connection from MCP_POSTGRES_CONNECTION environment variable")
        return env_conn

    # 3. Default connection string
    default_conn = "postgresql://postgres:abc123!@160.250.246.78:5432/shophaui?sslaccept=accept_invalid_certs"
    app.logger.info(f"Using default database connection: {default_conn}")
    return default_conn

import os # Needed for environment variables

DB_CONNECTION = get_db_connection_string()

# Test database connection
try:
    conn = psycopg2.connect(DB_CONNECTION)
    conn.close()
    app.logger.info(f"✅ Successfully connected to PostgreSQL database")
except Exception as e:
    app.logger.critical(f"CRITICAL ERROR: Could not connect to PostgreSQL database: {e}")
    app.logger.critical("Please check your connection string or database status.")
    exit(1)

app.logger.info(f"✅ MCP Server configured. PostgreSQL connection established.")
app.logger.info(f"   All database operations will use this connection.")

# Helper function to get database connection
def get_db_conn():
    return psycopg2.connect(DB_CONNECTION, cursor_factory=RealDictCursor)

# --- Tool Definitions (for MCP /mcp/tools endpoint) ---
TOOLS_METADATA = [
    {
        "name": "get_customer_info",
        "description": "Retrieves comprehensive information about a customer including profile, orders, cart, and behavior data.",
        "input_schema": {
            "type": "object",
            "properties": {
                "customer_id": {"type": "string", "description": "ID of the customer to retrieve information for"}
            },
            "required": ["customer_id"]
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "customer_info": {"type": "string", "description": "Formatted customer information including profile, orders, cart items, and other related data"},
                "error": {"type": "string", "description": "Error message if any"}
            }
        }
    },
    {
        "name": "get_all_products",
        "description": "Retrieves all products from the database.",
        "input_schema": {
            "type": "object",
            "properties": {}
        },
        "output_schema": {
            "type": "object",
            "properties": {
                "products": {"type": "array", "description": "List of all products with their details"},
                "error": {"type": "string", "description": "Error message if any"}
            }
        }
    }
]

# --- Tool Implementations ---

def tool_get_customer_info(params):
    customer_id = params.get("customer_id")
    
    if not customer_id:
        return {"error": "Missing customer_id parameter"}
    
    try:
        conn = psycopg2.connect(DB_CONNECTION)
        
        # Helper function to execute queries
        def execute_query(query, params):
            cursor = conn.cursor()
            cursor.execute(query, params)
            results = cursor.fetchall()
            cursor.close()
            return results
        
        # Fetch customer data
        raw_customer = execute_query('SELECT * FROM "Customer" WHERE customer_id = %s', (customer_id,))
        raw_orders = execute_query('SELECT * FROM "orders" WHERE customer_id = %s', (customer_id,))
        raw_order_items = execute_query("""
            SELECT oi.* FROM "order_items" oi
            JOIN "orders" o ON oi.order_id = o.order_id
            WHERE o.customer_id = %s
        """, (customer_id,))
        raw_payments = execute_query("""
            SELECT p.* FROM "payments" p
            JOIN "orders" o ON p.order_id = o.order_id
            WHERE o.customer_id = %s
        """, (customer_id,))
        raw_reviews = execute_query('SELECT * FROM "Review" WHERE customer_id = %s', (customer_id,))
        raw_wishlist = execute_query('SELECT * FROM "Wishlist" WHERE customer_id = %s', (customer_id,))
        raw_notifications = execute_query('SELECT * FROM "Notification" WHERE customer_id = %s', (customer_id,))
        raw_address_shippers = execute_query('SELECT * FROM "address_shippers" WHERE customer_id = %s', (customer_id,))
        raw_cart = execute_query('SELECT * FROM "Cart" WHERE customer_id = %s', (customer_id,))
        raw_cart_items = execute_query("""
            SELECT 
                ci.cartitem_id,
                ci.quantity,
                p.product_id,
                p.product_name,
                p.price,
                s.size_id,
                s.name_size
            FROM "CartItem" ci
            JOIN "Cart" c ON ci.cart_id = c.cart_id
            JOIN "Product" p ON ci.product_id = p.product_id
            JOIN "Size" s ON ci.size_id = s.size_id
            WHERE c.customer_id = %s
        """, (customer_id,))
        raw_user_behavior = execute_query('SELECT * FROM "UserBehavior" WHERE "userId" = %s', (customer_id,))

        # Process customer data
        customer_columns = [
            "customer_id", "name", "email", "phone", "image", "username", "password", 
            "created_at", "updated_at", "token", "roleId", "id_card_front", "id_card_data"
        ]
        sensitive_fields = {"password", "token"}
        customer_info = None
        if raw_customer and len(raw_customer) > 0:
            row = raw_customer[0]
            customer_info = {}
            for i, col in enumerate(customer_columns):
                if i < len(row) and col not in sensitive_fields and col not in ("id_card_front", "id_card_data"):
                    customer_info[col] = row[i]
                    
            # Check ID card verification
            try:
                idx_front = customer_columns.index("id_card_front")
                idx_data = customer_columns.index("id_card_data")
                is_verified = idx_front < len(row) and idx_data < len(row) and row[idx_front] is not None and row[idx_data] is not None
                customer_info["id_card_verified"] = bool(is_verified)
            except (ValueError, IndexError):
                customer_info["id_card_verified"] = False
        
        # Process cart items
        cart_items = []
        if raw_cart_items:
            for row in raw_cart_items:
                if len(row) >= 7:  # Ensure we have all expected columns
                    cart_items.append({
                        "cartitem_id": row[0],
                        "quantity": row[1],
                        "product_id": row[2],
                        "product_name": row[3],
                        "price": row[4],
                        "size_id": row[5],
                        "size_name": row[6]
                    })
        
        # Process orders
        orders = []
        if raw_orders:
            for row in raw_orders:
                if len(row) >= 8:  # Ensure we have all expected columns
                    orders.append({
                        "order_id": row[0],
                        "customer_id": row[1],
                        "order_date": row[2],
                        "total_amount": row[3],
                        "order_state": row[4],
                        "created_at": row[5],
                        "updated_at": row[6],
                        "address_id": row[7]
                    })
        
        # Process order items
        order_items = []
        if raw_order_items:
            for row in raw_order_items:
                if len(row) >= 8:  # Ensure we have all expected columns
                    order_items.append({
                        "orderitem_id": row[0],
                        "order_id": row[1],
                        "product_id": row[2],
                        "quantity": row[3],
                        "price": row[4],
                        "size_id": row[5],
                        "created_at": row[6],
                        "updated_at": row[7]
                    })
        
        # Process user behavior
        user_behavior = []
        if raw_user_behavior:
            for row in raw_user_behavior:
                if len(row) >= 5:  # Ensure we have all expected columns
                    user_behavior.append({
                        "id": row[0],
                        "user_id": row[1],
                        "product_id": row[2],
                        "action": row[3],
                        "timestamp": row[4]
                    })
        
        # Format text response
        lines = []
        lines.append(f"\n--- CUSTOMER ---")
        if customer_info:
            for k, v in customer_info.items():
                if k != "id_card_verified":
                    lines.append(f"{k}: {v}")
            lines.append(f"Đã xác thực căn cước: {'Có' if customer_info.get('id_card_verified') else 'Chưa'}")
        else:
            lines.append("Không có dữ liệu.")

        lines.append(f"\n--- CART_ITEMS ---")
        if cart_items:
            lines.append("Các sản phẩm trong giỏ hàng:")
            for item in cart_items:
                lines.append(f"- Sản phẩm: {item['product_name']} (ID: {item['product_id']}), Giá: {item['price']}, Số lượng: {item['quantity']}, Size: {item['size_name']}")
        else:
            lines.append("Không có dữ liệu.")

        lines.append(f"\n--- ORDERS ---")
        if orders:
            lines.append("Danh sách đơn hàng:")
            for order in orders:
                lines.append(f"- Order ID: {order['order_id']}, Ngày đặt: {order['order_date']}, Tổng tiền: {order['total_amount']}, Trạng thái: {order['order_state']}")
        else:
            lines.append("Không có dữ liệu.")

        lines.append(f"\n--- ORDER_ITEMS ---")
        if order_items:
            lines.append("Các sản phẩm trong các đơn hàng:")
            for item in order_items:
                lines.append(f"- OrderItem ID: {item['orderitem_id']}, Order ID: {item['order_id']}, Product ID: {item['product_id']}, Số lượng: {item['quantity']}, Giá: {item['price']}, Size ID: {item['size_id']}")
        else:
            lines.append("Không có dữ liệu.")

        lines.append(f"\n--- USER_BEHAVIOR ---")
        if user_behavior:
            lines.append("Hành vi người dùng:")
            for beh in user_behavior:
                lines.append(f"- ID: {beh['id']}, UserID: {beh['user_id']}, ProductID: {beh['product_id']}, Hành động: {beh['action']}, Thời gian: {beh['timestamp']}")
        else:
            lines.append("Không có dữ liệu.")

        lines.append(f"\n--- REVIEWS ---")
        if raw_reviews:
            lines.append("Đánh giá của khách hàng:")
            for i, review in enumerate(raw_reviews, 1):
                lines.append(f"- Review #{i}: {review}")
        else:
            lines.append("Không có dữ liệu.")
            
        lines.append(f"\n--- WISHLIST ---")
        if raw_wishlist:
            lines.append("Danh sách yêu thích:")
            for i, item in enumerate(raw_wishlist, 1):
                lines.append(f"- Wishlist #{i}: {item}")
        else:
            lines.append("Không có dữ liệu.")
            
        conn.close()
        app.logger.info(f"Successfully retrieved comprehensive customer info for customer ID {customer_id}")
        return {"customer_info": "\n".join(lines)}
    
    except Exception as e:
        app.logger.error(f"Error retrieving customer info: {e}")
        return {"error": f"Database error: {str(e)}"}


def tool_describe_table(params):
    try:
        table = params.get("table")
        schema = params.get("schema", "public")
        
        if not table:
            return {"error": "Table name is required"}
        
        app.logger.info(f"Describing table: {schema}.{table}")
        
        # Query to get column information
        query = """
        SELECT 
            column_name, 
            data_type, 
            is_nullable, 
            column_default,
            character_maximum_length,
            numeric_precision,
            numeric_scale
        FROM information_schema.columns 
        WHERE table_schema = %s AND table_name = %s
        ORDER BY ordinal_position
        """
        
        # Query to get primary key information
        pk_query = """
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
          ON tc.constraint_name = kcu.constraint_name
          AND tc.table_schema = kcu.table_schema
        WHERE tc.constraint_type = 'PRIMARY KEY'
          AND tc.table_schema = %s
          AND tc.table_name = %s
        """
        
        conn = get_db_conn()
        try:
            columns = []
            with conn.cursor() as cursor:
                # Get column information
                cursor.execute(query, (schema, table))
                column_info = cursor.fetchall()
                
                if not column_info:
                    return {"error": f"Table {schema}.{table} not found or has no columns"}
                
                # Get primary key columns
                cursor.execute(pk_query, (schema, table))
                pk_columns = [row['column_name'] for row in cursor.fetchall()]
                
                # Combine information
                for col in column_info:
                    column_data = dict(col)
                    column_data['is_primary_key'] = col['column_name'] in pk_columns
                    columns.append(column_data)
                
                app.logger.info(f"Retrieved information for {len(columns)} columns in {schema}.{table}")
                return {"columns": columns}
        finally:
            conn.close()
            
    except Exception as e:
        app.logger.error(f"Error describing table: {e}", exc_info=True)
        return {"error": f"Database error: {str(e)}"}

def tool_execute_update(params):
    try:
        query = params.get("query", "")
        query_params = params.get("params", {})
        
        # Security check: Ensure this is not a SELECT query (those should use query_data)
        if query.strip().upper().startswith("SELECT"):
            app.logger.warning(f"SELECT query attempted with execute_update: {query}")
            return {"success": False, "error": "SELECT queries should use the query_data tool, not execute_update."}
        
        # Check for potentially dangerous operations
        dangerous_statements = ["DROP", "TRUNCATE", "ALTER", "CREATE", "GRANT", "REVOKE"]
        for stmt in dangerous_statements:
            if stmt in query.strip().upper().split():
                app.logger.warning(f"Potentially dangerous operation detected: {stmt} in query: {query}")
                return {"success": False, "error": f"Potentially dangerous operation ({stmt}) detected. For safety, this tool only allows INSERT, UPDATE, and DELETE operations."}
        
        app.logger.info(f"Executing update query: {query}")
        
        conn = get_db_conn()
        try:
            with conn.cursor() as cursor:
                if query_params:
                    cursor.execute(query, query_params)
                else:
                    cursor.execute(query)
                
                rows_affected = cursor.rowcount
                conn.commit()
                
                app.logger.info(f"Query affected {rows_affected} rows")
                return {"success": True, "rows_affected": rows_affected}
        except Exception as db_error:
            conn.rollback()
            app.logger.error(f"Database error during query execution: {db_error}")
            return {"success": False, "error": f"Database error: {str(db_error)}"}
        finally:
            conn.close()
            
    except Exception as e:
        app.logger.error(f"Error executing update: {e}", exc_info=True)
        return {"success": False, "error": f"Error: {str(e)}"}

# --- MCP Endpoints ---
@app.route('/mcp/tools', methods=['GET'])
def get_tools():
    return jsonify(TOOLS_METADATA)

def tool_get_all_products(params):
    try:
        conn = psycopg2.connect(DB_CONNECTION)
        
        try:
            cursor = conn.cursor()
            query = """
            SELECT product_id, product_name, description, price, stock_quantity, category_id, 
                   brand_id, created_at, updated_at, season_id, rating_id, color
            FROM public."Product"
            """
            cursor.execute(query)
            results = cursor.fetchall()
            cursor.close()
            
            products = []
            for row in results:
                products.append({
                    "product_id": row[0],
                    "product_name": row[1],
                    "description": row[2],
                    "price": float(row[3]) if row[3] else None,
                    "stock_quantity": row[4],
                    "category_id": row[5],
                    "brand_id": row[6],
                    "created_at": row[7].isoformat() if row[7] else None,
                    "updated_at": row[8].isoformat() if row[8] else None,
                    "season_id": row[9],
                    "rating_id": row[10],
                    "color": row[11]
                })
            
            # Also return a formatted text version for easy reading
            formatted_products = "\n--- PRODUCTS ---\n"
            for prod in products:
                formatted_products += f"Product ID: {prod['product_id']}\n"
                formatted_products += f"Name: {prod['product_name']}\n"
                formatted_products += f"Price: {prod['price']}\n"
                formatted_products += f"Stock: {prod['stock_quantity']}\n"
                formatted_products += f"Category ID: {prod['category_id']}\n"
                formatted_products += f"Color: {prod['color']}\n"
                formatted_products += "-------------------\n"
            
            app.logger.info(f"Retrieved {len(products)} products from database")
            return {"products": products, "formatted_products": formatted_products}
        finally:
            conn.close()
    except Exception as e:
        app.logger.error(f"Error retrieving products: {e}", exc_info=True)
        return {"error": f"Database error: {str(e)}"}

@app.route('/mcp/execute', methods=['POST'])
def execute_tool():
    data = request.json
    tool_name = data.get("tool_name")
    parameters = data.get("parameters", {})

    app.logger.info(f"Received tool execution request: tool='{tool_name}', params={parameters}")

    result = {}
    status_code = 200
    
    if tool_name == "get_customer_info":
        result = tool_get_customer_info(parameters)
    elif tool_name == "get_all_products":
        result = tool_get_all_products(parameters)
    else:
        result = {"error": f"Unknown tool: {tool_name}"}
        status_code = 404
        app.logger.error(f"Unknown tool requested: {tool_name}")

    # Check for errors in result
    if "error" in result and status_code == 200:
        app.logger.error(f"Tool '{tool_name}' returned an error: {result.get('error')}")
        status_code = 400 # Use 400 for client-side logic errors (like customer not found)

    app.logger.info(f"Sending tool execution response (status={status_code}): {result}")

    return jsonify({"tool_name": tool_name, "result": result}), status_code

if __name__ == '__main__':
    # The argparse logic is already handled in get_db_connection_string(), so it's processed before Flask app starts
    print(f"Starting PostgreSQL MCP Server...")
    print(f"Connected to PostgreSQL database: '{DB_CONNECTION}'")
    print("Endpoints:")
    print("  GET  /mcp/tools        (Lists available tools)")
    print("  POST /mcp/execute     (Executes a tool)")
    print("\nAvailable tools:")
    print("  get_customer_info     (Retrieves customer information)")
    print("  execute_update        (Executes INSERT, UPDATE, DELETE queries)")
    # Flask's debug mode also enables its logger by default.
    # Setting debug=True is good for development.
    app.run(host='0.0.0.0', port=5003, debug=True)