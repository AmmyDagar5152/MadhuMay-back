'use strict';

// Vrndavan seed data — shared source of truth for the catalog + editorial.
// Kept in one file so the backend zip is fully self-contained.

const SAMPRADAYAS = [
  { id: 'gaudiya', name: 'Gaudiya (ISKCON)' },
  { id: 'sri', name: 'Sri Vaishnava' },
  { id: 'pushti', name: 'Pushtimarg' },
  { id: 'madhva', name: 'Madhva' },
];

const CATEGORIES = [
  { slug: 'daily-bhakti', name: 'Daily Bhakti' },
  { slug: 'home-temple', name: 'Home Temple' },
  { slug: 'books', name: 'Sacred Texts' },
  { slug: 'attire', name: 'Deity Attire' },
  { slug: 'gifting', name: 'Gifting' },
];

const SEVA_TIERS = [
  { id: 'mantra', name: 'Mantra Sankalp', priceAddOn: 251, description: 'Your item is chanted over with the Maha Mantra 108 times by a devotee at our Vrindavan atelier before it leaves for you.' },
  { id: 'naam', name: 'Naam Sankalp', priceAddOn: 751, description: '108 rounds of japa dedicated in your name. Item ships with a handwritten card noting the date, devotee and dedication.' },
  { id: 'purna', name: 'Purna Seva', priceAddOn: 2100, description: 'Offered on the altar during Mangala Aarti at a partner temple, followed by 1,008 rounds of japa. A certificate of seva accompanies your order.' },
];

const IMG = {
  mala: 'https://images.unsplash.com/photo-1646185843593-9d7dd6a957cb?w=1200&q=80',
  mala2: 'https://images.unsplash.com/photo-1601824096525-954268b9eb72?w=1200&q=80',
  japa: 'https://images.unsplash.com/photo-1528319725582-ddc096101511?w=1200&q=80',
  altar1: 'https://images.pexels.com/photos/8369442/pexels-photo-8369442.jpeg?w=1200',
  altar2: 'https://images.pexels.com/photos/3822775/pexels-photo-3822775.jpeg?w=1200',
  mandir: 'https://images.pexels.com/photos/8819212/pexels-photo-8819212.jpeg?w=1200',
  peacock: 'https://images.unsplash.com/photo-1578885564199-db62248858cf?w=1200&q=80',
  krishna: 'https://images.unsplash.com/photo-1689582398122-8f143966bdc2?w=1200&q=80',
  prayer: 'https://images.pexels.com/photos/10182772/pexels-photo-10182772.jpeg?w=1200',
  meditation: 'https://images.unsplash.com/photo-1529155656340-c2c1cccb3dd1?w=1200&q=80',
};

const PRODUCTS = [
  { id: 'p-tulsi-108', slug: 'tulsi-japa-mala-108', name: 'Tulsi Japa Mala, 108 Beads', subtitle: 'Hand-strung in Vrindavan', devotionalContext: 'The tulsi tree is beloved of Sri Krishna. Each bead is a step home; each round, a quiet return.', price: 1850, currency: 'INR', images: [IMG.mala, IMG.mala2], category: 'daily-bhakti', sampradaya: ['gaudiya', 'sri', 'pushti', 'madhva'], material: 'Sacred tulsi wood, cotton thread', sourcingStory: 'Sourced from an eight-year-old tulsi grove tended by a family in Vrindavan for four generations. Beads are cut by hand, sanded with river water, and strung with a single knot between each — a technique that keeps the mala moving quietly through the fingers.', inventory: 42, authenticity: { materialOrigin: 'Vrindavan, UP', verifiedBy: 'Authenticity Council' } },
  { id: 'p-krishna-idol', slug: 'panchaloha-krishna-9in', name: 'Panchaloha Krishna, 9"', subtitle: 'Cast in five sacred metals', devotionalContext: 'Bala Gopala, in the tribhanga pose — flute at the lips, one foot crossed at the ankle.', price: 18500, currency: 'INR', images: [IMG.krishna, IMG.altar1], category: 'home-temple', sampradaya: ['sri', 'madhva', 'gaudiya'], material: 'Panchaloha (gold, silver, copper, brass, tin)', sourcingStory: 'Cast by the Sthapati family workshop in Swamimalai using the lost-wax method described in the Shilpa Shastras. Each idol takes 21 days from wax carving to final chiselling.', inventory: 6, authenticity: { materialOrigin: 'Swamimalai, Tamil Nadu', verifiedBy: 'Shilpa Council' } },
  { id: 'p-brass-diya', slug: 'brass-aarti-diya-set', name: 'Brass Aarti Diya, Set of Five', subtitle: 'For Panchapradip', devotionalContext: 'Five wicks for the five elements — offered together at aarti.', price: 2400, currency: 'INR', images: [IMG.altar1, IMG.altar2], category: 'home-temple', sampradaya: ['gaudiya', 'sri', 'pushti', 'madhva'], material: 'Solid brass, hand-turned', sourcingStory: 'Turned on a foot-powered lathe in Moradabad. The rim is left un-lacquered so that time and daily aarti give each diya its own patina.', inventory: 24, authenticity: { materialOrigin: 'Moradabad, UP', verifiedBy: 'Authenticity Council' } },
  { id: 'p-gita', slug: 'bhagavad-gita-deluxe', name: 'Bhagavad Gita As It Is, Deluxe', subtitle: 'Cloth-bound, Sanskrit + English', devotionalContext: '“Whoever, at the end, quits his body, remembering Me alone, at once attains My nature.”', price: 1200, currency: 'INR', images: [IMG.altar2, IMG.mandir], category: 'books', sampradaya: ['gaudiya'], material: 'Cotton cloth binding, cream paper', sourcingStory: 'Set in Fraunces and Adobe Devanagari, printed on 80gsm cream paper with a Smyth-sewn binding. A silk ribbon marker is bound in.', inventory: 88, authenticity: { materialOrigin: 'Chennai printing', verifiedBy: 'BBT Approved' } },
  { id: 'p-silk-attire', slug: 'deity-silk-attire-blue-gold', name: 'Deity Silk Attire, Blue & Gold', subtitle: 'For 6–10 inch Bala forms', devotionalContext: 'The colour of the monsoon sky, hemmed in temple gold.', price: 3600, currency: 'INR', images: [IMG.mandir, IMG.krishna], category: 'attire', sampradaya: ['gaudiya', 'pushti'], material: 'Mulberry silk, real zari', sourcingStory: 'Woven and stitched by artisans in Kanchipuram who have dressed temple deities for three generations. Every set is cut to a single seva family’s specifications.', inventory: 14, authenticity: { materialOrigin: 'Kanchipuram, Tamil Nadu', verifiedBy: 'Weaver Cooperative' } },
  { id: 'p-ekadashi-kit', slug: 'ekadashi-fasting-kit', name: 'Ekadashi Fasting Kit', subtitle: 'For a day of remembrance', devotionalContext: 'For the eleventh day of the lunar fortnight, kept in every Vaishnav tradition.', price: 1450, currency: 'INR', images: [IMG.altar2, IMG.altar1], category: 'gifting', sampradaya: ['gaudiya', 'sri', 'pushti', 'madhva'], material: 'Kuttu, sabudana, sendha namak, dry fruits, a small booklet', sourcingStory: 'Grains sourced from a family farm in Uttarakhand; the accompanying booklet notes the story of Ekadashi and a short reading suited to the fast.', inventory: 33, authenticity: { materialOrigin: 'Uttarakhand', verifiedBy: 'Farm Direct' } },
  { id: 'p-chandan', slug: 'sandalwood-chandan-box', name: 'Sandalwood Chandan Box', subtitle: 'For tilak, kept close', devotionalContext: 'The scent that lingers on the fingers, long after aarti.', price: 950, currency: 'INR', images: [IMG.altar1, IMG.mandir], category: 'daily-bhakti', sampradaya: ['gaudiya', 'sri', 'pushti', 'madhva'], material: 'Karnataka sandalwood, natural wax finish', sourcingStory: 'Turned from certified plantation sandalwood in Mysuru, finished only with beeswax so the fragrance remains true.', inventory: 61, authenticity: { materialOrigin: 'Mysuru, Karnataka', verifiedBy: 'Sandalwood Board' } },
  { id: 'p-vraja-wall', slug: 'radha-krishna-vraja-print', name: 'Radha-Krishna — The Vraja Edit', subtitle: 'Archival giclee print, framed', devotionalContext: 'A study of the divine couple in the groves of Vrindavan.', price: 4200, currency: 'INR', images: [IMG.peacock, IMG.krishna], category: 'home-temple', sampradaya: ['gaudiya', 'pushti'], material: 'Hahnemühle cotton paper, teak frame', sourcingStory: 'A limited edition of 108, printed on Hahnemühle Museum Etching and framed in solid teak by a Chennai studio. Signed by the illustrator.', inventory: 27, authenticity: { materialOrigin: 'Chennai atelier', verifiedBy: 'Signed edition of 108' } },
  { id: 'p-thali', slug: 'neem-aarti-thali', name: 'Neem-Wood Aarti Thali', subtitle: 'Turned by hand', devotionalContext: 'A quiet vessel for camphor, kumkum and the small silence before aarti.', price: 2850, currency: 'INR', images: [IMG.mandir, IMG.altar2], category: 'home-temple', sampradaya: ['gaudiya', 'sri', 'pushti', 'madhva'], material: 'Neem wood, food-safe finish', sourcingStory: 'Turned on a manual lathe in Channapatna; finished with a food-safe lac that permits daily wiping without dulling the grain.', inventory: 19, authenticity: { materialOrigin: 'Channapatna, Karnataka', verifiedBy: 'Craft Council' } },
];

const ARTICLES = [
  { slug: 'why-tulsi', title: 'Why Tulsi, and Why 108', excerpt: 'A short reading on the plant beloved of Sri Krishna — and the number that ends every round of japa.', image: IMG.japa, kicker: 'Practice', readingTime: '6 min read', publishedAt: 'June 3, 2025', author: 'The Editor', body: [
    'There is a small ritual in the morning that begins before words. The mala is lifted from the cotton pouch, the tassel checked for the knot that must sit at the guru bead, and the first bead is turned between the fingers. Nothing has been said yet, and yet the day has begun.',
    'The tulsi tree — Ocimum tenuiflorum — grows in the courtyards of most Vaishnav homes for a reason older than any of us. The Puranas hold that Sri Krishna would not eat food that had not been offered with a tulsi leaf, and the plant is described in the Padma Purana as His most beloved. When we hold a tulsi mala, we hold a small piece of that grove.',
    'Then, one hundred and eight. It is the number the Vedas return to. Twenty-seven nakshatras, four padas each. The distance from the earth to the sun in solar diameters, roughly. The number of Upanishads. The number of pithas of the Devi. It is the number that stops us from counting.',
    'The point of a round is not the count. It is that the count ends. When the finger arrives back at the guru bead, we do not cross it — we turn the mala, and begin again. The end of the count is a small refusal of arithmetic. It says: enough. Return.',
    'A tulsi mala, kept for a year, will smell faintly of the hands that have held it. That is the record of the practice. It is the only record that matters.',
  ] },
  { slug: 'setting-up-a-home-altar', title: 'Setting up a Home Altar: A Quiet Guide', excerpt: 'On placement, light, and what to keep on the lowest shelf.', image: IMG.altar1, kicker: 'Home', readingTime: '8 min read', publishedAt: 'May 27, 2025', author: 'Radhika S.', body: [
    'A home altar is not a shrine and not a decoration. It is somewhere between. It is the corner of the house where the family goes to be less certain of itself for a moment, and to be reminded that there is something worth returning to.',
    'Choose the direction first. In most Vaishnav households the deity faces west, so that the family offering aarti stands facing east — toward the sunrise.',
    'Light matters more than material. A wooden shelf with a warm bulb overhead will hold reverence better than a marble slab in a room with a ceiling fluorescent.',
    'The lowest shelf is for the small things: a chandan box, a small copper vessel of water, a stack of unlit incense, a bell, and the mala when it is not being used.',
    'The middle shelf is for the deity and the accompanying photographs. Keep the number small. Three photographs is better than nine.',
    'The top of the altar should hold almost nothing. The empty space above the deity is doing work.',
    'Finally: dust it yourself. Once a week, on any morning that is quieter than the others, take a cotton cloth and clean the shelves in silence.',
  ] },
  { slug: 'ekadashi-primer', title: 'A Primer on Ekadashi', excerpt: 'The eleventh day of the lunar fortnight, kept differently in every home.', image: IMG.altar2, kicker: 'Calendar', readingTime: '5 min read', publishedAt: 'May 19, 2025', author: 'The Editor', body: [
    'Twice a lunar month, on the eleventh day of the waxing and waning fortnights, Vaishnavs keep Ekadashi.',
    'The classical observance is a complete fast — nirjala, without even water. Most families do not do this. What is more common is a fast from grains and legumes.',
    'The point is not the diet. The point is that once a fortnight, the household changes its pattern.',
    'The most beautiful gesture of Ekadashi is that it is optional and universal at once. Every Vaishnav lineage keeps it. No two houses keep it the same.',
    'If you have never fasted, begin with one Ekadashi. Not the strictest version. See what the next morning feels like.',
  ] },
  { slug: 'the-seva-question', title: 'Should a Blessing Be Sold?', excerpt: 'On why we made Seva Sankalp opt-in, and how we describe it exactly.', image: IMG.prayer, kicker: 'The House', readingTime: '7 min read', publishedAt: 'May 12, 2025', author: 'The Founder', body: [
    'When we began to design Vrndavan, the question we could not sleep on was this: a great deal of what is sold as devotional online is sold with an implicit claim of blessing.',
    'We felt strongly that we did not want to participate in that. But we also did not want to refuse the idea of seva altogether.',
    'So we made it opt-in. Every product on Vrndavan can be shipped as-is. Nothing is described as blessed unless a specific, named, describable seva has been done.',
    'It felt embarrassing at first. But every founder we admire has kept one thing they will not compromise. This is ours.',
    'A blessing that is claimed without effort is not a blessing. A seva done well, and described honestly, is one of the most beautiful transactions in the world.',
  ] },
  { slug: 'reading-the-gita-slowly', title: 'Reading the Gita, Slowly', excerpt: 'A gentle method for the seven-hundred-verse book.', image: IMG.meditation, kicker: 'Practice', readingTime: '9 min read', publishedAt: 'May 4, 2025', author: 'Meera J.', body: [
    'I have begun the Bhagavad Gita eleven times. This is a confession.',
    'The Gita is seven hundred verses. If you read three a day and do not miss more than a Sunday a month, you will finish in about eight months.',
    'Read them in the morning if you can. Read the Sanskrit first, aloud, even if you do not know what it means.',
    'Do not underline. The book is not being asked to give you something to remember; you are being asked to sit with it.',
    'When you finish, wait a month. Then begin again.',
  ] },
  { slug: 'the-sound-of-a-conch', title: 'The Sound of a Conch', excerpt: 'A small essay on the shankha — what it means, how to sound it.', image: IMG.mandir, kicker: 'Objects', readingTime: '5 min read', publishedAt: 'April 28, 2025', author: 'The Editor', body: [
    'The conch on the altar is not decoration. It is an instrument.',
    'To sound a conch correctly, hold it with the opening facing your right. Take a full breath from the diaphragm, and blow steadily.',
    'Blow it once at the start of aarti. Once at the end. That is enough.',
  ] },
];

const FESTIVALS = [
  { date: '2025-06-21', name: 'Yogini Ekadashi', kind: 'Ekadashi', note: 'Krishna Paksha of Jyeshtha. A fast of remembrance.' },
  { date: '2025-07-06', name: 'Devshayani Ekadashi', kind: 'Ekadashi', note: 'Chaturmasya begins. Sri Vishnu enters yogic rest.' },
  { date: '2025-07-10', name: 'Guru Purnima', kind: 'Purnima', note: 'The full moon kept for the teacher.' },
  { date: '2025-07-21', name: 'Kamika Ekadashi', kind: 'Ekadashi', note: 'For the release of longing.' },
  { date: '2025-08-05', name: 'Putrada Ekadashi', kind: 'Ekadashi', note: 'Shravana Shukla.' },
  { date: '2025-08-16', name: 'Sri Krishna Janmashtami', kind: 'Festival', note: 'The appearance day of Sri Krishna.' },
  { date: '2025-08-19', name: 'Aja Ekadashi', kind: 'Ekadashi', note: 'Bhadrapada Krishna.' },
  { date: '2025-08-31', name: 'Radhashtami', kind: 'Festival', note: 'The appearance day of Srimati Radharani.' },
  { date: '2025-09-03', name: 'Parivartini Ekadashi', kind: 'Ekadashi', note: 'Sri Vishnu turns in His yogic rest.' },
  { date: '2025-09-17', name: 'Indira Ekadashi', kind: 'Ekadashi', note: 'For the ancestors.' },
  { date: '2025-10-03', name: 'Papankusha Ekadashi', kind: 'Ekadashi', note: 'A rain of grace on the fast.' },
  { date: '2025-10-06', name: 'Sharad Purnima', kind: 'Purnima', note: 'The night of Rasa. Kheer offered under moonlight.' },
  { date: '2025-10-17', name: 'Rama Ekadashi', kind: 'Ekadashi', note: 'Kept before Diwali.' },
  { date: '2025-10-29', name: 'Gopashtami', kind: 'Festival', note: 'Sri Krishna is entrusted with the cows.' },
  { date: '2025-11-01', name: 'Devuthani Ekadashi', kind: 'Ekadashi', note: 'Sri Vishnu wakes. Chaturmasya ends.' },
  { date: '2025-11-05', name: 'Kartik Purnima', kind: 'Purnima', note: 'The month of lamps closes.' },
  { date: '2025-11-15', name: 'Utpanna Ekadashi', kind: 'Ekadashi', note: 'The Ekadashi of the personified fast herself.' },
  { date: '2025-12-01', name: 'Mokshada Ekadashi (Gita Jayanti)', kind: 'Festival', note: 'The day the Gita was spoken on Kurukshetra.' },
  { date: '2025-12-15', name: 'Saphala Ekadashi', kind: 'Ekadashi', note: 'For the fruits of long devotion.' },
  { date: '2026-01-10', name: 'Vaikuntha Ekadashi', kind: 'Ekadashi', note: 'The gates of Vaikuntha are said to open.' },
  { date: '2026-01-14', name: 'Makar Sankranti', kind: 'Festival', note: 'The sun turns north; the days lengthen.' },
  { date: '2026-01-25', name: 'Shattila Ekadashi', kind: 'Ekadashi', note: 'Six forms of sesame offered.' },
  { date: '2026-02-08', name: 'Jaya Ekadashi', kind: 'Ekadashi', note: 'For quiet victory.' },
  { date: '2026-02-24', name: 'Vijaya Ekadashi', kind: 'Ekadashi', note: 'Kept before the darkness of Phalguna.' },
  { date: '2026-03-03', name: 'Holi', kind: 'Festival', note: 'The colours of Vraja.' },
  { date: '2026-03-10', name: 'Amalaki Ekadashi', kind: 'Ekadashi', note: 'The amla tree is worshipped.' },
  { date: '2026-03-26', name: 'Papmochani Ekadashi', kind: 'Ekadashi', note: 'The washing away of long-held things.' },
  { date: '2026-03-27', name: 'Sri Rama Navami', kind: 'Festival', note: 'The appearance day of Sri Rama.' },
  { date: '2026-04-08', name: 'Kamada Ekadashi', kind: 'Ekadashi', note: 'The Ekadashi that fulfils longing.' },
  { date: '2026-04-23', name: 'Varuthini Ekadashi', kind: 'Ekadashi', note: 'A shield for the fasting devotee.' },
  { date: '2026-04-30', name: 'Akshaya Tritiya', kind: 'Festival', note: 'The day of imperishable merit.' },
  { date: '2026-05-08', name: 'Mohini Ekadashi', kind: 'Ekadashi', note: 'The Ekadashi of Sri Vishnu’s enchanting form.' },
  { date: '2026-05-22', name: 'Apara Ekadashi', kind: 'Ekadashi', note: 'Beyond measure, this Ekadashi.' },
  { date: '2026-06-06', name: 'Nirjala Ekadashi', kind: 'Ekadashi', note: 'Kept without even water. The strictest fast.' },
  { date: '2026-06-22', name: 'Yogini Ekadashi', kind: 'Ekadashi', note: 'A fast of remembrance.' },
  { date: '2026-07-06', name: 'Devshayani Ekadashi', kind: 'Ekadashi', note: 'Chaturmasya begins.' },
  { date: '2026-07-21', name: 'Kamika Ekadashi', kind: 'Ekadashi', note: 'For the release of longing.' },
  { date: '2026-07-29', name: 'Guru Purnima', kind: 'Purnima', note: 'The full moon kept for the teacher.' },
  { date: '2026-08-04', name: 'Putrada Ekadashi', kind: 'Ekadashi', note: 'Shravana Shukla.' },
  { date: '2026-08-18', name: 'Aja Ekadashi', kind: 'Ekadashi', note: 'Bhadrapada Krishna.' },
  { date: '2026-09-02', name: 'Parivartini Ekadashi', kind: 'Ekadashi', note: 'Sri Vishnu turns in His yogic rest.' },
  { date: '2026-09-04', name: 'Sri Krishna Janmashtami', kind: 'Festival', note: 'The appearance day of Sri Krishna.' },
  { date: '2026-09-17', name: 'Indira Ekadashi', kind: 'Ekadashi', note: 'For the ancestors.' },
  { date: '2026-09-20', name: 'Radhashtami', kind: 'Festival', note: 'The appearance day of Srimati Radharani.' },
  { date: '2026-10-01', name: 'Papankusha Ekadashi', kind: 'Ekadashi', note: 'A rain of grace on the fast.' },
  { date: '2026-10-16', name: 'Rama Ekadashi', kind: 'Ekadashi', note: 'Kept before Diwali.' },
  { date: '2026-10-25', name: 'Sharad Purnima', kind: 'Purnima', note: 'The night of Rasa.' },
  { date: '2026-10-28', name: 'Gopashtami', kind: 'Festival', note: 'Sri Krishna is entrusted with the cows.' },
  { date: '2026-10-31', name: 'Devuthani Ekadashi', kind: 'Ekadashi', note: 'Sri Vishnu wakes.' },
  { date: '2026-11-15', name: 'Utpanna Ekadashi', kind: 'Ekadashi', note: 'The personified fast.' },
  { date: '2026-11-24', name: 'Kartik Purnima', kind: 'Purnima', note: 'The month of lamps closes.' },
  { date: '2026-12-04', name: 'Saphala Ekadashi', kind: 'Ekadashi', note: 'For the fruits of long devotion.' },
  { date: '2026-12-20', name: 'Mokshada Ekadashi (Gita Jayanti)', kind: 'Festival', note: 'The day the Gita was spoken on Kurukshetra.' },
  { date: '2027-01-04', name: 'Pausha Putrada Ekadashi', kind: 'Ekadashi', note: 'Vaikuntha Ekadashi in the Southern tradition.' },
  { date: '2027-01-14', name: 'Makar Sankranti', kind: 'Festival', note: 'The sun turns north.' },
  { date: '2027-01-19', name: 'Shattila Ekadashi', kind: 'Ekadashi', note: 'Six forms of sesame offered.' },
];

module.exports = { SAMPRADAYAS, CATEGORIES, SEVA_TIERS, PRODUCTS, ARTICLES, FESTIVALS };
