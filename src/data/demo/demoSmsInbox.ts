/**
 * Sample simulated demo SMS inbox used for in-browser testing
 * of on-device SMS inspection and phishing link analyzer.
 */
export const SAMPLE_PERMITTED_SMS_INBOX = [
  {
    id: 'sms-demo-1',
    title: '⚡ Electricity Power Disconnection',
    sender: 'VM-BESCOM-PWR',
    body: 'Dear Consumer, Your electricity power will be disconnected tonight at 9:30 PM from the power office because your previous month bill was not updated. Please immediately pay ₹10 on UPI abc123@upi or call officer at 9876543210.',
    text: 'Dear Consumer, Your electricity power will be disconnected tonight at 9:30 PM from the power office because your previous month bill was not updated. Please immediately pay ₹10 on UPI abc123@upi or call officer at 9876543210.',
    type: 'Electricity Disconnection Scam',
    date: '10 mins ago',
    timestamp: Date.now() - 600000,
    unread: true
  },
  {
    id: 'sms-demo-2',
    title: '🏦 Bank Account KYC Suspension',
    sender: 'AD-SBIINB-KYC',
    body: 'Dear Customer, Your SBI YONO account suspended today due to pending PAN card verification. Update KYC immediately via link: sbi-kyc-update.apk to avoid ₹10,000 fine.',
    text: 'Dear Customer, Your SBI YONO account suspended today due to pending PAN card verification. Update KYC immediately via link: sbi-kyc-update.apk to avoid ₹10,000 fine.',
    type: 'Bank KYC Phishing APK',
    date: '1 hour ago',
    timestamp: Date.now() - 3600000,
    unread: true
  },
  {
    id: 'sms-demo-3',
    title: '🎁 KBC Lucky Draw Winner',
    sender: 'VK-KBCWIN',
    body: 'Congratulations! Your mobile number won ₹25,00,000 cash prize in KBC Jio Lucky Draw. To claim, send registration fee ₹25 to manager UPI lottery-gift@ybl.',
    text: 'Congratulations! Your mobile number won ₹25,00,000 cash prize in KBC Jio Lucky Draw. To claim, send registration fee ₹25 to manager UPI lottery-gift@ybl.',
    type: 'Lottery Prize Trap',
    date: '3 hours ago',
    timestamp: Date.now() - 3600000 * 3,
    unread: false
  },
  {
    id: 'sms-demo-4',
    title: '✅ Legitimate Swiggy OTP',
    sender: 'AX-SWIGGY',
    body: '128945 is your secret OTP for logging into Swiggy. Valid for 10 minutes. Do not share this OTP with anyone.',
    text: '128945 is your secret OTP for logging into Swiggy. Valid for 10 minutes. Do not share this OTP with anyone.',
    type: 'Safe Notification',
    date: 'Yesterday',
    timestamp: Date.now() - 86400000,
    unread: false
  }
];
