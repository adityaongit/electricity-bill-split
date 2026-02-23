export const SUPPORTED_CURRENCIES = [
  // Asia
  { code: "INR", symbol: "₹", locale: "en-IN", name: "Indian Rupee" },
  { code: "JPY", symbol: "¥", locale: "ja-JP", name: "Japanese Yen" },
  { code: "CNY", symbol: "¥", locale: "zh-CN", name: "Chinese Yuan" },
  { code: "SGD", symbol: "$", locale: "en-SG", name: "Singapore Dollar" },
  { code: "HKD", symbol: "$", locale: "zh-HK", name: "Hong Kong Dollar" },
  { code: "KRW", symbol: "₩", locale: "ko-KR", name: "South Korean Won" },
  { code: "THB", symbol: "฿", locale: "th-TH", name: "Thai Baht" },
  { code: "MYR", symbol: "RM", locale: "ms-MY", name: "Malaysian Ringgit" },
  { code: "IDR", symbol: "Rp", locale: "id-ID", name: "Indonesian Rupiah" },
  { code: "PHP", symbol: "₱", locale: "en-PH", name: "Philippine Peso" },
  { code: "VND", symbol: "₫", locale: "vi-VN", name: "Vietnamese Dong" },
  { code: "BDT", symbol: "৳", locale: "en-BD", name: "Bangladeshi Taka" },
  { code: "PKR", symbol: "₨", locale: "en-PK", name: "Pakistani Rupee" },
  { code: "LKR", symbol: "Rs", locale: "en-LK", name: "Sri Lankan Rupee" },
  { code: "NPR", symbol: "₨", locale: "en-NP", name: "Nepalese Rupee" },
  // Americas
  { code: "USD", symbol: "$", locale: "en-US", name: "US Dollar" },
  { code: "CAD", symbol: "$", locale: "en-CA", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$", locale: "en-AU", name: "Australian Dollar" },
  { code: "BRL", symbol: "R$", locale: "pt-BR", name: "Brazilian Real" },
  { code: "MXN", symbol: "$", locale: "es-MX", name: "Mexican Peso" },
  { code: "ARS", symbol: "$", locale: "es-AR", name: "Argentine Peso" },
  { code: "CLP", symbol: "$", locale: "es-CL", name: "Chilean Peso" },
  { code: "COP", symbol: "$", locale: "es-CO", name: "Colombian Peso" },
  { code: "PEN", symbol: "S/", locale: "es-PE", name: "Peruvian Sol" },
  // Europe
  { code: "EUR", symbol: "€", locale: "de-DE", name: "Euro" },
  { code: "GBP", symbol: "£", locale: "en-GB", name: "British Pound" },
  { code: "CHF", symbol: "CHF", locale: "de-CH", name: "Swiss Franc" },
  { code: "SEK", symbol: "kr", locale: "sv-SE", name: "Swedish Krona" },
  { code: "NOK", symbol: "kr", locale: "nb-NO", name: "Norwegian Krone" },
  { code: "DKK", symbol: "kr", locale: "da-DK", name: "Danish Krone" },
  { code: "PLN", symbol: "zł", locale: "pl-PL", name: "Polish Zloty" },
  { code: "CZK", symbol: "Kč", locale: "cs-CZ", name: "Czech Koruna" },
  { code: "HUF", symbol: "Ft", locale: "hu-HU", name: "Hungarian Forint" },
  { code: "RON", symbol: "lei", locale: "ro-RO", name: "Romanian Leu" },
  { code: "BGN", symbol: "лв", locale: "bg-BG", name: "Bulgarian Lev" },
  { code: "RUB", symbol: "₽", locale: "ru-RU", name: "Russian Ruble" },
  { code: "UAH", symbol: "₴", locale: "uk-UA", name: "Ukrainian Hryvnia" },
  { code: "TRY", symbol: "₺", locale: "tr-TR", name: "Turkish Lira" },
  // Middle East & Africa
  { code: "AED", symbol: "د.إ", locale: "ar-AE", name: "UAE Dirham" },
  { code: "SAR", symbol: "ر.س", locale: "ar-SA", name: "Saudi Riyal" },
  { code: "QAR", symbol: "ر.ق", locale: "ar-QA", name: "Qatari Riyal" },
  { code: "KWD", symbol: "د.ك", locale: "ar-KW", name: "Kuwaiti Dinar" },
  { code: "BHD", symbol: "BD", locale: "ar-BH", name: "Bahraini Dinar" },
  { code: "OMR", symbol: "ر.ع.", locale: "ar-OM", name: "Omani Rial" },
  { code: "ILS", symbol: "₪", locale: "he-IL", name: "Israeli Shekel" },
  { code: "EGP", symbol: "E£", locale: "ar-EG", name: "Egyptian Pound" },
  { code: "ZAR", symbol: "R", locale: "en-ZA", name: "South African Rand" },
  { code: "NGN", symbol: "₦", locale: "en-NG", name: "Nigerian Naira" },
  { code: "KES", symbol: "KSh", locale: "en-KE", name: "Kenyan Shilling" },
  // Oceania
  { code: "NZD", symbol: "$", locale: "en-NZ", name: "New Zealand Dollar" },
  { code: "FJD", symbol: "$", locale: "en-FJ", name: "Fijian Dollar" },
] as const

export type CurrencyCode = typeof SUPPORTED_CURRENCIES[number]["code"]
export const DEFAULT_CURRENCY: CurrencyCode = "INR"

export function getCurrencyConfig(code: CurrencyCode) {
  return SUPPORTED_CURRENCIES.find((c) => c.code === code) ?? SUPPORTED_CURRENCIES[0]
}
