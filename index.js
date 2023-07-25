// index.js

const cheerio = require('cheerio');
const Excel = require('exceljs');
const axios = require('axios');

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
    return workbook.xlsx.writeFile(excelFileName);
  })
  .then(() => {
    console.log('Lista de títulos exportada com sucesso para o arquivo "titulos.xlsx"');
  })
  .catch((error) => {
    console.error('Ocorreu um erro:', error);
  });