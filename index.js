// index.js

const express = require('express');
const app = express();
const path = require('path');
const cheerio = require('cheerio');
const Excel = require('exceljs');
const axios = require('axios');

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/scrape', (req, res) => {
  const url = "https://www.spareroom.co.uk/flatshare/?search_id=1234606887&";

  axios.get(url)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);

      // Recuperar apenas as tags <h2> dentro das <li> que contêm <mark class="new"> ou <mark class="new-today">,
      // mas que não possuem <span class="featuredHeading">Featured Ad</span>
      const h2Texts = [];
      $('li:not(:has(.featuredHeading))').filter((index, element) => {
        return $(element).find('mark.new, mark.new-today').length > 0;
      }).each((index, element) => {
        const h2Element = $(element).find('h2').first();
        const h2Text = h2Element.text().trim();
        h2Texts.push(h2Text);
      });

      console.log('Títulos <h2> dentro das <li> com <mark class="new"> ou <mark class="new-today">, exceto os que têm <span class="featuredHeading">Featured Ad</span>:');
      console.log(h2Texts);

      // Exportar a lista para um arquivo Excel
      const workbook = new Excel.Workbook();
      const worksheet = workbook.addWorksheet('Lista de Titulos');

      h2Texts.forEach((title, index) => {
        worksheet.getCell(`A${index + 1}`).value = title;
      });

      const excelFileName = 'titulos.xlsx'; // Nome do arquivo Excel que será gerado
      return workbook.xlsx.writeBuffer();
    })
    .then(buffer => {
      // Enviar a resposta com o arquivo Excel em formato de Blob para o cliente
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename=titulos.xlsx');
      res.end(buffer, 'binary');
    })
    .catch((error) => {
      console.error('Ocorreu um erro:', error);
      res.status(500).send('Ocorreu um erro ao realizar o scraping e exportação.');
    });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}/`);
});
