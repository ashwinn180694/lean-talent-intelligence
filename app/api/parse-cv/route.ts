import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const SKILL_HINTS = [
  'Open Banking','Payments','API Products','Product Strategy','Partnerships','Banking','Fintech','Risk','Compliance','Data','Engineering Management','Platform','B2B SaaS','GTM','Enterprise Sales','KYC','AML','Lending','Cards','Core Banking','APIs','SaaS','Growth','Strategy','Product Management','Remittance','Crypto','Trading','Investing','RegTech','Fraud','Identity','Operations','Commercial','Sales','Marketing','Analytics','Machine Learning','AI','Cloud','AWS','GCP','Azure','JavaScript','TypeScript','Python','SQL','PostgreSQL','React','Node.js'
];
const TAG_HINTS = ['Tier 1 Talent','High Potential','GCC Interested','Open Banking','Payments','Product Leader','Engineering Leader','Warm Relationship','Ashby Ready','KSA','UAE','Global Fintech'];
const LANGUAGE_HINTS = ['Arabic','English','Hindi','Urdu','French','Spanish','German','Italian','Portuguese','Turkish'];

function clean(text: string) {
  return text.replace(/\r/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

function firstUsefulLine(lines: string[]) {
  return lines.find(line => line.length > 2 && line.length < 80 && !/@|linkedin|github|phone|mobile|email/i.test(line)) || '';
}

function detectTitle(lines: string[]) {
  const titleRegex = /(product manager|senior product|engineering manager|software engineer|director|head of|vp|vice president|founder|co-founder|commercial|partnership|operations|risk|compliance|data scientist|analyst|manager|lead)/i;
  return lines.find(line => titleRegex.test(line) && line.length < 100) || '';
}

function detectLocation(text: string) {
  const locations = ['Riyadh','Jeddah','Dubai','Abu Dhabi','UAE','KSA','Saudi Arabia','London','New York','San Francisco','Singapore','Bahrain','Doha','Kuwait','Cairo','Amman','Beirut','Berlin','Paris','Amsterdam'];
  return locations.find(loc => new RegExp(`\\b${loc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text)) || '';
}

function detectExperience(lines: string[]) {
  const output: any[] = [];
  const year = '(?:19|20)\\d{2}';
  const datePattern = new RegExp(`(${year})(?:\\s*[-–—]\\s*(Present|Current|${year}))?`, 'i');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!datePattern.test(line)) continue;
    const prev = lines[i - 1] || '';
    const prev2 = lines[i - 2] || '';
    const match = line.match(datePattern);
    const title = prev2.length < 90 ? prev2 : '';
    const company = prev.length < 90 ? prev : '';
    if (company || title) {
      output.push({
        company_name: company || 'Unknown company',
        title: title || '',
        start_date: match?.[1] || '',
        end_date: match?.[2] || '',
        is_current: /present|current/i.test(match?.[2] || line),
        notes: 'Extracted from CV parser'
      });
    }
    if (output.length >= 8) break;
  }
  return output;
}

function detectEducation(lines: string[]) {
  return lines
    .filter(line => /university|college|school|mba|bsc|msc|bachelor|master|degree|diploma/i.test(line))
    .slice(0, 6)
    .map(line => ({ school: line, degree: '', field: '', start_year: '', end_year: '', notes: 'Extracted from CV parser' }));
}

function parseText(raw: string) {
  const text = clean(raw);
  const lines = text.split(/\n+/).map(line => line.trim()).filter(Boolean);
  const lower = text.toLowerCase();
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const linkedin = text.match(/https?:\/\/(www\.)?linkedin\.com\/in\/[^\s)]+/i)?.[0] || '';
  const skills = SKILL_HINTS.filter(skill => lower.includes(skill.toLowerCase()));
  const tags = TAG_HINTS.filter(tag => lower.includes(tag.toLowerCase()));
  const languages = LANGUAGE_HINTS.filter(lang => lower.includes(lang.toLowerCase()));
  const full_name = firstUsefulLine(lines);
  const title = detectTitle(lines);
  const location = detectLocation(text);
  const education = detectEducation(lines);
  const experience = detectExperience(lines);
  const previous_company = experience.find(exp => !exp.is_current)?.company_name || experience[1]?.company_name || '';
  const summary = [
    full_name ? `Candidate: ${full_name}` : '',
    title ? `Likely title: ${title}` : '',
    location ? `Location signal: ${location}` : '',
    skills.length ? `Skills detected: ${skills.join(', ')}` : '',
    languages.length ? `Languages detected: ${languages.join(', ')}` : '',
    education.length ? `Education signals: ${education.map((e: any) => e.school).join(' | ')}` : '',
    experience.length ? `Experience signals: ${experience.map((e: any) => `${e.title ? e.title + ' at ' : ''}${e.company_name}`).join(' | ')}` : '',
    email ? `Email detected: ${email}` : ''
  ].filter(Boolean).join('\n');
  return { full_name, title, location, linkedin_url: linkedin, email, skills, tags, languages, education, experience, previous_company, cv_summary: summary || text.slice(0, 900), parsed_cv_text: text };
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    const name = file.name.toLowerCase();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text = '';
    if (name.endsWith('.txt') || file.type.startsWith('text/')) {
      text = buffer.toString('utf8');
    } else if (name.endsWith('.docx')) {
      const mammoth: any = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      text = result.value || '';
    } else if (name.endsWith('.pdf')) {
      const pdfParseModule: any = await import('pdf-parse/lib/pdf-parse.js');
      const pdfParse = pdfParseModule.default || pdfParseModule;
      const result = await pdfParse(buffer);
      text = result.text || '';
    } else {
      return NextResponse.json({ error: 'Automatic parsing currently supports PDF, DOCX, and TXT files. Upload still works for other file types.' }, { status: 415 });
    }
    if (!text.trim()) return NextResponse.json({ error: 'Could not extract text from this CV.' }, { status: 422 });
    return NextResponse.json({ parsed: parseText(text) });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Could not parse CV.' }, { status: 500 });
  }
}
