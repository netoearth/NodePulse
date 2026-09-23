export const COLO_DICT: Record<string, { city: string; country: string; flag: string }> = {
  // Asia Pacific
  HKG: { city: '中国香港', country: 'Hong Kong', flag: '🇭🇰' },
  NRT: { city: '日本东京 (成田)', country: 'Japan', flag: '🇯🇵' },
  HND: { city: '日本东京 (羽田)', country: 'Japan', flag: '🇯🇵' },
  KIX: { city: '日本大阪 (关西)', country: 'Japan', flag: '🇯🇵' },
  SIN: { city: '新加坡', country: 'Singapore', flag: '🇸🇬' },
  TPE: { city: '中国台湾 (台北)', country: 'Taiwan', flag: '🇹🇼' },
  KHH: { city: '中国台湾 (高雄)', country: 'Taiwan', flag: '🇹🇼' },
  ICN: { city: '韩国首尔 (仁川)', country: 'South Korea', flag: '🇰🇷' },
  BKK: { city: '泰国曼谷', country: 'Thailand', flag: '🇹🇭' },
  KUL: { city: '马来西亚吉隆坡', country: 'Malaysia', flag: '🇲🇾' },
  MNL: { city: '菲律宾马尼拉', country: 'Philippines', flag: '🇵🇭' },
  SGN: { city: '越南胡志明市', country: 'Vietnam', flag: '🇻🇳' },
  SYD: { city: '澳大利亚悉尼', country: 'Australia', flag: '🇦🇺' },
  MEL: { city: '澳大利亚墨尔本', country: 'Australia', flag: '🇦🇺' },
  
  // North America
  SJC: { city: '美国圣何塞 (硅谷)', country: 'United States', flag: '🇺🇸' },
  LAX: { city: '美国洛杉矶', country: 'United States', flag: '🇺🇸' },
  SFO: { city: '美国旧金山', country: 'United States', flag: '🇺🇸' },
  SEA: { city: '美国西雅图', country: 'United States', flag: '🇺🇸' },
  ORD: { city: '美国芝加哥', country: 'United States', flag: '🇺🇸' },
  EWR: { city: '美国纽瓦克/纽约', country: 'United States', flag: '🇺🇸' },
  JFK: { city: '美国纽约 (JFK)', country: 'United States', flag: '🇺🇸' },
  IAD: { city: '美国华盛顿特区', country: 'United States', flag: '🇺🇸' },
  DFW: { city: '美国达拉斯', country: 'United States', flag: '🇺🇸' },
  YVR: { city: '加拿大温哥华', country: 'Canada', flag: '🇨🇦' },
  YYZ: { city: '加拿大多伦多', country: 'Canada', flag: '🇨🇦' },

  // Europe
  FRA: { city: '德国法兰克福', country: 'Germany', flag: '🇩🇪' },
  LHR: { city: '英国伦敦', country: 'United Kingdom', flag: '🇬🇧' },
  AMS: { city: '荷兰阿姆斯特丹', country: 'Netherlands', flag: '🇳🇱' },
  CDG: { city: '法国巴黎', country: 'France', flag: '🇫🇷' },
  ZUR: { city: '瑞士苏黎世', country: 'Switzerland', flag: '🇨🇭' },
  HEL: { city: '芬兰赫尔辛基', country: 'Finland', flag: '🇫🇮' },
  ARN: { city: '瑞典斯德哥尔摩', country: 'Sweden', flag: '🇸🇪' },

  // Mainland China edge nodes (when accessed through domestic peering)
  SHA: { city: '中国上海', country: 'China', flag: '🇨🇳' },
  BJS: { city: '中国北京', country: 'China', flag: '🇨🇳' },
  CAN: { city: '中国广州', country: 'China', flag: '🇨🇳' },
  SZX: { city: '中国深圳', country: 'China', flag: '🇨🇳' },
  CTU: { city: '中国成都', country: 'China', flag: '🇨🇳' },
};

export function lookupColo(coloCode: string): { city: string; country: string; flag: string } {
  const upper = (coloCode || '').toUpperCase().trim();
  if (COLO_DICT[upper]) {
    return COLO_DICT[upper];
  }
  return { city: `边缘接入点 (${upper})`, country: 'Global Edge', flag: '🌐' };
}
