/**
 * Generates src/config/businessRegistry.data.ts from structured rows.
 * Run: node scripts/build-business-registry.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(__dirname, '..', 'src', 'config', 'businessRegistry.data.ts');

/** @type {{ id: string; label: string; labelHi: string; icon: string; template: string; groupId: string }[]} */
const rows = [];

function add(groupId, id, label, labelHi, icon, template) {
  rows.push({ groupId, id, label, labelHi, icon, template });
}

// ── 18 groups — Food (15) ──
const G_FOOD = 'food';
add(G_FOOD, 'restaurant_dhaba', 'Restaurant / Dhaba', 'रेस्टोरेंट / ढाबा', '🍛', 'restaurant');
add(G_FOOD, 'cafe_coffee', 'Café / Coffee Shop', 'कैफे / कॉफी शॉप', '☕', 'cafe');
add(G_FOOD, 'cloud_kitchen', 'Cloud Kitchen', 'क्लाउड किचन', '☁️', 'restaurant');
add(G_FOOD, 'bakery_sweet', 'Bakery & Sweet Shop', 'बेकरी और मिठाई', '🥐', 'cafe');
add(G_FOOD, 'juice_smoothie', 'Juice Bar / Smoothie Bar', 'जूस / स्मूदी बार', '🥤', 'cafe');
add(G_FOOD, 'tiffin_service', 'Tiffin Service', 'टिफिन सेवा', '🍱', 'restaurant');
add(G_FOOD, 'catering', 'Catering Service', 'कैटरिंग सेवा', '🍲', 'restaurant');
add(G_FOOD, 'ice_cream', 'Ice Cream Parlour', 'आइसक्रीम पार्लर', '🍦', 'cafe');
add(G_FOOD, 'street_food', 'Street Food Stall', 'स्ट्रीट फूड स्टॉल', '🌮', 'restaurant');
add(G_FOOD, 'pizza_burger', 'Pizza / Burger Shop', 'पिज़्ज़ा / बर्गर शॉप', '🍕', 'restaurant');
add(G_FOOD, 'biryani_house', 'Biryani House', 'बिरयानी हाउस', '🍚', 'restaurant');
add(G_FOOD, 'mess_canteen', 'Mess / Canteen', 'मेस / कैंटीन', '🍽️', 'restaurant');
add(G_FOOD, 'fruit_veg_shop', 'Fruit & Vegetable Shop', 'फल और सब्जी की दुकान', '🥬', 'other');
add(G_FOOD, 'dry_fruits', 'Dry Fruits Shop', 'मेवों की दुकान', '🥜', 'other');
add(G_FOOD, 'spice_shop', 'Spice Shop', 'मसालों की दुकान', '🌶️', 'other');

// Healthcare (18)
const G_HEALTH = 'healthcare';
add(G_HEALTH, 'medical_clinic_opd', 'Medical Clinic / OPD', 'मेडिकल क्लिनिक / ओपीडी', '🩺', 'clinic');
add(G_HEALTH, 'hospital', 'Hospital', 'अस्पताल', '🏥', 'hospital');
add(G_HEALTH, 'dental_clinic', 'Dental Clinic', 'दंत चिकित्सालय', '🦷', 'clinic');
add(G_HEALTH, 'eye_optician', 'Eye Clinic / Optician', 'आँख / चश्मा क्लिनिक', '👓', 'clinic');
add(G_HEALTH, 'pathology_lab', 'Pathology / Diagnostic Lab', 'पैथोलॉजी लैब', '🧪', 'hospital');
add(G_HEALTH, 'pharmacy', 'Pharmacy / Medical Store', 'फार्मेसी / मेडिकल स्टोर', '💊', 'clinic');
add(G_HEALTH, 'physio', 'Physiotherapy Clinic', 'फिजियोथेरेपी', '🦵', 'clinic');
add(G_HEALTH, 'ayurveda_naturo', 'Ayurveda / Naturopathy Center', 'आयुर्वेद / प्राकृतिक चिकित्सा', '🌿', 'clinic');
add(G_HEALTH, 'nursing_home', 'Nursing Home', 'नर्सिंग होम', '🛏️', 'hospital');
add(G_HEALTH, 'blood_bank', 'Blood Bank', 'ब्लड बैंक', '🩸', 'hospital');
add(G_HEALTH, 'ortho_clinic', 'Orthopedic Clinic', 'हड्डी रोग क्लिनिक', '🦴', 'clinic');
add(G_HEALTH, 'derma_clinic', 'Dermatology Clinic', 'त्वचा रोग क्लिनिक', '✨', 'clinic');
add(G_HEALTH, 'pediatric_clinic', 'Pediatric Clinic', 'बाल रोग क्लिनिक', '👶', 'clinic');
add(G_HEALTH, 'gynae_clinic', 'Gynecology Clinic', 'स्त्री रोग क्लिनिक', '🌸', 'clinic');
add(G_HEALTH, 'psychiatry_therapy', 'Psychiatry / Therapy Clinic', 'मनोरोग / थेरेपी', '🧠', 'clinic');
add(G_HEALTH, 'homeopathy', 'Homeopathy Clinic', 'होम्योपैथी क्लिनिक', '⚗️', 'clinic');
add(G_HEALTH, 'ent_clinic', 'ENT Clinic', 'ईएनटी क्लिनिक', '👂', 'clinic');
add(G_HEALTH, 'dietitian', 'Dietitian / Nutritionist', 'डाइटिशियन / पोषण विशेषज्ञ', '🥗', 'clinic');

// Beauty & Wellness (12) — main taxonomy
const G_BEAUTY = 'beauty';
add(G_BEAUTY, 'mens_salon_barber', "Men's Salon / Barber Shop", 'पुरुष सैलून / नाई', '💈', 'men_salon');
add(G_BEAUTY, 'ladies_parlour', 'Ladies Beauty Parlour', 'लेडीज़ ब्यूटी पार्लर', '💅', 'beauty_parlour');
add(G_BEAUTY, 'unisex_salon', 'Unisex Salon', 'यूनिसेक्स सैलून', '✂️', 'unisex_salon');
add(G_BEAUTY, 'spa_wellness', 'Spa & Wellness Center', 'स्पा और वेलनेस', '🧖', 'spa');
add(G_BEAUTY, 'nail_studio', 'Nail Studio', 'नेल स्टूडियो', '💅', 'beauty_parlour');
add(G_BEAUTY, 'mehndi_artist', 'Mehndi Artist', 'मेहंदी कलाकार', '🎨', 'beauty_parlour');
add(G_BEAUTY, 'tattoo_studio', 'Tattoo Studio', 'टैटू स्टूडियो', '🖋️', 'beauty_parlour');
add(G_BEAUTY, 'massage_center', 'Massage Therapy Center', 'मसाज थेरेपी', '💆', 'spa');
add(G_BEAUTY, 'acupuncture', 'Acupuncture Clinic', 'एक्यूपंक्चर', '📍', 'clinic');
add(G_BEAUTY, 'makeup_artist', 'Makeup Artist', 'मेकअप आर्टिस्ट', '💄', 'beauty_parlour');
add(G_BEAUTY, 'bridal_studio', 'Bridal Studio', 'ब्राइडल स्टूडियो', '👰', 'beauty_parlour');
add(G_BEAUTY, 'threading_waxing', 'Threading / Waxing Center', 'थ्रेडिंग / वैक्सिंग', '🧵', 'beauty_parlour');

// Education (14)
const G_EDU = 'education';
add(G_EDU, 'coaching_tuition', 'Coaching / Tuition Center', 'कोचिंग / ट्यूशन', '📚', 'coaching');
add(G_EDU, 'school_academy', 'School / Academy', 'स्कूल / अकादमी', '🏫', 'coaching');
add(G_EDU, 'dance_academy', 'Dance Academy', 'डांस अकादमी', '💃', 'coaching');
add(G_EDU, 'music_school', 'Music School', 'संगीत विद्यालय', '🎵', 'coaching');
add(G_EDU, 'yoga_studio_edu', 'Yoga Studio', 'योग स्टूडियो', '🧘', 'gym');
add(G_EDU, 'coding_bootcamp', 'Coding Bootcamp / IT Institute', 'कोडिंग / आईटी संस्थान', '💻', 'coaching');
add(G_EDU, 'art_classes', 'Art & Drawing Classes', 'कला कक्षाएं', '🖌️', 'coaching');
add(G_EDU, 'driving_school', 'Driving School', 'ड्राइविंग स्कूल', '🚗', 'coaching');
add(G_EDU, 'cooking_class', 'Cooking Class', 'कुकिंग क्लास', '👨‍🍳', 'coaching');
add(G_EDU, 'spoken_english', 'Spoken English / Language', 'स्पोकन इंग्लिश', '🗣️', 'coaching');
add(G_EDU, 'nursery_play', 'Nursery / Play School', 'नर्सरी / प्ले स्कूल', '🧸', 'coaching');
add(G_EDU, 'home_tutor', 'Home Tutor', 'होम ट्यूटर', '🏠', 'coaching');
add(G_EDU, 'library', 'Library / Reading Room', 'पुस्तकालय', '📖', 'coaching');
add(G_EDU, 'sports_coaching', 'Sports Coaching Academy', 'खेल कोचिंग', '⚽', 'gym');

// Fitness (8)
const G_FIT = 'fitness';
add(G_FIT, 'gym_fitness', 'Gym / Fitness Center', 'जिम / फिटनेस', '💪', 'gym');
add(G_FIT, 'cricket_academy', 'Cricket Academy', 'क्रिकेट अकादमी', '🏏', 'gym');
add(G_FIT, 'sports_turf', 'Football / Sports Turf', 'फुटबॉल / टर्फ', '⚽', 'gym');
add(G_FIT, 'swimming_pool', 'Swimming Pool', 'स्विमिंग पूल', '🏊', 'gym');
add(G_FIT, 'martial_arts', 'Martial Arts / Karate', 'मार्शल आर्ट्स', '🥋', 'gym');
add(G_FIT, 'crossfit', 'CrossFit / Functional Fitness', 'क्रॉसफिट', '🏋️', 'gym');
add(G_FIT, 'gymnastics', 'Gymnastics Center', 'जिमनास्टिक', '🤸', 'gym');
add(G_FIT, 'badminton_tennis', 'Badminton / Tennis Court', 'बैडमिंटन / टेनिस', '🎾', 'gym');

// Retail (22)
const G_RETAIL = 'retail';
add(G_RETAIL, 'grocery_kirana', 'Grocery / Kirana Store', 'किराना स्टोर', '🛒', 'other');
add(G_RETAIL, 'electronics_shop', 'Electronics Shop', 'इलेक्ट्रॉनिक्स', '📺', 'repair_shop');
add(G_RETAIL, 'clothing_garments', 'Clothing / Readymade Garments', 'कपड़े / रेडीमेड', '👔', 'other');
add(G_RETAIL, 'boutique', 'Boutique / Designer Wear', 'बुटीक', '👗', 'other');
add(G_RETAIL, 'jewellery_shop', 'Jewellery Shop', 'ज्वैलरी शॉप', '💎', 'other');
add(G_RETAIL, 'furniture_shop', 'Furniture Shop', 'फर्नीचर', '🛋️', 'other');
add(G_RETAIL, 'mobile_accessories', 'Mobile & Accessories Shop', 'मोबाइल एक्सेसरीज़', '📱', 'repair_shop');
add(G_RETAIL, 'shoe_shop', 'Shoe Shop', 'जूते की दुकान', '👟', 'other');
add(G_RETAIL, 'toy_store', 'Toy Store', 'खिलौने की दुकान', '🧸', 'other');
add(G_RETAIL, 'gift_shop', 'Gift Shop', 'गिफ्ट शॉप', '🎁', 'other');
add(G_RETAIL, 'hardware_store', 'Hardware Store', 'हार्डवेयर', '🔩', 'repair_shop');
add(G_RETAIL, 'stationery_shop', 'Stationery Shop', 'स्टेशनरी', '📝', 'other');
add(G_RETAIL, 'saree_shop', 'Saree Shop', 'साड़ी की दुकान', '🥻', 'other');
add(G_RETAIL, 'optician_retail', 'Optician / Spectacle Shop', 'चश्मे की दुकान', '👓', 'other');
add(G_RETAIL, 'watch_showroom', 'Watch Showroom', 'घड़ी शोरूम', '⌚', 'other');
add(G_RETAIL, 'cosmetics_retail', 'Cosmetics / Beauty Products', 'कॉस्मेटिक्स', '💋', 'other');
add(G_RETAIL, 'baby_care_shop', 'Baby Care Shop', 'बेबी केयर', '🍼', 'other');
add(G_RETAIL, 'musical_instruments', 'Musical Instruments Shop', 'संगीत वाद्य', '🎸', 'other');
add(G_RETAIL, 'sports_shop', 'Sports Shop', 'खेल सामान', '⚽', 'other');
add(G_RETAIL, 'pet_shop', 'Pet Shop', 'पेट शॉप', '🐾', 'pet_care');
add(G_RETAIL, 'florist', 'Florist / Flower Shop', 'फूलों की दुकान', '💐', 'other');
add(G_RETAIL, 'aquarium_shop', 'Aquarium Shop', 'एक्वेरियम', '🐠', 'pet_care');

// Home services (16)
const G_HOME = 'home_services';
add(G_HOME, 'electrician', 'Electrician', 'इलेक्ट्रीशियन', '⚡', 'repair_shop');
add(G_HOME, 'plumber', 'Plumber', 'प्लंबर', '🔧', 'repair_shop');
add(G_HOME, 'carpenter', 'Carpenter', 'बढ़ई', '🪚', 'repair_shop');
add(G_HOME, 'painter', 'Painter / Painting Contractor', 'पेंटर', '🎨', 'repair_shop');
add(G_HOME, 'ac_repair', 'AC Repair & Service', 'एसी रिपेयर', '❄️', 'repair_shop');
add(G_HOME, 'ro_service', 'RO / Water Purifier Service', 'आरओ सेवा', '💧', 'repair_shop');
add(G_HOME, 'pest_control', 'Pest Control', 'कीट नियंत्रण', '🐜', 'repair_shop');
add(G_HOME, 'laundry_home', 'Laundry / Dry Cleaner', 'लॉन्ड्री', '👔', 'laundry');
add(G_HOME, 'home_cleaning', 'Home Cleaning Service', 'घर की सफाई', '🧹', 'laundry');
add(G_HOME, 'sofa_carpet_clean', 'Sofa / Carpet Cleaning', 'सोफा / कालीन क्लीनिंग', '🛋️', 'laundry');
add(G_HOME, 'cctv_install', 'CCTV Installation', 'सीसीटीवी इंस्टॉल', '📹', 'repair_shop');
add(G_HOME, 'solar_install', 'Solar Panel Installation', 'सोलर पैनल', '☀️', 'repair_shop');
add(G_HOME, 'appliance_repair', 'Appliance Repair', 'उपकरण मरम्मत', '🔌', 'repair_shop');
add(G_HOME, 'locksmith', 'Lock & Key / Locksmith', 'ताला चाबी', '🔐', 'repair_shop');
add(G_HOME, 'tile_flooring', 'Tile Work / Flooring', 'टाइल / फ्लोरिंग', '⬛', 'repair_shop');
add(G_HOME, 'waterproofing', 'Waterproofing Contractor', 'वॉटरप्रूफिंग', '💦', 'repair_shop');

// Transport (14)
const G_TRANS = 'transport';
add(G_TRANS, 'cab_taxi', 'Cab / Taxi Service', 'कैब / टैक्सी', '🚕', 'other');
add(G_TRANS, 'auto_rickshaw', 'Auto Rickshaw / Ride-hailing', 'ऑटो / राइड', '🛺', 'other');
add(G_TRANS, 'courier', 'Courier / Delivery Service', 'कूरियर', '📦', 'other');
add(G_TRANS, 'car_garage', 'Car Garage / Workshop', 'कार गैरेज', '🚗', 'repair_shop');
add(G_TRANS, 'bike_workshop', 'Bike / Scooter Workshop', 'बाइक वर्कशॉप', '🏍️', 'repair_shop');
add(G_TRANS, 'car_rental', 'Car Rental', 'कार रेंटल', '🚙', 'other');
add(G_TRANS, 'bike_rental', 'Bike Rental', 'बाइक रेंटल', '🛵', 'other');
add(G_TRANS, 'tyre_shop', 'Tyre Shop', 'टायर शॉप', '⭕', 'repair_shop');
add(G_TRANS, 'car_wash', 'Car Wash', 'कार वाश', '🧼', 'other');
add(G_TRANS, 'driving_school_trans', 'Driving School', 'ड्राइविंग स्कूल', '🚦', 'coaching');
add(G_TRANS, 'packers_movers', 'Packers & Movers', 'पैकर्स एंड मूवर्स', '📦', 'other');
add(G_TRANS, 'petrol_pump', 'Petrol Pump', 'पेट्रोल पंप', '⛽', 'other');
add(G_TRANS, 'truck_tempo', 'Truck / Tempo Transport', 'ट्रक / टेम्पो', '🚚', 'other');
add(G_TRANS, 'school_van', 'School Van Service', 'स्कूल वैन', '🚌', 'other');

// Real estate (14)
const G_RE = 'real_estate';
add(G_RE, 'real_estate_agency', 'Real Estate Agency', 'रियल एस्टेट', '🏢', 'other');
add(G_RE, 'property_dealer', 'Property Dealer / Broker', 'प्रॉपर्टी डीलर', '🔑', 'other');
add(G_RE, 'civil_contractor', 'Civil Contractor', 'सिविल कॉन्ट्रैक्टर', '🏗️', 'other');
add(G_RE, 'interior_designer', 'Interior Designer', 'इंटीरियर डिज़ाइनर', '🛋️', 'other');
add(G_RE, 'architect_firm', 'Architect Firm', 'वास्तुकार', '📐', 'other');
add(G_RE, 'pg_hostel', 'PG / Hostel', 'पीजी / हॉस्टल', '🛏️', 'other');
add(G_RE, 'painting_contractor_re', 'Painting Contractor', 'पेंटिंग कॉन्ट्रैक्टर', '🖌️', 'repair_shop');
add(G_RE, 'tiles_marble', 'Tiles & Marbles Shop', 'टाइल और संगमरमर', '⬜', 'other');
add(G_RE, 'steel_tmt', 'Steel / TMT Dealer', 'स्टील / टीएमटी', '🔩', 'other');
add(G_RE, 'cement_dealer', 'Cement Dealer', 'सीमेंट डीलर', '🏗️', 'other');
add(G_RE, 'plywood_hardware', 'Plywood / Hardware Fittings', 'प्लाईवुड', '🪵', 'other');
add(G_RE, 'sand_gravel', 'Sand & Gravel Supplier', 'रेत और बजरी', '🏜️', 'other');
add(G_RE, 'false_ceiling_acp', 'False Ceiling / ACP Dealer', 'फॉल्स सीलिंग', '⬜', 'other');
add(G_RE, 'scaffolding', 'Scaffolding Rental', 'स्कैफोल्डिंग', '🪜', 'other');

// Tech (10)
const G_TECH = 'tech';
add(G_TECH, 'software_agency', 'Software Development Agency', 'सॉफ्टवेयर एजेंसी', '💻', 'other');
add(G_TECH, 'web_design_agency', 'Web Design / UI-UX Agency', 'वेब / यूआई-यूएक्स', '🎨', 'photography');
add(G_TECH, 'it_support', 'IT Support Company', 'आईटी सपोर्ट', '🖥️', 'repair_shop');
add(G_TECH, 'cyber_cafe', 'Cyber Café', 'साइबर कैफे', '🌐', 'other');
add(G_TECH, 'mobile_repair_shop', 'Mobile Repair Shop', 'मोबाइल रिपेयर', '📱', 'repair_shop');
add(G_TECH, 'cctv_security_tech', 'CCTV / Security Systems', 'सीसीटीवी सिस्टम', '📹', 'repair_shop');
add(G_TECH, 'data_recovery', 'Data Recovery Lab', 'डेटा रिकवरी', '💾', 'repair_shop');
add(G_TECH, 'game_dev', 'Game Dev Studio', 'गेम डेव स्टूडियो', '🎮', 'other');
add(G_TECH, 'saas_company', 'SaaS Product Company', 'सास कंपनी', '☁️', 'other');
add(G_TECH, 'digital_marketing', 'Digital Marketing Agency', 'डिजिटल मार्केटिंग', '📣', 'other');

// Finance & Legal (12)
const G_FIN = 'finance_legal';
add(G_FIN, 'ca_firm', 'CA / Accounting Firm', 'सीए फर्म', '📊', 'law_firm');
add(G_FIN, 'tax_gst', 'Tax Consultant / GST Filing', 'टैक्स / जीएसटी', '📑', 'law_firm');
add(G_FIN, 'loan_agent', 'Loan Agent / DSA', 'लोन एजेंट', '💰', 'law_firm');
add(G_FIN, 'insurance', 'Insurance Agency', 'बीमा एजेंसी', '🛡️', 'law_firm');
add(G_FIN, 'stock_broker', 'Stock Broker / Mutual Fund', 'शेयर ब्रोकर', '📈', 'law_firm');
add(G_FIN, 'lawyer_firm', 'Lawyer / Law Firm', 'वकील / लॉ फर्म', '⚖️', 'law_firm');
add(G_FIN, 'notary', 'Notary / Document Service', 'नोटरी', '📜', 'law_firm');
add(G_FIN, 'money_lender', 'Money Lender / Chit Fund', 'साहूकार / चिट फंड', '💵', 'law_firm');
add(G_FIN, 'company_secretary', 'Company Secretary', 'कंपनी सेक्रेटरी', '📋', 'law_firm');
add(G_FIN, 'property_valuation', 'Property Valuation Expert', 'प्रॉपर्टी वैल्यूएशन', '🏠', 'law_firm');
add(G_FIN, 'customs_broker', 'Customs Broker', 'कस्टम्स ब्रोकर', '🚢', 'law_firm');
add(G_FIN, 'immigration', 'Immigration Consultant', 'इमिग्रेशन', '✈️', 'law_firm');

// Agriculture (10)
const G_AG = 'agriculture';
add(G_AG, 'kisan_store', 'Agriculture / Kisan Store', 'किसान स्टोर', '🌾', 'other');
add(G_AG, 'dairy_farm', 'Dairy Farm', 'डेयरी फार्म', '🥛', 'other');
add(G_AG, 'poultry_farm', 'Poultry Farm', 'पोल्ट्री फार्म', '🐔', 'pet_care');
add(G_AG, 'fish_farm', 'Fish Farm / Fish Market', 'मछली फार्म', '🐟', 'other');
add(G_AG, 'crop_manager', 'Crop / Farm Manager', 'फसल प्रबंधन', '🌱', 'other');
add(G_AG, 'plant_nursery', 'Plant Nursery', 'पौध नर्सरी', '🪴', 'pet_care');
add(G_AG, 'honey_farm', 'Honey Farm', 'शहद फार्म', '🍯', 'other');
add(G_AG, 'rice_mill', 'Rice Mill / Flour Mill', 'चक्की / राइस मिल', '🌾', 'other');
add(G_AG, 'seed_store', 'Seed Store', 'बीज की दुकान', '🌰', 'other');
add(G_AG, 'animal_feed', 'Animal Feed Store', 'पशु आहार', '🐄', 'pet_care');

// Hospitality & events (12)
const G_HOSP = 'hospitality';
add(G_HOSP, 'hotel_lodge', 'Hotel / Lodge', 'होटल / लॉज', '🏨', 'restaurant');
add(G_HOSP, 'guest_house', 'Guest House / Homestay', 'गेस्ट हाउस', '🏠', 'restaurant');
add(G_HOSP, 'event_mgmt', 'Event Management Company', 'इवेंट मैनेजमेंट', '🎉', 'event_planner');
add(G_HOSP, 'wedding_planner', 'Wedding Planner', 'वेडिंग प्लानर', '💒', 'event_planner');
add(G_HOSP, 'banquet_hall', 'Banquet / Function Hall', 'बैंक्वेट हॉल', '🏛️', 'event_planner');
add(G_HOSP, 'tent_decor', 'Tent House / Decorator', 'टेंट हाउस', '🎪', 'event_planner');
add(G_HOSP, 'travel_agency', 'Travel Agency', 'ट्रैवल एजेंसी', '✈️', 'other');
add(G_HOSP, 'tour_operator', 'Tour Operator', 'टूर ऑपरेटर', '🗺️', 'other');
add(G_HOSP, 'resort_retreat', 'Resort / Retreat', 'रिज़ॉर्ट', '🏝️', 'restaurant');
add(G_HOSP, 'dj_service', 'DJ Service', 'डीजे सेवा', '🎧', 'event_planner');
add(G_HOSP, 'photo_studio_hosp', 'Photography Studio', 'फोटोग्राफी स्टूडियो', '📸', 'photography');
add(G_HOSP, 'video_studio', 'Videography Studio', 'वीडियोग्राफी', '🎬', 'photography');

// Manufacturing (10)
const G_MFG = 'manufacturing';
add(G_MFG, 'steel_fab', 'Steel Fabrication Workshop', 'स्टील फैब्रिकेशन', '🏭', 'other');
add(G_MFG, 'printing_press', 'Printing Press', 'प्रिंटिंग प्रेस', '🖨️', 'other');
add(G_MFG, 'packaging_supplier', 'Packaging Supplier', 'पैकेजिंग', '📦', 'other');
add(G_MFG, 'rubber_stamp', 'Rubber Stamp Maker', 'रबर स्टाम्प', '✳️', 'other');
add(G_MFG, 'textile_weaving', 'Silk / Textile Weaving', 'रेशम / टेक्सटाइल', '🧵', 'other');
add(G_MFG, 'bamboo_products', 'Bamboo Products', 'बांस उत्पाद', '🎋', 'other');
add(G_MFG, 'paper_mart', 'Paper Mart / Wholesale Stationery', 'पेपर मार्ट', '📄', 'other');
add(G_MFG, 'plastic_mfg', 'Plastic Products Manufacturer', 'प्लास्टिक', '♻️', 'other');
add(G_MFG, 'food_processing', 'Food Processing Unit', 'फूड प्रोसेसिंग', '🏭', 'restaurant');
add(G_MFG, 'garment_mfg', 'Garment / Clothing Manufacturer', 'गारमेंट मैन्युफैक्चरिंग', '👕', 'other');

// Specialized (15)
const G_SPEC = 'specialized';
add(G_SPEC, 'security_agency', 'Security Agency', 'सिक्योरिटी एजेंसी', '🛡️', 'other');
add(G_SPEC, 'parking_mgmt', 'Parking Management', 'पार्किंग', '🅿️', 'other');
add(G_SPEC, 'rwa_manager', 'Society / RWA Manager', 'आरडब्ल्यूए', '🏘️', 'other');
add(G_SPEC, 'cold_storage', 'Cold Storage', 'कोल्ड स्टोरेज', '❄️', 'other');
add(G_SPEC, 'warehouse', 'Warehouse / Storage', 'वेयरहाउस', '📦', 'other');
add(G_SPEC, 'scrap_dealer', 'Scrap Dealer', 'स्क्रैप डीलर', '♻️', 'other');
add(G_SPEC, 'atm_maint', 'ATM Maintenance', 'एटीएम मेंटेनेंस', '🏧', 'repair_shop');
add(G_SPEC, 'cable_tv', 'Cable TV Operator', 'केबल टीवी', '📡', 'other');
add(G_SPEC, 'isp', 'Internet Service Provider', 'इंटरनेट सेवा', '🌐', 'other');
add(G_SPEC, 'gas_agency', 'Gas Agency (LPG)', 'गैस एजेंसी', '🔥', 'other');
add(G_SPEC, 'water_tanker', 'Water Tanker Service', 'पानी का टैंकर', '🚚', 'other');
add(G_SPEC, 'borewell', 'Borewell / Drilling Service', 'बोरवेल', '⛏️', 'other');
add(G_SPEC, 'stone_crusher', 'Stone Crusher', 'स्टोन क्रशर', '🪨', 'other');
add(G_SPEC, 'rmc_plant', 'RMC Plant (Ready Mix Concrete)', 'आरएमसी प्लांट', '🏗️', 'other');
add(G_SPEC, 'labor_contractor', 'Labor Contractor', 'श्रम ठेकेदार', '👷', 'other');

// Specialty clinics (8)
const G_SCLIN = 'specialty_clinics';
add(G_SCLIN, 'skin_hair_clinic', 'Skin & Hair Clinic', 'त्वचा और बाल क्लिनिक', '✨', 'clinic');
add(G_SCLIN, 'sexology', 'Sexology / Men\'s Health', 'यौन स्वास्थ्य', '⚕️', 'clinic');
add(G_SCLIN, 'infertility', 'Infertility Clinic', 'बांझपन क्लिनिक', '👶', 'clinic');
add(G_SCLIN, 'obesity_clinic', 'Obesity / Weight Loss Clinic', 'मोटापा क्लिनिक', '⚖️', 'clinic');
add(G_SCLIN, 'sleep_clinic', 'Sleep Disorder Clinic', 'नींद विकार', '😴', 'clinic');
add(G_SCLIN, 'allergy_clinic', 'Allergy Clinic', 'एलर्जी क्लिनिक', '🤧', 'clinic');
add(G_SCLIN, 'rehab_center', 'Rehab / De-Addiction Center', 'नशा मुक्ति', '🏥', 'hospital');
add(G_SCLIN, 'vet_clinic', 'Veterinary / Pet Clinic', 'पशु चिकित्सा', '🐾', 'pet_care');

// Digital (8)
const G_DIG = 'digital';
add(G_DIG, 'ecommerce', 'E-Commerce Store', 'ई-कॉमर्स', '🛒', 'other');
add(G_DIG, 'd2c_brand', 'D2C Brand', 'डी2सी ब्रांड', '📦', 'other');
add(G_DIG, 'dropshipping', 'Dropshipping Store', 'ड्रॉपशिपिंग', '🚚', 'other');
add(G_DIG, 'news_portal', 'News Portal / Blog', 'न्यूज़ पोर्टल', '📰', 'other');
add(G_DIG, 'subscription_box', 'Subscription Box', 'सब्सक्रिप्शन बॉक्स', '📬', 'other');
add(G_DIG, 'online_coaching', 'Online Coaching', 'ऑनलाइन कोचिंग', '💻', 'coaching');
add(G_DIG, 'freelance_agency', 'Freelance Agency', 'फ्रीलांस एजेंसी', '👥', 'other');
add(G_DIG, 'influencer_mgmt', 'Influencer / Creator Management', 'इन्फ्लुएंसर', '📱', 'other');

// ── Expanded beauty / salon niches (user appendix) ──
const G_SALON_EX = 'salon_barber_detail';
add(G_SALON_EX, 'hair_cutting_salon_gents', 'Hair Cutting Salon (Gents)', 'हेयर कटिंग (जेंट्स)', '💇‍♂️', 'men_salon');
add(G_SALON_EX, 'kids_hair_salon', 'Kids Hair Salon', 'बच्चों का हेयर सैलून', '👦', 'men_salon');
add(G_SALON_EX, 'premium_mens_grooming', 'Premium Men\'s Grooming Studio', 'प्रीमियम ग्रूमिंग', '🪒', 'men_salon');
add(G_SALON_EX, 'hair_color_studio', 'Hair Color & Treatment Studio', 'हेयर कलर स्टूडियो', '🎨', 'men_salon');
add(G_SALON_EX, 'hair_transplant', 'Hair Transplant Clinic', 'हेयर ट्रांसप्लांट', '🧑‍🦲', 'clinic');

const G_LADIES_EX = 'ladies_beauty_detail';
add(G_LADIES_EX, 'party_makeup_artist', 'Party Makeup Artist', 'पार्टी मेकअप', '💋', 'beauty_parlour');
add(G_LADIES_EX, 'facial_skin_parlour', 'Facial & Skin Treatment Parlour', 'फेशियल और स्किन', '🧴', 'beauty_parlour');
add(G_LADIES_EX, 'eyebrow_studio', 'Eyebrow Shaping Studio', 'आईब्रो शेपिंग', '👁️', 'beauty_parlour');
add(G_LADIES_EX, 'nail_art_extension', 'Nail Art & Extension Studio', 'नेल आर्ट एक्सटेंशन', '💅', 'beauty_parlour');
add(G_LADIES_EX, 'eyelash_studio', 'Eyelash Extension Studio', 'आईलैश एक्सटेंशन', '👀', 'beauty_parlour');
add(G_LADIES_EX, 'permanent_makeup', 'Permanent Makeup Studio', 'पर्मानेंट मेकअप', '✏️', 'beauty_parlour');

const G_SPA_EX = 'spa_wellness_detail';
add(G_SPA_EX, 'body_massage_parlour', 'Body Massage Parlour', 'बॉडी मसाज', '💆', 'spa');
add(G_SPA_EX, 'foot_reflexology', 'Foot Reflexology Center', 'फुट रिफ्लेक्सोलॉजी', '🦶', 'spa');
add(G_SPA_EX, 'thai_massage', 'Thai Massage Studio', 'थाई मसाज', '🧘', 'spa');
add(G_SPA_EX, 'aromatherapy', 'Aromatherapy Center', 'अरोमाथेरेपी', '🌸', 'spa');
add(G_SPA_EX, 'steam_sauna', 'Steam & Sauna Center', 'स्टीम और सौना', '🧖‍♀️', 'spa');
add(G_SPA_EX, 'destress_wellness', 'De-Stress Wellness Center', 'डी-स्ट्रेस वेलनेस', '😌', 'spa');

const G_SKIN_EX = 'skin_hair_care_detail';
add(G_SKIN_EX, 'skincare_clinic', 'Skin Care Clinic', 'स्किन केयर क्लिनिक', '🧴', 'clinic');
add(G_SKIN_EX, 'acne_clinic', 'Acne / Pimple Treatment Clinic', 'मुहासे उपचार', '🩹', 'clinic');
add(G_SKIN_EX, 'laser_hair_removal', 'Laser Hair Removal Studio', 'लेज़र हेयर रिमूवल', '✨', 'clinic');
add(G_SKIN_EX, 'hair_spa_center', 'Hair Spa Center', 'हेयर स्पा', '💆‍♀️', 'beauty_parlour');
add(G_SKIN_EX, 'dandruff_studio', 'Dandruff Treatment Studio', 'डैंड्रफ ट्रीटमेंट', '🧴', 'men_salon');
add(G_SKIN_EX, 'keratin_smoothing', 'Keratin / Smoothening Studio', 'केराटिन / स्मूदनिंग', '✨', 'unisex_salon');
add(G_SKIN_EX, 'hair_extension_studio', 'Hair Extension Studio', 'हेयर एक्सटेंशन', '👱‍♀️', 'unisex_salon');

const G_MEHNDI_EX = 'mehndi_art_detail';
add(G_MEHNDI_EX, 'bridal_mehndi_studio', 'Bridal Mehndi Studio', 'ब्राइडल मेहंदी', '👰', 'beauty_parlour');
add(G_MEHNDI_EX, 'arabic_mehndi', 'Arabic Mehndi Artist', 'अरबी मेहंदी', '🖌️', 'beauty_parlour');
add(G_MEHNDI_EX, 'temp_tattoo', 'Temporary Tattoo Artist', 'टेम्प टैटू', '🎭', 'beauty_parlour');
add(G_MEHNDI_EX, 'body_painting', 'Body Painting Studio', 'बॉडी पेंटिंग', '🎨', 'beauty_parlour');

const G_NAILS_EX = 'nails_detail';
add(G_NAILS_EX, 'gel_nail_extension', 'Gel Nail Extension', 'जेल नेल', '💅', 'beauty_parlour');
add(G_NAILS_EX, 'acrylic_nails', 'Acrylic Nail Studio', 'एक्रिलिक नेल', '💎', 'beauty_parlour');
add(G_NAILS_EX, 'nail_art_fine', 'Nail Art Studio', 'नेल आर्ट स्टूडियो', '✨', 'beauty_parlour');
add(G_NAILS_EX, 'pedi_mani_center', 'Pedicure & Manicure Center', 'पेडीक्योर मैनीक्योर', '🦶', 'beauty_parlour');

const G_YOGA_EX = 'yoga_fitness_detail';
add(G_YOGA_EX, 'meditation_center', 'Meditation Center', 'ध्यान केंद्र', '🧘‍♀️', 'spa');
add(G_YOGA_EX, 'zumba_aerobics', 'Zumba / Aerobics Class', 'ज़ुम्बा / एरोबिक्स', '💃', 'gym');
add(G_YOGA_EX, 'pilates_studio', 'Pilates Studio', 'पिलेट्स', '🤸‍♀️', 'gym');
add(G_YOGA_EX, 'dance_fitness', 'Dance Fitness Class', 'डांस फिटनेस', '🕺', 'gym');

const G_AYU_EX = 'ayurveda_natural_detail';
add(G_AYU_EX, 'panchakarma', 'Panchakarma Center', 'पंचकर्म', '🌿', 'clinic');
add(G_AYU_EX, 'herbal_beauty', 'Herbal Beauty Parlour', 'हर्बल ब्यूटी', '🌺', 'beauty_parlour');
add(G_AYU_EX, 'acupressure', 'Acupressure Center', 'एक्यूप्रेशर', '👐', 'spa');

const G_FITLINK_EX = 'fitness_beauty_detail';
add(G_FITLINK_EX, 'slimming_center', 'Slimming Center', 'स्लिमिंग सेंटर', '⚖️', 'gym');
add(G_FITLINK_EX, 'weight_loss_clinic', 'Weight Loss Clinic', 'वजन घटाने की क्लिनिक', '🏃', 'clinic');
add(G_FITLINK_EX, 'body_transformation', 'Body Transformation Studio', 'बॉडी ट्रांसफॉर्मेशन', '💪', 'gym');
add(G_FITLINK_EX, 'bridal_fitness', 'Pre/Post Bridal Fitness', 'ब्राइडल फिटनेस', '👰', 'gym');

const G_HOME_BEAUTY = 'home_beauty_service';
add(G_HOME_BEAUTY, 'home_salon_service', 'Home Salon Service', 'होम सैलून', '🏠', 'men_salon');
add(G_HOME_BEAUTY, 'doorstep_makeup', 'Doorstep Makeup Artist', 'डोरस्टेप मेकअप', '💄', 'beauty_parlour');
add(G_HOME_BEAUTY, 'home_massage', 'Home Massage Service', 'होम मसाज', '💆', 'spa');
add(G_HOME_BEAUTY, 'home_mehndi', 'Home Mehndi Service', 'होम मेहंदी', '🖌️', 'beauty_parlour');
add(G_HOME_BEAUTY, 'home_facial', 'Home Facial Service', 'होम फेशियल', '🧴', 'beauty_parlour');

// ── TS output ──
const groups = [
  { id: 'food', label: 'Food & Restaurant', labelHi: 'खाना और रेस्टोरेंट', icon: '🍽️' },
  { id: 'healthcare', label: 'Healthcare', labelHi: 'स्वास्थ्य सेवा', icon: '🏥' },
  { id: 'beauty', label: 'Beauty & Wellness', labelHi: 'ब्यूटी और वेलनेस', icon: '💄' },
  { id: 'education', label: 'Education', labelHi: 'शिक्षा', icon: '📚' },
  { id: 'fitness', label: 'Fitness & Sports', labelHi: 'फिटनेस और खेल', icon: '💪' },
  { id: 'retail', label: 'Retail & Shopping', labelHi: 'खुदरा और शॉपिंग', icon: '🛒' },
  { id: 'home_services', label: 'Home Services', labelHi: 'घरेलू सेवाएं', icon: '🏠' },
  { id: 'transport', label: 'Transport & Auto', labelHi: 'परिवहन', icon: '🚗' },
  { id: 'real_estate', label: 'Real Estate & Construction', labelHi: 'रियल एस्टेट', icon: '🏢' },
  { id: 'tech', label: 'Technology & IT', labelHi: 'प्रौद्योगिकी', icon: '💻' },
  { id: 'finance_legal', label: 'Finance & Legal', labelHi: 'वित्त और कानून', icon: '⚖️' },
  { id: 'agriculture', label: 'Agriculture & Farming', labelHi: 'कृषि', icon: '🌾' },
  { id: 'hospitality', label: 'Hospitality & Events', labelHi: 'आतिथ्य और इवेंट', icon: '🎉' },
  { id: 'manufacturing', label: 'Manufacturing & Wholesale', labelHi: 'विनिर्माण', icon: '🏭' },
  { id: 'specialized', label: 'Specialized Services', labelHi: 'विशेष सेवाएं', icon: '⚙️' },
  { id: 'specialty_clinics', label: 'Specialty Clinics', labelHi: 'विशेष क्लिनिक', icon: '🩺' },
  { id: 'digital', label: 'Digital / Online', labelHi: 'डिजिटल / ऑनलाइन', icon: '🌐' },
  { id: 'salon_barber_detail', label: 'Salon / Barber (detailed)', labelHi: 'सैलून / नाई (विस्तृत)', icon: '💈' },
  { id: 'ladies_beauty_detail', label: 'Ladies Beauty (detailed)', labelHi: 'लेडीज़ ब्यूटी', icon: '💅' },
  { id: 'spa_wellness_detail', label: 'Spa & Wellness (detailed)', labelHi: 'स्पा विस्तृत', icon: '🧖' },
  { id: 'skin_hair_care_detail', label: 'Skin & Hair Care (detailed)', labelHi: 'त्वचा और बाल', icon: '✨' },
  { id: 'mehndi_art_detail', label: 'Mehndi & Art (detailed)', labelHi: 'मेहंदी और कला', icon: '🎨' },
  { id: 'nails_detail', label: 'Nails (detailed)', labelHi: 'नेल विस्तृत', icon: '💅' },
  { id: 'yoga_fitness_detail', label: 'Yoga & Dance Fitness', labelHi: 'योग और डांस', icon: '🧘' },
  { id: 'ayurveda_natural_detail', label: 'Ayurveda & Natural', labelHi: 'आयुर्वेद', icon: '🌿' },
  { id: 'fitness_beauty_detail', label: 'Fitness-linked Beauty', labelHi: 'फिटनेस ब्यूटी', icon: '⚖️' },
  { id: 'home_beauty_service', label: 'Home Beauty Services', labelHi: 'घर पर ब्यूटी', icon: '🏠' },
];

const out = `/* eslint-disable */
// AUTO-GENERATED by scripts/build-business-registry.mjs — do not edit by hand
import type { BusinessCategory } from '../store/AppContext';

export interface BusinessRegistryGroup {
  id: string;
  label: string;
  labelHi: string;
  icon: string;
}

export const BUSINESS_REGISTRY_GROUPS: BusinessRegistryGroup[] = ${JSON.stringify(groups, null, 2)};

export interface BusinessNicheRow {
  id: string;
  groupId: string;
  label: string;
  labelHi: string;
  icon: string;
  template: BusinessCategory;
}

export const ALL_BUSINESS_NICHE_ROWS: BusinessNicheRow[] = ${JSON.stringify(rows, null, 2)};
`;

fs.writeFileSync(outPath, out, 'utf8');
console.log('Wrote', outPath, 'niches:', rows.length);
