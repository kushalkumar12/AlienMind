-- ── AlienMind Professional Seeding Script ──
-- Purpose: Populates 50 Users with shorter identifiers (5-8 letters)

DO $$
DECLARE
    user_id_val BIGINT;
    candidate_id_val BIGINT;
    interviewer_id_val BIGINT;
    company_id_val BIGINT;
    i INTEGER;
    j INTEGER;
    v_role TEXT;
    v_email TEXT;
    v_name TEXT;
    -- Password '123' in SHA-256
    v_password_hash TEXT := 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';
    v_skills TEXT[] := ARRAY['Java', 'Spring Boot', 'System Design', 'React', 'TypeScript', 'AWS', 'PostgreSQL', 'Docker', 'Kubernetes', 'Python'];
    v_levels TEXT[] := ARRAY['Junior Engineer', 'Senior SDE', 'Staff Engineer', 'Lead Developer', 'Fullstack Dev'];
    v_companies TEXT[] := ARRAY['Google', 'Meta', 'Stripe', 'Netflix', 'Amazon', 'NovaTech', 'CyberFlow', 'AlienMind Core'];
BEGIN
    -- 1. Clean up existing dummy data
    DELETE FROM candidate_profile_skills;
    DELETE FROM interviewer_profile_skills;
    DELETE FROM interview_result;
    DELETE FROM interview_session;
    DELETE FROM candidate_profile;
    DELETE FROM interviewer_profile;
    DELETE FROM company_profile;
    -- Delete all previous seed users
    DELETE FROM user_account WHERE email LIKE '%@am.io' OR email LIKE 'dummy_%';

    -- 2. Generate 50 Users & Profiles
    FOR i IN 1..50 LOOP
        IF i <= 25 THEN v_role := 'CANDIDATE';
        ELSIF i <= 40 THEN v_role := 'INTERVIEWER';
        ELSE v_role := 'COMPANY';
        END IF;

        -- Short usernames (u1@u.com - u50@u.com)
        v_email := 'u' || i || '@u.com'; 
        
        v_name := CASE 
            WHEN i % 5 = 0 THEN 'Aarav ' || i 
            WHEN i % 5 = 1 THEN 'Maya ' || i 
            WHEN i % 5 = 2 THEN 'Rohan ' || i 
            WHEN i % 5 = 3 THEN 'Priya ' || i 
            ELSE 'Karan ' || i END;

        INSERT INTO user_account (full_name, email, password_hash, role, created_at)
        VALUES (v_name, v_email, v_password_hash, v_role, NOW() - (i || ' days')::INTERVAL)
        RETURNING id INTO user_id_val;

        IF v_role = 'CANDIDATE' THEN
            INSERT INTO candidate_profile (user_id, current_level, summary, average_rating, completed_interviews, public_results, public_recordings)
            VALUES (user_id_val, v_levels[(i % 5) + 1], 'Experienced developer focusing on ' || v_skills[(i % 10) + 1], (7 + (i % 3))::FLOAT, (i % 10), TRUE, TRUE)
            RETURNING id INTO candidate_id_val;
            
            INSERT INTO candidate_profile_skills (candidate_profile_id, skills)
            VALUES (candidate_id_val, v_skills[(i % 10) + 1]), (candidate_id_val, v_skills[((i+2) % 10) + 1]);
        
        ELSIF v_role = 'INTERVIEWER' THEN
            INSERT INTO interviewer_profile (user_id, rank_title, price_per_interview, average_rating, completed_interviews)
            VALUES (user_id_val, 'Senior Interviewer @ ' || v_companies[(i % 8) + 1], (50 + (i * 2))::DECIMAL, (4.5 + (i % 5) * 0.1)::FLOAT, (10 + i))
            RETURNING id INTO interviewer_id_val;
            
            INSERT INTO interviewer_profile_skills (interviewer_profile_id, skills)
            VALUES (interviewer_id_val, v_skills[(i % 10) + 1]), (interviewer_id_val, v_skills[((i+1) % 10) + 1]);

        ELSIF v_role = 'COMPANY' THEN
            INSERT INTO company_profile (user_id, company_name, hiring_focus)
            VALUES (user_id_val, v_companies[(i % 8) + 1], 'Hiring for ' || v_levels[(i % 5) + 1]);
        END IF;
    END LOOP;

    -- 3. Generate 100 Interview Sessions
    FOR j IN 1..100 LOOP
        INSERT INTO interview_session (candidate_id, interviewer_id, status, scheduled_at, room_url, recording_url)
        SELECT 
            (SELECT id FROM candidate_profile ORDER BY RANDOM() LIMIT 1),
            (SELECT id FROM interviewer_profile ORDER BY RANDOM() LIMIT 1),
            CASE WHEN j % 4 = 0 THEN 'COMPLETED' WHEN j % 4 = 1 THEN 'SCHEDULED' ELSE 'REQUESTED' END,
            NOW() + ((j - 50) || ' hours')::INTERVAL,
            'https://meet.alienmind.io/room-' || j,
            CASE WHEN j % 4 = 0 THEN 'https://cdn.alienmind.io/rec/' || j || '.mp4' ELSE NULL END;
    END LOOP;

    -- 4. Generate Results
    INSERT INTO interview_result (session_id, candidate_score, feedback, technical_score, communication_score, improvement_areas, created_at)
    SELECT id, (7 + (id % 3)), 'Strong architectural skills demonstrated.', (8 + (id % 2)), (7 + (id % 4)), 'Focus on Java Concurrency.', NOW()
    FROM interview_session WHERE status = 'COMPLETED' LIMIT 40;

    RAISE NOTICE 'Seed completed with short usernames (user01 - user50).';
END $$;
