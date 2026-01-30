require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Startup = require('./models/Startup');
const Comment = require('./models/Comment');
const connectDB = require('./config/db');

const userData = [
  { username: 'sarah_chen', email: 'sarah@example.com', password: 'password123', role: 'founder' },
  { username: 'mike_founder', email: 'mike@example.com', password: 'password123', role: 'founder' },
  { username: 'priya_tech', email: 'priya@example.com', password: 'password123', role: 'founder' },
  { username: 'alex_dev', email: 'alex@example.com', password: 'password123', role: 'founder' },
  { username: 'jordan_lee', email: 'jordan@example.com', password: 'password123', role: 'founder' },
  { username: 'sam_investor', email: 'sam@example.com', password: 'password123', role: 'public' },
  { username: 'taylor_fan', email: 'taylor@example.com', password: 'password123', role: 'public' },
  { username: 'casey_rocks', email: 'casey@example.com', password: 'password123', role: 'public' },
  { username: 'riley_curious', email: 'riley@example.com', password: 'password123', role: 'public' },
  { username: 'quinn_builder', email: 'quinn@example.com', password: 'password123', role: 'public' },
];

const startupData = [
  { name: 'CloudSync', logo: 'https://logo.clearbit.com/cloudsync.io', oneLinePitch: 'One-click backup and sync for teams. Never lose a file again.', detailedDescription: 'CloudSync is a SaaS platform that automatically backs up and syncs files across your team. We support all major cloud providers and offer end-to-end encryption. Perfect for remote teams and agencies.', fundsRaised: 1200000, contactEmail: 'hello@cloudsync.io', categoryTags: ['SaaS', 'B2B', 'Cloud'] },
  { name: 'FitTrack', logo: 'https://ui-avatars.com/api/?name=FitTrack&background=6366f1&color=fff&size=128&bold=true', oneLinePitch: 'AI-powered fitness coaching in your pocket.', detailedDescription: 'FitTrack uses machine learning to create personalized workout and nutrition plans. Our app has helped over 50k users reach their goals. We integrate with wearables and offer live coaching.', fundsRaised: 850000, contactEmail: 'invest@fittrack.app', categoryTags: ['Health', 'AI', 'Mobile'] },
  { name: 'EduFlow', logo: 'https://ui-avatars.com/api/?name=EduFlow&background=10b981&color=fff&size=128&bold=true', oneLinePitch: 'Interactive learning paths for modern educators.', detailedDescription: 'EduFlow helps teachers build engaging courses with quizzes, videos, and live sessions. We focus on K-12 and vocational training. Already used in 200+ schools across three countries.', fundsRaised: 500000, contactEmail: 'partners@eduflow.com', categoryTags: ['EdTech', 'B2B', 'Education'] },
  { name: 'GreenCart', logo: 'https://ui-avatars.com/api/?name=GreenCart&background=22c55e&color=fff&size=128&bold=true', oneLinePitch: 'Carbon-neutral delivery for e-commerce.', detailedDescription: 'GreenCart partners with online stores to offer carbon-neutral shipping. We offset emissions and use electric last-mile where possible. Brands using us see higher conversion and loyalty.', fundsRaised: 2100000, contactEmail: 'funding@greencart.io', categoryTags: ['Sustainability', 'Logistics', 'E-commerce'] },
  { name: 'CodeCraft', logo: 'https://ui-avatars.com/api/?name=CodeCraft&background=f59e0b&color=fff&size=128&bold=true', oneLinePitch: 'Low-code platform that developers actually love.', detailedDescription: 'CodeCraft lets you build web apps with a visual builder while keeping full control of the code. Export to React or Vue. Used by 1000+ devs and agencies to ship faster.', fundsRaised: 650000, contactEmail: 'hello@codecraft.dev', categoryTags: ['Developer Tools', 'Low-code', 'SaaS'] },
  { name: 'MediMatch', logo: 'https://ui-avatars.com/api/?name=MediMatch&background=ec4899&color=fff&size=128&bold=true', oneLinePitch: 'Matching patients with the right clinical trials.', detailedDescription: 'MediMatch connects patients and researchers for clinical trials. Our AI improves matching accuracy and reduces trial recruitment time by 40%. We work with top pharma and hospitals.', fundsRaised: 3200000, contactEmail: 'invest@medimatch.com', categoryTags: ['HealthTech', 'AI', 'B2B'] },
  { name: 'PaySlice', logo: 'https://ui-avatars.com/api/?name=PaySlice&background=3b82f6&color=fff&size=128&bold=true', oneLinePitch: 'BNPL and split payments for SMBs.', detailedDescription: 'PaySlice enables small businesses to offer buy-now-pay-later and split payments. We handle risk and compliance. Merchants see 25% higher average order value.', fundsRaised: 1800000, contactEmail: 'partners@payslice.com', categoryTags: ['Fintech', 'Payments', 'SMB'] },
  { name: 'RecycleAI', logo: 'https://ui-avatars.com/api/?name=RecycleAI&background=14b8a6&color=fff&size=128&bold=true', oneLinePitch: 'Smart sorting for recycling facilities.', detailedDescription: 'RecycleAI uses computer vision to sort waste at scale. Our systems increase purity and throughput. We are deployed in 15 facilities across Europe.', fundsRaised: 950000, contactEmail: 'contact@recycleai.tech', categoryTags: ['AI', 'Sustainability', 'Hardware'] },
  { name: 'VoiceBase', logo: 'https://ui-avatars.com/api/?name=VoiceBase&background=8b5cf6&color=fff&size=128&bold=true', oneLinePitch: 'Voice analytics for customer support teams.', detailedDescription: 'VoiceBase turns call recordings into insights. Sentiment, topics, and compliance in one dashboard. Used by contact centers to improve CSAT and reduce risk.', fundsRaised: 1100000, contactEmail: 'sales@voicebase.io', categoryTags: ['SaaS', 'AI', 'CX'] },
  { name: 'FarmStack', logo: 'https://ui-avatars.com/api/?name=FarmStack&background=16a34a&color=fff&size=128&bold=true', oneLinePitch: 'Supply chain and marketplace for smallholder farmers.', detailedDescription: 'FarmStack connects farmers with buyers and provides logistics and payments. We reduce food waste and improve farmer income. Active in India and Southeast Asia.', fundsRaised: 750000, contactEmail: 'hello@farmstack.co', categoryTags: ['AgTech', 'Marketplace', 'Sustainability'] },
  { name: 'SecureVault', logo: 'https://ui-avatars.com/api/?name=SecureVault&background=1e40af&color=fff&size=128&bold=true', oneLinePitch: 'Zero-knowledge encrypted storage for enterprises.', detailedDescription: 'SecureVault offers end-to-end encrypted file storage and sharing. Only your team holds the keys. Compliant with SOC2 and GDPR. Trusted by 50+ enterprises.', fundsRaised: 2400000, contactEmail: 'enterprise@securevault.com', categoryTags: ['Security', 'SaaS', 'B2B'] },
  { name: 'Eventify', logo: 'https://ui-avatars.com/api/?name=Eventify&background=f97316&color=fff&size=128&bold=true', oneLinePitch: 'All-in-one platform for virtual and hybrid events.', detailedDescription: 'Eventify handles registration, streaming, networking, and analytics. We have powered 5000+ events. Integrates with Zoom, Slack, and major CRMs.', fundsRaised: 1400000, contactEmail: 'events@eventify.io', categoryTags: ['Events', 'SaaS', 'B2B'] },
  { name: 'TaskBurst', logo: 'https://ui-avatars.com/api/?name=TaskBurst&background=ef4444&color=fff&size=128&bold=true', oneLinePitch: 'Async video updates that replace long meetings.', detailedDescription: 'TaskBurst lets teams send short video updates instead of scheduling calls. Async by default, with reactions and threads. We have cut meeting time by 30% for our customers.', fundsRaised: 600000, contactEmail: 'team@taskburst.app', categoryTags: ['Productivity', 'Video', 'Remote'] },
  { name: 'LocalBite', logo: 'https://ui-avatars.com/api/?name=LocalBite&background=dc2626&color=fff&size=128&bold=true', oneLinePitch: 'Discover and order from local food makers.', detailedDescription: 'LocalBite is a marketplace for homemade and small-batch food. We handle payments, delivery, and quality. Supporting 2000+ makers in 12 cities.', fundsRaised: 420000, contactEmail: 'hello@localbite.com', categoryTags: ['Marketplace', 'Food', 'Local'] },
  { name: 'DataPipe', logo: 'https://ui-avatars.com/api/?name=DataPipe&background=06b6d4&color=fff&size=128&bold=true', oneLinePitch: 'No-code data pipelines for growth teams.', detailedDescription: 'DataPipe connects your tools and databases without writing code. Sync, transform, and schedule in a few clicks. Used by marketing and ops teams at 300+ companies.', fundsRaised: 1700000, contactEmail: 'invest@datapipe.io', categoryTags: ['Data', 'No-code', 'SaaS'] },
];

async function seed() {
  await connectDB();
  const db = mongoose.connection;

  console.log('Clearing existing data...');
  await Comment.deleteMany({});
  await Startup.deleteMany({});
  await User.deleteMany({});

  console.log('Creating users...');
  const users = [];
  for (const u of userData) {
    users.push(await User.create(u));
  }
  const founders = users.filter(u => u.role === 'founder');
  const publicUsers = users.filter(u => u.role === 'public');

  console.log('Creating startups...');
  const startups = [];
  for (let i = 0; i < startupData.length; i++) {
    const s = startupData[i];
    const author = founders[i % founders.length];
    const startup = await Startup.create({
      ...s,
      author: author._id,
    });
    startups.push(startup);
  }

  console.log('Adding votes and followers to startups...');
  for (const s of startups) {
    const upVoters = [...users].sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 5));
    const downVoters = [...users].filter(u => !upVoters.some(uv => uv._id.equals(u._id))).slice(0, Math.floor(Math.random() * 2));
    const followers = [...users].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 4));
    s.upvotes = upVoters.map(u => u._id);
    s.downvotes = downVoters.map(u => u._id);
    s.followers = followers.map(u => u._id);
    await s.save();
  }

  console.log('Creating comments...');
  const commentTexts = [
    'Really impressive traction. What’s the main differentiator vs incumbents?',
    'Love the focus on sustainability. When do you plan to expand to the US?',
    'We’ve been looking for something like this. Happy to connect.',
    'How do you handle compliance in different regions?',
    'The demo was great. When is the API going public?',
    'Congrats on the round. Who led the seed?',
    'This could be huge for SMBs. Following.',
    'Would love to see a case study with a mid-market customer.',
    'Pricing is clear – rare in this space.',
    'How does this compare to [competitor]? Considering both.',
    'Exactly what we needed. Signed up last week.',
    'Any plans for a mobile app?',
    'Great pitch. What’s the biggest risk you’re watching?',
    'Interested in a pilot. Who do we talk to?',
    'The UX is really clean. Well done.',
    'Following. Would like to stay updated on launches.',
    'We use something similar – curious how you differentiate.',
    'Impressive numbers. What’s the main driver of churn?',
    'This is the future of the space. In.',
    'When do you expect to be profitable?',
  ];
  const replyTexts = [
    'Thanks! I’ll DM you the details.',
    'Great question – we’re focusing on EU first, then US in Q3.',
    'Our compliance team handles region-specific requirements.',
    'API is in beta – you can request access on the site.',
    'We had a strong lead from a tier-1 VC.',
    'We’re publishing one next month. I’ll share it here.',
    'App is on the roadmap for next quarter.',
    'Happy to jump on a call. Check the contact email.',
  ];

  for (let i = 0; i < startups.length; i++) {
    const startup = startups[i];
    const numComments = 2 + Math.floor(Math.random() * 4);
    const used = new Set();
    for (let c = 0; c < numComments; c++) {
      const author = users[Math.floor(Math.random() * users.length)];
      const text = commentTexts[(i * 3 + c) % commentTexts.length];
      const comment = await Comment.create({
        content: text,
        author: author._id,
        startup: startup._id,
        parent: null,
      });
      comment.upvotes = [users[0]._id, users[1]._id].slice(0, 1 + Math.floor(Math.random() * 2));
      comment.downvotes = [];
      await comment.save();
      used.add(comment._id.toString());

      if (Math.random() > 0.5) {
        const replyAuthor = users[Math.floor(Math.random() * users.length)];
        const reply = await Comment.create({
          content: replyTexts[c % replyTexts.length],
          author: replyAuthor._id,
          startup: startup._id,
          parent: comment._id,
        });
        await Comment.findByIdAndUpdate(comment._id, { $push: { replies: reply._id } });
        reply.upvotes = [users[2]._id];
        await reply.save();
      }
    }
    startup.commentCount = await Comment.countDocuments({ startup: startup._id });
    await startup.save();
  }

  console.log('Updating user followedStartups...');
  for (const user of users) {
    const followed = await Startup.find({ followers: user._id }).select('_id');
    user.followedStartups = followed.map(s => s._id);
    await user.save();
  }

  console.log('Seed complete. Created:', users.length, 'users,', startups.length, 'startups,', await Comment.countDocuments(), 'comments.');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
