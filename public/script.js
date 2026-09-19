async function enviarVideo() {
  const urlInput = document.getElementById('videoUrl').value.trim();
  const statusElement = document.getElementById('status');

  if (!urlInput) {
    statusElement.style.color = '#f87171';
    statusElement.innerText = 'Cole um link válido!';
    return;
  }

  statusElement.style.color = '#38bdf8';
  statusElement.innerText = '⏳ Processando e baixando o vídeo...';

  try {
    const response = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ videoUrl: urlInput })
    });

    const data = await response.json();

    if (response.ok) {
      statusElement.style.color = '#4ade80';
      statusElement.innerText = '✅ Vídeo enviado com sucesso para o Discord!';
      document.getElementById('videoUrl').value = '';
    } else {
      statusElement.style.color = '#f87171';
      statusElement.innerText = `❌ Erro: ${data.error}`;
    }
  } catch (error) {
    statusElement.style.color = '#f87171';
    statusElement.innerText = '❌ Erro ao conectar com o servidor.';
  }
}

