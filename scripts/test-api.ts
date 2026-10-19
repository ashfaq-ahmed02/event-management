import { NextRequest } from 'next/server';
import { POST as registerHandler } from '../src/app/api/auth/register/route';
import { POST as loginHandler } from '../src/app/api/auth/login/route';
import { GET as eventsGetHandler, POST as eventsPostHandler } from '../src/app/api/events/route';
import { GET as eventDetailHandler, DELETE as eventDeleteHandler } from '../src/app/api/events/[id]/route';
import { POST as registerEventHandler, DELETE as cancelRegistrationHandler } from '../src/app/api/events/[id]/register/route';
import { GET as myRegistrationsHandler } from '../src/app/api/registrations/my/route';
import { GET as eventAttendeesHandler } from '../src/app/api/registrations/event/[id]/route';
import { POST as chatHandler } from '../src/app/api/chat/route';

async function runTests() {
  console.log('🧪 Starting CampusEvent Phase 2 Backend & Auth Test Suite...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName}`);
      failed++;
    }
  }

  try {
    // 1. Test Admin Login
    console.log('1. Testing Authentication...');
    const adminLoginReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@campusevent.edu', password: 'Admin@123' }),
    });
    const adminLoginRes = await loginHandler(adminLoginReq);
    const adminLoginData = await adminLoginRes.json();
    assert(adminLoginData.success === true, 'Admin login with valid credentials');
    assert(adminLoginData.data.user.role === 'admin', 'Admin role returned properly');
    const adminToken = adminLoginData.data.token;

    // 2. Test Student Login
    const studentLoginReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'student@campusevent.edu', password: 'Student@123' }),
    });
    const studentLoginRes = await loginHandler(studentLoginReq);
    const studentLoginData = await studentLoginRes.json();
    assert(studentLoginData.success === true, 'Student login with valid credentials');
    assert(studentLoginData.data.user.role === 'student', 'Student role returned properly');
    const studentToken = studentLoginData.data.token;

    // 3. Test Invalid Login
    const invalidLoginReq = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'admin@campusevent.edu', password: 'WrongPassword' }),
    });
    const invalidLoginRes = await loginHandler(invalidLoginReq);
    assert(invalidLoginRes.status === 401, 'Invalid password rejected with 401');

    // 4. Test Student Registration
    const testEmail = `test_student_${Date.now()}@campusevent.edu`;
    const regReq = new NextRequest('http://localhost:3000/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Sarah Connor',
        email: testEmail,
        password: 'Password@123',
        department: 'Cybernetics',
      }),
    });
    const regRes = await registerHandler(regReq);
    const regData = await regRes.json();
    assert(regData.success === true, 'New student registration succeeds');
    assert(regData.data.user.email === testEmail, 'Registered student email matches');
    const newStudentToken = regData.data.token;

    // 5. Test Event Listing
    console.log('\n2. Testing Events API...');
    const listReq = new NextRequest('http://localhost:3000/api/events');
    const listRes = await eventsGetHandler(listReq);
    const listData = await listRes.json();
    assert(listData.success === true && listData.data.events.length >= 6, 'Event catalog listing returns seeded events');

    // Filter by Category
    const techReq = new NextRequest('http://localhost:3000/api/events?category=Technical');
    const techRes = await eventsGetHandler(techReq);
    const techData = await techRes.json();
    assert(techData.data.events.every((e: any) => e.category === 'Technical'), 'Category filtering works');

    // 6. Test Event Creation (Admin only)
    console.log('\n3. Testing Event Creation & Admin Protection...');
    const createReqUnauthorized = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      headers: { authorization: `Bearer ${studentToken}` }, // student trying to create
      body: JSON.stringify({ title: 'Unauthorized Event' }),
    });
    const unauthRes = await eventsPostHandler(createReqUnauthorized);
    assert(unauthRes.status === 403, 'Non-admin prevented from creating event (403 Forbidden)');

    const newEventPayload = {
      title: 'Automated Test Hackathon 2026',
      description: 'A test hackathon event created by test suite',
      category: 'Technical',
      date: '2026-12-15',
      time: '11:00 AM',
      venue: 'Lab 5',
      capacity: 50,
      banner_url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d',
      organizer: 'Robotics Club',
      price: 0,
    };
    const createReqAdmin = new NextRequest('http://localhost:3000/api/events', {
      method: 'POST',
      headers: { authorization: `Bearer ${adminToken}` },
      body: JSON.stringify(newEventPayload),
    });
    const createRes = await eventsPostHandler(createReqAdmin);
    const createData = await createRes.json();
    assert(createData.success === true, 'Admin successfully created new event');
    const createdEventId = createData.data.event.id;

    // 7. Test Event Registration as Student
    console.log('\n4. Testing Event Registration Workflow...');
    const regEventReq = new NextRequest(`http://localhost:3000/api/events/${createdEventId}/register`, {
      method: 'POST',
      headers: { authorization: `Bearer ${newStudentToken}` },
    });
    const regEventRes = await registerEventHandler(regEventReq, { params: { id: String(createdEventId) } });
    const regEventData = await regEventRes.json();
    assert(regEventData.success === true, 'Student successfully registered for event');
    assert(regEventData.data.registration.ticket_code.startsWith('CE-'), 'Unique Ticket Code generated');

    // Test duplicate registration rejection
    const duplicateRegReq = new NextRequest(`http://localhost:3000/api/events/${createdEventId}/register`, {
      method: 'POST',
      headers: { authorization: `Bearer ${newStudentToken}` },
    });
    const dupRes = await registerEventHandler(duplicateRegReq, { params: { id: String(createdEventId) } });
    assert(dupRes.status === 409, 'Duplicate event registration prevented (409 Conflict)');

    // 8. Test My Registrations
    const myRegReq = new NextRequest('http://localhost:3000/api/registrations/my', {
      headers: { authorization: `Bearer ${newStudentToken}` },
    });
    const myRegRes = await myRegistrationsHandler(myRegReq);
    const myRegData = await myRegRes.json();
    assert(
      myRegData.data.registrations.some((r: any) => r.event_id === createdEventId),
      'Event appears in student My Registrations dashboard'
    );

    // 9. Test Admin Attendee Inspection
    const attendeesReq = new NextRequest(`http://localhost:3000/api/registrations/event/${createdEventId}`, {
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const attendeesRes = await eventAttendeesHandler(attendeesReq, { params: { id: String(createdEventId) } });
    const attendeesData = await attendeesRes.json();
    assert(attendeesData.data.attendees.length === 1, 'Admin can view attendee list with registered student');
    assert(attendeesData.data.attendees[0].user_email === testEmail, 'Attendee email matches student email');

    // 10. Test Campus Chatbot
    console.log('\n5. Testing AI Chatbot...');
    const chatReqVenue = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Where is the auditorium?' }),
    });
    const chatResVenue = await chatHandler(chatReqVenue);
    const chatDataVenue = await chatResVenue.json();
    assert(chatDataVenue.reply.includes('Main Auditorium'), 'Chatbot answers venue location queries correctly');

    const chatReqTech = new NextRequest('http://localhost:3000/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: 'Show technical events' }),
    });
    const chatResTech = await chatHandler(chatReqTech);
    const chatDataTech = await chatResTech.json();
    assert(chatDataTech.reply.includes('TECHNICAL'), 'Chatbot lists technical events from database');

    // 11. Test Event Cleanup
    console.log('\n6. Cleaning up test data...');
    const deleteReq = new NextRequest(`http://localhost:3000/api/events/${createdEventId}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${adminToken}` },
    });
    const deleteRes = await eventDeleteHandler(deleteReq, { params: { id: String(createdEventId) } });
    const deleteData = await deleteRes.json();
    assert(deleteData.success === true, 'Test event cleanly deleted by Admin');

    console.log(`\n==========================================`);
    console.log(`✨ Test Results: ${passed} Passed, ${failed} Failed`);
    console.log(`==========================================\n`);

    if (failed > 0) process.exit(1);
  } catch (err) {
    console.error('❌ Test execution error:', err);
    process.exit(1);
  }
}

runTests();
