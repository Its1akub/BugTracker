

CREATE VIEW user_assigned_bugs AS
SELECT
    u.discord_id,
    u.username,
    b.bug_id,
    b.title         AS bug_title,
    b.priority,
    b.status,
    p.name          AS project_name,
    b.created_at
FROM users u
         JOIN bug_assignments ba ON ba.user_id = u.user_id
         JOIN bugs b ON b.bug_id = ba.bug_id
         JOIN projects p ON p.project_id = b.project_id;


CREATE VIEW user_projects AS
SELECT
    u.discord_id,
    p.project_id,
    p.name AS project_name,
    p.is_active,
    COUNT(b.bug_id) AS bug_count,
    MIN(b.created_at) AS first_bug_date,
    MAX(b.created_at) AS last_bug_date
FROM users u
         CROSS JOIN projects p
         LEFT JOIN bug_assignments ba ON ba.user_id = u.user_id
         LEFT JOIN bugs b ON b.bug_id = ba.bug_id AND b.project_id = p.project_id
GROUP BY
    u.discord_id,
    p.project_id,
    p.name,
    p.is_active
ORDER BY p.project_id, u.discord_id;



CREATE VIEW bug_history_detail AS
SELECT
    u.discord_id,
    bh.bh_id            AS history_id,
    bh.bug_id,
    b.title          AS title,
    bh.action,
    u.username       AS performed_by,
    bh.action_date
FROM bugs_history bh
         JOIN bugs b ON bh.bug_id = b.bug_id
         JOIN users u ON bh.user_id = u.user_id
ORDER BY bh.action_date;



DELIMITER $$

CREATE PROCEDURE assign_bug_to_user(
    IN p_bug_id INT,
    IN p_user_id INT
)
BEGIN
    DECLARE v_bug_exists INT;
    DECLARE v_user_exists INT;

    DECLARE EXIT HANDLER FOR SQLEXCEPTION
BEGIN
ROLLBACK;
SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Assign bug transaction failed';
END;

START TRANSACTION;

-- kontrola existence bugu
SELECT COUNT(*) INTO v_bug_exists
FROM bugs
WHERE id = p_bug_id;

IF v_bug_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Bug does not exist';
END IF;

    -- kontrola existence usera
SELECT COUNT(*) INTO v_user_exists
FROM users
WHERE id = p_user_id;

IF v_user_exists = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User does not exist';
END IF;

    -- M:N vazba
INSERT INTO bug_assignments (bug_id, user_id)
VALUES (p_bug_id, p_user_id);

-- historie
INSERT INTO bug_history (bug_id, action, user_id)
VALUES (p_bug_id, 'UPDATE', p_user_id);

COMMIT;
END$$

DELIMITER ;