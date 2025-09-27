import os
import datetime
import jwt
from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from flask_cors import CORS
from dotenv import load_dotenv
from bson import ObjectId # Used to handle MongoDB's default _id format
from functools import wraps

UF_SW_CORNER = (29.62725, -82.37236)
UF_NE_CORNER = (29.660000, -82.300000)

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
# Enable CORS to allow your frontend to communicate with this server
CORS(app, resources={r"/api/*": {"origins": "*"}})
bcrypt = Bcrypt(app)
# You'll need to set a secret key to sign the JWTs
app.config['SECRET_KEY'] = 'LeftoverLinks2025' 

# --- Database Connection ---
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.eator # Use a database named 'eator'
pins_collection = db.pins # Use a collection named 'pins'
users_collection = db.users # Collection for user data

# --- Admin Seeding ---
def seed_admin_user():
    """Creates admin users if they don't already exist."""
    admin_user = [
        {"username": "Spongebob", "password": "LeftoverLinks2025"},
    ]

    for admin_data in admin_user:
        if not users_collection.find_one({"username": admin_data["username"]}):
            hashed_password = bcrypt.generate_password_hash(admin_data["password"]).decode('utf-8')
            users_collection.insert_one({
                "username": admin_data["username"],
                "password": hashed_password,
                "role": "Admin"
            })
            print(f"Admin user '{admin_data['username']}' created.")

# --- The "Magic" Part: TTL Index ---
# This special index tells MongoDB to automatically delete documents
# from this collection after a certain amount of time.
# We create an index on the 'expiresAt' field.
pins_collection.create_index("expiresAt", expireAfterSeconds=0)
print("TTL index on 'expiresAt' ensured.")

# --- Helper function to convert MongoDB docs to JSON ---
# MongoDB documents have a special ObjectId that needs to be converted to a string
def serialize_doc(doc):
    doc['_id'] = str(doc['_id'])
    return doc

# --- Token Verification Decorator ---
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check for token in the 'x-access-token' header
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            # Decode the token using the secret key
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = users_collection.find_one({'_id': ObjectId(data['user_id'])})
        except Exception as e:
            return jsonify({'message': 'Token is invalid!', 'error': str(e)}), 401
        
        # Pass the current user to the decorated function
        return f(current_user, *args, **kwargs)

    return decorated

# --- API Endpoints ---
@app.route("/api/pins", methods=['GET'])
def get_all_pins():
    """Returns all active (non-expired) food pins."""
    try:
        pins = [serialize_doc(pin) for pin in pins_collection.find()]
        return jsonify(pins), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/pins", methods=['POST'])
@token_required
def create_pin(current_user):
    data = request.get_json()
    coords = data.get('coordinates')

    if not coords:
        return jsonify({"error": "Coordinates are required"}), 400

    lat = coords.get('lat')
    lng = coords.get('lng')

    # Check if the new pin is inside our updated geofence
    is_lat_in_bounds = UF_SW_CORNER[0] < lat < UF_NE_CORNER[0]
    is_lng_in_bounds = UF_SW_CORNER[1] < lng < UF_NE_CORNER[1]

    if not (is_lat_in_bounds and is_lng_in_bounds):
        return jsonify({"error": "Pin is outside the allowed area"}), 400

    # If it's valid, proceed with saving to the database
    try:
        # Set creation and expiration times
        createdAt = datetime.datetime.now(datetime.timezone.utc)
        # Pin will expire in 1 hour (3600 seconds)
        expiresAt = createdAt + datetime.timedelta(hours=1)

        pin = {
            "description": data.get("description"),
            "location_name": data.get("location_name", "N/A"),
            "coordinates": [lat, lng],
            "createdAt": createdAt,
            "expiresAt": expiresAt,
            "user_id": current_user['_id'],
            "username": current_user['username']
        }

        result = pins_collection.insert_one(pin)
        pin['_id'] = str(result.inserted_id) # Convert ObjectId to string for the response

        return jsonify(serialize_doc(pin)), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/pins/<pin_id>", methods=['DELETE'])
@token_required
def delete_pin(current_user, pin_id):
    """Deletes a pin if the user is the owner."""
    try:
        # Find the pin by its ID
        pin = pins_collection.find_one({'_id': ObjectId(pin_id)})

        if not pin:
            return jsonify({"message": "Pin not found"}), 404

        # Check if the current user is an admin or the one who created the pin
        is_admin = current_user.get('role') == 'Admin'
        if pin['user_id'] != current_user['_id'] and not is_admin:
            return jsonify({"message": "You are not authorized to delete this pin"}), 403

        # Delete the pin
        pins_collection.delete_one({'_id': ObjectId(pin_id)})

        return jsonify({"message": "Pin deleted successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/signup', methods=['POST'])
def signup():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"message": "Username and password are required"}), 400

    # Check if user already exists
    if users_collection.find_one({'username': username}):
        return jsonify({"message": "Username already exists"}), 409
    
    # Hash the password for security
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    # Save user to the 'users' collection in MongoDB
    users_collection.insert_one({
        'username': username, 
        'password': hashed_password,
        'role': "User"
    })
    
    return jsonify({"message": "User created successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    # Find user in the database
    user = users_collection.find_one({'username': username})
    
    # Check if user exists and password is correct
    if user and bcrypt.check_password_hash(user['password'], password):
        # Create a JWT token
        token = jwt.encode({
            'user_id': str(user['_id']),
            'exp': datetime.utcnow() + datetime.timedelta(hours=24)
        }, app.config['SECRET_KEY'])
        
        return jsonify({'token': token})
        
    return jsonify({"message": "Invalid credentials"}), 401

# --- Run the Server ---
if __name__ == "__main__":
    # Seed the database with admin users
    seed_admin_user()
    # The host='0.0.0.0' makes it accessible on your local network
    # The port is set to 5001 to avoid conflicts with the frontend's default port
    app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)