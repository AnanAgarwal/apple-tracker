import requests
import json
from datetime import datetime, timedelta

# --- CONFIGURATION ---

MOCK_AVAILABILITY_MODE = False  # set True for testing

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

# Latest cookie (update manually when expired)
LATEST_APPLE_COOKIES = "as_sfa=Mnxpbnxpbnx8ZW5fSU58Y29uc3VtZXJ8aW50ZXJuZXR8MHwwfDE; dssf=1; dssid2=bdcd8ff5-15f0-4954-a8b8-3fd92bf8b7db; as_uct=2; rtsid=%7BIN%3D%7Bt%3Da%3Bi%3DR756%3B%7D%3B%7D; as_loc=7580cd6d1f89f852ac6b820dbae9261b8ac41b7b6f7ba3929d5dc962a1a26da66749bd905cf09d98fa70aede24451434b0871e6cbc5c3e7f03e7e16c064a9b7f4510361571754645ff204626ae7afec4130a306e117e55f405389368b8a750cc; as_pcts=QRvQIP8vz4GGkL91Mf4SCvXBeC1osuAiHZqA57XV38vQzb-3SO4NQzc3qyA1E8EhD0uFyx3HBU3NZDmO0HQxVKFhNKmTiVwut-heyGhjkMZHGo; as_dc=ucp6; geo=IN; at_check=true; as_rumid=fe779ff1-467d-49a9-9334-63703ca09a29; shld_bt_m=RzMNVaowGDarmokgj7BsRw|1784665368|Zz2fiAqdjHEucn6cgxbUiA|mjWApRs7pNfvEdlHrH8a1UZxyKo; s_fid=6F702AE27CBBC376-19A87A292E8FAD4C; s_cc=true; s_vi=[CS]v1|352FDC7C9B936575-40000E3A4DA41CEC[CE]; sh_spksy=.; as_tex=~1~|668643:1:1786165140:IND|pcNsmh7MOEXWD/e7H0Ir6UllM2k0gh+LXQwB946faUg; shld_bt_ck=pIQ_YFQkJdWnHYawVUIEIQ|1784665383|Ib27BakBhooUy6eALp25yshaucBjNZtoD-Fj5Cg7_lfjUwSrmdWYCDwh9n6HA3YDkNrVUbF7jCSHjRa_rRjmLbnlg-u89oiotVdpSPkEuCJdaYIK1vf5cuUwd0xYCp_mjUyxG8DQKEsyvZdRGkD2IZ8k_wjTs_2x2eY50p68mH7et6CGGImfVZnPVqmuc-kqpYH7x4Ttz2qfqacYMI13SI3d2VhyQO-2RHSqToC8NC64bIIoMSWbt_KYKDJgFhoeEkKg8TIADe210GLrQGbHewQ3gKJSovOFV-bpkBlRQYgtThYndg3Y4O_0aS-BLERNTAVcsHoeraTh474KdzmUNBD51SU2vJaG2NZluksxY7ko9F6sblu9fTOsdPJ2apte|sB8EP8EYp7cq7GA5w8X2eBs_oD8; as_atb=1.0|MjAyNi0wNy0yMSAxMToyMzoxMA|4531b2e5ded9775cfdec9cf04b1b94187e49aa11; mbox=session#b262744776514a2ca6ca8da1741fc608#1784660049|PC#b262744776514a2ca6ca8da1741fc608.38_0#1784659989"

# Apple API endpoint
APPLE_API_URL = "https://www.apple.com/in/shop/fulfillment-messages"

BASE_HEADERS = {
    "User-Agent": "Mozilla/5.0",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "x-skip-redirect": "true",
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
}


# --- UTILITY FUNCTIONS ---

def send_telegram_message(chat_id, message):
    if "YOUR_REAL_TELEGRAM_BOT_TOKEN" in TELEGRAM_BOT_TOKEN:
        print("❌ Telegram token missing. Skipping Telegram.")
        return

    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {"chat_id": chat_id, "text": message}

    try:
        r = requests.post(url, json=payload, timeout=10)
        if not r.ok:
            print(f"Telegram Error {r.status_code}: {r.text}")
        r.raise_for_status()
    except Exception as e:
        print(f"Telegram send error: {e}")


def build_api_query():
    params = {
        "fae": "true",
        "little": "false",
        "store": STORE_ID,
        "location": "110017",
        "mts.0": "regular",
        "mts.1": "sticky",
        "fts": "true",
    }
    for i, p in enumerate(PRODUCTS):
        params[f"parts.{i}"] = p["sku"]

    return "&".join([f"{k}={v}" for k, v in params.items()])


# --- PLAYWRIGHT BROWSER-BASED REQUEST ---

def run_apple_request(query_string):
    full_url = f"{APPLE_API_URL}?{query_string}"

    try:
        from playwright.sync_api import sync_playwright

        print(f"Fetching Apple API for {len(PRODUCTS)} items via Playwright...")
        print(f"URL: {full_url}")

        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            context = browser.new_context(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
                locale="en-IN",
            )
            page = context.new_page()

            # Navigate to the API URL directly — browser handles TLS/cookies/JS
            response = page.goto(full_url, wait_until="networkidle", timeout=30000)

            status = response.status if response else 0
            print(f"Response Status: {status}")

            if status in [401, 403]:
                alert = "🚨 COOKIE EXPIRED — Update the Cookie immediately!"
                print(alert)
                send_telegram_message(TELEGRAM_PERSONAL_ID, alert)
                browser.close()
                return None

            if status >= 400:
                body_preview = page.content()[:200]
                alert = f"🚨 Apple API returned HTTP {status}."
                print(alert)
                print(f"Response preview: {body_preview}")
                send_telegram_message(TELEGRAM_PERSONAL_ID, alert)
                browser.close()
                return None

            # Get the page body text (should be raw JSON)
            body = page.inner_text("body")
            browser.close()

            print(f"Response length: {len(body)}")
            return body

    except Exception as e:
        print(f"Playwright Request Error: {e}")
        return None


# --- MAIN LOGIC ---

def check_apple_availability():
    print("Starting Apple availability check...")

    query_string = build_api_query()
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
        response = run_apple_request(query_string)
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
