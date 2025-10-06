import { createClient } from '@supabase/supabase-js';
import * as cheerio from 'cheerio';
import fetch from 'node-fetch';

// IMPORTANT: Use the service_role key for admin-level access.
// You can find this in your Supabase project settings under API > Project API keys.
// DO NOT expose this key on the client-side.
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseUrl = 'https://itwnghrwolvydupxmnqw.supabase.co';

if (!supabaseServiceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set. Please set it in your environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const CLUBS_URL = 'https://lfp.dz/ar/clubs';

async function main() {
  try {
    console.log('Scraping clubs...');
    const response = await fetch(CLUBS_URL);
    const html = await response.text();
    const $ = cheerio.load(html);

    const clubs = $('.clubs-cards-list a').map((i, el) => {
      const name = $(el).find('h4').text().trim();
      const logoUrl = $(el).find('img').attr('src');
      const clubUrl = $(el).attr('href');
      const lfpId = clubUrl ? parseInt(clubUrl.split('/').pop() || '0') : 0;
      return { name, logoUrl, clubUrl, lfpId };
    }).get();

    for (const club of clubs) {
      try {
        console.log(`Upserting club: ${club.name}`);
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .upsert({ name: club.name, logo_url: club.logoUrl, country: 'Algeria' }, { onConflict: 'name' })
          .select('id')
          .single();

        if (teamError) {
          console.error(`Error upserting team ${club.name}:`, JSON.stringify(teamError, null, 2));
          continue;
        }

        const teamId = teamData?.id;

        if (!teamId) {
            console.error(`Could not get id for team ${club.name}`);
            continue;
        }

        if (club.clubUrl) {
          console.log(`Scraping players for ${club.name}...`);
          const clubResponse = await fetch(`https://lfp.dz${club.clubUrl}`);
          const clubHtml = await clubResponse.text();
          const $$ = cheerio.load(clubHtml);

          const players = $$('.club-player-card').map((i, el) => {
            const name = $$(el).find('h5').text().trim();
            const photoUrl = $$(el).find('img').attr('src');
            const jerseyNumber = parseInt($$(el).find('.player-jersey').text().trim() || '0');
            const ageText = $$(el).find('.player-age').text().trim();
            const age = ageText ? parseInt(ageText.split(': ')[1] || '0') : undefined;
            const nationality = $$(el).find('.player-nationality span').text().trim();
            const lfpIdString = $$(el).find('a').attr('href')?.split('/').pop();
            const lfpId = lfpIdString ? parseInt(lfpIdString) : undefined;
            return { name, photoUrl, jerseyNumber, age, nationality, lfpId };
          }).get();

          for (const player of players) {
            try {
              console.log(`Upserting player: ${player.name}`);
              const { error: playerError } = await supabase
                .from('scouted_players')
                .upsert({
                  name: player.name,
                  photo_url: player.photoUrl,
                  jersey_number: player.jerseyNumber,
                  age: player.age,
                  nationality: player.nationality,
                  team_id: teamId,
                  current_club: club.name,
                  league: 'Algerian Ligue 1',
                  lfp_id: player.lfpId,
                }, { onConflict: 'lfp_id' });

              if (playerError) {
                  console.error(`Error upserting player ${player.name}:`, JSON.stringify(playerError, null, 2));
              }
            } catch (e) {
              console.error(`An unexpected error occurred while processing player ${player.name}:`, e);
            }
          }
        }
      } catch (e) {
        console.error(`An unexpected error occurred while processing club ${club.name}:`, e);
      }
    }

    console.log('Seeding a test match...');
    const testMatchId = '123e4567-e89b-12d3-a456-426614174000';
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .upsert({
        id: testMatchId,
        name: 'Test Match for Verification',
        home_team_name: 'Team A',
        away_team_name: 'Team B',
        status: 'published',
        match_date: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (matchError) {
      console.error('Error seeding test match:', JSON.stringify(matchError, null, 2));
    } else {
      console.log('Test match seeded successfully with ID:', testMatchId);
    }

    console.log('Seeding a test admin user...');
    await createTestAdmin();


    console.log('Done.');
  } catch (e) {
    console.error('An unexpected error occurred in main function:', e);
  }
}

async function createTestAdmin() {
  const adminEmail = 'admin@example.com';
  const adminPassword = 'password';

  // Check if user already exists
  const { data: { user: existingUser } } = await supabase.auth.admin.getUserByEmail(adminEmail);

  if (existingUser) {
    console.log('Test admin user already exists.');
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPassword,
    email_confirm: true,
    user_metadata: { full_name: 'Admin User' },
  });

  if (error) {
    console.error('Error creating test admin user:', JSON.stringify(error, null, 2));
    return;
  }

  if (data.user) {
    console.log('Test admin user created successfully.');
    // Also add to profiles table with admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', data.user.id);

    if (profileError) {
      console.error('Error setting admin role for test user:', JSON.stringify(profileError, null, 2));
    } else {
      console.log('Test admin user role set to "admin".');
    }
  }
}

main();
