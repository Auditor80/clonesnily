const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { nanoid } = require('nanoid'); // Biblioteca para gerar IDs curtos

const app = express();
const db = new sqlite3.Database('./database.sqlite');
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON
app.use(express.json());
app.use(express.static('public')); // Serve arquivos estáticos (HTML, CSS, JS)

// Rota para criar um novo link com CTA
app.post('/api/links', async (req, res) => {
    const { originalUrl, ctaText, ctaUrl } = req.body;
    const shortCode = nanoid(6); // Gera um ID de 6 caracteres

    try {
        const sql = `INSERT INTO links (original_url, cta_text, cta_url, short_code) VALUES (?, ?, ?, ?)`;
        db.run(sql, [originalUrl, ctaText, ctaUrl, shortCode], function(err) {
            if (err) {
                return res.status(500).json({ error: 'Erro ao salvar no banco de dados.' });
            }
            // Retorna o link encurtado completo
            res.json({ shortUrl: `http://localhost:${PORT}/s/${shortCode}` });
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
});

// Rota para acessar o link encurtado
app.get('/s/:shortCode', (req, res) => {
    const { shortCode } = req.params;

    const sql = `SELECT * FROM links WHERE short_code = ?`;
    db.get(sql, [shortCode], (err, row) => {
        if (err || !row) {
            return res.status(404).send('Link não encontrado.');
        }

        // Aqui, em vez de redirecionar, vamos servir um HTML que exibe a página original com o CTA
        // Técnica simplificada: usar um iframe para a página original e o CTA por cima.
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .sniply-cta {
                        position: fixed;
                        bottom: 20px;
                        right: 20px;
                        background-color: #007bff;
                        color: white;
                        padding: 10px 20px;
                        border-radius: 5px;
                        text-decoration: none;
                        z-index: 10000;
                    }
                    .sniply-frame {
                        width: 100%;
                        height: 100vh;
                        border: none;
                    }
                </style>
            </head>
            <body>
                <iframe src="${row.original_url}" class="sniply-frame"></iframe>
                <a href="${row.cta_url}" target="_blank" class="sniply-cta">${row.cta_text}</a>
            </body>
            </html>
        `);
    });
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});