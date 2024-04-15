const fs = require("fs");
const path = require("path");
const { createWriteStream } = require("fs");
const https = require("https");

const downloadImage = (imageUrl, imagePath) => {
  return new Promise((resolve, reject) => {
    const file = createWriteStream(imagePath);

    https
      .get(imageUrl, (response) => {
        if (response.statusCode !== 200) {
          reject(
            new Error(`Failed to download image: ${response.statusMessage}`)
          );
          return;
        }

        response.pipe(file);

        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        fs.unlink(imagePath, () => {
          reject(new Error(`Error downloading image: ${err.message}`));
        });
      });
  });
};

async function downloadImagesFromJSON(jsonFilePath, outputFolder) {
  try {
    // Read the JSON file
    const data = fs.readFileSync(jsonFilePath);
    const modalDivs = JSON.parse(data);

    // Create the output folder if it doesn't exist
    if (!fs.existsSync(outputFolder)) {
      fs.mkdirSync(outputFolder);
    }

    console.log(`Scraping ${modalDivs.length} JSON objects...`);

    let totalImagesDownloaded = 0;

    // Iterate over each modal object and download images
    for (const modal of modalDivs) {
      const mainImageUrl = modal.mainImage;
      const sizeImageUrl = modal.sizeImage;
      const footerLinks = modal.footerLinks;

      if (mainImageUrl) {
        await downloadImage(
          mainImageUrl,
          path.join(outputFolder, path.basename(mainImageUrl))
        );
        totalImagesDownloaded++;
      }

      if (sizeImageUrl) {
        await downloadImage(
          sizeImageUrl,
          path.join(outputFolder, path.basename(sizeImageUrl))
        );
        totalImagesDownloaded++;
      }

      // Download images from footer links
      for (const footerLink of footerLinks) {
        if (footerLink.imageUrl) {
          await downloadImage(
            footerLink.imageUrl,
            path.join(outputFolder, path.basename(footerLink.imageUrl))
          );
          totalImagesDownloaded++;
        }
      }
    }

    console.log(`Downloaded ${totalImagesDownloaded} images successfully.`);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Usage example
const jsonFilePath = "pools_data.json";
const outputFolder = "downloaded_images";
downloadImagesFromJSON(jsonFilePath, outputFolder);
