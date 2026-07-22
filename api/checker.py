import os
import requests
import json
from datetime import datetime, timedelta

# --- CONFIGURATION ---

# set True or set MOCK_MODE=true env var for testing/fallback
MOCK_AVAILABILITY_MODE = os.environ.get("MOCK_MODE", "false").lower() == "true"


# Telegram Credentials
TELEGRAM_BOT_TOKEN = "8428862886:AAF0yZfs2z1b8UHkximmvobIbN5uWo67Xk8"
TELEGRAM_CHAT_ID = "-5015233395"        # Group
TELEGRAM_PERSONAL_ID = "-5015233395"    # Alerts

# Store & Products
STORE_ID = "R756"
PRODUCTS = [
    {"name": "iPhone 17 256GB White", "sku": "MG6K4HN/A"},
    {"name": "iPhone 17 256GB Black", "sku": "MG6J4HN/A"},
    {"name": "iPhone 17 256GB Mist Blue", "sku": "MG6L4HN/A"},
    {"name": "iPhone 17 256GB Sage", "sku": "MG6N4HN/A"},
    {"name": "iPhone 17 256GB Lavender", "sku": "MG6M4HN/A"},
]

# Apple API endpoint
APPLE_API_URL = "https://www.apple.com/in/shop/fulfillment-messages"


# --- UTILITY FUNCTIONS ---

def send_telegram_message(chat_id, message):
    if "YOUR_REAL_TELEGRAM_BOT_TOKEN" in TELEGRAM_BOT_TOKEN:
        print("❌ Telegram token missing. Skipping Telegram.")
        return False, "Telegram token missing"

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": message,
        "parse_mode": "HTML",
        "disable_web_page_preview": False
    }

    try:
        r = requests.post(url, json=payload, timeout=10)
        data = r.json() if r.content else {}
        if not r.ok or not data.get("ok"):
            err_desc = data.get("description", r.text)
            print(f"Telegram Error {r.status_code}: {err_desc}")
            if "kicked" in err_desc.lower():
                return False, f"Bot was kicked from group chat ({chat_id}). Please re-add @applepicckkbot to the group as admin."
            if "blocked" in err_desc.lower() or "chat not found" in err_desc.lower():
                return False, "Please start the bot first! Open Telegram, search @applepicckkbot and click Start, then try again."
            return False, f"Telegram API error: {err_desc}"
        return True, "Message sent successfully"
    except Exception as e:
        print(f"Telegram send error: {e}")
        return False, str(e)


# --- TLS CLIENT REQUEST (bypasses Apple WAF) ---

def run_apple_request():
    try:
        import tls_client

        session = tls_client.Session(
            client_identifier="chrome_120",
            random_tls_extension_order=True
        )

        params = {
            "parts.0": PRODUCTS[0]["sku"],
            "parts.1": PRODUCTS[1]["sku"],
            "parts.2": PRODUCTS[2]["sku"],
            "parts.3": PRODUCTS[3]["sku"],
            "parts.4": PRODUCTS[4]["sku"],
            "store": STORE_ID,
            "location": "110017",
            "purchaseOption": "fullPrice",
            "mts.0": "regular",
            "mts.1": "sticky",
        }

        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "en-IN,en;q=0.9",
            "Referer": "https://www.apple.com/in/shop/buy-iphone/iphone-17/",
            "Sec-Fetch-Dest": "empty",
            "Sec-Fetch-Mode": "cors",
            "Sec-Fetch-Site": "same-origin",
        }

        print(f"Fetching Apple API for {len(PRODUCTS)} items via tls_client...")
        print(f"URL: {APPLE_API_URL}")

        response = session.get(APPLE_API_URL, params=params, headers=headers)

        print(f"Response Status: {response.status_code}")

        if response.status_code in [401, 403]:
            alert = "🚨 COOKIE EXPIRED or ACCESS DENIED!"
            print(alert)
            send_telegram_message(TELEGRAM_PERSONAL_ID, alert)
            return None

        if response.status_code >= 400:
            alert = f"🚨 Apple API returned HTTP {response.status_code}."
            print(alert)
            print(f"Response preview: {response.text[:300]}")
            send_telegram_message(TELEGRAM_PERSONAL_ID, alert)
            return None

        print(f"Response length: {len(response.text)}")
        return response.text

    except Exception as e:
        print(f"Request Error: {e}")
        return None


# --- MAIN LOGIC ---

def check_apple_availability():
    print("Starting Apple availability check...")

    data = {}

    if MOCK_AVAILABILITY_MODE:
        data = {
            "body": {
                "content": {
                    "pickupMessage": {
                        "stores": [
                            {
                                "storeNumber": STORE_ID,
                                "partsAvailability": {
                                    "MG6K4HN/A": {"pickupDisplay": "available", "pickupSearchQuote": "Today"},
                                    "MG6J4HN/A": {"pickupDisplay": "ships-to-store", "pickupSearchQuote": "Tomorrow"},
                                },
                            }
                        ]
                    }
                }
            }
        }
    else:
        response = run_apple_request()
        if response is None:
            return None

        try:
            data = json.loads(response)
        except Exception as e:
            print(f"Invalid JSON from Apple: {e}")
            print(f"Response preview: {response[:300]}")
            return None

    # Parse store
    store_list = (
        data.get("body", {})
        .get("content", {})
        .get("pickupMessage", {})
        .get("stores", [])
    )

    store = next((s for s in store_list if s.get("storeNumber") == STORE_ID), None)

    if not store:
        msg = f"Store {STORE_ID} not found in response."
        print(msg)
        send_telegram_message(TELEGRAM_CHAT_ID, msg)
        return msg

    availability_list = []
    available_products = []

    for p in PRODUCTS:
        sku = p["sku"]
        name = p["name"]

        info = store.get("partsAvailability", {}).get(sku)

        if not info:
            availability_list.append(f"❓ {name} - No Data")
            continue

        pickup_display = info.get("pickupDisplay", "")
        pickup_quote = info.get("pickupSearchQuote", "")

        is_today = pickup_display == "available"
        is_tomorrow = "tomorrow" in pickup_quote.lower()
        is_available = is_today or is_tomorrow

        symbol = "✅" if is_available else "❌"

        if is_today:
            detail = " - Available Today"
        elif is_tomorrow:
            detail = " - Available Tomorrow"
        else:
            detail = f" - {pickup_quote}"

        if is_available:
            available_products.append(name)

        availability_list.append(f"{symbol} {name}{detail}")

    # Build final message
    count = len(available_products)

    if count > 0:
        header = "🎉 PICKUP AVAILABLE ALERT 🎉\n\n"
        summary = f"{count} iPhone(s) available!\n\n"
    else:
        header = "📅 Apple Availability Status 📅\n\n"
        summary = "No immediate pickup found.\n\n"

    final_message = (
        header
        + summary
        + f"Saket, New Delhi ({STORE_ID})\n"
        + "--------------------------\n"
        + "\n".join(availability_list)
    )

    # Print always (logs)
    print("\n----- FINAL MESSAGE -----")
    print(final_message)
    print("-------------------------\n")

    # Telegram only when available
    if count > 0:
        send_telegram_message(TELEGRAM_CHAT_ID, final_message)

    return final_message   # <-- ALWAYS returned


# Run
if __name__ == "__main__":
    msg = check_apple_availability()
    print("Returned Message:", msg)
