import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

serve(async (req) => {
  try {
    const { transcript } = await req.json();

    const eventKeywords = {
      'PASS': ['تمريرة', 'باس', 'مرر'],
      'SHOT': ['تسديدة', 'شوط', 'سدد'],
      'GOAL': ['هدف', 'جول', 'غوال'],
      'FOUL': ['خطأ', 'فاول', 'مخالفة'],
      'YC': ['بطاقة صفراء', 'إنذار'],
      'RC': ['بطاقة حمراء', 'طرد'],
      'CORNER': ['ركنية', 'كورنر'],
      'FK': ['ضربة حرة', 'فري كيك'],
      'OFF': ['تسلل', 'أوفسايد'],
      'SAVE': ['صد', 'تصدي', 'إنقاذ'],
    };

    let parsedEvent = null;
    for (const [event, keywords] of Object.entries(eventKeywords)) {
      for (const keyword of keywords) {
        if (transcript.toLowerCase().includes(keyword)) {
          parsedEvent = event;
          break;
        }
      }
      if (parsedEvent) break;
    }

    const playerRegex = /(?:p|player|لاعب)\s*(\d+)/i;
    const teamRegex = /(?:team|فريق)\s*(home|away|محلي|زائر)/i;
    const targetPlayerRegex = /(?:to|إلى)\s*(?:p|player|لاعب)\s*(\d+)/i;

    const playerMatch = transcript.match(playerRegex);
    const teamMatch = transcript.match(teamRegex);
    const targetPlayerMatch = transcript.match(targetPlayerRegex);

    const playerNumber = playerMatch ? parseInt(playerMatch[1]) : null;
    const team = teamMatch ? (teamMatch[1].toLowerCase() === 'home' || teamMatch[1].toLowerCase() === 'محلي' ? 'home' : 'away') : null;
    const targetPlayerNumber = targetPlayerMatch ? parseInt(targetPlayerMatch[1]) : null;

    const timestamp = new Date().toISOString();

    const response = {
      timestamp,
      player: playerNumber,
      team,
      event: parsedEvent,
      target: targetPlayerNumber,
      source: 'voice_commentator',
    };

    return new Response(
      JSON.stringify(response),
      { headers: { 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
});
