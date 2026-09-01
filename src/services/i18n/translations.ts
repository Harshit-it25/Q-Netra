import { SupportedLanguage } from './languages';

export interface DecisionTranslation {
  title: string;
  subtitle: string;
  voiceMessage: string;
  actionBadge: string;
  evidenceHeader: string;
  evidencePillars: string[];
}

export interface LanguageTranslations {
  name: string;
  stop: DecisionTranslation;
  verify: DecisionTranslation;
  proceed: DecisionTranslation;
  voiceUi: {
    playWarning: string;
    replayWarning: string;
    speaking: string;
    voiceUnavailable: string;
    voiceDisclaimer: string;
    voiceAlertsToggle: string;
    voiceAlertsOn: string;
    voiceAlertsOff: string;
    languageLabel: string;
    selectLanguage: string;
    attemptingToSend: string;
    protectedAnalysis: string;
    whyButton: string;
    networkButton: string;
    voiceQaButton: string;
    networkCheckTitle: string;
    networkSummary: (connected: number, elevated: number) => string;
    dataMinimizationTitle: string;
    askAiContext: (vpa: string, amt: number) => string;
    askAiGreeting: (vpa: string, risk: string) => string;
    askAiPlaceholder: string;
    quickQuestions: string[];
  };
  storyCorrelation: {
    title: string;
    claimedStory: string;
    recipientReality: string;
    networkTrail: string;
    statusInconsistent: string;
    statusUnknown: string;
    statusConsistent: string;
  };
  qaAnswers: {
    report1930: string;
    qrSafety: string;
    muleNetwork: string;
    apkMalware: string;
    whyFlaggedStop: (amt: number, vpa: string, reason?: string) => string;
    whyFlaggedVerify: (amt: number, vpa: string, headline?: string) => string;
    whyFlaggedProceed: (amt: number, vpa: string) => string;
    generalAdvice: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, LanguageTranslations> = {
  en: {
    name: 'English',
    stop: {
      title: 'STOP',
      subtitle: 'High risk detected.',
      voiceMessage: 'Warning. High-risk payment detected. Please do not proceed with this payment. Do not enter your UPI PIN.',
      actionBadge: 'Action: DO NOT PROCEED',
      evidenceHeader: 'WHY WE STOPPED',
      evidencePillars: [
        'Payment pressure detected (Urgent penalty coercion signature)',
        'Recipient has elevated risk indicators and syndicate linkages',
        'Available network evidence conflicts with the payment context'
      ]
    },
    verify: {
      title: 'VERIFY',
      subtitle: 'Additional verification recommended.',
      voiceMessage: 'Caution. This payment needs verification. Please independently verify the recipient before proceeding.',
      actionBadge: 'Action: VERIFY RECIPIENT',
      evidenceHeader: 'MISSING VERIFICATION EVIDENCE',
      evidencePillars: [
        'Handle active for less than 30 days without established clearing history',
        'Counterparty trust depth remains shallow across peer networks'
      ]
    },
    proceed: {
      title: 'PROCEED',
      subtitle: 'No significant risk indicators detected.',
      voiceMessage: 'No significant risk indicators detected. Please review the payment details before proceeding.',
      actionBadge: 'Action: REVIEW & PROCEED',
      evidenceHeader: 'VERIFIED CLEARING EVIDENCE',
      evidencePillars: [
        'Standard organic payment intent without coercive signals',
        'Verified corporate KYC enterprise clearing counterparty',
        'Direct scheduled commercial bank settlement route'
      ]
    },
    voiceUi: {
      playWarning: 'Play Warning',
      replayWarning: 'Replay Warning',
      speaking: 'Speaking Alert...',
      voiceUnavailable: 'Voice unavailable on this device.',
      voiceDisclaimer: 'Voice output depends on device/browser speech-service availability.',
      voiceAlertsToggle: 'Voice Safety Alerts',
      voiceAlertsOn: 'VOICE: ON',
      voiceAlertsOff: 'VOICE: OFF',
      languageLabel: 'Language',
      selectLanguage: 'Select Language',
      attemptingToSend: 'Attempting to send',
      protectedAnalysis: 'Protected Analysis',
      whyButton: 'Why?',
      networkButton: 'NETWORK',
      voiceQaButton: 'VOICE Q&A',
      networkCheckTitle: 'Network Check',
      networkSummary: (connected: number, elevated: number) =>
        `${connected} connected entities, ${elevated} elevated-risk connections.`,
      dataMinimizationTitle: 'WHAT WE SEND (Data Minimization)',
      askAiContext: (vpa: string, amt: number) => `Context: ${vpa} (₹${amt})`,
      askAiGreeting: (vpa: string, risk: string) =>
        `Voice Assistant Active for payment to ${vpa} (${risk}). Say "Hi Q-NETRA" or ask me anything about the payment story, recipient, or network trail.`,
      askAiPlaceholder: 'Ask or speak: "Why did you stop this?"',
      quickQuestions: [
        'Is this payment safe?',
        'Why did you stop this?',
        'Who am I paying?',
        'Where does the money go?',
        'Does the story match the trail?',
        'Is my camera data private?'
      ]
    },
    storyCorrelation: {
      title: 'Story ↮ Money Trail Correlation',
      claimedStory: 'Claimed Story',
      recipientReality: 'Recipient Reality',
      networkTrail: 'Network Trail',
      statusInconsistent: 'INCONSISTENT',
      statusUnknown: 'INTENT UNVERIFIED',
      statusConsistent: 'TRAIL ALIGNED'
    },
    qaAnswers: {
      report1930: 'If you lost money or suspect a scam, immediately call the National Cyber Crime Helpline at 1930 within the golden hour, or file a complaint at cybercrime.gov.in.',
      qrSafety: 'Golden Security Rule: You NEVER need to scan a QR code or enter your UPI PIN to receive money. PINs are only used to send money.',
      muleNetwork: 'Mule accounts are bank accounts rented by syndicates to launder stolen money across multiple hops. Q-NETRA maps these clusters to stop payments in time.',
      apkMalware: 'Never install apps like AnyDesk, QuickSupport, or APK links sent via SMS. They give scammers remote access to intercept your OTPs.',
      whyFlaggedStop: (amt: number, vpa: string, reason?: string) =>
        `Warning. High-risk payment detected for ₹${amt} to ${vpa}. Transaction halted due to coercive threat indicators and mule risk connections. Do not enter your UPI PIN.`,
      whyFlaggedVerify: (amt: number, vpa: string, headline?: string) =>
        `Caution. This payment of ₹${amt} to ${vpa} needs verification. Please independently verify the recipient before proceeding.`,
      whyFlaggedProceed: (amt: number, vpa: string) =>
        `No significant risk indicators detected for payment of ₹${amt} to ${vpa}. Please review the payment details before proceeding.`,
      generalAdvice: 'Q-NETRA AI advises you to always verify the verified name on your banking app, watch for false urgency deadlines, and check suspicious VPAs before entering your UPI PIN.'
    }
  },

  hi: {
    name: 'Hindi',
    stop: {
      title: 'रोकें (STOP)',
      subtitle: 'उच्च जोखिम पाया गया।',
      voiceMessage: 'सावधान। इस भुगतान में उच्च जोखिम पाया गया है। कृपया इस भुगतान को आगे न बढ़ाएं। अपना UPI PIN दर्ज न करें।',
      actionBadge: 'कार्रवाई: भुगतान न करें (DO NOT PROCEED)',
      evidenceHeader: 'हमने भुगतान क्यों रोका',
      evidencePillars: [
        'भुगतान का दबाव पाया गया (तत्काल बिजली कटौती/जुर्माने की धमकी)',
        'प्राप्तकर्ता में उच्च जोखिम संकेतक और म्यूल नेटवर्क संबंध मिले',
        'उपलब्ध नेटवर्क साक्ष्य भुगतान संदर्भ के विपरीत हैं'
      ]
    },
    verify: {
      title: 'सत्यापित करें (VERIFY)',
      subtitle: 'अतिरिक्त सत्यापन की अनुशंसा की जाती है।',
      voiceMessage: 'सावधानी। इस भुगतान को सत्यापन की आवश्यकता है। कृपया आगे बढ़ने से पहले प्राप्तकर्ता को स्वतंत्र रूप से सत्यापित करें।',
      actionBadge: 'कार्रवाई: प्राप्तकर्ता को सत्यापित करें',
      evidenceHeader: 'अनुपलब्ध सत्यापन साक्ष्य',
      evidencePillars: [
        'UPI हैंडल 30 दिनों से कम समय से सक्रिय है, कोई पुराना विश्वसनीय इतिहास नहीं',
        'सहकर्मी नेटवर्क में प्राप्तकर्ता का विश्वास स्तर कम है'
      ]
    },
    proceed: {
      title: 'आगे बढ़ें (PROCEED)',
      subtitle: 'कोई महत्वपूर्ण जोखिम संकेतक नहीं मिले।',
      voiceMessage: 'कोई महत्वपूर्ण जोखिम संकेतक नहीं मिले। कृपया आगे बढ़ने से पहले भुगतान विवरण की समीक्षा करें।',
      actionBadge: 'कार्रवाई: समीक्षा करें और आगे बढ़ें',
      evidenceHeader: 'सत्यापित साक्ष्य',
      evidencePillars: [
        'सामान्य प्रामाणिक भुगतान उद्देश्य, कोई दबाव नहीं',
        'सत्यापित कॉर्पोरेट KYC उद्यम खाता',
        'अनुसूचित वाणिज्यिक बैंक का सीधा निपटान मार्ग'
      ]
    },
    voiceUi: {
      playWarning: 'चेतावनी सुनें',
      replayWarning: 'चेतावनी दोबारा सुनें',
      speaking: 'चेतावनी बोली जा रही है...',
      voiceUnavailable: 'इस डिवाइस पर आवाज अनुपलब्ध है।',
      voiceDisclaimer: 'आवाज आउटपुट डिवाइस/ब्राउज़र की स्पीच सेवा पर निर्भर करता है।',
      voiceAlertsToggle: 'वॉयस सुरक्षा अलर्ट',
      voiceAlertsOn: 'आवाज: चालू',
      voiceAlertsOff: 'आवाज: बंद',
      languageLabel: 'भाषा',
      selectLanguage: 'भाषा चुनें',
      attemptingToSend: 'भुगतान का प्रयास',
      protectedAnalysis: 'संरक्षित विश्लेषण',
      whyButton: 'क्यों?',
      networkButton: 'नेटवर्क',
      voiceQaButton: 'वॉयस प्रश्नोत्तर',
      networkCheckTitle: 'नेटवर्क जांच',
      networkSummary: (connected: number, elevated: number) =>
        `${connected} जुड़े हुए खाते/संस्थान, ${elevated} उच्च जोखिम वाले कनेक्शन।`,
      dataMinimizationTitle: 'डेटा सुरक्षा (हम क्या भेजते हैं)',
      askAiContext: (vpa: string, amt: number) => `संदर्भ: ${vpa} (₹${amt})`,
      askAiGreeting: (vpa: string, risk: string) => {
        const riskLabel = risk === 'HIGH RISK' ? 'उच्च जोखिम (HIGH RISK)' : risk === 'MODERATE' ? 'सत्यापन आवश्यक (VERIFY)' : 'सुरक्षित (SAFE)';
        return `${vpa} (${riskLabel}) के लिए वॉयस सहायक सक्रिय है। "Hi Q-NETRA" बोलें या भुगतान के बारे में कुछ भी पूछें।`;
      },
      askAiPlaceholder: 'पूछें या बोलें: "इसे क्यों रोका गया?"',
      quickQuestions: [
        'क्या यह सुरक्षित है?',
        'इसे क्यों रोका गया?',
        'मैं किसे भुगतान कर रहा हूँ?',
        'पैसे कहाँ जाते हैं?',
        'क्या कहानी और नेटवर्क मेल खाते हैं?',
        'क्या मेरा कैमरा डेटा सुरक्षित है?'
      ]
    },
    storyCorrelation: {
      title: 'कहानी ↮ मनी ट्रेल सहसंबंध',
      claimedStory: 'कथित कारण',
      recipientReality: 'प्राप्तकर्ता की सच्चाई',
      networkTrail: 'नेटवर्क ट्रेल',
      statusInconsistent: 'विसंगत (INCONSISTENT)',
      statusUnknown: 'अपुष्ट (UNVERIFIED)',
      statusConsistent: 'संरेखित (ALIGNED)'
    },
    qaAnswers: {
      report1930: 'यदि आपने पैसे गंवा दिए हैं या धोखाधड़ी का संदेह है, तो तुरंत 1930 पर राष्ट्रीय साइबर अपराध हेल्पलाइन पर कॉल करें या cybercrime.gov.in पर शिकायत दर्ज करें।',
      qrSafety: 'सुरक्षा नियम: पैसे प्राप्त करने के लिए आपको कभी भी QR कोड स्कैन करने या UPI PIN दर्ज करने की आवश्यकता नहीं होती है। PIN केवल पैसे भेजने के लिए होता है।',
      muleNetwork: 'म्यूल खाते वे बैंक खाते हैं जिनका उपयोग गिरोह चोरी के पैसे को कई चरणों में छुपाने के लिए करते हैं। Q-NETRA इन गिरोहों को समय पर पहचानता है।',
      apkMalware: 'AnyDesk, QuickSupport जैसे ऐप्स या SMS में आए APK लिंक कभी इंस्टॉल न करें। वे धोखेबाजों को आपका OTP चुराने की अनुमति देते हैं।',
      whyFlaggedStop: (amt: number, vpa: string) =>
        `सावधान। ₹${amt} के भुगतान को ${vpa} के लिए रोका गया है। दबाव और संदिग्ध म्यूल नेटवर्क कनेक्शन पाए जाने के कारण यह भुगतान रोका गया है। अपना UPI PIN दर्ज न करें।`,
      whyFlaggedVerify: (amt: number, vpa: string) =>
        `सावधानी। ₹${amt} के भुगतान को ${vpa} के लिए सत्यापन की आवश्यकता है। कृपया आगे बढ़ने से पहले प्राप्तकर्ता को स्वतंत्र रूप से सत्यापित करें।`,
      whyFlaggedProceed: (amt: number, vpa: string) =>
        `₹${amt} के भुगतान के लिए ${vpa} में कोई महत्वपूर्ण जोखिम संकेतक नहीं मिले। कृपया आगे बढ़ने से पहले विवरण की समीक्षा करें।`,
      generalAdvice: 'Q-NETRA AI सलाह देता है कि हमेशा अपने बैंकिंग ऐप पर सत्यापित नाम जांचें, जल्दबाजी के दबाव से बचें और UPI PIN दर्ज करने से पहले VPA की पुष्टि करें।'
    }
  },

  mr: {
    name: 'Marathi',
    stop: {
      title: 'थांबा (STOP)',
      subtitle: 'उच्च जोखीम आढळली.',
      voiceMessage: 'सावधान. या पेमेंटमध्ये उच्च जोखीम आढळली आहे. कृपया हे पेमेंट करू नका. तुमचा UPI PIN टाकू नका.',
      actionBadge: 'कृती: पेमेंट करू नका (DO NOT PROCEED)',
      evidenceHeader: 'आम्ही पेमेंट का थांबवले',
      evidencePillars: [
        'पेमेंटचा दबाव आढळला (तातडीने वीज कापण्याची किंवा दंडाची धमकी)',
        'प्राप्तकर्त्यामध्ये उच्च जोखीम निर्देशक आणि म्यूल नेटवर्क संबंध आढळले',
        'उपलब्ध नेटवर्क पुरावे पेमेंटच्या संदर्भाशी विसंगत आहेत'
      ]
    },
    verify: {
      title: 'पडताळणी करा (VERIFY)',
      subtitle: 'अतिरिक्त पडताळणीची शिफारस केली जाते.',
      voiceMessage: 'सावधगिरी. या पेमेंटची पडताळणी करणे आवश्यक आहे. कृपया पुढे जाण्यापूर्वी प्राप्तकर्त्याची स्वतंत्रपणे पडताळणी करा.',
      actionBadge: 'कृती: प्राप्तकर्त्याची पडताळणी करा',
      evidenceHeader: 'अनुपलब्ध पडताळणी पुरावे',
      evidencePillars: [
        'UPI हँडल 30 दिवसांपेक्षा कमी काळापासून सक्रिय आहे, कोणताही जुना विश्वासार्ह इतिहास नाही',
        'नेटवर्कवर प्राप्तकर्त्याची विश्वास पातळी कमी आहे'
      ]
    },
    proceed: {
      title: 'पुढे जा (PROCEED)',
      subtitle: 'कोणतेही लक्षणीय जोखीम निर्देशक आढळले नाहीत.',
      voiceMessage: 'कोणतेही लक्षणीय जोखीम निर्देशक आढळले नाहीत. कृपया पुढे जाण्यापूर्वी पेमेंट तपशीलांचे पुनरावलोकन करा.',
      actionBadge: 'कृती: तपशील तपासा आणि पुढे जा',
      evidenceHeader: 'सत्यापित पुरावे',
      evidencePillars: [
        'सामान्य प्रामाणिक पेमेंट उद्देश, कोणताही दबाव नाही',
        'सत्यापित कॉर्पोरेट KYC एंटरप्राइझ खाते',
        'अनुसूचित व्यावसायिक बँकेचा थेट व्यवहार मार्ग'
      ]
    },
    voiceUi: {
      playWarning: 'इशारा ऐका',
      replayWarning: 'इशारा पुन्हा ऐका',
      speaking: 'इशारा बोलत आहे...',
      voiceUnavailable: 'या डिव्हाइसवर आवाज उपलब्ध नाही.',
      voiceDisclaimer: 'आवाज आउटपुट डिव्हाइस/ब्राउझरच्या स्पीच सेवेवर अवलंबून आहे.',
      voiceAlertsToggle: 'व्हॉइस सुरक्षा अलर्ट',
      voiceAlertsOn: 'आवाज: चालू',
      voiceAlertsOff: 'आवाज: बंद',
      languageLabel: 'भाषा',
      selectLanguage: 'भाषा निवडा',
      attemptingToSend: 'पेमेंट करण्याचा प्रयत्न',
      protectedAnalysis: 'संरक्षित विश्लेषण',
      whyButton: 'का?',
      networkButton: 'नेटवर्क',
      voiceQaButton: 'व्हॉइस प्रश्नोत्तरे',
      networkCheckTitle: 'नेटवर्क तपासणी',
      networkSummary: (connected: number, elevated: number) =>
        `${connected} जोडलेले खाते/संस्था, ${elevated} उच्च जोखीम कनेक्शन.`,
      dataMinimizationTitle: 'डेटा सुरक्षा (आम्ही काय पाठवतो)',
      askAiContext: (vpa: string, amt: number) => `संदर्भ: ${vpa} (₹${amt})`,
      askAiGreeting: (vpa: string, risk: string) => {
        const riskLabel = risk === 'HIGH RISK' ? 'उच्च जोखीम (HIGH RISK)' : risk === 'MODERATE' ? 'पडताळणी आवश्यक (VERIFY)' : 'सुरक्षित (SAFE)';
        return `${vpa} (${riskLabel}) साठी व्हॉइस सहाय्यक सक्रिय आहे. "Hi Q-NETRA" बोला किंवा पेमेंटबद्दल काहीही विचारा.`;
      },
      askAiPlaceholder: 'विचारा किंवा बोला: "हे का थांबवले?"',
      quickQuestions: [
        'का?',
        'हे पेमेंट सुरक्षित आहे का?',
        'हे का थांबवले?',
        'मी कोणाला पैसे पाठवत आहे?',
        'पैसे कुठे जातात?',
        'कॅमेरा डेटा खाजगी आहे का?'
      ]
    },
    storyCorrelation: {
      title: 'कथा ↮ मनी ट्रेल सहसंबंध',
      claimedStory: 'दावा केलेले कारण',
      recipientReality: 'प्राप्तकर्त्याचे वास्तव',
      networkTrail: 'नेटवर्क ट्रेल',
      statusInconsistent: 'विसंगत (INCONSISTENT)',
      statusUnknown: 'अपुष्ट (UNVERIFIED)',
      statusConsistent: 'जुळलेले (ALIGNED)'
    },
    qaAnswers: {
      report1930: 'जर तुमचे पैसे गेले असतील किंवा फसवणुकीचा संशय असेल, तर तातडीने गोल्डन अवरमध्ये 1930 वर राष्ट्रीय सायबर गुन्हे हेल्पलाईनला कॉल करा किंवा cybercrime.gov.in वर तक्रार नोंदवा.',
      qrSafety: 'सुरक्षा नियम: पैसे मिळवण्यासाठी तुम्हाला कधीही QR कोड स्कॅन करण्याची किंवा UPI PIN टाकण्याची गरज नसते. PIN फक्त पैसे पाठवण्यासाठी असतो.',
      muleNetwork: 'म्यूल खाती ही अशी बँक खाती असतात जी टोळ्या चोरीचे पैसे लपवण्यासाठी वापरतात. Q-NETRA ही खाती वेळेत शोधून काढते.',
      apkMalware: 'AnyDesk, QuickSupport सारखे ॲप्स किंवा SMS मध्ये आलेली APK लिंक कधीही इन्स्टॉल करू नका. यामुळे भामटे तुमचा OTP चोरू शकतात.',
      whyFlaggedStop: (amt: number, vpa: string) =>
        `सावधान. ₹${amt} चे पेमेंट ${vpa} साठी थांबवले आहे. दबाव आणि संशयास्पद नेटवर्क आढळल्यामुळे हे पेमेंट रोखण्यात आले आहे. तुमचा UPI PIN टाकू नका.`,
      whyFlaggedVerify: (amt: number, vpa: string) =>
        `सावधगिरी. ₹${amt} चे पेमेंट ${vpa} साठी पडताळणी आवश्यक आहे. कृपया पुढे जाण्यापूर्वी प्राप्तकर्त्याची स्वतंत्रपणे पडताळणी करा.`,
      whyFlaggedProceed: (amt: number, vpa: string) =>
        `₹${amt} च्या पेमेंटमध्ये ${vpa} साठी कोणतेही लक्षणीय जोखीम निर्देशक आढळले नाहीत. कृपया पुढे जाण्यापूर्वी तपशील तपासा.`,
      generalAdvice: 'Q-NETRA AI चा सल्ला आहे की बँकिंग ॲपवर नाव नेहमी तपासा, दबावाखाली येऊ नका आणि UPI PIN टाकण्यापूर्वी VPA ची खात्री करा.'
    }
  },

  bn: {
    name: 'Bengali',
    stop: {
      title: 'থামুন (STOP)',
      subtitle: 'উচ্চ ঝুঁকি সনাক্ত হয়েছে।',
      voiceMessage: 'সাবধান। এই অর্থপ্রদানে উচ্চ ঝুঁকি সনাক্ত হয়েছে। অনুগ্রহ করে এই অর্থপ্রদান এগিয়ে নেবেন না। আপনার UPI PIN লিখবেন না।',
      actionBadge: 'পদক্ষেপ: এগিয়ে যাবেন না (DO NOT PROCEED)',
      evidenceHeader: 'আমরা কেন থামিয়েছি',
      evidencePillars: [
        'অর্থপ্রদানের চাপ সনাক্ত হয়েছে (বিদ্যুৎ বিচ্ছিন্ন করার জরুরি হুমকি)',
        'প্রাপকের মধ্যে উচ্চ ঝুঁকি সূচক এবং মিউল নেটওয়ার্কের যোগসূত্র পাওয়া গেছে',
        'উপলব্ধ নেটওয়ার্ক প্রমাণ অর্থপ্রদানের উদ্দেশ্যের সাথে সঙ্গতিপূর্ণ নয়'
      ]
    },
    verify: {
      title: 'যাচাই করুন (VERIFY)',
      subtitle: 'অতিরিক্ত যাচাইকরণের সুপারিশ করা হচ্ছে।',
      voiceMessage: 'সতর্কতা। এই অর্থপ্রদানের যাচাইকরণ প্রয়োজন। এগিয়ে যাওয়ার আগে অনুগ্রহ করে প্রাপককে স্বাধীনভাবে যাচাই করুন।',
      actionBadge: 'পদক্ষেপ: প্রাপককে যাচাই করুন',
      evidenceHeader: 'অনুপস্থিত যাচাইকরণ প্রমাণ',
      evidencePillars: [
        'UPI হ্যান্ডেল ৩০ দিনের কম সময় ধরে সক্রিয়, কোনো অতীত লেনদেনের ইতিহাস নেই',
        'পিয়ার নেটওয়ার্কে প্রাপকের বিশ্বাসযোগ্যতা কম'
      ]
    },
    proceed: {
      title: 'এগিয়ে যান (PROCEED)',
      subtitle: 'কোন উল্লেখযোগ্য ঝুঁকি নির্দেশক সনাক্ত করা যায়নি।',
      voiceMessage: 'কোন উল্লেখযোগ্য ঝুঁকি নির্দেশক সনাক্ত করা যায়নি। এগিয়ে যাওয়ার আগে অনুগ্রহ করে অর্থপ্রদানের বিবরণ পর্যালোচনা করুন।',
      actionBadge: 'পদক্ষেপ: বিবরণ পর্যালোচনা করে এগিয়ে যান',
      evidenceHeader: 'যাচাইকৃত লেনদেন প্রমাণ',
      evidencePillars: [
        'স্বাভাবিক প্রামাণিক অর্থপ্রদানের উদ্দেশ্য, কোনো চাপ নেই',
        'যাচাইকৃত কর্পোরেট KYC এন্টারপ্রাইজ অ্যাকাউন্ট',
        'বাণিজ্যিক ব্যাংকের সরাসরি নিষ্পত্তি পথ'
      ]
    },
    voiceUi: {
      playWarning: 'সতর্কবার্তা শুনুন',
      replayWarning: 'সতর্কবার্তা পুনরায় শুনুন',
      speaking: 'সতর্কবার্তা বলা হচ্ছে...',
      voiceUnavailable: 'এই ডিভাইসে ভয়েস অনুপলব্ধ।',
      voiceDisclaimer: 'ভয়েস আউটপুট ডিভাইস/ব্রাউজারের স্পিচ সার্ভিসের উপর নির্ভরশীল।',
      voiceAlertsToggle: 'ভয়েস নিরাপত্তা সতর্কতা',
      voiceAlertsOn: 'ভয়েস: চালু',
      voiceAlertsOff: 'ভয়েস: বন্ধ',
      languageLabel: 'ভাষা',
      selectLanguage: 'ভাষা নির্বাচন করুন',
      attemptingToSend: 'অর্থ পাঠানোর চেষ্টা',
      protectedAnalysis: 'সুরক্ষিত বিশ্লেষণ',
      whyButton: 'কেন?',
      networkButton: 'নেটওয়ার্ক',
      voiceQaButton: 'ভয়েস প্রশ্নোত্তর',
      networkCheckTitle: 'নেটওয়ার্ক পরীক্ষা',
      networkSummary: (connected: number, elevated: number) =>
        `${connected} সংযুক্ত অ্যাকাউন্ট, ${elevated} উচ্চ ঝুঁকিপূর্ণ সংযোগ।`,
      dataMinimizationTitle: 'তথ্য নিরাপত্তা (আমরা কি পাঠাই)',
      askAiContext: (vpa: string, amt: number) => `প্রসঙ্গ: ${vpa} (₹${amt})`,
      askAiGreeting: (vpa: string, risk: string) => {
        const riskLabel = risk === 'HIGH RISK' ? 'উচ্চ ঝুঁকি (HIGH RISK)' : risk === 'MODERATE' ? 'যাচাই প্রয়োজন (VERIFY)' : 'নিরাপদ (SAFE)';
        return `${vpa} (${riskLabel}) এর জন্য ভয়েস সহকারী সক্রিয়। "Hi Q-NETRA" বলুন বা পেমেন্ট সম্পর্কে কিছু জিজ্ঞাসা করুন।`;
      },
      askAiPlaceholder: 'জিজ্ঞাসা করুন বা বলুন: "এটি কেন থামানো হল?"',
      quickQuestions: [
        'এটি কি নিরাপদ?',
        'এটি কেন থামানো হল?',
        'আমি কাকে টাকা দিচ্ছি?',
        'টাকা কোথায় যায়?',
        'ক্যামেরা তথ্য কি সুরক্ষিত?'
      ]
    },
    storyCorrelation: {
      title: 'দাবি ↮ নেটওয়ার্ক ট্রেল মিল',
      claimedStory: 'দাবিকৃত কারণ',
      recipientReality: 'প্রাপকের বাস্তবতা',
      networkTrail: 'নেটওয়ার্ক ট্রেল',
      statusInconsistent: 'অসঙ্গতিপূর্ণ (INCONSISTENT)',
      statusUnknown: 'অযাচাইকৃত (UNVERIFIED)',
      statusConsistent: 'সামঞ্জস্যপূর্ণ (ALIGNED)'
    },
    qaAnswers: {
      report1930: 'আপনি প্রতারিত হলে অবিলম্বে 1930 নম্বরে জাতীয় সাইবার ক্রাইম হেল্পলাইনে কল করুন বা cybercrime.gov.in-এ অভিযোগ করুন।',
      qrSafety: 'নিরাপত্তা নিয়ম: টাকা পাওয়ার জন্য আপনাকে কখনই QR কোড স্ক্যান করতে বা UPI PIN দিতে হয় না। PIN কেবল টাকা পাঠানোর জন্য।',
      muleNetwork: 'মিউল অ্যাকাউন্ট হল গ্যাংদের দ্বারা ব্যবহৃত ব্যাংক অ্যাকাউন্ট। Q-NETRA এদের সময়মতো সনাক্ত করে।',
      apkMalware: 'AnyDesk বা SMS এ আসা কোনো অজানা APK লিঙ্ক ইনস্টল করবেন না। এটি আপনার OTP চুরি করতে পারে।',
      whyFlaggedStop: (amt: number, vpa: string) =>
        `সাবধান। ₹${amt} এর পেমেন্ট ${vpa} এর জন্য থামানো হয়েছে। চাপের লক্ষণ এবং ঝুঁকিপূর্ণ নেটওয়ার্ক সংযোগ পাওয়ার কারণে এই লেনদেন বন্ধ করা হয়েছে। আপনার UPI PIN দেবেন না।`,
      whyFlaggedVerify: (amt: number, vpa: string) =>
        `সতর্কতা। ₹${amt} এর পেমেন্ট ${vpa} এর জন্য যাচাই প্রয়োজন। এগিয়ে যাওয়ার আগে প্রাপককে স্বাধীনভাবে যাচাই করুন।`,
      whyFlaggedProceed: (amt: number, vpa: string) =>
        `₹${amt} এর পেমেন্টে ${vpa} এর জন্য কোনো উল্লেখযোগ্য ঝুঁকি পাওয়া যায়নি। বিবরণ পর্যালোচনা করে এগিয়ে যান।`,
      generalAdvice: 'Q-NETRA AI সর্বদা ব্যাঙ্কিং অ্যাপে প্রাপকের নাম যাচাই করার পরামর্শ দেয়।'
    }
  },

  ta: {
    name: 'Tamil',
    stop: {
      title: 'நிறுத்துங்கள் (STOP)',
      subtitle: 'அதிக ஆபத்து கண்டறியப்பட்டது.',
      voiceMessage: 'எச்சரிக்கை. இந்த கட்டணத்தில் அதிக ஆபத்து கண்டறியப்பட்டுள்ளது. தயவுசெய்து இந்த கட்டணத்தை தொடர வேண்டாம். உங்கள் UPI PIN உள்ளிட வேண்டாம்.',
      actionBadge: 'செயல்: தொடர வேண்டாம் (DO NOT PROCEED)',
      evidenceHeader: 'நாங்கள் ஏன் நிறுத்தினோம்',
      evidencePillars: [
        'கட்டாய கட்டண அச்சுறுத்தல் கண்டறியப்பட்டது (அவசர மின்சார துண்டிப்பு மிரட்டல்)',
        'பெறுநரிடம் அதிக ஆபத்து குறிகாட்டிகள் மற்றும் மோசடி நெட்வொர்க் இணைப்புகள் உள்ளன',
        'கிடைக்கக்கூடிய நெட்வொர்க் சான்றுகள் கட்டண சூழலுக்கு முரணாக உள்ளன'
      ]
    },
    verify: {
      title: 'சரிபார்க்கவும் (VERIFY)',
      subtitle: 'கூடுதல் சரிபார்ப்பு பரிந்துரைக்கப்படுகிறது.',
      voiceMessage: 'கவனம். இந்த கட்டணத்திற்கு சரிபார்ப்பு தேவை. தொடர்வதற்கு முன் பெறுநரை தனிப்பட்ட முறையில் சரிபார்க்கவும்.',
      actionBadge: 'செயல்: பெறுநரை சரிபார்க்கவும்',
      evidenceHeader: 'இல்லாத சரிபார்ப்பு சான்றுகள்',
      evidencePillars: [
        'UPI முகவரி 30 நாட்களுக்கும் குறைவாகவே செயலில் உள்ளது, முந்தைய வரலாறு இல்லை',
        'நெட்வொர்க்கில் பெறுநரின் நம்பிக்கை நிலை குறைவாக உள்ளது'
      ]
    },
    proceed: {
      title: 'தொடரவும் (PROCEED)',
      subtitle: 'குறிப்பிடத்தக்க ஆபத்து குறிகாட்டிகள் எதுவும் கண்டறியப்படவில்லை.',
      voiceMessage: 'குறிப்பிடத்தக்க ஆபத்து குறிகாட்டிகள் எதுவும் கண்டறியப்படவில்லை. தொடர்வதற்கு முன் கட்டண விவரங்களை மதிப்பாய்வு செய்யவும்.',
      actionBadge: 'செயல்: மதிப்பாய்வு செய்து தொடரவும்',
      evidenceHeader: 'சரிபார்க்கப்பட்ட சான்றுகள்',
      evidencePillars: [
        'சாதாரண உண்மையான கட்டண நோக்கம், அச்சுறுத்தல் இல்லை',
        'சரிபார்க்கப்பட்ட கார்ப்பரேட் KYC கணக்கு',
        'நேரடி வணிக வங்கி பரிவர்த்தனை பாதை'
      ]
    },
    voiceUi: {
      playWarning: 'எச்சரிக்கையைக் கேளுங்கள்',
      replayWarning: 'மீண்டும் கேளுங்கள்',
      speaking: 'எச்சரிக்கை பேசப்படுகிறது...',
      voiceUnavailable: 'இந்த சாதனத்தில் குரல் கிடைக்கவில்லை.',
      voiceDisclaimer: 'குரல் வெளியீடு சாதனம்/உலாவியின் பேச்சு சேவையை சார்ந்துள்ளது.',
      voiceAlertsToggle: 'குரல் பாதுகாப்பு எச்சரிக்கைகள்',
      voiceAlertsOn: 'குரல்: ஆன்',
      voiceAlertsOff: 'குரல்: ஆஃப்',
      languageLabel: 'மொழி',
      selectLanguage: 'மொழியைத் தேர்ந்தெடுக்கவும்',
      attemptingToSend: 'அனுப்ப முயற்சிக்கும் தொகை',
      protectedAnalysis: 'பாதுகாக்கப்பட்ட பகுப்பாய்வு',
      whyButton: 'ஏன்?',
      networkButton: 'நெட்வொர்க்',
      voiceQaButton: 'குரல் கேள்வி-பதில்',
      networkCheckTitle: 'நெட்வொர்க் சோதனை',
      networkSummary: (connected: number, elevated: number) =>
        `${connected} இணைக்கப்பட்ட கணக்குகள், ${elevated} அதிக ஆபத்து இணைப்புகள்.`,
      dataMinimizationTitle: 'தரவு பாதுகாப்பு (நாங்கள் எதை அனுப்புகிறோம்)',
      askAiContext: (vpa: string, amt: number) => `சூழல்: ${vpa} (₹${amt})`,
      askAiGreeting: (vpa: string, risk: string) => {
        const riskLabel = risk === 'HIGH RISK' ? 'அதிக ஆபத்து (HIGH RISK)' : risk === 'MODERATE' ? 'சரிபார்ப்பு தேவை (VERIFY)' : 'பாதுகாப்பானது (SAFE)';
        return `${vpa} (${riskLabel}) க்கான குரல் உதவியாளர் செயலில் உள்ளது. "Hi Q-NETRA" என்று சொல்லுங்கள் அல்லது கேளுங்கள்.`;
      },
      askAiPlaceholder: 'கேளுங்கள் அல்லது பேசுங்கள்: "இது ஏன் நிறுத்தப்பட்டது?"',
      quickQuestions: [
        'இது பாதுகாப்பானதா?',
        'இது ஏன் நிறுத்தப்பட்டது?',
        'நான் யாருக்கு பணம் செலுத்துகிறேன்?',
        'பணம் எங்கே போகிறது?',
        'கேமரா தரவு பாதுகாப்பானதா?'
      ]
    },
    storyCorrelation: {
      title: 'கூற்று ↮ நெட்வொர்க் தொடர்பு',
      claimedStory: 'கூறப்பட்ட காரணம்',
      recipientReality: 'பெறுநரின் உண்மை நிலை',
      networkTrail: 'நெட்வொர்க் தடம்',
      statusInconsistent: 'முரண்பாடானது (INCONSISTENT)',
      statusUnknown: 'சரிபார்க்கப்படாதது (UNVERIFIED)',
      statusConsistent: 'பொருந்துகிறது (ALIGNED)'
    },
    qaAnswers: {
      report1930: 'பண இழப்பு ஏற்பட்டால் உடனடியாக 1930 என்ற தேசிய சைபர் கிரைம் உதவி எண்ணை அழைக்கவும் அல்லது cybercrime.gov.in இல் புகார் செய்யவும்.',
      qrSafety: 'பாதுகாப்பு விதி: பணம் பெற QR குறியீட்டை ஸ்கேன் செய்யவோ அல்லது UPI PIN உள்ளிடவோ தேவையில்லை. PIN பணம் அனுப்ப மட்டுமே.',
      muleNetwork: 'மியூல் கணக்குகள் திருடப்பட்ட பணத்தை மறைக்க மோசடி கும்பலால் பயன்படுத்தப்படும் கணக்குகள் ஆகும்.',
      apkMalware: 'AnyDesk போன்ற செயலிகளையோ அல்லது SMS இல் வரும் APK இணைப்புகளையோ ஒருபோதும் நிறுவ வேண்டாம்.',
      whyFlaggedStop: (amt: number, vpa: string) =>
        `எச்சரிக்கை. ₹${amt} தொகை ${vpa} கணக்கிற்கு செலுத்தப்படுவது நிறுத்தப்பட்டுள்ளது. அச்சுறுத்தல் மற்றும் மோசடி இணைப்புகள் கண்டறியப்பட்டதால் பரிவர்த்தனை நிறுத்தப்பட்டது. UPI PIN உள்ளிட வேண்டாம்.`,
      whyFlaggedVerify: (amt: number, vpa: string) =>
        `கவனம். ₹${amt} தொகை ${vpa} கணக்கிற்கு செலுத்தப்படுவதற்கு சரிபார்ப்பு தேவை. தொடர்வதற்கு முன் சரிபார்க்கவும்.`,
      whyFlaggedProceed: (amt: number, vpa: string) =>
        `₹${amt} கட்டணத்தில் ${vpa} க்கு எந்த முக்கிய ஆபத்தும் கண்டறியப்படவில்லை. தொடர்வதற்கு முன் விவரங்களை மதிப்பாய்வு செய்யவும்.`,
      generalAdvice: 'வங்கி செயலியில் உள்ள பெயரை எப்போதும் சரிபார்க்கவும், அவசரத்திற்கு ஆளாக வேண்டாம் என்று Q-NETRA AI அறிவுறுத்துகிறது.'
    }
  },

  te: {
    name: 'Telugu',
    stop: {
      title: 'ఆపండి (STOP)',
      subtitle: 'అధిక ప్రమాదం గుర్తించబడింది.',
      voiceMessage: 'హెచ్చరిక. ఈ చెల్లింపులో అధిక ప్రమాదం గుర్తించబడింది. దయచేసి ఈ చెల్లింపుతో ముందుకు సాగవద్దు. మీ UPI PIN నమోదు చేయవద్దు.',
      actionBadge: 'చర్య: ముందుకు సాగవద్దు (DO NOT PROCEED)',
      evidenceHeader: 'మేము ఎందుకు ఆపాము',
      evidencePillars: [
        'చెల్లింపు ఒత్తిడి గుర్తించబడింది (విద్యుత్ నిలిపివేత లేదా పెనాల్టీ బెదిరింపు)',
        'గ్రహీత ఖాతాలో అధిక ప్రమాద సూచికలు మరియు మ్యూల్ నెట్‌వర్క్ సంబంధాలు ఉన్నాయి',
        'అందుబాటులో ఉన్న నెట్‌వర్క్ సాక్ష్యాలు చెల్లింపు సందర్భానికి విరుద్ధంగా ఉన్నాయి'
      ]
    },
    verify: {
      title: 'ధృవీకరించండి (VERIFY)',
      subtitle: 'అదనపు ధృవీకరణ సిఫార్సు చేయబడింది.',
      voiceMessage: 'జాగ్రత్త. ఈ చెల్లింపునకు ధృవీకరణ అవసరం. ముందుకు సాగే ముందు గ్రహీతను స్వతంత్రంగా ధృవీకరించండి.',
      actionBadge: 'చర్య: గ్రహీతను ధృవీకరించండి',
      evidenceHeader: 'ధృవీకరణ సాక్ష్యం లేదు',
      evidencePillars: [
        'UPI హ్యాండిల్ 30 రోజుల కంటే తక్కువ సమయం నుండి సక్రియంగా ఉంది, మునుపటి చరిత్ర లేదు',
        'నెట్‌వర్క్‌లో గ్రహీత విశ్వసనీయత తక్కువగా ఉంది'
      ]
    },
    proceed: {
      title: 'కొనసాగించండి (PROCEED)',
      subtitle: 'ఎటువంటి ముఖ్యమైన ప్రమాద సూచికలు కనుగొనబడలేదు.',
      voiceMessage: 'ఎటువంటి ముఖ్యమైన ప్రమాద సూచికలు కనుగొనబడలేదు. ముందుకు సాగే ముందు చెల్లింపు వివరాలను సమీక్షించండి.',
      actionBadge: 'చర్య: సమీక్షించి కొనసాగించండి',
      evidenceHeader: 'ధృవీకరించబడిన సాక్ష్యాలు',
      evidencePillars: [
        'సాధారణ ప్రామాణిక చెల్లింపు ఉద్దేశ్యం, ఎలాంటి ఒత్తిడి లేదు',
        'ధృవీకరించబడిన కార్పొరేట్ KYC వ్యాపార ఖాతా',
        'వాణిజ్య బ్యాంకు ప్రత్యక్ష చెల్లింపు మార్గం'
      ]
    },
    voiceUi: {
      playWarning: 'హెచ్చరిక వినండి',
      replayWarning: 'మళ్లీ వినండి',
      speaking: 'హెచ్చరిక వినిపిస్తోంది...',
      voiceUnavailable: 'ఈ పరికరంలో వాయిస్ అందుబాటులో లేదు.',
      voiceDisclaimer: 'వాయిస్ అవుట్‌పుట్ పరికరం/బ్రౌజర్ స్పీచ్ సర్వీస్‌పై ఆధారపడి ఉంటుంది.',
      voiceAlertsToggle: 'వాయిస్ భద్రతా హెచ్చరికలు',
      voiceAlertsOn: 'వాయిస్: ఆన్',
      voiceAlertsOff: 'వాయిస్: ఆఫ్',
      languageLabel: 'భాష',
      selectLanguage: 'భాషను ఎంచుకోండి',
      attemptingToSend: 'పంపడానికి ప్రయత్నిస్తున్న మొత్తం',
      protectedAnalysis: 'రక్షిత విశ్లేషణ',
      whyButton: 'ఎందుకు?',
      networkButton: 'నెట్‌వర్క్',
      voiceQaButton: 'వాయిస్ ప్రశ్నలు',
      networkCheckTitle: 'నెట్‌వర్క్ తనిఖీ',
      networkSummary: (connected: number, elevated: number) =>
        `${connected} కనెక్ట్ చేయబడిన ఖాతాలు, ${elevated} అధిక ప్రమాద కనెక్షన్‌లు.`,
      dataMinimizationTitle: 'డేటా భద్రత (మేము ఏమి పంపుతాము)',
      askAiContext: (vpa: string, amt: number) => `సందర్భం: ${vpa} (₹${amt})`,
      askAiGreeting: (vpa: string, risk: string) => {
        const riskLabel = risk === 'HIGH RISK' ? 'అధిక ప్రమాదం (HIGH RISK)' : risk === 'MODERATE' ? 'ధృవీకరణ అవసరం (VERIFY)' : 'సురక్షితం (SAFE)';
        return `${vpa} (${riskLabel}) కోసం వాయిస్ అసిస్టెంట్ సిద్ధంగా ఉంది. "Hi Q-NETRA" అని చెప్పండి లేదా అడగండి.`;
      },
      askAiPlaceholder: 'అడగండి లేదా మాట్లాడండి: "ఇది ఎందుకు ఆపబడింది?"',
      quickQuestions: [
        'ఇది సురక్షితమేనా?',
        'ఇది ఎందుకు ఆపబడింది?',
        'నేను ఎవరికి చెల్లిస్తున్నాను?',
        'డబ్బు ఎక్కడికి వెళుతుంది?',
        'కెమెరా డేటా సురక్షితమేనా?'
      ]
    },
    storyCorrelation: {
      title: 'కథ ↮ నెట్‌వర్క్ ట్రయల్ సంబంధం',
      claimedStory: 'చెప్పబడిన కారణం',
      recipientReality: 'గ్రహీత వాస్తవికత',
      networkTrail: 'నెట్‌వర్క్ ట్రయల్',
      statusInconsistent: 'విరుద్ధమైనది (INCONSISTENT)',
      statusUnknown: 'ధృవీకరించబడలేదు (UNVERIFIED)',
      statusConsistent: 'సరిపోలింది (ALIGNED)'
    },
    qaAnswers: {
      report1930: 'డబ్బు పోగొట్టుకుంటే వెంటనే 1930 జాతీయ సైబర్ క్రైమ్ హెల్ప్‌లైన్‌కు కాల్ చేయండి లేదా cybercrime.gov.in లో ఫిర్యాదు చేయండి.',
      qrSafety: 'భద్రతా నియమం: డబ్బును స్వీకరించడానికి మీరు ఎప్పుడూ QR కోడ్‌ను స్కాన్ చేయనవసరం లేదు లేదా UPI PIN నమోదు చేయనవసరం లేదు.',
      muleNetwork: 'మ్యూల్ ఖాతాలు దొంగిలించబడిన డబ్బును లాండరింగ్ చేయడానికి ముఠాలు అద్దెకు తీసుకునే బ్యాంక్ ఖాతాలు.',
      apkMalware: 'AnyDesk వంటి యాప్‌లను లేదా SMS లో వచ్చిన APK లింక్‌లను ఎప్పుడూ ఇన్‌స్టాల్ చేయవద్దు.',
      whyFlaggedStop: (amt: number, vpa: string) =>
        `హెచ్చరిక. ₹${amt} చెల్లింపు ${vpa} కు ఆపబడింది. ముప్పు సూచికలు మరియు మ్యూల్ సంబంధాలు కనుగొనబడినందున లావాదేవీ నిలిపివేయబడింది. మీ UPI PIN నమోదు చేయవద్దు.`,
      whyFlaggedVerify: (amt: number, vpa: string) =>
        `జాగ్రత్త. ₹${amt} చెల్లింపు ${vpa} కు ధృవీకరణ అవసరం. ముందుకు సాగే ముందు గ్రహీతను ధృవీకరించండి.`,
      whyFlaggedProceed: (amt: number, vpa: string) =>
        `₹${amt} చెల్లింపులో ${vpa} కోసం ఎటువంటి ప్రమాద సూచికలు లేవు. ముందుకు సాగే ముందు వివరాలను సమీక్షించండి.`,
      generalAdvice: 'బ్యాంకింగ్ యాప్‌లో పేరును ఎల్లప్పుడూ తనిఖీ చేయాలని Q-NETRA AI సలహా ఇస్తుంది.'
    }
  },

  kn: {
    name: 'Kannada',
    stop: {
      title: 'ನಿಲ್ಲಿಸಿ (STOP)',
      subtitle: 'ಹೆಚ್ಚಿನ ಅಪಾಯ ಪತ್ತೆಯಾಗಿದೆ.',
      voiceMessage: 'ಎಚ್ಚರಿಕೆ. ಈ ಪಾವತಿಯಲ್ಲಿ ಹೆಚ್ಚಿನ ಅಪಾಯ ಪತ್ತೆಯಾಗಿದೆ. ದಯವಿಟ್ಟು ಈ ಪಾವತಿಯನ್ನು ಮುಂದುವರಿಸಬೇಡಿ. ನಿಮ್ಮ UPI PIN ನಮೂದಿಸಬೇಡಿ.',
      actionBadge: 'ಕ್ರಮ: ಮುಂದುವರಿಯಬೇಡಿ (DO NOT PROCEED)',
      evidenceHeader: 'ನಾವು ಏಕೆ ನಿಲ್ಲಿಸಿದ್ದೇವೆ',
      evidencePillars: [
        'ಪಾವತಿ ಒತ್ತಡ ಪತ್ತೆಯಾಗಿದೆ (ತುರ್ತು ವಿದ್ಯುತ್ ಸಂಪರ್ಕ ಕಡಿತ ಬೆದರಿಕೆ)',
        'ಸ್ವೀಕೃತಿದಾರರಲ್ಲಿ ಹೆಚ್ಚಿನ ಅಪಾಯದ ಸೂಚಕಗಳು ಮತ್ತು ಮ್ಯೂಲ್ ನೆಟ್‌ವರ್ಕ್ ಲಿಂಕ್‌ಗಳು ಕಂಡುಬಂದಿವೆ',
        'ಲಭ್ಯವಿರುವ ನೆಟ್‌ವರ್ಕ್ ಪುರಾವೆಗಳು ಪಾವತಿ ಸಂದರ್ಭಕ್ಕೆ ವಿರುದ್ಧವಾಗಿವೆ'
      ]
    },
    verify: {
      title: 'ಪರಿಶೀಲಿಸಿ (VERIFY)',
      subtitle: 'ಹೆಚ್ಚುವರಿ ಪರಿಶೀಲನೆಯನ್ನು ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.',
      voiceMessage: 'ಎಚ್ಚರಿಕೆ. ಈ ಪಾವತಿಗೆ ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ. ಮುಂದುವರಿಯುವ ಮೊದಲು ಸ್ವತಂತ್ರವಾಗಿ ಸ್ವೀಕೃತಿದಾರರನ್ನು ಪರಿಶೀಲಿಸಿ.',
      actionBadge: 'ಕ್ರಮ: ಸ್ವೀಕೃತಿದಾರರನ್ನು ಪರಿಶೀಲಿಸಿ',
      evidenceHeader: 'ಪರಿಶೀಲನೆ ಪುರಾವೆಗಳ ಕೊರತೆ',
      evidencePillars: [
        'UPI ಹ್ಯಾಂಡಲ್ 30 ದಿನಗಳಿಗಿಂತ ಕಡಿಮೆ ಅವಧಿಗೆ ಸಕ್ರಿಯವಾಗಿದೆ, ಹಿಂದಿನ ಇತಿಹಾಸವಿಲ್ಲ',
        'ನೆಟ್‌ವರ್ಕ್‌ನಲ್ಲಿ ಸ್ವೀಕೃತಿದಾರರ ವಿಶ್ವಾಸಾರ್ಹತೆ ಕಡಿಮೆಯಾಗಿದೆ'
      ]
    },
    proceed: {
      title: 'ಮುಂದುವರಿಯಿರಿ (PROCEED)',
      subtitle: 'ಯಾವುದೇ ಮಹತ್ವದ ಅಪಾಯದ ಸೂಚಕಗಳು ಕಂಡುಬಂದಿಲ್ಲ.',
      voiceMessage: 'ಯಾವುದೇ ಮಹತ್ವದ ಅಪಾಯದ ಸೂಚಕಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಮುಂದುವರಿಯುವ ಮೊದಲು ಪಾವತಿ ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
      actionBadge: 'ಕ್ರಮ: ಪರಿಶೀಲಿಸಿ ಮುಂದುವರಿಯಿರಿ',
      evidenceHeader: 'ಪರಿಶೀಲಿಸಿದ ಪುರಾವೆಗಳು',
      evidencePillars: [
        'ಸಾಮಾನ್ಯ ನೈಜ ಪಾವತಿ ಉದ್ದೇಶ, ಯಾವುದೇ ಒತ್ತಡವಿಲ್ಲ',
        'ಪರಿಶೀಲಿಸಿದ ಕಾರ್ಪೊರೇಟ್ KYC ಖಾತೆ',
        'ವಾಣಿಜ್ಯ ಬ್ಯಾಂಕಿನ ನೇರ ವಹಿವಾಟು ಮಾರ್ಗ'
      ]
    },
    voiceUi: {
      playWarning: 'ಎಚ್ಚರಿಕೆ ಆಲಿಸಿ',
      replayWarning: 'ಮತ್ತೆ ಆಲಿಸಿ',
      speaking: 'ಎಚ್ಚರಿಕೆ ಹೇಳಲಾಗುತ್ತಿದೆ...',
      voiceUnavailable: 'ಈ ಸಾಧನದಲ್ಲಿ ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ.',
      voiceDisclaimer: 'ಧ್ವನಿ ಔಟ್‌ಪುಟ್ ಸಾಧನ/ಬ್ರೌಸರ್‌ನ ಸ್ಪೀಚ್ ಸೇವೆಯನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ.',
      voiceAlertsToggle: 'ಧ್ವನಿ ಸುರಕ್ಷತಾ ಎಚ್ಚರಿಕೆಗಳು',
      voiceAlertsOn: 'ಧ್ವನಿ: ಆನ್',
      voiceAlertsOff: 'ಧ್ವನಿ: ಆಫ್',
      languageLabel: 'ಭಾಷೆ',
      selectLanguage: 'ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ',
      attemptingToSend: 'ಕಳುಹಿಸಲು ಪ್ರಯತ್ನಿಸುತ್ತಿರುವ ಮೊತ್ತ',
      protectedAnalysis: 'ರಕ್ಷಿತ ವಿಶ್ಲೇಷಣೆ',
      whyButton: 'ಏಕೆ?',
      networkButton: 'ನೆಟ್‌ವರ್ಕ್',
      voiceQaButton: 'ಧ್ವನಿ ಪ್ರಶ್ನೋತ್ತರ',
      networkCheckTitle: 'ನೆಟ್‌ವರ್ಕ್ ತಪಾಸಣೆ',
      networkSummary: (connected: number, elevated: number) =>
        `${connected} ಸಂಪರ್ಕಿತ ಖಾತೆಗಳು, ${elevated} ಹೆಚ್ಚಿನ ಅಪಾಯದ ಸಂಪರ್ಕಗಳು.`,
      dataMinimizationTitle: 'ಡೇಟಾ ಸುರಕ್ಷತೆ (ನಾವು ಏನು ಕಳುಹಿಸುತ್ತೇವೆ)',
      askAiContext: (vpa: string, amt: number) => `ಸಂದರ್ಭ: ${vpa} (₹${amt})`,
      askAiGreeting: (vpa: string, risk: string) => {
        const riskLabel = risk === 'HIGH RISK' ? 'ಹೆಚ್ಚಿನ ಅಪಾಯ (HIGH RISK)' : risk === 'MODERATE' ? 'ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ (VERIFY)' : 'ಸುರಕ್ಷಿತ (SAFE)';
        return `${vpa} (${riskLabel}) ಗಾಗಿ ಧ್ವನಿ ಸಹಾಯಕ ಸಕ್ರಿಯವಾಗಿದೆ. "Hi Q-NETRA" ಎಂದು ಹೇಳಿ ಅಥವಾ ಪ್ರಶ್ನಿಸಿ.`;
      },
      askAiPlaceholder: 'ಕೇಳಿ ಅಥವಾ ಮಾತನಾಡಿ: "ಇದನ್ನು ಏಕೆ ನಿಲ್ಲಿಸಲಾಗಿದೆ?"',
      quickQuestions: [
        'ಇದು ಸುರಕ್ಷಿತವೇ?',
        'ಇದನ್ನು ಏಕೆ ನಿಲ್ಲಿಸಲಾಗಿದೆ?',
        'ನಾನು ಯಾರಿಗೆ ಪಾವತಿಸುತ್ತಿದ್ದೇನೆ?',
        'ಹಣ ಎಲ್ಲಿಗೆ ಹೋಗುತ್ತದೆ?',
        'ಕ್ಯಾಮೆರಾ ಡೇಟಾ ಸುರಕ್ಷಿತವೇ?'
      ]
    },
    storyCorrelation: {
      title: 'ಹೇಳಿಕೆ ↮ ನೆಟ್‌ವರ್ಕ್ ಹೋಲಿಕೆ',
      claimedStory: 'ಹೇಳಲಾದ ಕಾರಣ',
      recipientReality: 'ಸ್ವೀಕೃತಿದಾರರ ನೈಜತೆ',
      networkTrail: 'ನೆಟ್‌ವರ್ಕ್ ಟ್ರಯಲ್',
      statusInconsistent: 'ಅಸಂಗತ (INCONSISTENT)',
      statusUnknown: 'ಅಪರಿಶೀಲಿತ (UNVERIFIED)',
      statusConsistent: 'ಹೊಂದಿಕೆಯಾಗಿದೆ (ALIGNED)'
    },
    qaAnswers: {
      report1930: 'ಹಣ ಕಳೆದುಕೊಂಡರೆ ತಕ್ಷಣವೇ 1930 ರಾಷ್ಟ್ರೀಯ ಸೈಬರ್ ಕ್ರೈಮ್ ಸಹಾಯವಾಣಿಗೆ ಕರೆ ಮಾಡಿ ಅಥವಾ cybercrime.gov.in ನಲ್ಲಿ ದೂರು ದಾಖಲಿಸಿ.',
      qrSafety: 'ಸುರಕ್ಷತಾ ನಿಯಮ: ಹಣ ಪಡೆಯಲು ನೀವು ಎಂದಿಗೂ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಬೇಕಾಗಿಲ್ಲ ಅಥವಾ UPI PIN ನಮೂದಿಸಬೇಕಾಗಿಲ್ಲ.',
      muleNetwork: 'ಮ್ಯೂಲ್ ಖಾತೆಗಳು ಕದ್ದ ಹಣವನ್ನು ಸಾಗಿಸಲು ವಂಚಕರು ಬಾಡಿಗೆಗೆ ಪಡೆಯುವ ಬ್ಯಾಂಕ್ ಖಾತೆಗಳಾಗಿವೆ.',
      apkMalware: 'AnyDesk ನಂತಹ ಅಪ್ಲಿಕೇಶನ್‌ಗಳನ್ನು ಅಥವಾ SMS ನಲ್ಲಿ ಬರುವ APK ಲಿಂಕ್‌ಗಳನ್ನು ಎಂದಿಗೂ ಸ್ಥಾಪಿಸಬೇಡಿ.',
      whyFlaggedStop: (amt: number, vpa: string) =>
        `ಎಚ್ಚರಿಕೆ. ₹${amt} ಪಾವತಿಯನ್ನು ${vpa} ಗೆ ನಿಲ್ಲಿಸಲಾಗಿದೆ. ಒತ್ತಡ ಮತ್ತು ಅಪಾಯಕಾರಿ ನೆಟ್‌ವರ್ಕ್ ಸಂಪರ್ಕ ಕಂಡುಬಂದಿರುವುದರಿಂದ ವಹಿವಾಟು ನಿಲ್ಲಿಸಲಾಗಿದೆ. UPI PIN ನಮೂದಿಸಬೇಡಿ.`,
      whyFlaggedVerify: (amt: number, vpa: string) =>
        `ಎಚ್ಚರಿಕೆ. ₹${amt} ಪಾವತಿಗೆ ${vpa} ಪರಿಶೀಲನೆ ಅಗತ್ಯವಿದೆ. ಮುಂದುವರಿಯುವ ಮೊದಲು ಪರಿಶೀಲಿಸಿ.`,
      whyFlaggedProceed: (amt: number, vpa: string) =>
        `₹${amt} ಪಾವತಿಯಲ್ಲಿ ${vpa} ಗೆ ಯಾವುದೇ ಅಪಾಯ ಕಂಡುಬಂದಿಲ್ಲ. ಮುಂದುವರಿಯುವ ಮೊದಲು ವಿವರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.`,
      generalAdvice: 'ಬ್ಯಾಂಕಿಂಗ್ ಅಪ್ಲಿಕೇಶನ್‌ನಲ್ಲಿ ಹೆಸರನ್ನು ಯಾವಾಗಲೂ ಪರಿಶೀಲಿಸಲು Q-NETRA AI ಸಲಹೆ ನೀಡುತ್ತದೆ.'
    }
  },

  gu: {
    name: 'Gujarati',
    stop: {
      title: 'રોકો (STOP)',
      subtitle: 'ઉચ્ચ જોખમ જણાયું.',
      voiceMessage: 'સાવધાન. આ ચુકવણીમાં ઉચ્ચ જોખમ જણાયું છે. કૃપા કરીને આ ચુકવણી આગળ ન વધારશો. તમારો UPI PIN દાખલ કરશો નહીં.',
      actionBadge: 'પગલું: આગળ ન વધશો (DO NOT PROCEED)',
      evidenceHeader: 'અમે ચુકવણી કેમ રોકી',
      evidencePillars: [
        'ચુકવણીનું દબાણ જણાયું (તાત્કાલિક વીજળી કાપવાની અથવા દંડની ધમકી)',
        'મેળવનાર ખાતામાં ઉચ્ચ જોખમ સૂચકાંકો અને મ્યૂલ નેટવર્ક કડીઓ મળી આવી',
        'ઉપલબ્ધ નેટવર્ક પુરાવા ચુકવણીના સંદર્ભ સાથે સુસંગત નથી'
      ]
    },
    verify: {
      title: 'ચકાસો (VERIFY)',
      subtitle: 'વધારાની ચકાસણીની ભલામણ કરવામાં આવે છે.',
      voiceMessage: 'સાવચેતી. આ ચુકવણીની ચકાસણી જરૂરી છે. આગળ વધતાં પહેલાં મેળવનારની સ્વતંત્ર રીતે ચકાસણી કરો.',
      actionBadge: 'પગલું: મેળવનારની ચકાસણી કરો',
      evidenceHeader: 'ચકાસણી પુરાવાનો અભાવ',
      evidencePillars: [
        'UPI હેન્ડલ 30 દિવસથી ઓછા સમયથી સક્રિય છે, કોઈ જૂનો ઇતિહાસ નથી',
        'નેટવર્ક પર મેળવનારની વિશ્વસનીયતા ઓછી છે'
      ]
    },
    proceed: {
      title: 'આગળ વધો (PROCEED)',
      subtitle: 'કોઈ નોંધપાત્ર જોખમ સૂચકાંકો મળ્યા નથી.',
      voiceMessage: 'કોઈ નોંધપાત્ર જોખમ સૂચકાંકો મળ્યા નથી. કૃપા કરીને આગળ વધતાં પહેલાં ચુકવણીની વિગતોની સમીક્ષા કરો.',
      actionBadge: 'પગલું: સમીક્ષા કરો અને આગળ વધો',
      evidenceHeader: 'ચકાસાયેલ પુરાવા',
      evidencePillars: [
        'સામાન્ય વાસ્તવિક ચુકવણી હેતુ, કોઈ દબાણ નથી',
        'ચકાસાયેલ કોર્પોરેટ KYC ખાતું',
        'વાણિજ્યિક બેંકનો સીધો વ્યવહાર માર્ગ'
      ]
    },
    voiceUi: {
      playWarning: 'ચેતવણી સાંભળો',
      replayWarning: 'ફરીથી સાંભળો',
      speaking: 'ચેતવણી બોલાઈ રહી છે...',
      voiceUnavailable: 'આ ઉપકરણ પર અવાજ ઉપલબ્ધ નથી.',
      voiceDisclaimer: 'અવાજ આઉટપુટ ઉપકરણ/બ્રાઉઝરની સ્પીચ સેવા પર આધારિત છે.',
      voiceAlertsToggle: 'વૉઇસ સુરક્ષા ચેતવણીઓ',
      voiceAlertsOn: 'અવાજ: ચાલુ',
      voiceAlertsOff: 'અવાજ: બંધ',
      languageLabel: 'ભાષા',
      selectLanguage: 'ભાષા પસંદ કરો',
      attemptingToSend: 'મોકલવાનો પ્રયાસ',
      protectedAnalysis: 'સંરક્ષિત વિશ્લેષણ',
      whyButton: 'કેમ?',
      networkButton: 'નેટવર્ક',
      voiceQaButton: 'વૉઇસ પ્રશ્નોત્તરી',
      networkCheckTitle: 'નેટવર્ક તપાસ',
      networkSummary: (connected: number, elevated: number) =>
        `${connected} જોડાયેલા ખાતા/સંસ્થાઓ, ${elevated} ઉચ્ચ જોખમ જોડાણો.`,
      dataMinimizationTitle: 'ડેટા સુરક્ષા (અમે શું મોકલીએ છીએ)',
      askAiContext: (vpa: string, amt: number) => `સંદર્ભ: ${vpa} (₹${amt})`,
      askAiGreeting: (vpa: string, risk: string) => {
        const riskLabel = risk === 'HIGH RISK' ? 'ઉચ્ચ જોખમ (HIGH RISK)' : risk === 'MODERATE' ? 'ચકાસણી જરૂરી (VERIFY)' : 'સુરક્ષિત (SAFE)';
        return `${vpa} (${riskLabel}) માટે વૉઇસ સહાયક સક્રિય છે. "Hi Q-NETRA" બોલો અથવા પૂછો.`;
      },
      askAiPlaceholder: 'પૂછો અથવા બોલો: "આ કેમ રોકવામાં આવ્યું?"',
      quickQuestions: [
        'શું આ સુરક્ષિત છે?',
        'આ કેમ રોકવામાં આવ્યું?',
        'હું કોને પૈસા ચૂકવી રહ્યો છું?',
        'પૈસા ક્યાં જાય છે?',
        'શું કેમેરા ડેટા ખાનગી છે?'
      ]
    },
    storyCorrelation: {
      title: 'વાર્તા ↮ નેટવર્ક ટ્રેલ સુસંગતતા',
      claimedStory: 'કહેવાયેલ કારણ',
      recipientReality: 'મેળવનારની વાસ્તવિકતા',
      networkTrail: 'નેટવર્ક ટ્રેઇલ',
      statusInconsistent: 'અસંગત (INCONSISTENT)',
      statusUnknown: 'અચકાસાયેલ (UNVERIFIED)',
      statusConsistent: 'સુસંગત (ALIGNED)'
    },
    qaAnswers: {
      report1930: 'જો નાણાકીય છેતરપિંડી થાય તો તરત જ 1930 પર રાષ્ટ્રીય સાયબર ક્રાઈમ હેલ્પલાઇન પર કૉલ કરો અથવા cybercrime.gov.in પર ફરિયાદ નોંધાવો.',
      qrSafety: 'સુરક્ષા નિયમ: પૈસા મેળવવા માટે તમારે ક્યારેય QR કોડ સ્કેન કરવાની કે UPI PIN દાખલ કરવાની જરૂર નથી.',
      muleNetwork: 'મ્યૂલ એકાઉન્ટ્સ એ ચોરીના નાણાં છુપાવવા માટે ગેંગ દ્વારા ભાડે રાખવામાં આવેલા બેંક ખાતાઓ છે.',
      apkMalware: 'AnyDesk જેવી એપ્સ અથવા SMS માં આવેલી શંકાસ્પદ APK લિંક્સ ક્યારેય ઇન્સ્ટોલ કરશો નહીં.',
      whyFlaggedStop: (amt: number, vpa: string) =>
        `સાવધાન. ₹${amt} ની ચુકવણી ${vpa} માટે રોકવામાં આવી છે. દબાણ અને શંકાસ્પદ મ્યૂલ નેટવર્ક જોડાણો મળ્યા હોવાથી આ વ્યવહાર રોકવામાં આવ્યો છે. તમારો UPI PIN દાખલ કરશો નહીં.`,
      whyFlaggedVerify: (amt: number, vpa: string) =>
        `સાવચેતી. ₹${amt} ની ચુકવણી ${vpa} માટે ચકાસણી જરૂરી છે. આગળ વધતાં પહેલાં મેળવનારની ચકાસણી કરો.`,
      whyFlaggedProceed: (amt: number, vpa: string) =>
        `₹${amt} ની ચુકવણીમાં ${vpa} માટે કોઈ નોંધપાત્ર જોખમ મળ્યું નથી. વિગતોની સમીક્ષા કરી આગળ વધો.`,
      generalAdvice: 'બેંકિંગ એપ પર નામ હંમેશા તપાસવાની અને ઉતાવળમાં PIN ન નાખવાની Q-NETRA AI સલાહ આપે છે.'
    }
  }
};

export function getTranslation(lang: SupportedLanguage = 'en'): LanguageTranslations {
  return TRANSLATIONS[lang] || TRANSLATIONS.en;
}

export function getDecisionTranslation(
  decision: 'STOP' | 'VERIFY' | 'PROCEED' | boolean | 'HIGH RISK' | 'MODERATE' | 'SAFE',
  lang: SupportedLanguage = 'en'
): DecisionTranslation {
  const t = getTranslation(lang);
  if (decision === 'STOP' || decision === true || decision === 'HIGH RISK') {
    return t.stop;
  }
  if (decision === 'VERIFY' || decision === 'MODERATE') {
    return t.verify;
  }
  return t.proceed;
}
