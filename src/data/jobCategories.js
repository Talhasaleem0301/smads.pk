// Central data source for all job categories.
// Used by both the Home page (cards) and the CategoryDetail page (deep-dive view).
// Edit this file to change what shows up when a user clicks a category box.

export const paymentMethods = [
  {
    name: 'JazzCash',
    account: '03157906576',
    accountTitle: 'Sm Ads Payments',
    note: 'Please transfer your registration fee to this JazzCash account to verify and activate your profile.',
  },
]

// Membership / registration packages. Every worker must pick one of these
// before they can apply for any job category — the price already includes
// the mandatory one-time registration/activation fee.
export const membershipPackages = [
  {
    key: 'silver',
    name: 'Silver',
    priceMin: 5000,
    priceMax: 7000,
    tagline: 'Best for getting started',
    accent: 'from-slate-300 to-slate-400',
    ring: 'border-slate-300',
    chip: 'bg-slate-100 text-slate-600 border-slate-300',
    features: [
      'Registration / activation fee included',
      'Verified Member Badge',
      'Apply to any of the 6 job categories',
      'Standard task assignment priority',
      'Escrow-protected wallet',
    ],
  },
  {
    key: 'golden',
    name: 'Golden',
    priceMin: 7000,
    priceMax: 10000,
    tagline: 'Most popular choice',
    popular: true,
    accent: 'from-amber-300 to-amber-500',
    ring: 'border-amber-400',
    chip: 'bg-amber-100 text-amber-700 border-amber-300',
    features: [
      'Registration / activation fee included',
      'Verified Member Badge',
      'Apply to any of the 6 job categories',
      'Higher task assignment priority',
      'Faster payment review by admin',
      'Escrow-protected wallet',
    ],
  },
  {
    key: 'platinum',
    name: 'Platinum',
    priceMin: 10000,
    priceMax: 15000,
    tagline: 'Maximum earning potential',
    accent: 'from-indigo-400 to-purple-500',
    ring: 'border-indigo-400',
    chip: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    features: [
      'Registration / activation fee included',
      'Verified Member Badge',
      'Apply to any of the 6 job categories',
      'Top task assignment priority',
      'Fastest payment review by admin',
      'Escrow-protected wallet + dedicated support',
    ],
  },
]

export function formatPkr(n) {
  return `PKR ${Number(n).toLocaleString('en-PK')}`
}

export const jobCategories = [
  {
    slug: 'tiktok-jobs',
    name: 'TikTok Jobs',
    iconKey: 'TikTok',
    tag: 'High Demand',
    tagColor: 'bg-pink-500/15 text-pink-300 border-pink-400/30',
    iconBg: 'from-pink-500 to-rose-500',
    desc: 'Video posting, editing, hashtag research & follower growth tasks for TikTok pages.',
    rate: 'PKR 300 – 1,500 / task',
    openings: '120+ open tasks',
    longDesc:
      'Work directly with TikTok page owners and small brands on short-form video tasks. Great for beginners who already know how to edit reels on their phone and understand trending sounds and hashtags.',
    tasks: [
      { title: 'Edit & post 1 TikTok video (CapCut/InShot)', pay: 'PKR 300 – 600' },
      { title: 'Hashtag & trending-sound research (per batch)', pay: 'PKR 250 – 450' },
      { title: 'Grow a page to 1,000 followers (organic)', pay: 'PKR 800 – 1,500' },
      { title: 'Write 10 short video captions/hooks', pay: 'PKR 300 – 500' },
      { title: 'Daily content calendar planning (weekly)', pay: 'PKR 900 – 1,200' },
    ],
    requirements: [
      'Active TikTok account in good standing',
      'Basic video editing app (CapCut, VN, or InShot)',
      'Stable internet for uploading videos',
    ],
  },
  {
    slug: 'instagram-jobs',
    name: 'Instagram Jobs',
    iconKey: 'Instagram',
    tag: 'Top Rated',
    tagColor: 'bg-purple-500/15 text-purple-300 border-purple-400/30',
    iconBg: 'from-purple-500 to-fuchsia-500',
    desc: 'Reels editing, caption writing, story management & page growth for IG accounts.',
    rate: 'PKR 250 – 1,200 / task',
    openings: '95+ open tasks',
    longDesc:
      'Help clients manage and grow their Instagram presence — from editing reels to keeping stories active and writing captions that convert. Most tasks are remote and self-paced.',
    tasks: [
      { title: 'Edit & schedule 1 Reel', pay: 'PKR 300 – 600' },
      { title: 'Write 5 post captions with hashtags', pay: 'PKR 250 – 400' },
      { title: 'Daily story management (per week)', pay: 'PKR 700 – 1,000' },
      { title: 'Page audit & growth strategy report', pay: 'PKR 800 – 1,200' },
      { title: 'Engage & reply to DMs/comments (per day)', pay: 'PKR 300 – 500' },
    ],
    requirements: [
      'Active Instagram account / familiarity with Reels & Stories',
      'Basic photo & video editing skills',
      'Good written communication for captions & DMs',
    ],
  },
  {
    slug: 'youtube-jobs',
    name: 'YouTube Jobs',
    iconKey: 'YouTube',
    tag: 'New Batch',
    tagColor: 'bg-red-500/15 text-red-300 border-red-400/30',
    iconBg: 'from-red-500 to-orange-500',
    desc: 'Thumbnail design, video editing, SEO tags & channel growth support work.',
    rate: 'PKR 400 – 2,000 / task',
    openings: '80+ open tasks',
    longDesc:
      'Support YouTube creators with the technical and creative side of running a channel — thumbnails, editing, SEO, and community management. Slightly higher pay since tasks need more skill.',
    tasks: [
      { title: 'Design 1 click-worthy thumbnail', pay: 'PKR 400 – 700' },
      { title: 'Edit a 5–10 min video (cuts, captions, music)', pay: 'PKR 800 – 2,000' },
      { title: 'SEO title, description & tags for 1 video', pay: 'PKR 300 – 500' },
      { title: 'Comment moderation & replies (per week)', pay: 'PKR 700 – 1,100' },
      { title: 'Channel audit & growth plan', pay: 'PKR 1,200 – 2,000' },
    ],
    requirements: [
      'Editing software (Premiere Pro, CapCut, or DaVinci Resolve)',
      'Basic Canva/Photoshop skills for thumbnails',
      'Understanding of YouTube SEO basics',
    ],
  },
  {
    slug: 'assignment-jobs',
    name: 'Assignment Jobs',
    iconKey: 'Clipboard',
    tag: 'Academic',
    tagColor: 'bg-indigo-500/15 text-indigo-300 border-indigo-400/30',
    iconBg: 'from-indigo-500 to-blue-500',
    desc: 'Essay writing, research work, formatting & proofreading for students & clients.',
    rate: 'PKR 500 – 3,000 / task',
    openings: '60+ open tasks',
    longDesc:
      'Academic and research-support tasks for students and professionals — writing, formatting, and proofreading. Pay scales with word count and deadline urgency.',
    tasks: [
      { title: 'Write a 1,000-word essay/report', pay: 'PKR 800 – 1,500' },
      { title: 'Proofread & format a document', pay: 'PKR 500 – 900' },
      { title: 'Research summary (5–10 sources)', pay: 'PKR 1,000 – 1,800' },
      { title: 'Full assignment with citations (2,000+ words)', pay: 'PKR 1,800 – 3,000' },
      { title: 'PowerPoint slides from written content', pay: 'PKR 600 – 1,200' },
    ],
    requirements: [
      'Strong written English',
      'Basic research & citation skills (APA/MLA)',
      'Ability to meet tight deadlines',
    ],
  },
  {
    slug: 'typing-jobs',
    name: 'Typing Jobs',
    iconKey: 'Keyboard',
    tag: 'Beginner Friendly',
    tagColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    iconBg: 'from-emerald-500 to-teal-500',
    desc: 'Data entry, document typing & transcription — quick and flexible daily earnings.',
    rate: 'PKR 200 – 900 / task',
    openings: '140+ open tasks',
    longDesc:
      'The easiest entry point on the platform — no special software needed, just accuracy and speed. Good for students or anyone wanting flexible daily-earning tasks.',
    tasks: [
      { title: 'Data entry — 100 rows (Excel/Sheets)', pay: 'PKR 200 – 350' },
      { title: 'Type a scanned document (5 pages)', pay: 'PKR 300 – 500' },
      { title: 'Audio-to-text transcription (10 min clip)', pay: 'PKR 400 – 700' },
      { title: 'PDF to Word conversion & formatting', pay: 'PKR 250 – 450' },
      { title: 'Bulk contact list typing (500 entries)', pay: 'PKR 600 – 900' },
    ],
    requirements: [
      'Good typing speed & accuracy',
      'MS Word / Excel or Google Docs & Sheets',
      'Attention to detail',
    ],
  },
  {
    slug: 'facebook-jobs',
    name: 'Facebook Jobs',
    iconKey: 'Facebook',
    tag: 'Community',
    tagColor: 'bg-blue-500/15 text-blue-300 border-blue-400/30',
    iconBg: 'from-blue-500 to-sky-500',
    desc: 'Page management, group moderation, post scheduling & ad support for FB pages.',
    rate: 'PKR 300 – 1,400 / task',
    openings: '75+ open tasks',
    longDesc:
      'Manage and grow Facebook Pages and Groups for local businesses and creators — posting, moderation, and light ad support. Steady, recurring task volume.',
    tasks: [
      { title: 'Schedule & post 5 updates to a Page', pay: 'PKR 300 – 500' },
      { title: 'Group moderation & spam removal (per week)', pay: 'PKR 700 – 1,000' },
      { title: 'Set up & monitor a boosted post/ad', pay: 'PKR 500 – 900' },
      { title: 'Reply to Page inbox messages (per day)', pay: 'PKR 300 – 500' },
      { title: 'Page growth to 500 new followers', pay: 'PKR 900 – 1,400' },
    ],
    requirements: [
      'Active, aged Facebook account in good standing',
      'Familiarity with Meta Business Suite (a plus)',
      'Comfortable moderating comments/messages',
    ],
  },
]

export function getCategoryBySlug(slug) {
  return jobCategories.find((c) => c.slug === slug)
}
