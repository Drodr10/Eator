import os
import datetime
from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from dotenv import load_dotenv
from bson import ObjectId # Used to handle MongoDB's default _id format

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
# Enable CORS to allow your frontend to communicate with this server
CORS(app)

# --- Database Connection ---
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client.eator # Use a database named 'eator'
pins_collection = db.pins # Use a collection named 'pins'

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
def create_pin():
    """Creates a new food pin."""
    try:
        data = request.get_json()

        # Basic validation
        if not data or 'description' not in data or 'coordinates' not in data:
            return jsonify({"error": "Missing required fields"}), 400

        # Set creation and expiration times
        createdAt = datetime.datetime.now(datetime.timezone.utc)
        # Pin will expire in 1 hour (3600 seconds)
        expiresAt = createdAt + datetime.timedelta(hours=1)

        pin = {
            "description": data.get("description"),
            "location_name": data.get("location_name", "N/A"),
            "coordinates": data.get("coordinates"), # Should be [latitude, longitude]
            "createdAt": createdAt,
            "expiresAt": expiresAt
        }

        result = pins_collection.insert_one(pin)
        pin['_id'] = str(result.inserted_id) # Convert ObjectId to string for the response

        return jsonify(pin), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# --- Run the Server ---
if __name__ == "__main__":
    # The host='0.0.0.0' makes it accessible on your local network
    # The port is set to 5001 to avoid conflicts with the frontend's default port
    app.run(host='0.0.0.0', port=5001, debug=True)