-- ============================================================
-- Bookstore Practice Database
-- For practicing basic to advanced SQL: SELECT, JOIN,
-- GROUP BY, subqueries, CTEs, window functions, etc.
-- ============================================================

-- ============================================================
-- Tables
-- ============================================================

CREATE TABLE publishers (
  id            SERIAL      PRIMARY KEY,
  name          TEXT        NOT NULL UNIQUE,
  country       TEXT        NOT NULL,
  founded_year  INT
);

CREATE TABLE authors (
  id            SERIAL      PRIMARY KEY,
  first_name    TEXT        NOT NULL,
  last_name     TEXT        NOT NULL,
  birth_year    INT,
  country       TEXT        NOT NULL
);

CREATE TABLE books (
  id            SERIAL      PRIMARY KEY,
  title         TEXT        NOT NULL,
  author_id     INT         NOT NULL REFERENCES authors(id),
  publisher_id  INT         NOT NULL REFERENCES publishers(id),
  genre         TEXT        NOT NULL CHECK (genre IN ('Fiction', 'Non-Fiction', 'Science', 'History', 'Biography', 'Fantasy', 'Mystery', 'Technology')),
  price         NUMERIC(7,2) NOT NULL,
  published_year INT        NOT NULL,
  pages         INT         NOT NULL,
  stock_qty     INT         NOT NULL DEFAULT 0
);

CREATE TABLE customers (
  id            SERIAL      PRIMARY KEY,
  first_name    TEXT        NOT NULL,
  last_name     TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  city          TEXT        NOT NULL,
  country       TEXT        NOT NULL,
  joined_date   DATE        NOT NULL
);

CREATE TABLE orders (
  id            SERIAL      PRIMARY KEY,
  customer_id   INT         NOT NULL REFERENCES customers(id),
  order_date    DATE        NOT NULL,
  status        TEXT        NOT NULL CHECK (status IN ('pending', 'shipped', 'delivered', 'cancelled')),
  shipping_city TEXT        NOT NULL
);

CREATE TABLE order_items (
  id            SERIAL      PRIMARY KEY,
  order_id      INT         NOT NULL REFERENCES orders(id),
  book_id       INT         NOT NULL REFERENCES books(id),
  quantity      INT         NOT NULL DEFAULT 1,
  unit_price    NUMERIC(7,2) NOT NULL
);

CREATE TABLE reviews (
  id            SERIAL      PRIMARY KEY,
  book_id       INT         NOT NULL REFERENCES books(id),
  customer_id   INT         NOT NULL REFERENCES customers(id),
  rating        INT         NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text   TEXT,
  reviewed_at   DATE        NOT NULL,
  UNIQUE (book_id, customer_id)
);

-- ============================================================
-- Seed data — publishers
-- ============================================================

INSERT INTO publishers (name, country, founded_year) VALUES
  ('Penguin Random House', 'USA',            1927),
  ('HarperCollins',        'USA',            1817),
  ('Macmillan Publishers', 'UK',             1843),
  ('Simon & Schuster',     'USA',            1924),
  ('Oxford University Press', 'UK',          1586),
  ('MIT Press',            'USA',            1962),
  ('Tor Books',            'USA',            1980),
  ('Vintage Books',        'USA',            1954);

-- ============================================================
-- Seed data — authors
-- ============================================================

INSERT INTO authors (first_name, last_name, birth_year, country) VALUES
  ('George',      'Orwell',       1903, 'UK'),
  ('Frank',       'Herbert',      1920, 'USA'),
  ('Yuval Noah',  'Harari',       1976, 'Israel'),
  ('J.R.R.',      'Tolkien',      1892, 'UK'),
  ('Agatha',      'Christie',     1890, 'UK'),
  ('Stephen',     'Hawking',      1942, 'UK'),
  ('Walter',      'Isaacson',     1952, 'USA'),
  ('Donna',       'Tartt',        1963, 'USA'),
  ('Andy',        'Weir',         1972, 'USA'),
  ('Ursula K.',   'Le Guin',      1929, 'USA'),
  ('Cormac',      'McCarthy',     1933, 'USA'),
  ('Malcolm',     'Gladwell',     1963, 'Canada');

-- ============================================================
-- Seed data — books
-- ============================================================

INSERT INTO books (title, author_id, publisher_id, genre, price, published_year, pages, stock_qty) VALUES
  ('1984',                            1,  1, 'Fiction',     12.99, 1949, 328,  45),
  ('Animal Farm',                     1,  1, 'Fiction',      9.99, 1945, 112,  60),
  ('Dune',                            2,  7, 'Fantasy',     14.99, 1965, 688,  38),
  ('Dune Messiah',                    2,  7, 'Fantasy',     13.99, 1969, 336,  22),
  ('Sapiens',                         3,  2, 'History',     16.99, 2011, 443,  75),
  ('Homo Deus',                       3,  2, 'History',     15.99, 2015, 450,  50),
  ('The Lord of the Rings',           4,  3, 'Fantasy',     24.99, 1954, 1178, 30),
  ('The Hobbit',                      4,  3, 'Fantasy',     11.99, 1937, 310,  55),
  ('Murder on the Orient Express',    5,  4, 'Mystery',     10.99, 1934, 256,  40),
  ('And Then There Were None',        5,  4, 'Mystery',      9.99, 1939, 272,  35),
  ('A Brief History of Time',         6,  1, 'Science',     13.99, 1988, 212,  28),
  ('The Theory of Everything',        6,  5, 'Science',     11.99, 2002, 176,   18),
  ('Steve Jobs',                      7,  4, 'Biography',   18.99, 2011, 630,  42),
  ('Leonardo da Vinci',               7,  4, 'Biography',   19.99, 2017, 600,  33),
  ('The Secret History',              8,  1, 'Fiction',     13.99, 1992, 544,  27),
  ('The Goldfinch',                   8,  1, 'Fiction',     15.99, 2013, 771,  20),
  ('The Martian',                     9,  1, 'Science',     12.99, 2011, 369,  65),
  ('Project Hail Mary',               9,  1, 'Science',     14.99, 2021, 476,  80),
  ('The Left Hand of Darkness',      10,  8, 'Fiction',     11.99, 1969, 304,  15),
  ('The Dispossessed',               10,  8, 'Fiction',     11.99, 1974, 387,  12),
  ('The Road',                       11,  1, 'Fiction',     12.99, 2006, 287,  25),
  ('No Country for Old Men',         11,  4, 'Fiction',     11.99, 2005, 309,  18),
  ('Outliers',                       12,  2, 'Non-Fiction', 13.99, 2008, 309,  55),
  ('The Tipping Point',              12,  2, 'Non-Fiction', 12.99, 2000, 301,  48),
  ('Blink',                          12,  2, 'Non-Fiction', 11.99, 2005, 296,  40);

-- ============================================================
-- Seed data — customers
-- (Intentionally some with no orders for LEFT JOIN practice)
-- ============================================================

INSERT INTO customers (first_name, last_name, email, city, country, joined_date) VALUES
  ('Emma',    'Johnson',   'emma.johnson@email.com',   'New York',    'USA',     '2020-01-15'),
  ('Liam',    'Smith',     'liam.smith@email.com',     'London',      'UK',      '2020-03-22'),
  ('Olivia',  'Williams',  'olivia.w@email.com',       'Toronto',     'Canada',  '2020-06-10'),
  ('Noah',    'Brown',     'noah.brown@email.com',     'Sydney',      'Australia','2021-02-28'),
  ('Ava',     'Jones',     'ava.jones@email.com',      'Chicago',     'USA',     '2021-04-05'),
  ('William', 'Garcia',    'william.g@email.com',      'Madrid',      'Spain',   '2021-07-14'),
  ('Sophia',  'Martinez',  'sophia.m@email.com',       'Berlin',      'Germany', '2021-09-01'),
  ('James',   'Hernandez', 'james.h@email.com',        'Paris',       'France',  '2022-01-18'),
  ('Isabella','Lopez',     'isabella.l@email.com',     'Boston',      'USA',     '2022-03-30'),
  ('Oliver',  'Gonzalez',  'oliver.g@email.com',       'Melbourne',   'Australia','2022-06-22'),
  ('Mia',     'Wilson',    'mia.wilson@email.com',     'Amsterdam',   'Netherlands','2022-08-11'),
  ('Elijah',  'Anderson',  'elijah.a@email.com',       'San Francisco','USA',    '2022-11-03'),
  ('Charlotte','Thomas',   'charlotte.t@email.com',    'Vancouver',   'Canada',  '2023-01-27'),
  ('Lucas',   'Taylor',    'lucas.taylor@email.com',   'Dublin',      'Ireland', '2023-04-09'),
  ('Amelia',  'Moore',     'amelia.m@email.com',       'Seattle',     'USA',     '2023-06-15'),
  ('Mason',   'Jackson',   'mason.j@email.com',        'Austin',      'USA',     '2023-09-20'),  -- no orders
  ('Harper',  'Lee',       'harper.lee@email.com',     'Nashville',   'USA',     '2024-01-05'),  -- no orders
  ('Ethan',   'White',     'ethan.white@email.com',    'Edinburgh',   'UK',      '2024-03-12');  -- no orders

-- ============================================================
-- Seed data — orders
-- ============================================================

INSERT INTO orders (customer_id, order_date, status, shipping_city) VALUES
  (1,  '2023-01-10', 'delivered', 'New York'),
  (1,  '2023-06-20', 'delivered', 'New York'),
  (1,  '2024-02-14', 'shipped',   'New York'),
  (2,  '2023-02-05', 'delivered', 'London'),
  (2,  '2024-01-18', 'delivered', 'London'),
  (3,  '2023-03-12', 'delivered', 'Toronto'),
  (4,  '2023-04-08', 'cancelled', 'Sydney'),
  (4,  '2023-11-22', 'delivered', 'Sydney'),
  (5,  '2023-05-15', 'delivered', 'Chicago'),
  (5,  '2024-03-01', 'pending',   'Chicago'),
  (6,  '2023-06-30', 'delivered', 'Madrid'),
  (7,  '2023-07-11', 'delivered', 'Berlin'),
  (7,  '2024-04-05', 'shipped',   'Berlin'),
  (8,  '2023-08-22', 'delivered', 'Paris'),
  (9,  '2023-09-14', 'delivered', 'Boston'),
  (9,  '2024-01-30', 'delivered', 'Boston'),
  (10, '2023-10-03', 'delivered', 'Melbourne'),
  (11, '2023-11-17', 'delivered', 'Amsterdam'),
  (12, '2023-12-05', 'delivered', 'San Francisco'),
  (12, '2024-02-28', 'shipped',   'San Francisco'),
  (13, '2024-01-12', 'delivered', 'Vancouver'),
  (14, '2024-02-03', 'delivered', 'Dublin'),
  (15, '2024-03-20', 'pending',   'Seattle');

-- ============================================================
-- Seed data — order_items
-- ============================================================

INSERT INTO order_items (order_id, book_id, quantity, unit_price) VALUES
  -- Order 1: Emma's first order
  (1,  1,  1, 12.99),
  (1,  5,  1, 16.99),
  -- Order 2: Emma's second order
  (2,  17, 1, 12.99),
  (2,  18, 1, 14.99),
  (2,  13, 1, 18.99),
  -- Order 3: Emma's third order
  (3,  7,  1, 24.99),
  -- Order 4: Liam
  (4,  5,  2, 16.99),
  (4,  6,  1, 15.99),
  -- Order 5: Liam second
  (5,  23, 1, 13.99),
  (5,  24, 1, 12.99),
  -- Order 6: Olivia
  (6,  3,  1, 14.99),
  (6,  4,  1, 13.99),
  -- Order 7: Noah (cancelled)
  (7,  8,  1, 11.99),
  -- Order 8: Noah second
  (8,  9,  1, 10.99),
  (8,  10, 1,  9.99),
  -- Order 9: Ava
  (9,  13, 1, 18.99),
  (9,  14, 1, 19.99),
  -- Order 10: Ava second
  (10, 25, 2, 11.99),
  -- Order 11: William
  (11, 11, 1, 13.99),
  (11, 12, 1, 11.99),
  -- Order 12: Sophia
  (12, 2,  1,  9.99),
  (12, 1,  1, 12.99),
  -- Order 13: Sophia second
  (13, 18, 1, 14.99),
  -- Order 14: James
  (14, 15, 1, 13.99),
  (14, 16, 1, 15.99),
  -- Order 15: Isabella
  (15, 17, 2, 12.99),
  -- Order 16: Isabella second
  (16, 18, 1, 14.99),
  (16, 3,  1, 14.99),
  -- Order 17: Oliver
  (17, 23, 1, 13.99),
  (17, 24, 1, 12.99),
  (17, 25, 1, 11.99),
  -- Order 18: Mia
  (18, 19, 1, 11.99),
  (18, 20, 1, 11.99),
  -- Order 19: Elijah
  (19, 5,  1, 16.99),
  (19, 11, 1, 13.99),
  -- Order 20: Elijah second
  (20, 18, 1, 14.99),
  -- Order 21: Charlotte
  (21, 7,  1, 24.99),
  (21, 8,  1, 11.99),
  -- Order 22: Lucas
  (22, 13, 1, 18.99),
  (22, 14, 1, 19.99),
  -- Order 23: Amelia
  (23, 17, 1, 12.99),
  (23, 18, 1, 14.99);

-- ============================================================
-- Seed data — reviews
-- (Intentionally some books without reviews for LEFT JOIN practice)
-- ============================================================

INSERT INTO reviews (book_id, customer_id, rating, review_text, reviewed_at) VALUES
  (1,  1,  5, 'A haunting masterpiece. Every page feels relevant today.',       '2023-01-20'),
  (1,  2,  5, 'Required reading for everyone.',                                 '2023-03-01'),
  (1,  12, 4, 'Brilliant but bleak.',                                           '2024-01-10'),
  (2,  1,  4, 'Short but powerful allegory.',                                   '2023-06-25'),
  (3,  3,  5, 'The best sci-fi novel ever written.',                            '2023-03-20'),
  (3,  6,  5, 'Epic world-building. Truly unmatched.',                          '2023-07-10'),
  (5,  2,  5, 'Changed the way I think about human history.',                   '2023-02-15'),
  (5,  5,  4, 'Thought-provoking and accessible.',                              '2023-05-25'),
  (5,  12, 5, 'Probably the most important book I have read.',                  '2023-12-15'),
  (6,  11, 3, 'Good but not as strong as Sapiens.',                             '2023-11-25'),
  (7,  1,  5, 'The greatest fantasy epic. A world unto itself.',                '2024-02-20'),
  (7,  13, 5, 'Re-read it every year. Timeless.',                               '2024-01-20'),
  (8,  4,  4, 'A joy to read. Perfect introduction to Tolkien.',                '2023-11-30'),
  (9,  8,  4, 'Clever mystery with a brilliant twist.',                         '2023-08-30'),
  (10, 4,  5, 'Christie at her absolute best.',                                 '2023-12-05'),
  (11, 6,  4, 'Made complex science approachable.',                             '2023-07-18'),
  (13, 5,  5, 'Isaacson captures Jobs perfectly. Honest and fascinating.',      '2023-05-22'),
  (13, 9,  4, 'Incredible detail. Long but worth every page.',                  '2023-09-22'),
  (13, 14, 5, 'Best biography I have ever read.',                               '2024-02-10'),
  (14, 5,  5, 'Even better than Steve Jobs.',                                   '2024-03-05'),
  (14, 9,  4, 'Stunning research and beautiful writing.',                       '2023-09-22'),
  (15, 8,  4, 'Atmospheric and unsettling in the best way.',                    '2023-08-30'),
  (17, 1,  5, 'Funny, tense and scientifically gripping.',                      '2023-06-28'),
  (17, 9,  5, 'Could not put it down. Best sci-fi in years.',                   '2023-09-20'),
  (17, 15, 4, 'Loved the problem-solving approach.',                            '2024-03-28'),
  (18, 7,  5, 'Weir does it again. Even better than The Martian.',              '2024-04-12'),
  (18, 9,  5, 'Absolutely brilliant. My favourite book this year.',             '2024-02-05'),
  (23, 2,  4, 'Gladwell is at his engaging best.',                              '2024-01-25'),
  (23, 10, 5, 'Eye-opening. Changed how I view success.',                       '2023-10-10'),
  (24, 10, 4, 'Fascinating read about small changes that cause big effects.',   '2023-10-10'),
  (25, 11, 4, 'Quick read packed with insight.',                                '2023-11-22');
