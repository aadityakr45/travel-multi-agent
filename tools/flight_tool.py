import os
import re
import requests
import certifi
import airportsdata
import pycountry

from dotenv import load_dotenv
load_dotenv()

#to prevent path issue 
os.environ['REQUESTS_CA_BUNDLE'] = certifi.where()
os.environ['SSL_CERT_FILE'] = certifi.where()


API_KEY = os.getenv("AVIATION_API_KEY")

#default origin airport code
DEFAULT_ORIGIN_IATA = os.getenv("DEFAULT_ORIGIN_IATA", "DEL")

BASE_URL = "http://api.aviationstack.com/v1/flights"

AIRPORTS = airportsdata.load('IATA')  # Load IATA airport data

COUNTRY_ALIASES = {
    "USA": "United States",
    "UK": "United Kingdom",
    "DE": "Germany",
    "FR": "France",
    "JP": "Japan",
    "RU": "Russia",
    "BR": "Brazil",
    "ES": "Spain",
    "IT": "Italy",
    "CA": "Canada",
    "AU": "Australia",
    "UA": "Ukraine",
    "AE": "United Arab Emirates",
    "AE":"UAE",
    "NL":"Netherlands",
    "CH":"Switzerland",
    "SE":"Sweden",
    "NO":"Norway",
    "IE":"Ireland",
    "IN":"India",
    "KR":"South Korea",
    "SG":"Singapore",
    "TH":"Thailand",
    "VN":"Vietnam",




}

#Preffered main Airpots for each country to avoid small airports
COUNTRY_MAIN_AIRPORTS = {
    "United States": ["JFK", "LAX", "ORD", "ATL", "DFW", "DEN", "SFO", "SEA", "MIA", "BOS"],
    "United Kingdom": ["LHR", "LGW", "MAN", "STN", "LTN", "EDI", "GLA", "BRS", "BHX", "SEN"],
    "Germany": ["FRA", "MUC", "TXL", "DUS", "HAM", "STR", "CGN", "LEJ", "NUE", "BRE"],
    "France": ["CDG", "ORY", "LYS", "NCE", "TLS", "BOD", "MRS", "NTE", "LIL", "MPL"],
    "Japan": ["NRT", "HND", "KIX", "CTS",   "FUK", "NGO", "ITM", "OKA", "KOJ", "SDJ"],  
    "Russia": ["SVO", "DME", "LED", "VKO", "KZN", "SVX", "ROV", "AER", "OVB", "KRR"],
    "Brazil": ["GRU", "GIG", "BSB", "CNF", "POA", "REC", "SSA", "VCP", "CWB", "FOR"],
    "Spain": ["MAD", "BCN", "AGP", "PMI", "SVQ", "BIO", "VLC", "LEI", "ALC", "LCG"],
    "Italy": ["FCO", "MXP", "VCE", "NAP", "BLQ", "TSF", "CIA", "VRN", "BRI", "TRN"],
    "Canada": ["YYZ", "YVR", "YUL", "YYC", "YEG", "YOW", "YQB", "YHZ", "YWG", "YXE"],
    "Australia": ["SYD", "MEL", "BNE", "PER",   "ADL", "CNS", "OOL", "HBA", "DRW", "MCY"],
    "Ukraine": ["KBP", "ODS", "LWO", "DNK", "HRK", "IEV", "CWC", "UZH", "VIN", "SIP"],
    "United Arab Emirates": ["DXB", "AUH", "SHJ", " DWC", "RKT", "FJR", "AZI", "XSB", "XNB", "XZA"],
    "UAE": ["DXB", "AUH", "SHJ", " DWC", "RKT", "FJR", "AZI", "XSB", "XNB", "XZA"],
    "Netherlands": ["AMS", "EIN", "RTM", "GRQ", "MST", "MST", "MST", "MST", "MST", "MST"],
    "Switzerland": ["ZRH", "GVA", "BSL", "BR    N", "LSZ", "ACH", "SIR", "LUG", "ZOS", "ZIN"],
    "Sweden": ["ARN", "GOT", "MMX", "VXO", "BMA", "KID", "UME", "LYC", "SDL", "VST"],
    "Norway": ["OSL", "BGO", "SVG", "TRD    ", "TOS", "KRS", "FRO", "HAA", "ALF", "LYR"],
    "Ireland": ["DUB", "SNN", "ORK", "WAT", "NOC", "KIR", "CFN", "SXL", "WEX", "NOC"],
    "India": ["DEL", "BOM", "BLR", "MAA", "HYD", "CCU", "COK", "GOI", "PNQ", "IXC", "LKO"],
    "South Korea": ["ICN", "GMP", "PUS", "C     JU", "TAE", "KWJ", "USN", "KUV", "RSU", "WJU"],
    "Singapore": ["SIN", "XSP", "XSP", "XSP", "XSP", "XSP", "XSP", "XSP", "XSP", "XSP"],
    "Thailand": ["BKK", "CNX", "HKT", "DMK", "USM", "KBV", "URT", "CEI", "NAK", "LOE"],
    "Vietnam": ["SGN", "HAN", "DAD", "VCA", "PQC", "VII", "CXR", "VCL", "HPH", "UIH"],
}    


def clean_text(text):
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9\s]', '', text)
    text = re.sub(r'\s+', ' ', text)
    stop_words = [
        "flight", "flights", "airline", "airlines", "airport", "airports", "plane", "planes",
        "ticket", "tickets", "fare", "fares", "travel", "traveling", "trip", "trips", "journey", "journeys", "departure", "departures",
        "hotel", "hotels", "stay", "stays", "accommodation", "accommodations", "booking", "bookings", "reservation", "reservations",
    ]
    words = [w for w in text.split() if w not in stop_words]
    return " ".join(words).strip()


def country_name_to_code(text:str):
    text=clean_text(text)

    if text in COUNTRY_ALIASES:
        return COUNTRY_ALIASES[text]
    try:
        country = pycountry.countries.lookup(text)
        return country.alpha_2
    except LookupError:
        pass

    #Detect country name inside longer text
    for country in pycountry.countries:
        country_name = country.name.lower()
        if country_name in text:
            return country.alpha_2
    for alias, code in COUNTRY_ALIASES.items():
        if alias.lower() in text:
            return code
        return None


def airport_country_matches(airport:str, country_code:str)->bool:
    airport_country =str(airport.get("country", "")).upper().strip()

    if airport_country == country_code:
        return True

    try:
        country = pycountry.countries.get(alpha_2=country_code)
        if country and airport_country.lower() == country.name.lower():
            return True
    except Exception:
        pass
    return False


def get_best_airport_for_country(country_code:str):
    preffered=COUNTRY_MAIN_AIRPORTS.get(country_code)

    if preffered and preffered in AIRPORTS:
        return preffered

    candidates = []
    for iata, airport in AIRPORTS.items():
        if airport_country_matches(airport, country_code):
            name=str(airport.get("name", "")).lower()
            city=str(airport.get("city", "")).lower()
            score = 0

            if "international" in name:
                score += 50
            if "intl" in name:
                score += 40
            if "capital" in name:
                score += 20
            if city:
                score += 5
            candidates.append((score, iata))

    if not candidates:
        return None
    candidates.sort(reverse=True)
    return candidates[0][1]