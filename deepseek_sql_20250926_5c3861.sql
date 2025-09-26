CREATE TABLE links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    -- URL original que o usuário quer compartilhar
    original_url TEXT NOT NULL,
    -- Texto do botão de Call-to-Action
    cta_text TEXT NOT NULL,
    -- URL para onde o CTA leva
    cta_url TEXT NOT NULL,
    -- Identificador único para o link encurtado (ex: "aBc123")
    short_code TEXT UNIQUE NOT NULL,
    -- Data de criação para possível limpeza de links antigos
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);