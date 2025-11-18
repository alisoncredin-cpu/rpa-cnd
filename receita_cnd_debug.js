const { chromium } = require('playwright');

async function debugReceitaCND() {
  console.log('Iniciando debug com Playwright...');

  const browser = await chromium.launch({
    headless: true
  });

  const page = await browser.newPage();

  try {
    console.log('Acessando página da CND PJ...');
    await page.goto(
      'https://servicos.receita.fazenda.gov.br/Servicos/certidaointernet/PJ/Emitir',
      { waitUntil: 'networkidle', timeout: 60000 }
    );

    console.log('Listando frames...');
    const frames = page.frames();
    frames.forEach((f, idx) => {
      console.log(`[${idx}] ${f.url()}`);
    });

    // tenta pegar um frame "útil"
    const frameAlvo =
      frames.find(f => f.url().includes('certidao')) ||
      frames.find(f => f.url() !== page.url()) ||
      page.mainFrame();

    console.log('Coletando inputs dentro do frame alvo...');
    const inputs = await frameAlvo.evaluate(() => {
      const arr = Array.from(document.querySelectorAll('input'));
      return arr.map((el, index) => ({
        index,
        id: el.id || null,
        name: el.name || null,
        type: el.type || null,
        placeholder: el.placeholder || null
      }));
    });

    console.log('Inputs encontrados:');
    console.log(JSON.stringify(inputs, null, 2));

    console.log('Debug finalizado.');

  } catch (err) {
    console.error('Erro durante debug:', err.message || err);
  } finally {
    await browser.close();
  }
}

debugReceitaCND().catch(err => console.error('Erro fatal:', err));
