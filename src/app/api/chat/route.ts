import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { CampusEvent, FAQ } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { message } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    const query = message.trim().toLowerCase();

    // 1. Check for specific event inquiries (e.g. "hackathon", "euphoria", "football", "ai workshop", "career")
    const events = db.all<CampusEvent>("SELECT * FROM events WHERE status != 'Cancelled'");
    
    // Check if query is asking for category events
    const categories = ['technical', 'cultural', 'sports', 'workshop', 'seminar'];
    const matchedCategory = categories.find(cat => query.includes(cat));

    if (matchedCategory) {
      const categoryEvents = events.filter(e => e.category.toLowerCase() === matchedCategory);
      if (categoryEvents.length > 0) {
        const eventList = categoryEvents
          .map(e => `• **${e.title}**\n  📅 Date: ${e.date} at ${e.time}\n  📍 Venue: ${e.venue}\n  🎟️ Seats Left: ${Math.max(0, e.capacity - e.registered_count)} / ${e.capacity}`)
          .join('\n\n');

        return NextResponse.json({
          success: true,
          reply: `Here are the upcoming **${matchedCategory.toUpperCase()}** events on campus:\n\n${eventList}\n\n💡 *Tip: Click on any event card on the home page to register!*`,
          suggestions: ['How to register?', 'Where is Main Auditorium?', 'Show all events'],
        });
      }
    }

    // Check if query asks for a specific event by title or keyword
    const matchedEvent = events.find(e => 
      query.includes(e.title.toLowerCase()) || 
      e.title.toLowerCase().split(' ').some(w => w.length > 4 && query.includes(w))
    );

    if (matchedEvent) {
      const seatsLeft = Math.max(0, matchedEvent.capacity - matchedEvent.registered_count);
      return NextResponse.json({
        success: true,
        reply: `**${matchedEvent.title}** (${matchedEvent.category})\n\n` +
          `📅 **Date & Time:** ${matchedEvent.date} at ${matchedEvent.time}\n` +
          `📍 **Venue:** ${matchedEvent.venue}\n` +
          `👥 **Organizer:** ${matchedEvent.organizer}\n` +
          `🎟️ **Seats Remaining:** ${seatsLeft} / ${matchedEvent.capacity}\n` +
          `💰 **Admission:** ${matchedEvent.price === 0 ? 'Free Entry' : '$' + matchedEvent.price}\n\n` +
          `📝 **About:** ${matchedEvent.description}\n\n` +
          `You can register instantly by logging in and clicking "Register Now" on the event card!`,
        suggestions: ['How do I register?', 'Where is this venue?', 'Show other events'],
      });
    }

    // 2. Check for "all events" / "upcoming events" / "what events"
    if (query.includes('all event') || query.includes('upcoming event') || query.includes('what event') || query.includes('list event')) {
      const upcoming = events.slice(0, 5);
      const list = upcoming.map(e => `• **${e.title}** (${e.category}) - ${e.date}`).join('\n');
      return NextResponse.json({
        success: true,
        reply: `Here are upcoming campus events:\n\n${list}\n\nWould you like more details on a specific event? Just ask me about it!`,
        suggestions: ['Technical events', 'Cultural fest info', 'How to register'],
      });
    }

    // 3. Search FAQs in database
    const faqs = db.all<FAQ>('SELECT * FROM faqs');
    let bestFaq: FAQ | null = null;
    let highestScore = 0;

    for (const faq of faqs) {
      let score = 0;
      const questionWords = faq.question.toLowerCase().split(' ');
      const keywordList = faq.keywords.toLowerCase().split(',').map(k => k.trim());

      for (const kw of keywordList) {
        if (query.includes(kw)) score += 3;
      }

      for (const qw of questionWords) {
        if (qw.length > 3 && query.includes(qw)) score += 1;
      }

      if (score > highestScore) {
        highestScore = score;
        bestFaq = faq;
      }
    }

    if (bestFaq && highestScore >= 2) {
      return NextResponse.json({
        success: true,
        reply: bestFaq.answer,
        suggestions: ['What events are upcoming?', 'Where is the auditorium?', 'Contact support'],
      });
    }

    // 4. Fallback smart campus assistant greeting & guide
    return NextResponse.json({
      success: true,
      reply: `Hi! I'm **CampusBot**, your college event assistant. 🎓\n\nI can help you with:\n` +
        `• Finding upcoming events (e.g. *"Show technical events"* or *"Tell me about HackCampus"*)\n` +
        `• Campus venues & locations (e.g. *"Where is the auditorium?"*)\n` +
        `• Registration & ticket guidelines (e.g. *"How do I register?"*)\n` +
        `• Certificates & organizer info.\n\nWhat would you like to know today?`,
      suggestions: ['Show all events', 'Technical events', 'How to register?', 'Where is the auditorium?'],
    });

  } catch (error: any) {
    console.error('Chatbot error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}
