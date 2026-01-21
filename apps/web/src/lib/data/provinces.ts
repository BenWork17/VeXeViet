export interface Province {
  id: string;
  name: string;
  displayName?: string; // Tên hiển thị (VD: "Đà Lạt - Lâm Đồng")
  region: 'north' | 'central' | 'south';
  aliases?: string[]; // Tên gọi khác, thành phố chính
}

export const VIETNAM_PROVINCES: Province[] = [
  // Miền Bắc (North)
  { id: 'hanoi', name: 'Hà Nội', region: 'north', aliases: ['ha noi'] },
  { id: 'haiphong', name: 'Hải Phòng', region: 'north', aliases: ['hai phong'] },
  { id: 'quangninh', name: 'Quảng Ninh', displayName: 'Hạ Long - Quảng Ninh', region: 'north', aliases: ['quang ninh', 'ha long', 'hạ long'] },
  { id: 'haigiang', name: 'Hà Giang', region: 'north', aliases: ['ha giang'] },
  { id: 'caobang', name: 'Cao Bằng', region: 'north', aliases: ['cao bang'] },
  { id: 'langson', name: 'Lạng Sơn', region: 'north', aliases: ['lang son'] },
  { id: 'laocai', name: 'Lào Cai', displayName: 'Sa Pa - Lào Cai', region: 'north', aliases: ['lao cai', 'sa pa', 'sapa'] },
  { id: 'yenbai', name: 'Yên Bái', region: 'north', aliases: ['yen bai'] },
  { id: 'tuyenquang', name: 'Tuyên Quang', region: 'north', aliases: ['tuyen quang'] },
  { id: 'backan', name: 'Bắc Kạn', region: 'north', aliases: ['bac kan'] },
  { id: 'thainguyen', name: 'Thái Nguyên', region: 'north', aliases: ['thai nguyen'] },
  { id: 'bacgiang', name: 'Bắc Giang', region: 'north', aliases: ['bac giang'] },
  { id: 'bacninh', name: 'Bắc Ninh', region: 'north', aliases: ['bac ninh'] },
  { id: 'hanam', name: 'Hà Nam', region: 'north', aliases: ['ha nam'] },
  { id: 'hungyen', name: 'Hưng Yên', region: 'north', aliases: ['hung yen'] },
  { id: 'haiduong', name: 'Hải Dương', region: 'north', aliases: ['hai duong'] },
  { id: 'namdinh', name: 'Nam Định', region: 'north', aliases: ['nam dinh'] },
  { id: 'thaibinh', name: 'Thái Bình', region: 'north', aliases: ['thai binh'] },
  { id: 'ninhbinh', name: 'Ninh Bình', region: 'north', aliases: ['ninh binh'] },
  { id: 'hoabinh', name: 'Hòa Bình', region: 'north', aliases: ['hoa binh'] },
  { id: 'sonla', name: 'Sơn La', region: 'north', aliases: ['son la'] },
  { id: 'dienbien', name: 'Điện Biên', region: 'north', aliases: ['dien bien'] },
  { id: 'laichau', name: 'Lai Châu', region: 'north', aliases: ['lai chau'] },
  { id: 'phutho', name: 'Phú Thọ', region: 'north', aliases: ['phu tho'] },
  { id: 'vinhphuc', name: 'Vĩnh Phúc', region: 'north', aliases: ['vinh phuc'] },

  // Miền Trung (Central)
  { id: 'thanhhoa', name: 'Thanh Hóa', region: 'central', aliases: ['thanh hoa'] },
  { id: 'nghean', name: 'Nghệ An', displayName: 'Vinh - Nghệ An', region: 'central', aliases: ['nghe an', 'vinh'] },
  { id: 'hatinh', name: 'Hà Tĩnh', region: 'central', aliases: ['ha tinh'] },
  { id: 'quangbinh', name: 'Quảng Bình', displayName: 'Đồng Hới - Quảng Bình', region: 'central', aliases: ['quang binh', 'dong hoi', 'đồng hới'] },
  { id: 'quangtri', name: 'Quảng Trị', region: 'central', aliases: ['quang tri'] },
  { id: 'thuathienhue', name: 'Thừa Thiên Huế', displayName: 'Huế - Thừa Thiên Huế', region: 'central', aliases: ['thua thien hue', 'hue', 'huế'] },
  { id: 'danang', name: 'Đà Nẵng', region: 'central', aliases: ['da nang'] },
  { id: 'quangnam', name: 'Quảng Nam', displayName: 'Hội An - Quảng Nam', region: 'central', aliases: ['quang nam', 'hoi an', 'hội an'] },
  { id: 'quangngai', name: 'Quảng Ngãi', region: 'central', aliases: ['quang ngai'] },
  { id: 'binhdinh', name: 'Bình Định', displayName: 'Quy Nhơn - Bình Định', region: 'central', aliases: ['binh dinh', 'quy nhon', 'quy nhơn'] },
  { id: 'phuyen', name: 'Phú Yên', displayName: 'Tuy Hòa - Phú Yên', region: 'central', aliases: ['phu yen', 'tuy hoa', 'tuy hòa'] },
  { id: 'khanhhoa', name: 'Khánh Hòa', displayName: 'Nha Trang - Khánh Hòa', region: 'central', aliases: ['khanh hoa', 'nha trang'] },
  { id: 'ninhthuan', name: 'Ninh Thuận', displayName: 'Phan Rang - Ninh Thuận', region: 'central', aliases: ['ninh thuan', 'phan rang'] },
  { id: 'binhthuan', name: 'Bình Thuận', displayName: 'Phan Thiết - Bình Thuận', region: 'central', aliases: ['binh thuan', 'phan thiet', 'phan thiết', 'mui ne', 'mũi né'] },
  { id: 'kontum', name: 'Kon Tum', region: 'central', aliases: ['kon tum'] },
  { id: 'gialai', name: 'Gia Lai', displayName: 'Pleiku - Gia Lai', region: 'central', aliases: ['gia lai', 'pleiku'] },
  { id: 'daklak', name: 'Đắk Lắk', displayName: 'Buôn Ma Thuột - Đắk Lắk', region: 'central', aliases: ['dak lak', 'buon ma thuot', 'buôn ma thuột'] },
  { id: 'daknong', name: 'Đắk Nông', region: 'central', aliases: ['dak nong'] },
  { id: 'lamdong', name: 'Lâm Đồng', displayName: 'Đà Lạt - Lâm Đồng', region: 'central', aliases: ['lam dong', 'da lat', 'đà lạt', 'dalat'] },

  // Miền Nam (South)
  { id: 'hochiminh', name: 'Hồ Chí Minh', region: 'south', aliases: ['ho chi minh', 'sai gon', 'sài gòn', 'hcm', 'sg', 'tp hcm', 'tphcm'] },
  { id: 'baria-vungtau', name: 'Bà Rịa - Vũng Tàu', displayName: 'Vũng Tàu - Bà Rịa', region: 'south', aliases: ['ba ria vung tau', 'vung tau', 'vũng tàu'] },
  { id: 'binhduong', name: 'Bình Dương', displayName: 'Thủ Dầu Một - Bình Dương', region: 'south', aliases: ['binh duong', 'thu dau mot', 'thủ dầu một'] },
  { id: 'binhphuoc', name: 'Bình Phước', region: 'south', aliases: ['binh phuoc'] },
  { id: 'dongnai', name: 'Đồng Nai', displayName: 'Biên Hòa - Đồng Nai', region: 'south', aliases: ['dong nai', 'bien hoa', 'biên hòa'] },
  { id: 'tayninh', name: 'Tây Ninh', region: 'south', aliases: ['tay ninh'] },
  { id: 'longan', name: 'Long An', displayName: 'Tân An - Long An', region: 'south', aliases: ['long an', 'tan an', 'tân an'] },
  { id: 'tiengiang', name: 'Tiền Giang', displayName: 'Mỹ Tho - Tiền Giang', region: 'south', aliases: ['tien giang', 'my tho', 'mỹ tho'] },
  { id: 'bentre', name: 'Bến Tre', region: 'south', aliases: ['ben tre'] },
  { id: 'travinh', name: 'Trà Vinh', region: 'south', aliases: ['tra vinh'] },
  { id: 'vinhlong', name: 'Vĩnh Long', region: 'south', aliases: ['vinh long'] },
  { id: 'dongtap', name: 'Đồng Tháp', displayName: 'Cao Lãnh - Đồng Tháp', region: 'south', aliases: ['dong thap', 'cao lanh', 'cao lãnh'] },
  { id: 'angiang', name: 'An Giang', displayName: 'Long Xuyên - An Giang', region: 'south', aliases: ['an giang', 'long xuyen', 'long xuyên', 'chau doc', 'châu đốc'] },
  { id: 'kiengiang', name: 'Kiên Giang', displayName: 'Rạch Giá - Kiên Giang', region: 'south', aliases: ['kien giang', 'rach gia', 'rạch giá', 'phu quoc', 'phú quốc'] },
  { id: 'cantho', name: 'Cần Thơ', region: 'south', aliases: ['can tho'] },
  { id: 'haugiang', name: 'Hậu Giang', displayName: 'Vị Thanh - Hậu Giang', region: 'south', aliases: ['hau giang', 'vi thanh', 'vị thanh'] },
  { id: 'soctrang', name: 'Sóc Trăng', region: 'south', aliases: ['soc trang'] },
  { id: 'baclieu', name: 'Bạc Liêu', region: 'south', aliases: ['bac lieu'] },
  { id: 'camau', name: 'Cà Mau', region: 'south', aliases: ['ca mau'] },
];

export const getProvincesByRegion = (region: 'north' | 'central' | 'south') => {
  return VIETNAM_PROVINCES.filter(p => p.region === region);
};

export const searchProvinces = (query: string): Province[] => {
  if (!query.trim()) return VIETNAM_PROVINCES;
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Remove Vietnamese accents for better matching
  const removeAccents = (str: string) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  };
  
  const normalizedQueryNoAccent = removeAccents(normalizedQuery);
  
  return VIETNAM_PROVINCES.filter(province => {
    const provinceName = province.name.toLowerCase();
    const provinceNameNoAccent = removeAccents(provinceName);
    
    // Check main name
    if (provinceName.includes(normalizedQuery) || provinceNameNoAccent.includes(normalizedQueryNoAccent)) {
      return true;
    }
    
    // Check aliases
    if (province.aliases) {
      return province.aliases.some(alias => {
        const aliasLower = alias.toLowerCase();
        const aliasNoAccent = removeAccents(aliasLower);
        return aliasLower.includes(normalizedQuery) || aliasNoAccent.includes(normalizedQueryNoAccent);
      });
    }
    
    return false;
  });
};
