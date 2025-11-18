const express = require('express');
const { emitirCND } = require('./bot');

const app = express();

app.use(express.json());

// rota simples pra ver se a API está no ar
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// rota que o Dyad / frontend vão usar
app.post('/emitir-cnd', async (req, res) => {
  const { cnpj } = req.body || {};

  if (!cnpj) {
    return res.status(400).json({
      ok: false,
      message: 'Informe o CNPJ no corpo da requisição. Ex: { "cnpj": "12345678000199" }'
    });
  }

  try {
    console.log('--- [API] Chamando robô emitirCND para CNPJ:', cnpj);
    await emitirCND(cnpj);

    return res.json({
      ok: true,
      message: 'Robô de emissão de CND executado (veja logs no servidor).',
      cnpj
    });
  } catch (error) {
    console.error('Erro na rota /emitir-cnd:', error);
    return res.status(500).json({
      ok: false,
      message: 'Erro ao executar automação.',
      error: String(error)
    });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`API RPA rodando na porta ${PORT}`);
});
