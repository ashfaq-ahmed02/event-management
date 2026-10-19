import bcrypt from 'bcryptjs';
import { db } from './db';

export function seedDatabase() {
  console.log('🌱 Starting CampusEvent database seeding...');

  // 1. Seed Users (if not exists)
  const existingUsers = db.all('SELECT count(*) as count FROM users');
  if (existingUsers[0].count === 0) {
    const adminPasswordHash = bcrypt.hashSync('Admin@123', 10);
    const studentPasswordHash = bcrypt.hashSync('Student@123', 10);
    const organizerPasswordHash = bcrypt.hashSync('Organizer@123', 10);

    db.run(
      `INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)`,
      ['Campus Admin', 'admin@campusevent.edu', adminPasswordHash, 'admin', 'Student Affairs & Dean Office']
    );

    db.run(
      `INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)`,
      ['Alex Johnson', 'student@campusevent.edu', studentPasswordHash, 'student', 'Computer Science & Engineering']
    );

    db.run(
      `INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)`,
      ['Prof. Elena Rostova', 'organizer@campusevent.edu', organizerPasswordHash, 'admin', 'Faculty Event Coordinator']
    );

    console.log('✅ Default users seeded (admin@campusevent.edu & student@campusevent.edu)');
  }

  // 2. Seed Events (if not exists)
  const existingEvents = db.all('SELECT count(*) as count FROM events');
  if (existingEvents[0].count === 0) {
    const sampleEvents = [
      {
        title: 'HackCampus 2026: 36-Hour National Hackathon',
        description: 'Join over 500 top college builders, designers, and innovators solving real-world AI, FinTech, and Sustainability challenges with $10,000+ in prizes, sponsor perks, and recruitment opportunities.',
        category: 'Technical',
        date: '2026-11-15',
        time: '09:00 AM',
        venue: 'Main Auditorium & Innovation Lab',
        capacity: 250,
        registered_count: 42,
        banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1200&q=80',
        organizer: 'Campus Tech Club & ACM Chapter',
        price: 0,
        status: 'Upcoming'
      },
      {
        title: 'Euphoria 2026: Annual Inter-College Cultural Fest',
        description: 'The biggest extravaganza of music, dance, battle of bands, fashion runway, and celebrity DJ night. Celebrate diversity and artistry with student performers from 40+ colleges.',
        category: 'Cultural',
        date: '2026-11-22',
        time: '04:00 PM',
        venue: 'Grand Open Air Amphitheatre',
        capacity: 600,
        registered_count: 120,
        banner_url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
        organizer: 'Campus Cultural Society',
        price: 0,
        status: 'Upcoming'
      },
      {
        title: 'Generative AI & LLM Systems Hands-on Workshop',
        description: 'Intensive masterclass on fine-tuning Open-Source LLMs, LangChain agentic workflows, and deploying RAG pipelines to production. Bring your laptop and GitHub account.',
        category: 'Workshop',
        date: '2026-11-05',
        time: '10:00 AM',
        venue: 'Turing Hall, 3rd Floor Computer Science Block',
        capacity: 80,
        registered_count: 35,
        banner_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
        organizer: 'AI Research & Robotics Lab',
        price: 0,
        status: 'Upcoming'
      },
      {
        title: 'Annual Inter-Department Football & Cricket Cup',
        description: 'Cheer for your department in the grand campus sports tournament featuring knockout football matches, cricket league, athletic sprints, and faculty exhibition matches.',
        category: 'Sports',
        date: '2026-11-10',
        time: '08:30 AM',
        venue: 'University Central Sports Arena & Ground',
        capacity: 400,
        registered_count: 85,
        banner_url: 'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?auto=format&fit=crop&w=1200&q=80',
        organizer: 'Department of Physical Education',
        price: 0,
        status: 'Upcoming'
      },
      {
        title: 'Campus Career & Internship Expo 2026',
        description: 'Meet recruiters from Fortune 500 tech companies, fast-growing startups, and research institutions. On-spot resume reviews, technical screening rounds, and career counseling.',
        category: 'Seminar',
        date: '2026-12-01',
        time: '10:00 AM',
        venue: 'Convention & Placement Pavilion',
        capacity: 500,
        registered_count: 210,
        banner_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
        organizer: 'Training & Placement Cell',
        price: 0,
        status: 'Upcoming'
      },
      {
        title: 'RoboWars & Autonomous Drone Racing',
        description: 'High-octane combat robotics cage matches and high-speed FPV drone obstacle course racing. Witness custom-built 15kg combat bots battle for campus supremacy.',
        category: 'Technical',
        date: '2026-11-28',
        time: '02:00 PM',
        venue: 'Mechanical Workshop Arena',
        capacity: 200,
        registered_count: 50,
        banner_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
        organizer: 'Robotics & Automation Guild',
        price: 0,
        status: 'Upcoming'
      }
    ];

    for (const evt of sampleEvents) {
      db.run(
        `INSERT INTO events (title, description, category, date, time, venue, capacity, registered_count, banner_url, organizer, price, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          evt.title,
          evt.description,
          evt.category,
          evt.date,
          evt.time,
          evt.venue,
          evt.capacity,
          evt.registered_count,
          evt.banner_url,
          evt.organizer,
          evt.price,
          evt.status
        ]
      );
    }
    console.log('✅ 6 Sample campus events seeded.');
  }

  // 3. Seed Registrations for demo student
  const student = db.get<{ id: number }>('SELECT id FROM users WHERE email = ?', ['student@campusevent.edu']);
  const firstEvent = db.get<{ id: number }>('SELECT id FROM events ORDER BY id ASC LIMIT 1');
  if (student && firstEvent) {
    const existingReg = db.get('SELECT id FROM registrations WHERE user_id = ? AND event_id = ?', [student.id, firstEvent.id]);
    if (!existingReg) {
      db.run(
        `INSERT INTO registrations (user_id, event_id, ticket_code, status) VALUES (?, ?, ?, ?)`,
        [student.id, firstEvent.id, 'CE-HACK-88319', 'confirmed']
      );
    }
  }

  // 4. Seed FAQs for Campus AI Chatbot
  const existingFaqs = db.all('SELECT count(*) as count FROM faqs');
  if (existingFaqs[0].count === 0) {
    const faqs = [
      {
        question: 'How do I register for an event?',
        answer: 'To register, log in to your student account, browse the events on the Home page, click on any event card to view details, and click the "Register Now" button. You will receive an instant digital ticket with a unique ticket code.',
        category: 'Registration',
        keywords: 'register, how to register, signup for event, join event, ticket'
      },
      {
        question: 'Where is the Main Auditorium located?',
        answer: 'The Main Auditorium is situated on the Ground Floor right beside the Central Library and Administrative Block. Parking is available at Gate 2.',
        category: 'Venues',
        keywords: 'auditorium, location, directions, where is auditorium, venue'
      },
      {
        question: 'Where is the Grand Open Air Amphitheatre?',
        answer: 'The Open Air Amphitheatre is located in the Central Campus Garden behind the Student Activity Center (SAC). Follow the signs from Gate 1.',
        category: 'Venues',
        keywords: 'amphitheatre, open air, cultural fest venue, music location'
      },
      {
        question: 'What are the upcoming technical events and hackathons?',
        answer: 'Upcoming technical highlights include "HackCampus 2026: 36-Hour National Hackathon" on Nov 15 and "Generative AI Workshop" on Nov 05. Check the "Technical" filter tab on the home page for complete details.',
        category: 'Events',
        keywords: 'tech, technical, hackathon, coding, ai, robotics'
      },
      {
        question: 'Do I get a certificate of participation?',
        answer: 'Yes! All confirmed registrations who attend the event and verify their digital ticket code at the venue check-in desk will receive an official verifiable digital certificate.',
        category: 'Certificates',
        keywords: 'certificate, attendance, credit, proof, participation'
      },
      {
        question: 'How can an admin or organizer create a new event?',
        answer: 'Admins and club organizers can log in with their admin credentials and navigate to the "Admin Portal" from the top navigation bar. Click "+ Create Event" to enter title, category, date, venue, capacity, and banner image.',
        category: 'Admin',
        keywords: 'create event, add event, organizer, admin portal, host event'
      },
      {
        question: 'How can I cancel my event registration?',
        answer: 'Go to your "My Dashboard" tab from the navbar, locate the event under "My Registered Events", and click the "Cancel Registration" button. This automatically frees up the seat for other students.',
        category: 'Registration',
        keywords: 'cancel, unregister, remove registration, refund, leave event'
      },
      {
        question: 'Who should I contact if I have technical issues?',
        answer: 'You can reach the Campus Event Technical Committee at support@campusevent.edu or visit the IT Helpdesk at CS Block Room 102.',
        category: 'Support',
        keywords: 'contact, help, support, email, phone, issue, problem'
      }
    ];

    for (const f of faqs) {
      db.run(
        `INSERT INTO faqs (question, answer, category, keywords) VALUES (?, ?, ?, ?)`,
        [f.question, f.answer, f.category, f.keywords]
      );
    }
    console.log('✅ 8 Campus FAQ entries seeded for the AI Chatbot.');
  }

  console.log('🎉 CampusEvent database seeding complete!');
}
