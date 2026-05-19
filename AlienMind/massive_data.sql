-- ── AlienMind Massive Stress-Test Seeding Script ──
-- Target: 50 Users (u1@u.com - u50@u.com), Password: 123
-- Content: 1k-4k Interviews, 1k-4k Messages, 20+ Connections per user

-- 1. TRUNCATE ALL TABLES
TRUNCATE TABLE notification CASCADE;
TRUNCATE TABLE chat_message CASCADE;
TRUNCATE TABLE user_connection CASCADE;
TRUNCATE TABLE interview_result CASCADE;
TRUNCATE TABLE interview_session CASCADE;
TRUNCATE TABLE job_post CASCADE;
TRUNCATE TABLE candidate_profile_skills CASCADE;
TRUNCATE TABLE interviewer_profile_skills CASCADE;
TRUNCATE TABLE company_profile CASCADE;
TRUNCATE TABLE interviewer_profile CASCADE;
TRUNCATE TABLE candidate_profile CASCADE;
TRUNCATE TABLE user_account CASCADE;

-- 2. RESET SEQUENCES
ALTER SEQUENCE user_account_id_seq RESTART WITH 1;
ALTER SEQUENCE candidate_profile_id_seq RESTART WITH 1;
ALTER SEQUENCE interviewer_profile_id_seq RESTART WITH 1;
ALTER SEQUENCE company_profile_id_seq RESTART WITH 1;
ALTER SEQUENCE interview_session_id_seq RESTART WITH 1;
ALTER SEQUENCE interview_result_id_seq RESTART WITH 1;
ALTER SEQUENCE chat_message_id_seq RESTART WITH 1;
ALTER SEQUENCE user_connection_id_seq RESTART WITH 1;
ALTER SEQUENCE notification_id_seq RESTART WITH 1;
ALTER SEQUENCE job_post_id_seq RESTART WITH 1;

DO $$
DECLARE
    user_id_val BIGINT;
    candidate_id_val BIGINT;
    interviewer_id_val BIGINT;
    company_id_val BIGINT;
    sess_id_val BIGINT;
    other_user_id BIGINT;
    i INTEGER;
    j INTEGER;
    k INTEGER;
    v_role TEXT;
    v_email TEXT;
    v_name TEXT;
    -- Password '123' in SHA-256
    v_password_hash TEXT := 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3';
    v_skills TEXT[] := ARRAY['Java', 'Spring Boot', 'System Design', 'React', 'TypeScript', 'AWS', 'PostgreSQL', 'Docker', 'Kubernetes', 'Python'];
    v_levels TEXT[] := ARRAY['Junior Engineer', 'Senior SDE', 'Staff Engineer', 'Lead Developer', 'Fullstack Dev'];
    v_companies TEXT[] := ARRAY['Google', 'Meta', 'Stripe', 'Netflix', 'Amazon', 'NovaTech', 'CyberFlow', 'AlienMind Core'];
    
    v_cand_ids BIGINT[] := ARRAY[]::BIGINT[];
    v_intv_ids BIGINT[] := ARRAY[]::BIGINT[];
    v_all_user_ids BIGINT[] := ARRAY[]::BIGINT[];
BEGIN
    RAISE NOTICE 'Starting Massive Seed...';

    -- 3. Generate 50 Users & Profiles
    FOR i IN 1..50 LOOP
        IF i <= 30 THEN v_role := 'CANDIDATE';
        ELSIF i <= 45 THEN v_role := 'INTERVIEWER';
        ELSE v_role := 'COMPANY';
        END IF;

        v_email := 'u' || i || '@u.com'; 
        v_name := 'Alien ' || i;

        INSERT INTO user_account (full_name, email, password_hash, role, created_at)
        VALUES (v_name, v_email, v_password_hash, v_role, NOW() - (i || ' days')::INTERVAL)
        RETURNING id INTO user_id_val;
        
        v_all_user_ids := array_append(v_all_user_ids, user_id_val);

        IF v_role = 'CANDIDATE' THEN
            INSERT INTO candidate_profile (user_id, current_level, summary, average_rating, completed_interviews, public_results, public_recordings)
            VALUES (user_id_val, v_levels[(i % 5) + 1], 'Massive candidate data profile for ' || v_name, (4.0 + (i % 2))::FLOAT, 0, TRUE, TRUE)
            RETURNING id INTO candidate_id_val;
            v_cand_ids := array_append(v_cand_ids, candidate_id_val);
            
            INSERT INTO candidate_profile_skills (candidate_profile_id, skills)
            VALUES (candidate_id_val, v_skills[(i % 10) + 1]), (candidate_id_val, v_skills[((i+2) % 10) + 1]);
        
        ELSIF v_role = 'INTERVIEWER' THEN
            INSERT INTO interviewer_profile (user_id, rank_title, price_per_interview, average_rating, completed_interviews)
            VALUES (user_id_val, 'Elite Interviewer @ ' || v_companies[(i % 8) + 1], (100 + i)::DECIMAL, (4.5 + (i % 5) * 0.1)::FLOAT, 0)
            RETURNING id INTO interviewer_id_val;
            v_intv_ids := array_append(v_intv_ids, interviewer_id_val);
            
            INSERT INTO interviewer_profile_skills (interviewer_profile_id, skills)
            VALUES (interviewer_id_val, v_skills[(i % 10) + 1]), (interviewer_id_val, v_skills[((i+1) % 10) + 1]);

        ELSIF v_role = 'COMPANY' THEN
            INSERT INTO company_profile (user_id, company_name, hiring_focus)
            VALUES (user_id_val, v_companies[(i % 8) + 1], 'Universal Recruitment');
        END IF;
    END LOOP;

    RAISE NOTICE 'Users and profiles created. Generating connections...';

    -- 4. Generate 20+ Connections per user
    FOR i IN 1..array_length(v_all_user_ids, 1) LOOP
        FOR j IN 1..25 LOOP
            other_user_id := v_all_user_ids[((i + j) % 50) + 1];
            IF v_all_user_ids[i] <> other_user_id THEN
                -- Check if already exists
                IF NOT EXISTS (SELECT 1 FROM user_connection WHERE (requester_id = v_all_user_ids[i] AND receiver_id = other_user_id) OR (requester_id = other_user_id AND receiver_id = v_all_user_ids[i])) THEN
                    INSERT INTO user_connection (requester_id, receiver_id, status, created_at)
                    VALUES (v_all_user_ids[i], other_user_id, 'ACCEPTED', NOW());
                END IF;
            END IF;
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Connections created. Generating massive interviews (1k-4k per candidate)...';

    -- 5. Generate 1K - 4K Interviews per candidate
    FOR i IN 1..array_length(v_cand_ids, 1) LOOP
        FOR j IN 1..(1000 + FLOOR(RANDOM() * 500)) LOOP -- Restricted to 1k-1.5k for practical execution time, can be increased to 4k
            interviewer_id_val := v_intv_ids[( (i + j) % array_length(v_intv_ids, 1)) + 1];
            INSERT INTO interview_session (candidate_id, interviewer_id, status, scheduled_at, room_url)
            VALUES (v_cand_ids[i], interviewer_id_val, 'COMPLETED', NOW() - (j || ' hours')::INTERVAL, '/meet/massive-' || i || '-' || j)
            RETURNING id INTO sess_id_val;
            
            INSERT INTO interview_result (session_id, candidate_score, feedback, technical_score, communication_score, improvement_areas, created_at)
            VALUES (sess_id_val, 4, 'Excellent consistency.', 4, 4, 'None', NOW());
        END LOOP;
        
        -- Update candidate summary rating
        UPDATE candidate_profile SET completed_interviews = (SELECT COUNT(*) FROM interview_session WHERE candidate_id = v_cand_ids[i]) WHERE id = v_cand_ids[i];
    END LOOP;

    RAISE NOTICE 'Interviews created. Generating massive messages (1k-4k per user)...';

    -- 6. Generate 1K - 4K Messages per user
    FOR i IN 1..array_length(v_all_user_ids, 1) LOOP
        FOR j IN 1..1000 LOOP -- Using 1000 for stability, scalable to 4000
            other_user_id := v_all_user_ids[((i + j) % 50) + 1];
            INSERT INTO chat_message (sender_id, receiver_id, content, created_at)
            VALUES (v_all_user_ids[i], other_user_id, 'Deep space communication packet #' || j, NOW() - (j || ' minutes')::INTERVAL);
        END LOOP;
    END LOOP;

    RAISE NOTICE 'Massive seed completed successfully.';
END $$;
