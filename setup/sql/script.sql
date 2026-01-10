

CREATE VIEW IF NOT EXISTS user_assigned_bugs AS
SELECT
    u.discord_id,
    b.bug_id,
    b.title         AS bug_title,
    b.priority,
    b.status,
    p.name          AS project_name,
    b.created_at,
    b.created_by
FROM users u
         JOIN bug_assignments ba ON ba.user_id = u.user_id
         JOIN bugs b ON b.bug_id = ba.bug_id
         JOIN projects p ON p.project_id = b.project_id;


CREATE VIEW IF NOT EXISTS user_projects AS
SELECT

    p.project_id,
    p.name AS project_name,
    p.is_active,
    p.created_by,
    COUNT(b.bug_id) AS bug_count,
    MIN(b.created_at) AS first_bug_date,
    MAX(b.created_at) AS last_bug_date
FROM projects p
         LEFT JOIN bugs b ON b.project_id = p.project_id
         LEFT JOIN bug_assignments ba ON ba.bug_id = b.bug_id
GROUP BY
    p.project_id,
    p.name,
    p.is_active,
    p.created_by
ORDER BY p.project_id;



CREATE VIEW IF NOT EXISTS bug_history_detail AS
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

CREATE VIEW IF NOT EXISTS bug_comments_view AS
SELECT
    bc.bug_id,
    bc.bc_id,
    bc.content,
    bc.created_at,
    u.discord_id AS author
FROM bug_comments bc
         JOIN users u ON u.user_id = bc.user_id;




CREATE PROCEDURE IF NOT EXISTS assign_bug_to_user(
    IN p_bug_id INT,
    IN p_user_id INT,
    IN p_assign_user_id INT
)
BEGIN
    DECLARE v_bug_author INT;
    DECLARE v_bug_exists INT;
    DECLARE v_user_exists INT;


START TRANSACTION;


SELECT COUNT(*) INTO v_bug_exists
FROM bugs
WHERE bug_id = p_bug_id;

IF v_bug_exists = 0 THEN
         ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Bug does not exist';
END IF;


SELECT COUNT(*) INTO v_user_exists
FROM users
WHERE user_id = p_assign_user_id;

SELECT created_by INTO v_bug_author
FROM bugs
WHERE bug_id = p_bug_id;

IF v_user_exists = 0 THEN
         ROLLBACK;
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'User does not exist';
END IF;

IF v_bug_author <> p_user_id THEN
        ROLLBACK;
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Nemáte oprávnění přiřadit tento bug';
END IF;

IF EXISTS (SELECT 1 FROM bug_assignments
           WHERE bug_id = p_bug_id AND user_id = p_assign_user_id) THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'User already assigned to this bug';
END IF;



INSERT INTO bug_assignments (bug_id, user_id)
VALUES (p_bug_id, p_assign_user_id);


INSERT INTO bugs_history (bug_id, action, user_id)
VALUES (p_bug_id, 'ASSIGN', p_user_id);

COMMIT;
END;