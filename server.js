const express = require('express');
const axios = require('axios');
const FormData = require('form-data');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || 'Https://discord.com/api/webhooks/1550880101913067591/RCo-bz_Oljz7j47B1ajO2YUWA23NuWDWFVBn-hVkwPqTnJNCuTGfD5vMET1-nM1xM8VJ';
const RENDER_URL = process.env.RENDER_EXTERNAL_URL;

app.get('/ping', (req, res) => res.status(200).send('OK'));

app.post('/api/download', (req, res) => {
  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Insira um link válido!' });
  }

  const outputPath = path.join(__dirname, `temp_${Date.now()}.mp4`);

  console.log(`Baixando vídeo: ${videoUrl}`);

  exec(`yt-dlp -o "${outputPath}" "${videoUrl}"`, async (error) => {
    if (error) {
      console.error('Erro no yt-dlp:', error.message);
      return res.status(500).json({ error: 'Erro ao baixar o vídeo. Verifique se o link está correto.' });
    }

    try {
      console.log('Vídeo baixado. Enviando para o Discord...');

      const form = new FormData();
      form.append('file', fs.createReadStream(outputPath));
      form.append('content', `📹 **Vídeo baixado via tdrk**\n🔗 Original: ${videoUrl}`);

      await axios.post(DISCORD_WEBHOOK_URL, form, {
        headers: form.getHeaders(),
      });

      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);

      console.log('Enviado com sucesso!');
      res.json({ success: true, message: 'Vídeo enviado ao Discord!' });
    } catch (err) {
      console.error('Erro no Webhook:', err.message);
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      res.status(500).json({ error: 'Erro ao enviar para o Discord. O arquivo pode ter passado de 25MB.' });
    }
  });
});

if (RENDER_URL) {
  setInterval(async () => {
    try {
      await axios.get(`${RENDER_URL}/ping`);
    } catch (err) {
      console.error('Erro no auto-ping:', err.message);
    }
  }, 10 * 60 * 1000);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 tdrk rodando na porta ${PORT}`);
  console.log(`Acesse no navegador: http://localhost:${PORT}`);
});

