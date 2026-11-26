/**
 * ISO 3166-1 alpha-2 region codes. Names are not stored here: they are
 * produced in any language by Intl.DisplayNames, so new languages need no
 * extra country translations.
 */
export const REGION_CODES = [
  "AD","AE","AF","AG","AI","AL","AM","AO","AR","AS","AT","AU","AW","AX","AZ",
  "BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO","BQ","BR","BS","BT","BW","BY","BZ",
  "CA","CC","CD","CF","CG","CH","CI","CK","CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ",
  "DE","DJ","DK","DM","DO","DZ","EC","EE","EG","EH","ER","ES","ET","FI","FJ","FK","FM","FO","FR",
  "GA","GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GT","GU","GW","GY",
  "HK","HN","HR","HT","HU","ID","IE","IL","IM","IN","IO","IQ","IR","IS","IT","JE","JM","JO","JP",
  "KE","KG","KH","KI","KM","KN","KP","KR","KW","KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY",
  "MA","MC","MD","ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV","MW","MX","MY","MZ",
  "NA","NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NZ","OM","PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PW","PY",
  "QA","RE","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SH","SI","SK","SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ",
  "TC","TD","TG","TH","TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ","UA","UG","US","UY","UZ",
  "VA","VC","VE","VG","VI","VN","VU","WF","WS","XK","YE","YT","ZA","ZM","ZW",
] as const;

export function regionName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code) ?? code;
  } catch {
    return code;
  }
}

export type Region = { code: string; name: string };
const sortedCache = new Map<string, Region[]>();

/**
 * Region list sorted for a locale. Memoised so the same array is returned
 * every time. Call only in the browser: Node and browsers ship different ICU
 * data, so server-rendered names could differ from the client's.
 */
export function sortedRegions(locale: string): Region[] {
  let list = sortedCache.get(locale);
  if (!list) {
    const collator = new Intl.Collator(locale);
    list = REGION_CODES.map((code) => ({ code, name: regionName(code, locale) })).sort((a, b) =>
      collator.compare(a.name, b.name),
    );
    sortedCache.set(locale, list);
  }
  return list;
}
