import os
from flask import Flask, jsonify, send_from_directory
from api.checker import check_apple_availability
from datetime import datetime

# Initialize Flask app to serve built frontend or API endpoints
app = Flask(__name__, static_folder='dist', static_url_path='')

@app.route('/api/cron', methods=['GET', 'POST'])
def trigger_cron():
    """
    Endpoint for cron-job.org or automated pingers to trigger stock check.
    """
    try:
        msg = check_apple_availability()
        if msg is None:
            return jsonify({
                "status": "error",
                "message": "Apple API check executed. Note: Enable MOCK_MODE=true for testing if Akamai 541 occurs.",
                "timestamp": datetime.now().isoformat()
            }), 200
        
        return jsonify({
            "status": "success",
            "message": "Apple availability check executed, alerts dispatched.",
            "msg": msg,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    elif os.path.exists(os.path.join(app.static_folder, 'index.html')):
        return send_from_directory(app.static_folder, 'index.html')
    else:
        return jsonify({
            "name": "Apple Store Pickup Tracker SaaS (India)",
            "status": "running",
            "cron_endpoint": "/api/cron",
            "timestamp": datetime.now().isoformat()
        })

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port)
