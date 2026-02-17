import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from supabase import create_client, Client

app = Flask(__name__)
CORS(app)  # Essential for enabling React frontend to communicate with Flask backend

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

@app.route('/visitors', methods=['GET'])
def get_visitors():
    response = supabase.table("visitors").select("*").order("created_at", desc=True).execute()
    return jsonify(response.data)

@app.route('/visitors', methods=['POST'])
def add_visitor():
    data = request.json
    response = supabase.table("visitors").insert(data).execute()
    return jsonify(response.data), 201

@app.route('/visitors/<id>', methods=['PUT'])
def update_visitor(id):
    data = request.json
    response = supabase.table("visitors").update(data).eq("id", id).execute()
    return jsonify(response.data)

@app.route('/visitors/<id>', methods=['DELETE'])
def delete_visitor(id):
    supabase.table("visitors").delete().eq("id", id).execute()
    return jsonify({"message": "Entry deleted successfully"}), 200

if __name__ == '__main__':
    # Retrieves PORT from environment variable, defaults to 5000 for local development
    port = int(os.environ.get("PORT", 5000))
    # Binding to 0.0.0.0 ensures the app is accessible from external connections
    app.run(host='0.0.0.0', port=port)
