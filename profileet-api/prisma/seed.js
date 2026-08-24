const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log(' Seeding database...')

  await prisma.booking.deleteMany()
  await prisma.inquiry.deleteMany()
  await prisma.availability.deleteMany()
  await prisma.message.deleteMany()
  await prisma.messageConversation.deleteMany()
  await prisma.artisanNote.deleteMany()
  await prisma.artisanProfile.deleteMany()
  await prisma.clientProfile.deleteMany()
  await prisma.portfolioItem.deleteMany()
  await prisma.review.deleteMany()
  await prisma.user.deleteMany()

  const artisanUser = await prisma.user.upsert({
    where: { email: 'adaeze@example.com' },
    update: {
      password: 'seeded-artisan-password',
      role: 'artisan',
    },
    create: {
      email: 'adaeze@example.com',
      password: 'seeded-artisan-password',
      role: 'artisan',
    },
  })

  const clientUser = await prisma.user.upsert({
    where: { email: 'ada.obi@example.com' },
    update: {
      password: 'seeded-client-password',
      role: 'client',
    },
    create: {
      email: 'ada.obi@example.com',
      password: 'seeded-client-password',
      role: 'client',
    },
  })
  

  const bookings = [
    {
      id: 'BK-2401',
      client: 'Amara Obiechina',
      initials: 'AO',
      clientColor: '#be185d',
      clientPhone: '08012345678',
      service: 'Bridal Gown',
      occasion: 'Wedding',
      deliveryDate: '2026-08-15',
      quantity: 1,
      urgent: false,
      status: 'pending',
      receivedAt: '2026-06-17T08:30:00',
      price: 120000,
      depositPaid: false,
      depositAmount: 60000,
      designNotes:
        'A floor-length A-line bridal gown with off-shoulder neckline, floral lace overlay on the bodice, cinched waist with a satin bow at the back, and a cathedral train. I want it pure ivory white.',
      fabrics: ['Lace', 'Silk'],
      colors: ['#f5f5f0'],
      inspirationRef: 'https://pinterest.com/pin/example',
      measurements: {
        chest: '88', waist: '70', hips: '96', shoulder: '38',
        dressLength: '180', height: '168', weight: '62',
      },
      consultation: {
        requested: true, date: '2026-06-20', time: '11:00 AM',
        note: 'Want to discuss the lace pattern and train length in detail.', status: 'pending',
      },
    },
    {
      id: 'BK-2402',
      client: 'Tunde Balogun',
      initials: 'TB',
      clientColor: '#0ea5e9',
      clientPhone: '08098765432',
      service: 'Agbada Set',
      occasion: 'Traditional Ceremony',
      deliveryDate: '2026-07-20',
      quantity: 1,
      urgent: true,
      status: 'accepted',
      receivedAt: '2026-06-16T14:00:00',
      price: 85000,
      depositPaid: true,
      depositAmount: 42500,
      designNotes:
        'Full 3-piece Agbada set — inner sokoto, inner buba, and outer agbada. Deep royal blue with gold embroidery on collar and cuffs. Wide sleeves. No cap needed.',
      fabrics: ['Aso-oke'],
      colors: ['#1e3a8a', '#d97706'],
      measurements: {
        chest: '102', waist: '88', hips: '105', shoulder: '46', height: '175', weight: '85',
      },
      consultation: { requested: false, status: 'none' },
    },
    {
      id: 'BK-2403',
      client: 'Funke Adeyemi',
      initials: 'FA',
      clientColor: '#7c3aed',
      clientPhone: '09011223344',
      service: 'Corporate Blazer Set',
      occasion: 'Corporate Event',
      deliveryDate: '2026-07-05',
      quantity: 2,
      urgent: false,
      status: 'in_progress',
      receivedAt: '2026-06-14T09:00:00',
      price: 55000,
      depositPaid: true,
      depositAmount: 27500,
      designNotes:
        'Two matching blazer sets — one wine and one charcoal. Both slim-fit with 2 front buttons. Straight-cut trousers. Would love a subtle pinstripe on the charcoal one.',
      fabrics: ['Cotton'],
      colors: ['#7f1d1d', '#374151'],
      measurements: {
        chest: '94', waist: '76', hips: '98', shoulder: '40',
        sleeveLength: '60', dressLength: '100', height: '162', weight: '68',
      },
      consultation: { requested: true, date: '2026-06-15', time: '10:00 AM', note: '', status: 'done' },
    },
    {
      id: 'BK-2404',
      client: 'Chidinma Eze',
      initials: 'CE',
      clientColor: '#16a34a',
      clientPhone: '07033445566',
      service: 'Evening Gown',
      occasion: 'Birthday',
      deliveryDate: '2026-06-28',
      quantity: 1,
      urgent: true,
      status: 'completed',
      receivedAt: '2026-06-10T11:00:00',
      price: 75000,
      depositPaid: true,
      depositAmount: 75000,
      designNotes:
        'Elegant floor-length evening gown in emerald green. Mermaid silhouette, open back, embellished neckline. Side slit at the left leg.',
      fabrics: ['Chiffon', 'Velvet'],
      colors: ['#065f46'],
      measurements: { chest: '84', waist: '66', hips: '92', dressLength: '175', height: '170', weight: '58' },
      consultation: { requested: false, status: 'none' },
    },
    {
      id: 'BK-2405',
      client: 'Emeka Nwosu',
      initials: 'EN',
      clientColor: '#d97706',
      clientPhone: '08155667788',
      service: 'Ankara Shirt (×3)',
      occasion: 'Everyday Wear',
      deliveryDate: '2026-07-10',
      quantity: 3,
      urgent: false,
      status: 'cancelled',
      receivedAt: '2026-06-12T16:00:00',
      price: 36000,
      depositPaid: false,
      depositAmount: 0,
      designNotes: '3 casual Ankara shirts in different prints. Short sleeves, relaxed fit.',
      fabrics: ['Ankara'],
      colors: [],
      measurements: { chest: '98', waist: '84', shoulder: '44', sleeveLength: '30', height: '180', weight: '80' },
      consultation: { requested: false, status: 'none' },
    },
  ]

  for (const booking of bookings) {
    await prisma.booking.create({
      data: {
        ...booking,
        artisanId: artisanUser.id,
        clientId: null,
      },
    })
  }
  console.log(`  ${bookings.length} bookings seeded`)

 
  const inquiries = [
    {
      client: 'Amara Obi',
      service: 'Bridal gown & 2 asoebi',
      date: 'Jun 10',
      status: 'New',
      message: 'Hi, I need a bridal gown and 2 asoebi dresses for my wedding in August. Can we discuss pricing?',
    },
    {
      client: 'Funke Adeyemi',
      service: 'Corporate blazer set',
      date: 'Jun 9',
      status: 'Replied',
      message: 'I would like a corporate blazer set in navy blue. Size 12. What is your turnaround time?',
    },
    {
      client: 'Chisom Eze',
      service: 'Ankara two-piece',
      date: 'Jun 8',
      status: 'Booked',
      message: 'Please I want an Ankara two-piece for a naming ceremony. I have the fabric already.',
    },
  ]

  for (const inquiry of inquiries) {
    await prisma.inquiry.create({
      data: {
        ...inquiry,
        artisanId: artisanUser.id,
        clientId: null,
      },
    })
  }
  console.log(`   ${inquiries.length} inquiries seeded`)

  
  const reviews = [
    {
      client: 'Amara Obi',
      initials: 'AO',
      color: '#be185d',
      service: 'Bridal Gown',
      rating: 5,
      date: 'Jun 10, 2026',
      text: 'My bridal gown was absolutely stunning! The craftsmanship and attention to detail exceeded all my expectations. The fit was perfect and every guest complimented it. I will definitely recommend to all my friends.',
      helpful: 12,
      replied: false,
      bookingId: 'BK-2401',
    },
    {
      client: 'Chidinma Eze',
      initials: 'CE',
      color: '#16a34a',
      service: 'Evening Gown',
      rating: 5,
      date: 'Jun 28, 2026',
      text: 'Fast turnaround and the evening gown fit perfectly on the first try. She understood exactly what I wanted even from my rough sketch. Absolutely loved it!',
      helpful: 8,
      replied: true,
      reply: 'Thank you so much, Chidinma! It was a pleasure creating your gown. You were such a joy to work with. Looking forward to dressing you again! 🧡',
      bookingId: 'BK-2404',
    },
    {
      client: 'Tunde Balogun',
      initials: 'TB',
      color: '#0ea5e9',
      service: 'Agbada Set',
      rating: 4,
      date: 'Jun 20, 2026',
      text: 'Beautiful agbada set, very professional. Communication throughout was excellent and delivery was on time. Would have given 5 stars but one seam needed slight adjustment.',
      helpful: 5,
      replied: false,
      bookingId: 'BK-2402',
    },
    {
      client: 'Funke Adeyemi',
      initials: 'FA',
      color: '#7c3aed',
      service: 'Corporate Blazer Set',
      rating: 5,
      date: 'Jul 5, 2026',
      text: 'Two blazer sets that looked exactly like the reference photos. My colleagues were impressed. The quality of the cotton fabric was premium.',
      helpful: 9,
      replied: false,
      bookingId: 'BK-2403',
    },
  ]

  for (const review of reviews) {
    await prisma.review.create({
      data: {
        ...review,
        artisanId: artisanUser.id,
      },
    })
  }
  console.log(`   ${reviews.length} reviews seeded`)

  const artisanSeeds = [
    {
      id: 'seed-artisan-2',
      email: 'emeka@example.com',
      name: 'Emeka Fashola',
      specialty: 'Streetwear & Casual',
      location: 'Lagos, Ikeja',
      bio: 'Tailor for casual and streetwear looks.',
      phone: '08023456789',
      yearsOfExperience: 5,
      initials: 'EF',
      color: '#1a1a2e',
      styles: ['Streetwear', 'Casual', 'Unisex'],
      startingPrice: 20000,
      available: true,
      status: 'Verified',
      joined: 'Jun 8, 2025',
    },
    {
      id: 'seed-artisan-3',
      email: 'fatima@example.com',
      name: 'Fatima Aliyu',
      specialty: 'Kaftan & Aso-oke',
      location: 'Abuja, Wuse',
      bio: 'Traditional and kaftan specialist.',
      phone: '08034567890',
      yearsOfExperience: 3,
      initials: 'FA',
      color: '#1a1a2e',
      styles: ['Kaftan', 'Aso-oke', 'Traditional'],
      startingPrice: 35000,
      available: false,
      status: 'Active',
      joined: 'Jun 5, 2025',
    },
    {
      id: 'seed-artisan-4',
      email: 'chidi@example.com',
      name: 'Chidi Okafor',
      specialty: 'Corporate & Suits',
      location: 'Port Harcourt',
      bio: 'Sharp corporate tailoring and suiting.',
      phone: '08045678901',
      yearsOfExperience: 9,
      initials: 'CO',
      color: '#1a1a2e',
      styles: ['Corporate', 'Suits', 'Agbada'],
      startingPrice: 30000,
      available: true,
      status: 'Active',
      joined: 'Jun 1, 2025',
    },
    {
      id: 'seed-artisan-5',
      email: 'ngozi@example.com',
      name: 'Ngozi Eze',
      specialty: 'Evening & Cocktail',
      location: 'Lagos, Lekki',
      bio: 'Eveningwear and cocktail pieces.',
      phone: '08056789012',
      yearsOfExperience: 4,
      initials: 'NE',
      color: '#1a1a2e',
      styles: ['Evening', 'Cocktail', 'Bridal'],
      startingPrice: 60000,
      available: true,
      status: 'Pending',
      joined: 'May 25, 2025',
    },
    {
      id: 'seed-artisan-6',
      email: 'bayo@example.com',
      name: 'Bayo Adeleke',
      specialty: 'Agbada & Traditional',
      location: 'Ibadan',
      bio: 'Agbada and traditional wear specialist.',
      phone: '08067890123',
      yearsOfExperience: 10,
      initials: 'BA',
      color: '#1a1a2e',
      styles: ['Agbada', 'Traditional', 'Ankara'],
      startingPrice: 25000,
      available: false,
      status: 'Rejected',
      joined: 'May 20, 2025',
    },
  ]

  for (const seed of artisanSeeds) {
    await prisma.user.upsert({
      where: { email: seed.email },
      update: { name: seed.name, role: 'artisan' },
      create: { id: seed.id, name: seed.name, email: seed.email, password: 'seeded-artisan-password', role: 'artisan' },
    })
  }

  await prisma.artisanProfile.createMany({
    data: [
      { id: '1', artisanId: artisanUser.id, fullName: 'Adaeze Nwosu', specialty: 'Bridal & Ankara', location: 'Lagos, VI', bio: 'Bridal artisan with a focus on elegant, modern silhouettes.', phone: '08012345678', yearsOfExperience: 7, initials: 'AN', color: '#1a1a2e', styles: ['Bridal', 'Ankara', 'Corporate'], startingPrice: 45000, available: true, status: 'Pending', joined: 'Jun 10, 2025' },
      { id: '2', artisanId: 'seed-artisan-2', fullName: 'Emeka Fashola', specialty: 'Streetwear & Casual', location: 'Lagos, Ikeja', bio: 'Tailor for casual and streetwear looks.', phone: '08023456789', yearsOfExperience: 5, initials: 'EF', color: '#1a1a2e', styles: ['Streetwear', 'Casual', 'Unisex'], startingPrice: 20000, available: true, status: 'Verified', joined: 'Jun 8, 2025' },
      { id: '3', artisanId: 'seed-artisan-3', fullName: 'Fatima Aliyu', specialty: 'Kaftan & Aso-oke', location: 'Abuja, Wuse', bio: 'Traditional and kaftan specialist.', phone: '08034567890', yearsOfExperience: 3, initials: 'FA', color: '#1a1a2e', styles: ['Kaftan', 'Aso-oke', 'Traditional'], startingPrice: 35000, available: false, status: 'Active', joined: 'Jun 5, 2025' },
      { id: '4', artisanId: 'seed-artisan-4', fullName: 'Chidi Okafor', specialty: 'Corporate & Suits', location: 'Port Harcourt', bio: 'Sharp corporate tailoring and suiting.', phone: '08045678901', yearsOfExperience: 9, initials: 'CO', color: '#1a1a2e', styles: ['Corporate', 'Suits', 'Agbada'], startingPrice: 30000, available: true, status: 'Active', joined: 'Jun 1, 2025' },
      { id: '5', artisanId: 'seed-artisan-5', fullName: 'Ngozi Eze', specialty: 'Evening & Cocktail', location: 'Lagos, Lekki', bio: 'Eveningwear and cocktail pieces.', phone: '08056789012', yearsOfExperience: 4, initials: 'NE', color: '#1a1a2e', styles: ['Evening', 'Cocktail', 'Bridal'], startingPrice: 60000, available: true, status: 'Pending', joined: 'May 25, 2025' },
      { id: '6', artisanId: 'seed-artisan-6', fullName: 'Bayo Adeleke', specialty: 'Agbada & Traditional', location: 'Ibadan', bio: 'Agbada and traditional wear specialist.', phone: '08067890123', yearsOfExperience: 10, initials: 'BA', color: '#1a1a2e', styles: ['Agbada', 'Traditional', 'Ankara'], startingPrice: 25000, available: false, status: 'Rejected', joined: 'May 20, 2025' },
    ]
  })

  await prisma.artisanNote.create({
    data: { artisanProfileId: '2',
       author: 'Support Agent', role: 'support_agent',
        content: 'artisan submitted all required documents. Portfolio reviewed and approved.', createdAt: 'Jun 9, 2025' },
  })

  await prisma.artisanNote.create({
    data: { artisanProfileId: '4', author: 'Profile Manager', role: 'profile_manager', content: 'Account suspended pending investigation into client complaint about undelivered order.', createdAt: 'Jun 1, 2025' },
  })

  await prisma.artisanNote.create({
    data: { artisanProfileId: '6', author: 'Profile Manager', role: 'profile_manager', content: 'Profile rejected - portfolio does not meet minimum quality standards. artisan may reapply in 30 days.', createdAt: 'May 21, 2025' },
  })

  await prisma.messageConversation.create({
    data: {
      artisanProfileId: '1',
      artisanId: artisanUser.id,
      artisanName: 'Adaeze Nwosu',
      initials: 'AN',
      color: '#FF6500',
      lastMessage: 'Your gown is ready for the second fitting!',
      time: '10:42 AM',
      unread: 2,
      messages: {
        create: [
          { from: 'client', text: 'Hi Adaeze, I just confirmed my booking. Looking forward to working with you!', time: 'Mon 9:00 AM' },
          { from: 'artisan', text: "Thank you! I've received your brief. Let's schedule the first fitting for next week.", time: 'Mon 9:15 AM' },
        ]
      }
    }
  })

  await prisma.clientProfile.create({
    data: { clientId: clientUser.id, firstName: 'Ada', lastName: 'Obi', email: 'ada.obi@example.com', phone: '08012345678', location: 'Lagos, Nigeria', bio: 'I love beautifully made clothes and easy communication with artisans.' },
  })

  console.log(' Seeding complete!')

}

main()
  .catch((e) => {
    console.error(' Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


