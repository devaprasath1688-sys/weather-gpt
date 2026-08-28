import type {
  DistrictIntelligence,
  OfficialAlert,
  PersonalizedRecommendation,
  UserProfile,
  WeatherData,
} from "@/types";

export type PersonaPreset = {
  id: string;
  name: string;
  subtitle: string;
  profile: UserProfile;
  weather: WeatherData;
  district: DistrictIntelligence;
  alerts: OfficialAlert[];
  recommendation: PersonalizedRecommendation;
  notificationReason: string;
};

export const MOCK_PERSONAS: Record<string, PersonaPreset> = {
  chennai_student: {
    id: "chennai_student",
    name: "Chennai Student",
    subtitle: "Heavy Rainfall & Campus Closure Scenario",
    profile: {
      id: "usr_ch_01",
      state: "Tamil Nadu",
      district: "Chennai",
      city: "Guindy",
      latitude: 13.0067,
      longitude: 80.2206,
      locationSource: "manual",
      occupation: "student",
      language: "en",
      activityNotes: "Daily college commuter via local bus/metro",
      notificationPreferences: {
        heavyRainfall: true,
        officialClosures: true,
        heatwavesAndDrought: false,
        travelDisruptions: true,
        agriculturalImpact: false,
      },
    },
    weather: {
      locationName: "Guindy, Chennai",
      district: "Chennai",
      state: "Tamil Nadu",
      temperatureC: 27,
      feelsLikeC: 31,
      humidityPercent: 94,
      windSpeedKmh: 42,
      rainfallMm24h: 118.5,
      uvIndex: 2,
      conditionCategory: "heavy_rain",
      conditionDescription: "Torrential downpour & coastal gale warnings",
      updatedAt: "Just now",
    },
    district: {
      districtId: "dist_tn_chennai",
      districtName: "Chennai",
      state: "Tamil Nadu",
      overallRiskLevel: "severe",
      primaryHazard: "Severe Urban Inundation & Coastal Storm Surge",
      activeOfficialAlertsCount: 2,
      affectedAreas: [
        {
          name: "Velachery & Madipakkam",
          subdivision: "South Chennai",
          waterloggingRisk: "severe",
          disruptionLevel: "Submerged access roads; local rescue buses deployed.",
        },
        {
          name: "Guindy Industrial Area",
          subdivision: "Central Chennai",
          waterloggingRisk: "high",
          disruptionLevel: "Subway flooded; traffic diverted via Kathipara Flyover.",
        },
        {
          name: "T. Nagar / Kodambakkam",
          subdivision: "Central Chennai",
          waterloggingRisk: "moderate",
          disruptionLevel: "Slow moving traffic; heavy surface runoff.",
        },
      ],
      emergencyContacts: {
        helpline: "1077 (District Control)",
        controlRoom: "044-25619206 (GCC Flood Cell)",
      },
      lastUpdated: "5 mins ago",
    },
    alerts: [
      {
        id: "alt_chn_001",
        district: "Chennai",
        state: "Tamil Nadu",
        sourceName: "District_Collectorate",
        officialRefUrl: "https://chennai.nic.in/press-release-rain-holiday",
        title: "Official Press Release: Holiday for Schools & Colleges",
        rawAnnouncement:
          "ORDER BY DISTRICT COLLECTOR: In view of continuous heavy rainfall and red alert issued by IMD, all government and private schools and colleges in Chennai District shall remain closed today, Oct 24.",
        severity: "emergency",
        verificationStatus: "verified_official",
        closureDeclared: "schools_and_colleges",
        effectiveFrom: "2026-10-24T06:00:00Z",
        effectiveUntil: "2026-10-24T23:59:00Z",
        issuedAt: "2026-10-24T05:30:00Z",
        aiSummary: {
          en: "OFFICIAL CLOSURE: District Collector has officially declared a holiday for all schools and colleges in Chennai today due to heavy rains.",
          hi: "आधिकारिक अवकाश: लगातार भारी बारिश के कारण आज चेन्नई जिले के सभी स्कूल और कॉलेज बंद रहेंगे।",
          ta: "அதிகாரப்பூர்வ விடுமுறை: கனமழை காரணமாக இன்று சென்னை மாவட்டத்தில் உள்ள அனைத்து பள்ளிகள் மற்றும் கல்லூரிகளுக்கு விடுமுறை அறிவிக்கப்பட்டுள்ளது.",
        },
      },
    ],
    recommendation: {
      id: "rec_chn_student",
      occupation: "student",
      district: "Chennai",
      riskScore: 88,
      priority: "urgent",
      headline: {
        en: "Do NOT commute to campus. Official college holiday declared.",
        hi: "कॉलेज न जाएं। आधिकारिक कॉलेज अवकाश घोषित किया गया है।",
        ta: "கல்லூரிக்கு செல்ல வேண்டாம். அதிகாரப்பூர்வ விடுமுறை அறிவிக்கப்பட்டுள்ளது.",
      },
      keyActions: {
        en: [
          "Stay indoors; classes are officially suspended for Chennai colleges today.",
          "Velachery, Madipakkam, and Guindy underpass roads are flooded.",
          "Keep mobile devices charged in case of localized power shutoffs.",
        ],
        hi: [
          "घर के भीतर रहें; आज चेन्नई के कॉलेजों में कक्षाएं निलंबित हैं।",
          "वेलाचेरी और गुइंडी अंडरपास जलमग्न हैं।",
        ],
        ta: [
          "வீட்டிலேயே இருங்கள்; இன்று சென்னையில் உள்ள கல்லூரிகளுக்கு விடுமுறை.",
          "வேளச்சேரி, கிண்டி சுரங்கப் பாதைகளில் வெள்ளநீர் தேங்கியுள்ளது.",
        ],
      },
      travelAdvice: {
        en: "Suburban trains on Beach-Tambaram line running with delays. Avoid low-lying Guindy subways.",
      },
      officialClosureNotice: {
        en: "Verified Source: Chennai District Collectorate Press Release #402/2026.",
      },
      generatedAt: "Just now",
    },
    notificationReason:
      "Targeted because profile matches location = Chennai AND occupation = Student during an official verified school/college closure alert.",
  },

  coimbatore_farmer: {
    id: "coimbatore_farmer",
    name: "Coimbatore Farmer",
    subtitle: "Heatwave & Crop Irrigation Protection Scenario",
    profile: {
      id: "usr_cbe_02",
      state: "Tamil Nadu",
      district: "Coimbatore",
      city: "Pollachi",
      latitude: 10.6609,
      longitude: 77.0048,
      locationSource: "manual",
      occupation: "farmer",
      language: "en",
      activityNotes: "Coconut & vegetables cultivator; active outdoor irrigation",
      notificationPreferences: {
        heavyRainfall: false,
        officialClosures: false,
        heatwavesAndDrought: true,
        travelDisruptions: false,
        agriculturalImpact: true,
      },
    },
    weather: {
      locationName: "Pollachi, Coimbatore",
      district: "Coimbatore",
      state: "Tamil Nadu",
      temperatureC: 39,
      feelsLikeC: 43,
      humidityPercent: 35,
      windSpeedKmh: 14,
      rainfallMm24h: 0.0,
      uvIndex: 11,
      conditionCategory: "extreme_heat",
      conditionDescription: "Extreme solar radiation & hot gusty winds",
      updatedAt: "Just now",
    },
    district: {
      districtId: "dist_tn_coimbatore",
      districtName: "Coimbatore",
      state: "Tamil Nadu",
      overallRiskLevel: "high",
      primaryHazard: "Severe Agricultural Heat Stress & Soil Evaporation",
      activeOfficialAlertsCount: 1,
      affectedAreas: [
        {
          name: "Pollachi & Anaimalai",
          subdivision: "South Coimbatore",
          waterloggingRisk: "low",
          disruptionLevel: "High soil thermal stress; afternoon outdoor field restriction recommended.",
        },
        {
          name: "Mettupalayam Foothills",
          subdivision: "North Coimbatore",
          waterloggingRisk: "low",
          disruptionLevel: "Elevated temperature; keep livestock shaded.",
        },
      ],
      emergencyContacts: {
        helpline: "1077 (District Collectorate)",
        controlRoom: "0422-2301114 (Agri Extension Cell)",
      },
      lastUpdated: "12 mins ago",
    },
    alerts: [
      {
        id: "alt_cbe_002",
        district: "Coimbatore",
        state: "Tamil Nadu",
        sourceName: "IMD",
        officialRefUrl: "https://mausam.imd.gov.in",
        title: "IMD Heatwave Advisory for Inland Districts",
        rawAnnouncement:
          "IMD METEOROLOGICAL BULLETIN: Maximum temperatures expected to remain 4-5°C above normal across Coimbatore rural and Pollachi belts. High UV Index (11+). Outdoor manual labor restricted between 12:00 PM and 3:30 PM.",
        severity: "advisory",
        verificationStatus: "verified_official",
        closureDeclared: "none",
        effectiveFrom: "2026-10-24T11:00:00Z",
        effectiveUntil: "2026-10-24T16:00:00Z",
        issuedAt: "2026-10-24T07:00:00Z",
        aiSummary: {
          en: "IMD HEAT ADVISORY: Temperatures reaching 39°C with dangerous UV levels. Restrict field spraying and labor between 12 PM and 3:30 PM.",
          hi: "आईएमडी हीट एडवाइजरी: तापमान 39°C तक पहुंच रहा है। दोपहर 12 से 3:30 बजे के बीच खेतों में काम करने से बचें।",
          ta: "வானிலை எச்சரிக்கை: கோவை மாவட்டத்தில் 39°C வெப்பம் நிலவுகிறது. மதியம் 12 மணி முதல் 3:30 மணி வரை வயல்வெளிகளில் வேலை செய்வதை தவிர்க்கவும்.",
        },
      },
    ],
    recommendation: {
      id: "rec_cbe_farmer",
      occupation: "farmer",
      district: "Coimbatore",
      riskScore: 76,
      priority: "recommended",
      headline: {
        en: "Protect crops with early morning drip irrigation; avoid 12 PM - 3:30 PM field labor.",
        hi: "सुबह तड़के सिंचाई करें; दोपहर 12 से 3:30 बजे के बीच धूप में न जाएं।",
        ta: "காலை வேளையில் பாசனம் செய்யவும்; மதியம் 12-3:30 மணி வெயிலில் வேலை செய்வதை தவிர்க்கவும்.",
      },
      keyActions: {
        en: [
          "Irrigate coconut and vegetable saplings early before sunrise to minimize soil evaporation.",
          "Provide shaded water troughs for livestock; apply organic mulch over exposed roots.",
          "Shift heavy field labor to after 4 PM due to extreme UV Index (11).",
        ],
        hi: [
          "वाष्पीकरण रोकने के लिए सूर्योदय से पहले सिंचाई करें।",
          "पशुओं के लिए छायादार स्थान और पानी की व्यवस्था करें।",
        ],
        ta: [
          "சூரிய உதயத்திற்கு முன் சொட்டு நீர் பாசனம் செய்யவும்.",
          "கால்நடைகளுக்கு நிழல் மற்றும் நீர் வசதி செய்து தரவும்.",
        ],
      },
      travelAdvice: {
        en: "Carry hydration packs when operating tractors in open fields. High heat exhaustion risk.",
      },
      officialClosureNotice: {
        en: "Note: No Chennai school closures apply to Coimbatore. Receive only local agricultural advisories.",
      },
      generatedAt: "Just now",
    },
    notificationReason:
      "Targeted because profile matches location = Coimbatore AND occupation = Farmer during IMD Heat Advisory. Notice that Chennai alerts do NOT reach this user!",
  },

  cuddalore_worker: {
    id: "cuddalore_worker",
    name: "Cuddalore Outdoor Worker",
    subtitle: "Coastal Cyclone & High Wind Alert",
    profile: {
      id: "usr_cud_03",
      state: "Tamil Nadu",
      district: "Cuddalore",
      city: "Chidambaram",
      latitude: 11.3992,
      longitude: 79.6936,
      locationSource: "manual",
      occupation: "construction",
      language: "en",
      activityNotes: "Building construction & scaffolding supervisor",
      notificationPreferences: {
        heavyRainfall: true,
        officialClosures: false,
        heatwavesAndDrought: false,
        travelDisruptions: true,
        agriculturalImpact: false,
      },
    },
    weather: {
      locationName: "Chidambaram, Cuddalore",
      district: "Cuddalore",
      state: "Tamil Nadu",
      temperatureC: 25,
      feelsLikeC: 27,
      humidityPercent: 96,
      windSpeedKmh: 58,
      rainfallMm24h: 84.0,
      uvIndex: 1,
      conditionCategory: "thunderstorm",
      conditionDescription: "Squally coastal winds & lightning activity",
      updatedAt: "Just now",
    },
    district: {
      districtId: "dist_tn_cuddalore",
      districtName: "Cuddalore",
      state: "Tamil Nadu",
      overallRiskLevel: "severe",
      primaryHazard: "Coastal Wind Gusts & Scaffolding Collapse Danger",
      activeOfficialAlertsCount: 2,
      affectedAreas: [
        {
          name: "Coastal Chidambaram & Pichavaram",
          subdivision: "East Cuddalore",
          waterloggingRisk: "severe",
          disruptionLevel: "Gale winds up to 60 km/h; temporary roof & crane restriction.",
        },
      ],
      emergencyContacts: {
        helpline: "1077",
        controlRoom: "04142-220700",
      },
      lastUpdated: "2 mins ago",
    },
    alerts: [
      {
        id: "alt_cud_003",
        district: "Cuddalore",
        state: "Tamil Nadu",
        sourceName: "State_Disaster_Management",
        officialRefUrl: "https://tndma.tn.gov.in",
        title: "TNDMA Warning: Halt Outdoor Scaffolding & High-Structure Work",
        rawAnnouncement:
          "TAMIL NADU DISASTER MANAGEMENT AUTHORITY: High wind warning issued for Cuddalore coastal belt. Construction contractors are instructed to secure cranes, dismantle high scaffolding, and halt outdoor high-altitude work immediately.",
        severity: "emergency",
        verificationStatus: "verified_official",
        closureDeclared: "none",
        effectiveFrom: "2026-10-24T06:00:00Z",
        effectiveUntil: "2026-10-25T06:00:00Z",
        issuedAt: "2026-10-24T06:00:00Z",
        aiSummary: {
          en: "OFFICIAL SAFETY DIRECTIVE: TNDMA orders immediate suspension of high-altitude construction & outdoor crane work in Cuddalore due to 60 km/h gusts.",
          hi: "टीएनडीएमए सुरक्षा निर्देश: 60 किमी/घंटा की हवाओं के कारण कुड्डालोर में ऊंचे निर्माण कार्य को तुरंत रोक दें।",
          ta: "பாதுகாப்பு எச்சரிக்கை: கடலூரில் 60 கிமீ வேகத்தில் காற்று வீசுவதால் கட்டிடப் பணிகளை உடனடியாக நிறுத்த உத்தரவு.",
        },
      },
    ],
    recommendation: {
      id: "rec_cud_worker",
      occupation: "construction",
      district: "Cuddalore",
      riskScore: 92,
      priority: "urgent",
      headline: {
        en: "Halt high-elevation scaffolding & crane work immediately due to 58 km/h wind gusts.",
        hi: "58 किमी/घंटा हवा के झोंकों के कारण तुरंत ऊंची निर्माण गतिविधियों को रोकें।",
        ta: "58 கிமீ வேகக் காற்று காரணமாக உடனடியாக உயரமான கட்டுமானப் பணிகளை நிறுத்தவும்.",
      },
      keyActions: {
        en: [
          "Dismantle unsecured metal sheets and lower overhead crane booms.",
          "Ensure site workers take shelter inside solid masonry structures.",
          "Beware of fallen branches and active lightning near coastal Chidambaram.",
        ],
        hi: [
          "क्रेन और टीन की छत वाली संरचनाओं को सुरक्षित करें।",
          "श्रमिकों को सुरक्षित भवनों के अंदर पहुंचाएं।",
        ],
        ta: [
          "தற்காலிக கூரைகள் மற்றும் உயரமான வேலைகளை பாதுகாப்பாக வைக்கவும்.",
          "ஊழியர்களை பாதுகாப்பான கட்டிடத்திற்குள் மாற்றவும்.",
        ],
      },
      travelAdvice: {
        en: "Coastal ECR road blocked near Sirkazhi due to uprooted trees.",
      },
      officialClosureNotice: {
        en: "Verified Source: Tamil Nadu Disaster Management Authority (TNDMA) Directive.",
      },
      generatedAt: "Just now",
    },
    notificationReason:
      "Targeted because profile matches location = Cuddalore AND occupation = Construction Worker with high risk of wind hazard.",
  },
};
