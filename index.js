const puppeteer = require('puppeteer');

async function emitirCND() {
  console.log('Iniciando automação de emissão de CND...');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();

  try {
    console.log('Acessando site principal...');
    await page.goto(
      'https://servicos.receita.fazenda.gov.br/Servicos/certidaointernet/PJ/Emitir',
      { waitUntil: 'networkidle0', timeout: 60000 }
    );

    console.log('Procurando iframe da aplicação...');
    const frames = await page.frames();

    // só pra debug: listar todos os frames
    console.log('Frames encontrados:');
    frames.forEach((f, idx) => {
      console.log(`  [${idx}] ${f.url()}`);
    });

    // tenta achar um iframe "útil"
    const iframe =
      frames.find(f => f.url().includes('certidao')) ||
      frames.find(f => f.url().includes('Emitir')) ||
      frames.find(f => f.url() !== page.url());

    if (!iframe) {
      throw new Error('IFrame da CND não encontrado!');
    }

    console.log('IFrame localizado com sucesso!');
    console.log('Coletando inputs dentro do iframe...');

    // Aqui vamos trazer todos os inputs pra ver os nomes/ids
    const inputs = await iframe.evaluate(() => {
      const arr = Array.from(document.querySelectorAll('input'));
      return arr.map((el, index) => ({
        index,
        id: el.id || null,
        name: el.name || null,
        type: el.type || null,
        placeholder: el.placeholder || null,
        value: el.value || null
      }));
    });

    console.log('Inputs encontrados dentro do iframe:');
    console.log(JSON.stringify(inputs, null, 2));

    console.log('--- Fim do debug dos inputs ---');
    console.log('Por enquanto não vamos preencher nada, só inspecionar.');

  } catch (err) {
    console.error('Erro durante execução:', err.message || err);
  } finally {
    await browser.close();
  }
}

emitirCND().catch(err => console.error('Erro fatal:', err));
