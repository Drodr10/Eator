import os
import datetime
from flask import Flask, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from dotenv import load_dotenv
from bson import ObjectId # Used to handle MongoDB's default _id format

UF_SW_CORNER = (29.62725, -82.37236)
UF_NE_CORNER = (29.660000, -82.300000)

# Load environment variables from .env file
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
# Enable CORS to allow your frontend to communicate with this server
CORS(app, resources={r"/api/*": {"origins": "*"}})

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
    # ...

    return jsonify({"status": "success"}), 201

# --- Run the Server ---
if __name__ == "__main__":
    # The host='0.0.0.0' makes it accessible on your local network
    # The port is set to 5001 to avoid conflicts with the frontend's default port
    app.run(host='0.0.0.0', port=5001, debug=True, use_reloader=False)