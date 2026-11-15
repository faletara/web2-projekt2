DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL CHECK (username <> '') UNIQUE,
    password TEXT NOT NULL CHECK (password <> ''),
    balance NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    iban TEXT NOT NULL CHECK (iban <> '') UNIQUE,
    csrf_token TEXT
);

INSERT INTO
    users (username, password, balance, iban)
VALUES
    ('ana', 'ana123', 10000.00, 'HR1210010051863000160'),
    ('ivan', 'ivan123', 10000.00, 'HR1210010051863000161'),
    ('napadac', 'napadac123', 250.00, 'HR1210010051863000162');
