const cheerio = require("cheerio");
const fs = require("fs");

async function scrapeWebsite() {
  try {
    const response = await fetch("https://aquatechnicspools.com/range");
    const html = await response.text();
    const $ = cheerio.load(html);

    const modalDivs = [];
    $(".modal").each((index, element) => {
      const $element = $(element);

      const imageUrls = [];
      $element.find(".modal-slide img").each((index, imgElement) => {
        const imageUrl = $(imgElement).attr("src");
        imageUrls.push(imageUrl);
      });

      const textArray = [];
      $element.find(".modal-body-left li").each((index, liElement) => {
        const text = $(liElement).text().trim();
        textArray.push(text);
      });

      const footerLinks = [];
      $element
        .find(".modal-footer-copy-container li")
        .each((index, liElement) => {
          const link = $(liElement).find("a").attr("href");
          const imageUrl = $(liElement).find("img").attr("src");
          footerLinks.push({ link, imageUrl });
        });

      modalDivs.push({
        name: $element.attr("id"),
        mainImage: $element.find(".modal-slide img").first().attr("src"),
        dimension1: $element.find(".modal-dimension").first().text(),
        dimension2: $element.find(".modal-dimension1").first().text(),
        subTitle: $element.find(".modal-body-copy-title").first().text(),
        text: $element.find(".modal-body-copy").first().text(),
        sizeImage: $element.find(".modal-body-right img").first().attr("src"),
        liText: textArray,
        footerLinks: footerLinks,
      });
    });

    fs.writeFileSync("pools_data.json", JSON.stringify(modalDivs, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

scrapeWebsite();
