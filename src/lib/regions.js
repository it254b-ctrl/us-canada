export const US = { AL:'Alabama',AK:'Alaska',AZ:'Arizona',AR:'Arkansas',CA:'California',CO:'Colorado',CT:'Connecticut',DE:'Delaware',FL:'Florida',GA:'Georgia',HI:'Hawaii',ID:'Idaho',IL:'Illinois',IN:'Indiana',IA:'Iowa',KS:'Kansas',KY:'Kentucky',LA:'Louisiana',ME:'Maine',MD:'Maryland',MA:'Massachusetts',MI:'Michigan',MN:'Minnesota',MS:'Mississippi',MO:'Missouri',MT:'Montana',NE:'Nebraska',NV:'Nevada',NH:'New Hampshire',NJ:'New Jersey',NM:'New Mexico',NY:'New York',NC:'North Carolina',ND:'North Dakota',OH:'Ohio',OK:'Oklahoma',OR:'Oregon',PA:'Pennsylvania',RI:'Rhode Island',SC:'South Carolina',SD:'South Dakota',TN:'Tennessee',TX:'Texas',UT:'Utah',VT:'Vermont',VA:'Virginia',WA:'Washington',WV:'West Virginia',WI:'Wisconsin',WY:'Wyoming',DC:'District of Columbia' };
export const CA = { AB:'Alberta',BC:'British Columbia',MB:'Manitoba',NB:'New Brunswick',NL:'Newfoundland and Labrador',NS:'Nova Scotia',ON:'Ontario',PE:'Prince Edward Island',QC:'Quebec',SK:'Saskatchewan',NT:'Northwest Territories',NU:'Nunavut',YT:'Yukon' };
export const slugify = (s) => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
export const ALL = [
  ...Object.entries(US).map(([code, name]) => ({ code, name, country: 'US', slug: slugify(name) })),
  ...Object.entries(CA).map(([code, name]) => ({ code, name, country: 'CA', slug: slugify(name) })),
];
export const regionBySlug = (slug) => ALL.find((r) => r.slug === slug);
export const citySlug = (city, st) => `${slugify(city)}-${st.toLowerCase()}`;
export const HIGHWAYS = ['I-80', 'I-95', 'I-40', 'I-10', 'I-75', 'ON-401', 'Trans-Canada Hwy'];
export const FILTERS = {
  free: ['is_free', 'Free Parking'], open: ['is_24_7', '24/7 Open'], showers: ['has_showers', 'Showers'],
  security: ['has_security', 'Security Cameras'], wifi: ['has_wifi', 'Wi-Fi'], diesel: ['has_diesel', 'Diesel'],
};
