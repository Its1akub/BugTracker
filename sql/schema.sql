
CREATE TABLE users (
                       user_id INT AUTO_INCREMENT PRIMARY KEY,
                       username VARCHAR(100) NOT NULL,
                       discord_id VARCHAR(50) NOT NULL
);

CREATE TABLE projects (
                          project_id INT AUTO_INCREMENT PRIMARY KEY,
                          name VARCHAR(100) NOT NULL,
                          is_active BOOLEAN DEFAULT TRUE,
                          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bugs (
                      bug_id INT AUTO_INCREMENT PRIMARY KEY,
                      title VARCHAR(200) NOT NULL ,
                      priority ENUM('LOW','MEDIUM','HIGH') DEFAULT 'MEDIUM',
                      status ENUM('OPEN','CLOSED') DEFAULT 'OPEN',
                      estimated_time FLOAT DEFAULT 0.0,
                      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                      project_id INT,
                      FOREIGN KEY (project_id) REFERENCES projects(project_id)
);

CREATE TABLE bug_assignments (
                                 bug_id INT,
                                 user_id INT,
                                 assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                                 PRIMARY KEY (bug_id, user_id),
                                 FOREIGN KEY (bug_id) REFERENCES bugs(bug_id) ON DELETE CASCADE,
                                 FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE bug_comments (
                              bc_id INT AUTO_INCREMENT PRIMARY KEY,
                              bug_id INT,
                              user_id INT,
                              content TEXT,
                              created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                              FOREIGN KEY (bug_id) REFERENCES bugs(bug_id)  ON DELETE CASCADE,
                              FOREIGN KEY (user_id) REFERENCES users(user_id)
);

CREATE TABLE bugs_history (
                              bh_id INT AUTO_INCREMENT PRIMARY KEY,
                              bug_id INT,
                              action ENUM('CREATE','UPDATE','CLOSE','DELETED', 'OPENED'),
                              user_id INT,
                              action_date DATETIME DEFAULT CURRENT_TIMESTAMP,
                              FOREIGN KEY (bug_id) REFERENCES bugs(bug_id),
                              FOREIGN KEY (user_id) REFERENCES users(user_id)
);




