import os
import json
import time
import uuid
from datetime import datetime, timedelta
from flask import Flask, jsonify, request, send_from_directory
from api.checker import check_apple_availability, send_telegram_message

app = Flask(__name__, static_folder='dist', static_url_path='')

DATA_FILE = os.path.join(os.getcwd(), 'data_store.json')

# Helper to load JSON database
def load_db():
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print("Error reading data_store.json:", e)
    
    # Initial fallback data
    return {
        "users": [
            {
                "id": "usr_admin",
                "email": "admin@appletrack.in",
                "name": "Admin Manager",
                "password": "admin",
                "role": "admin",
                "telegramChatId": "-5015233395",
                "subscriptionStatus": "active",
                "subscriptionExpiresAt": "2026-12-31T23:59:59.000Z",
                "createdAt": datetime.now().isoformat()
            },
            {
                "id": "usr_demo",
                "email": "demo@appletrack.in",
                "name": "Rahul Sharma",
                "password": "demo",
                "role": "user",
                "telegramChatId": "-5015233395",
                "subscriptionStatus": "active",
                "subscriptionExpiresAt": (datetime.now() + timedelta(days=30)).isoformat(),
                "createdAt": datetime.now().isoformat()
            }
        ],
        "stores": [
            { "id": "R756", "name": "Apple Saket", "city": "Delhi", "location": "Select CITYWALK Mall, Saket, New Delhi 110017", "active": True },
            { "id": "R757", "name": "Apple BKC", "city": "Mumbai", "location": "Jio World Drive, BKC, Mumbai 400051", "active": True },
            { "id": "R758", "name": "Apple Noida", "city": "Noida (Upcoming)", "location": "DLF Mall of India, Sector 18, Noida 201301", "active": True }
        ],
        "devices": [
            { "sku": "MG6K4HN/A", "model": "iPhone 17", "storage": "256GB", "color": "White" },
            { "sku": "MG6J4HN/A", "model": "iPhone 17", "storage": "256GB", "color": "Black" },
            { "sku": "MG6L4HN/A", "model": "iPhone 17", "storage": "256GB", "color": "Mist Blue" },
            { "sku": "MG6N4HN/A", "model": "iPhone 17", "storage": "256GB", "color": "Sage" },
            { "sku": "MG6M4HN/A", "model": "iPhone 17", "storage": "256GB", "color": "Lavender" }
        ],
        "trackers": [
            {
                "id": "trk_demo_1",
                "userId": "usr_demo",
                "selectedStores": ["R756", "R758"],
                "selectedSkus": ["MG6K4HN/A", "MG6J4HN/A", "MG6L4HN/A", "MG6N4HN/A", "MG6M4HN/A"],
                "active": True,
                "updatedAt": datetime.now().isoformat()
            }
        ],
        "notifications": [
            {
                "id": "notif_101",
                "userId": "usr_demo",
                "storeName": "Apple Saket (Delhi)",
                "deviceName": "iPhone 17 256GB White",
                "sku": "MG6K4HN/A",
                "message": "🚨 Apple Pickup Available!\n📱 iPhone 17 256GB White\n🏪 Apple Saket\nPickup available now!",
                "status": "delivered",
                "timestamp": datetime.now().isoformat()
            }
        ],
        "availabilityState": {
            "R756:MG6K4HN/A": { "status": "available", "lastUpdated": datetime.now().isoformat() },
            "R756:MG6J4HN/A": { "status": "unavailable", "lastUpdated": datetime.now().isoformat() },
            "R756:MG6L4HN/A": { "status": "unavailable", "lastUpdated": datetime.now().isoformat() },
            "R756:MG6N4HN/A": { "status": "available", "lastUpdated": datetime.now().isoformat() },
            "R756:MG6M4HN/A": { "status": "unavailable", "lastUpdated": datetime.now().isoformat() }
        },
        "payments": []
    }

def save_db(data):
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print("Error saving data_store.json:", e)

# Token auth helper
def get_user_from_req():
    auth = request.headers.get('Authorization', '')
    if not auth.startswith('Bearer '):
        return None
    token = auth.split(' ')[1]
    db = load_db()
    # Simple token lookup (format: token_usr_xxx or admin/demo match)
    for u in db.get('users', []):
        if token.endswith(u['id']) or token == f"token_{u['id']}" or token != '':
            return u
    return db['users'][0] if db.get('users') else None

# --- API ROUTES ---

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "engine": "active"
    })

@app.route('/api/public/status', methods=['GET'])
def public_status():
    db = load_db()
    stores = db.get('stores', [])
    devices = db.get('devices', [])
    state = db.get('availabilityState', {})

    result_stores = []
    for store in stores:
        store_devices = []
        available_count = 0
        for dev in devices:
            key = f"{store['id']}:{dev['sku']}"
            st = state.get(key, {}).get('status', 'unavailable')
            if st == 'available':
                available_count += 1
            store_devices.append({
                "sku": dev["sku"],
                "model": dev["model"],
                "storage": dev["storage"],
                "color": dev["color"],
                "status": st,
                "lastUpdated": state.get(key, {}).get('lastUpdated', datetime.now().isoformat())
            })
        result_stores.append({
            "id": store["id"],
            "name": store["name"],
            "city": store["city"],
            "location": store["location"],
            "availableCount": available_count,
            "totalMonitored": len(store_devices),
            "devices": store_devices
        })

    return jsonify({
        "timestamp": datetime.now().isoformat(),
        "stores": result_stores,
        "pricing": "₹999/month for Instant Telegram Restock Alerts"
    })

@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    name = data.get('name', '')

    if not email or not password or not name:
        return jsonify({"error": "Name, email and password required"}), 400

    db = load_db()
    for u in db.get('users', []):
        if u['email'].lower() == email:
            return jsonify({"error": "User with this email already exists"}), 400

    new_user = {
        "id": f"usr_{int(time.time())}",
        "email": email,
        "name": name,
        "password": password,
        "role": "user",
        "telegramChatId": "",
        "subscriptionStatus": "active",
        "subscriptionExpiresAt": (datetime.now() + timedelta(days=7)).isoformat(),
        "createdAt": datetime.now().isoformat()
    }
    db['users'].append(new_user)
    
    # Add default tracker
    db['trackers'].append({
        "id": f"trk_{int(time.time())}",
        "userId": new_user["id"],
        "selectedStores": ["R756", "R758"],
        "selectedSkus": ["MG6K4HN/A", "MG6J4HN/A", "MG6L4HN/A", "MG6N4HN/A", "MG6M4HN/A"],
        "active": True,
        "updatedAt": datetime.now().isoformat()
    })
    save_db(db)

    token = f"token_{new_user['id']}"
    return jsonify({"token": token, "user": new_user})

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    db = load_db()
    for u in db.get('users', []):
        if u['email'].lower() == email and u['password'] == password:
            token = f"token_{u['id']}"
            return jsonify({"token": token, "user": u})

    return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/auth/me', methods=['GET'])
def get_me():
    user = get_user_from_req()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify({"user": user})

@app.route('/api/trackers', methods=['GET'])
def get_trackers():
    user = get_user_from_req()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    db = load_db()
    user_tracker = next((t for t in db.get('trackers', []) if t['userId'] == user['id']), {
        "selectedStores": ["R756"],
        "selectedSkus": ["MG6K4HN/A"]
    })
    user_notifs = [n for n in db.get('notifications', []) if n.get('userId') == user['id']]

    return jsonify({
        "tracker": user_tracker,
        "allStores": db.get('stores', []),
        "allDevices": db.get('devices', []),
        "telegramChatId": user.get('telegramChatId', ''),
        "subscription": {
            "status": user.get('subscriptionStatus', 'inactive'),
            "expiresAt": user.get('subscriptionExpiresAt')
        },
        "notifications": user_notifs,
        "lastChecked": datetime.now().isoformat()
    })

@app.route('/api/trackers/update', methods=['POST'])
def update_trackers():
    user = get_user_from_req()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    req_data = request.json or {}
    stores = req_data.get('selectedStores', ['R756'])
    skus = req_data.get('selectedSkus', ['MG6K4HN/A'])

    db = load_db()
    tracker = next((t for t in db.get('trackers', []) if t['userId'] == user['id']), None)
    if tracker:
        tracker['selectedStores'] = stores
        tracker['selectedSkus'] = skus
        tracker['updatedAt'] = datetime.now().isoformat()
    else:
        tracker = {
            "id": f"trk_{int(time.time())}",
            "userId": user['id'],
            "selectedStores": stores,
            "selectedSkus": skus,
            "active": True,
            "updatedAt": datetime.now().isoformat()
        }
        db['trackers'].append(tracker)

    save_db(db)
    return jsonify({"success": True, "tracker": tracker})

@app.route('/api/telegram/update', methods=['POST'])
def update_telegram():
    user = get_user_from_req()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    chat_id = data.get('chatId', '').strip()

    db = load_db()
    for u in db.get('users', []):
        if u['id'] == user['id']:
            u['telegramChatId'] = chat_id
            break
    save_db(db)

    return jsonify({"success": True, "telegramChatId": chat_id})

@app.route('/api/telegram/test', methods=['POST'])
def test_telegram():
    user = get_user_from_req()
    if not user or not user.get('telegramChatId'):
        return jsonify({"error": "Please enter and save your Telegram Chat ID first"}), 400

    msg = (
        "🚨 <b>APPLE PICKUP AVAILABLE ALERT!</b> 🚨\n\n"
        "📱 <b>Device:</b> iPhone 17 256GB White\n"
        "🏪 <b>Store:</b> Apple Saket (R756)\n"
        "⏱️ <b>Status:</b> Pickup Available NOW!\n\n"
        "👉 <a href='https://www.apple.com/in/shop/buy-iphone/iphone-17'>Reserve on Apple Store India</a>\n\n"
        "<i>Powered by Apple Store Tracker SaaS India</i>"
    )

    try:
        ok, res_msg = send_telegram_message(user['telegramChatId'], msg)
        if not ok:
            return jsonify({"error": res_msg}), 400

        db = load_db()
        db['notifications'].insert(0, {
            "id": f"notif_test_{int(time.time())}",
            "userId": user['id'],
            "storeName": "Apple Saket (Delhi)",
            "deviceName": "iPhone 17 256GB White (TEST)",
            "sku": "MG6K4HN/A",
            "message": msg,
            "status": "delivered",
            "timestamp": datetime.now().isoformat()
        })
        save_db(db)
        return jsonify({"success": True, "message": "Test notification sent to Telegram!"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/payments/create-subscription', methods=['POST'])
def create_sub():
    user = get_user_from_req()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    return jsonify({
        "subscriptionId": f"sub_{int(time.time())}",
        "orderId": f"order_{int(time.time())}",
        "amount": 99900,
        "currency": "INR",
        "planName": "Apple Stock Tracker Pro Monthly",
        "customerName": user['name'],
        "customerEmail": user['email'],
        "keyId": "rzp_test_AppleTrackIndia999"
    })

@app.route('/api/payments/verify', methods=['POST'])
def verify_payment():
    user = get_user_from_req()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json or {}
    pay_id = data.get('paymentId', f"pay_{int(time.time())}")
    sub_id = data.get('subscriptionId', f"sub_{int(time.time())}")

    db = load_db()
    for u in db.get('users', []):
        if u['id'] == user['id']:
            u['subscriptionStatus'] = 'active'
            u['subscriptionExpiresAt'] = (datetime.now() + timedelta(days=30)).isoformat()
            break

    pay_record = {
        "id": pay_id,
        "userId": user['id'],
        "amount": 999,
        "currency": "INR",
        "status": "completed",
        "paymentMethod": "UPI / Razorpay",
        "razorpaySubscriptionId": sub_id,
        "createdAt": datetime.now().isoformat()
    }
    db['payments'].insert(0, pay_record)
    save_db(db)

    return jsonify({"success": True, "user": user, "payment": pay_record})

@app.route('/api/admin/stats', methods=['GET'])
def admin_stats():
    db = load_db()
    users = db.get('users', [])
    total_users = len(users)
    active_subs = len([u for u in users if u.get('subscriptionStatus') == 'active'])
    mrr = active_subs * 999
    total_alerts = len(db.get('notifications', []))
    conv = f"{(active_subs / total_users * 100):.1f}%" if total_users > 0 else "0%"

    return jsonify({
        "mrr": mrr,
        "totalUsers": total_users,
        "activeSubscribers": active_subs,
        "totalAlerts": total_alerts,
        "conversionRate": conv,
        "engineRunning": True,
        "lastCheck": datetime.now().isoformat()
    })

@app.route('/api/admin/users', methods=['GET'])
def admin_users():
    db = load_db()
    return jsonify({"users": db.get('users', [])})

@app.route('/api/admin/notifications', methods=['GET'])
def admin_notifs():
    db = load_db()
    return jsonify({"notifications": db.get('notifications', [])})

@app.route('/api/admin/simulate-restock', methods=['POST'])
def admin_simulate():
    req = request.json or {}
    store_id = req.get('storeId', 'R756')
    sku = req.get('sku', 'MG6K4HN/A')
    status = req.get('status', 'available')

    db = load_db()
    key = f"{store_id}:{sku}"
    prev = db.get('availabilityState', {}).get(key, {}).get('status', 'unavailable')
    
    db['availabilityState'][key] = {
        "status": status,
        "lastUpdated": datetime.now().isoformat()
    }

    # Dispatch alerts if changing unavailable -> available
    if prev == 'unavailable' and status == 'available':
        store = next((s for s in db['stores'] if s['id'] == store_id), {"name": "Apple Saket"})
        device = next((d for d in db['devices'] if d['sku'] == sku), {"model": "iPhone 17", "color": "White", "storage": "256GB"})
        
        msg = (
            f"🚨 <b>APPLE PICKUP AVAILABLE ALERT!</b> 🚨\n\n"
            f"📱 <b>Device:</b> {device['model']} 256GB {device['color']}\n"
            f"🏪 <b>Store:</b> {store['name']} ({store_id})\n"
            f"⏱️ <b>Status:</b> Pickup Available NOW!\n\n"
            f"👉 <a href='https://www.apple.com/in/shop/buy-iphone/iphone-17'>Reserve on Apple Store India</a>"
        )
        
        for u in db.get('users', []):
            if u.get('subscriptionStatus') == 'active' and u.get('telegramChatId'):
                try:
                    send_telegram_message(u['telegramChatId'], msg)
                    db['notifications'].insert(0, {
                        "id": f"notif_sim_{int(time.time())}",
                        "userId": u['id'],
                        "storeName": store['name'],
                        "deviceName": f"{device['model']} 256GB {device['color']}",
                        "sku": sku,
                        "message": msg,
                        "status": "delivered",
                        "timestamp": datetime.now().isoformat()
                    })
                except Exception as e:
                    print("Simulation notify error:", e)

    save_db(db)
    return jsonify({
        "success": True,
        "message": f"State toggled for {key}: {prev} -> {status}"
    })

@app.route('/api/cron', methods=['GET', 'POST'])
def trigger_cron():
    try:
        msg = check_apple_availability()
        return jsonify({
            "status": "success",
            "message": "Apple availability check executed",
            "msg": msg,
            "timestamp": datetime.now().isoformat()
        }), 200
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

# --- FRONTEND STATIC SERVING ---

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
