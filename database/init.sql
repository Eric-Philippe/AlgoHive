-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE Users(
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   firstname VARCHAR(50) NOT NULL,
   lastname VARCHAR(50) NOT NULL,
   email VARCHAR(255) NOT NULL UNIQUE,
   password VARCHAR(255) NOT NULL,
   last_connected TIMESTAMP,
   blocked BOOLEAN NOT NULL
);

CREATE TABLE Roles(
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE Inputs(
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   puzzle_id VARCHAR(50) NOT NULL,
   content TEXT NOT NULL,
   solution_one VARCHAR(255) NOT NULL,
   solution_two VARCHAR(255) NOT NULL,
   user_id UUID NOT NULL,
   FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE APIEnvironments(
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   address VARCHAR(255) NOT NULL,
   name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE Scopes(
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   name VARCHAR(50) NOT NULL UNIQUE,
   role_id UUID,
   FOREIGN KEY(role_id) REFERENCES Roles(id) ON DELETE CASCADE
);

CREATE TABLE Groups(
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   name VARCHAR(50) NOT NULL UNIQUE,
   description VARCHAR(255),
   scope_id UUID NOT NULL,
   FOREIGN KEY(scope_id) REFERENCES Scopes(id) ON DELETE CASCADE
);

CREATE TABLE Competitions(
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   title VARCHAR(100) NOT NULL UNIQUE,
   description TEXT NOT NULL,
   finished BOOLEAN NOT NULL,
   show BOOLEAN NOT NULL,
   api_theme VARCHAR(50) NOT NULL,
   api_environment_id UUID NOT NULL,
   FOREIGN KEY(api_environment_id) REFERENCES APIEnvironments(id) ON DELETE CASCADE
);

CREATE TABLE Tries(
   id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
   puzzle_id VARCHAR(50) NOT NULL,
   puzzle_index INTEGER NOT NULL,
   puzzle_lvl VARCHAR(50) NOT NULL,
   step INTEGER NOT NULL,
   start_time TIMESTAMP NOT NULL,
   end_time TIMESTAMP,
   attempts INTEGER NOT NULL,
   score NUMERIC(15,2) NOT NULL,
   competition_id UUID NOT NULL,
   user_id UUID NOT NULL,
   FOREIGN KEY(competition_id) REFERENCES Competitions(id) ON DELETE CASCADE,
   FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE
);

CREATE TABLE scope_api_access(
   api_environment_id UUID,
   scope_id UUID,
   PRIMARY KEY(api_environment_id, scope_id),
   FOREIGN KEY(api_environment_id) REFERENCES APIEnvironments(id) ON DELETE CASCADE,
   FOREIGN KEY(scope_id) REFERENCES Scopes(id) ON DELETE CASCADE
);

CREATE TABLE competition_accessible_to(
   group_id UUID,
   competition_id UUID,
   PRIMARY KEY(group_id, competition_id),
   FOREIGN KEY(group_id) REFERENCES Groups(id) ON DELETE CASCADE,
   FOREIGN KEY(competition_id) REFERENCES Competitions(id) ON DELETE CASCADE
);

CREATE TABLE user_groups(
   user_id UUID,
   group_id UUID,
   PRIMARY KEY(user_id, group_id),
   FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE,
   FOREIGN KEY(group_id) REFERENCES Groups(id) ON DELETE CASCADE
);

CREATE TABLE users_roles(
   user_id UUID,
   role_id UUID,
   PRIMARY KEY(user_id, role_id),
   FOREIGN KEY(user_id) REFERENCES Users(id) ON DELETE CASCADE,
   FOREIGN KEY(role_id) REFERENCES Roles(id) ON DELETE CASCADE
);
