// Keywords for each case type — English + Bangla + Banglish combined

interface CaseTypeKeywords {
  primary: string[];
  secondary: string[];
}

export const KEYWORDS: Record<string, CaseTypeKeywords> = {
  phishing_or_social_engineering: {
    primary: [
      // English
      "otp", "pin", "password", "mpin", "nid", "bank account",
      "asked for otp", "asked for pin", "gave otp", "shared otp",
      "suspicious call", "suspicious sms", "fake call", "fake sms",
      "scam call", "scam sms", "fraud call",
      "customer care number", "helpline number",
      "claimed to be from", "posing as",
      "bKash agent called", "Nagad agent called",
      // Bangla
      "ওটিপি", "পিন", "পাসওয়ার্ড", "এমপিন",
      "ওটিপি চেয়েছে", "পিন চেয়েছে",
      "সন্দেহজনক কল", "সন্দেহজনক এসএমএস",
      "জাল কল", "ভুয়া কল",
      // Banglish
      "otp disi", "pin disi", "call disilo", "sms esilo",
      "customer care theke", "helpline number diye",
      "bkash kormi", "nagad kormi",
    ],
    secondary: [
      "suspicious", "fraud", "scam", "fake", "impersonate",
      "unknown number", "strange call",
      "প্রতারণা", "ঠকানো", "ভুয়া",
      "baje number", "aganona call",
    ],
  },
  duplicate_payment: {
    primary: [
      // English
      "double charged", "charged twice", "duplicate payment",
      "double payment", "two times", "same transaction twice",
      "multiple times charged",
      // Bangla
      "ডাবল চার্জ", "দুইবার কাটা", "দুইবার চার্জ",
      "একই লেনদেন দুইবার", "দুইবার কেটেছে", "দুইবার কেটে",
      // Banglish
      "duibar charge", "duibar kato", "double kato",
      "abar kato", "abar charge", "duibar keteche",
    ],
    secondary: [
      "duplicate", "double", "twice", "repeat", "again",
      "আবার", "পুনরায়", "দুবার",
    ],
  },
  agent_cash_in_issue: {
    primary: [
      // English
      "agent cash in", "cash in issue", "agent didn't",
      "agent said", "cash not received", "cash in failed",
      "agent didn't give", "agent took money",
      // Bangla
      "এজেন্ট ক্যাশ ইন", "ক্যাশ ইন করেনি", "এজেন্ট দেয়নি",
      "এজেন্ট টাকা নিয়েছে", "এজেন্ট টাকা দেয়নি",
      "ক্যাশ ইন হয়নি",
      // Banglish
      "agent a tk disi", "agent tk nilo", "agent cash in koreni",
      "agent tk dilo na", "agent er kache", "agent er kase",
    ],
    secondary: [
      "agent", "cash in", "ডিপোজিট", "জমা", "deposit",
      "এজেন্ট", "ক্যাশ",
    ],
  },
  merchant_settlement_delay: {
    primary: [
      // English
      "merchant payment", "settlement delay", "settlement not received",
      "merchant not paid", "payout delay", "no settlement",
      "merchant didn't receive",
      // Bangla
      "মার্চেন্ট পেমেন্ট", "মার্চেন্ট পায়নি",
      "মার্চেন্ট টাকা পায়নি", "সেটেলমেন্ট হয়নি",
      // Banglish
      "merchant tk payni", "merchant payment aseni",
      "settlement hoyni", "merchant er payment",
    ],
    secondary: [
      "merchant", "settlement", "payout", "business account",
      "মার্চেন্ট", "সেটেলমেন্ট", "পেমেন্ট",
    ],
  },
  payment_failed: {
    primary: [
      // English
      "payment failed", "transaction failed", "money deducted but",
      "amount deducted", "taka kata but", "failed transaction",
      "unsuccessful", "payment not successful",
      "money went but", "sent but failed",
      // Bangla
      "পেমেন্ট ফেল", "লেনদেন ব্যর্থ", "টাকা কেটেছে কিন্তু",
      "টাকা কেটে গেছে", "পেমেন্ট হয়নি", "ব্যর্থ হয়েছে",
      // Banglish
      "tk kete geche", "tk keteche", "payment fail",
      "tk kato but", "send kore fail", "tk nilo but",
    ],
    secondary: [
      "fail", "error", "problem", "issue", "unsuccessful",
      "ব্যর্থ", "সমস্যা", "ত্রুটি",
    ],
  },
  wrong_transfer: {
    primary: [
      // English
      "wrong number", "wrong account", "wrong person",
      "sent to wrong", "transferred to wrong",
      "wrong recipient", "incorrect number",
      "sent by mistake", "accidentally sent",
      // Bangla
      "ভুল নাম্বার", "ভুল অ্যাকাউন্ট", "ভুল মানুষ",
      "ভুল জায়গায় পাঠানো", "ভুল জায়গায় টাকা পাঠানো",
      "ভুলে পাঠানো",
      // Banglish
      "vul number", "vul account", "bhul number",
      "vul manush", "vul lok", "vul jaigay",
      "mistake kore pathaisi", "vule pathaisi",
    ],
    secondary: [
      "wrong", "mistake", "incorrect", "accidental",
      "ভুল", "ভুলে",
    ],
  },
  refund_request: {
    primary: [
      // English
      "refund", "money back", "return my money", "give me refund",
      "cancel transaction", "reverse transaction",
      "refund my money", "get my money back",
      // Bangla
      "রিফান্ড", "টাকা ফেরত", "ফেরত চাই",
      "টাকা ফেরত দিন", "লেনদেন বাতিল",
      // Banglish
      "refund dao", "tk ferot dao", "tk ferot chai",
      "cancel kore dao", "revert kore dao",
    ],
    secondary: [
      "return", "reverse", "cancel", "refund", "reversal",
      "ফেরত", "বাতিল", "রিফান্ড",
    ],
  },
};
