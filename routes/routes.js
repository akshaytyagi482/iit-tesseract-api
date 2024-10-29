const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const tesspath = process.env.tesspath
function isBase64(str) {
  
  const base64Pattern = /^data:image\/(jpeg|png|gif|bmp|webp|tiff|svg\+xml);base64,[A-Za-z0-9+/]+={0,2}$/;

  const isMatch = base64Pattern.test(str);
  console.log('Is Base64 valid:', isMatch); // Debugging line
  return isMatch;
}

router.post('/get-text',  async (req, res) => {
  try{
    const { base64_image } = req.body;
  const response = await fetch(base64_image);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const tempImagePath = path.join(__dirname, 'temp_image.jpg');
  if ( isBase64(base64_image)) {
  fs.writeFileSync(tempImagePath, buffer);

  const outputFilePath = path.join(__dirname, 'output'); 
  exec(`${tesspath} ${tempImagePath} ${outputFilePath} -l eng`, (error, stdout, stderr) => {
      if (error) {
          console.error(`Error: ${error.message}`);
          return res.status(500).json({ error: 'Failed to process image with Tesseract.' });
      }

      fs.readFile(`${outputFilePath}.txt`, 'utf8', (err, data) => {
          if (err) {
              console.error(err);
              return res.status(500).json({ error: 'Failed to read output text.' });
          }

          fs.unlinkSync(tempImagePath);
          fs.unlinkSync(`${outputFilePath}.txt`);

          // Send extracted text
          res.json({success: true ,text: data });
      });
  });
} else {
  return res.json({
    "success": false,
    "error": {
        "message": "Invalid base64_image."
    }
});
}
} catch (error) {
  console.error(error);
  res.status(500).json({ error: 'An error occurred while processing the image.' });
}
});
router.post('/get-bboxes', async (req, res) => {
  try {
      const { base64_image, bbox_type } = req.body;


      // Set PSM value based on the requested type
      let psmValue;
      switch (bbox_type) {
          case 'word':
              psmValue = 6; // Assume a single uniform block of text
              break;
          case 'line':
              psmValue = 4; // Assume a single line of text
              break;
          case 'paragraph':
              psmValue = 1; // Assume a single column of text
              break;
          case 'block':
              psmValue = 3; // Assume a block of text
              break;
          case 'page':
              psmValue = 3; // Use the default page segmentation
              break;
          default:
            return res.json({
              "success": false,
              "error": {
                  "message": "Invalid bbox_type"
              }
          });
      }

      // Download the image from the URL
      const response = await fetch(base64_image);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const tempImagePath = path.join(__dirname, 'temp_image.jpg');

      // Check if content type is text-based (indicates it might be encoded in Base64)
      if (isBase64(base64_image)) {
        fs.writeFileSync(tempImagePath, buffer);

        const outputFilePath = path.join(__dirname, 'output');
        exec(`"${tesspath}" "${tempImagePath}" "${outputFilePath}" -l eng --psm ${psmValue} hocr`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.json({
                  "success": false,
                  "error": {
                      "message": "Invalid base64_image."
                  }
              });
            }
  
            // Read the output HTML with bounding box information
            fs.readFile(`${outputFilePath}.hocr`, 'utf8', (err, data) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to read output text.' });
                }
  
                fs.unlinkSync(tempImagePath);
                fs.unlinkSync(`${outputFilePath}.hocr`);
                 const output = parseHocr(data)
                res.json({ "success": true,
                  "result": {
                      "bboxes": output
                  }});
            });
            function parseHocr(hocrData) {
              const boundingBoxes = [];
              const regex = /bbox (\d+) (\d+) (\d+) (\d+)/g;
              let match;
          
              while ((match = regex.exec(hocrData)) !== null) {
                  const [_, xMin, yMin, xMax, yMax] = match;
                  boundingBoxes.push({
                    "x_min":  parseInt(xMin),
                    "y_min": parseInt(yMin),
                    "x_max": parseInt(xMax),
                    "y_max": parseInt(yMax)
                });
                  break;
              }
          
              return boundingBoxes;
          }
          });
      } else {
          return res.json({
            "success": false,
            "error": {
                "message": "Invalid base64_image."
            }
        });
      }
      // Save the image temporarily
      
  } catch (error) {
      console.error(error);return res.json({
        "success": false,
        "error": {
            "message": "Invalid base64_image."
        }
    });
  }
});



module.exports = router;