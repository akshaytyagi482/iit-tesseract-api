# Tesseract api backend
This Express.js application serves as a RESTful API for extracting text and bounding boxes from images using Tesseract OCR. The application consists of two primary endpoints:

/get-text: This endpoint accepts a base64-encoded image as input. It validates the input to ensure it is a valid base64 string. If valid, it converts the base64 string into a buffer, saves it as a temporary image file, and then invokes the Tesseract OCR binary to extract text from the image. The extracted text is returned as a JSON response. Temporary files are deleted after processing to maintain cleanliness.

/get-bboxes: This endpoint also accepts a base64-encoded image and a bounding box type (bbox_type) that determines the page segmentation mode (PSM) for Tesseract. After validating the input, it processes the image in a similar manner as the /get-text endpoint but returns bounding box coordinates for the recognized text instead of the text itself. The bounding boxes are parsed from Tesseract’s HOCR output format.

The application utilizes the child_process module to execute the Tesseract command-line tool, ensuring that image processing is handled efficiently. All necessary error handling is implemented to manage potential issues during file operations and OCR processing. Environment variables are used to configure the Tesseract executable path for cross-platform compatibility.

# Installation Instructions
1. first we have to clone the project and then install the dependencies.  
   ```git clone "https://github.com/akshaytyagi482/iit-tesseract-api.git"```    
   ```npm install ```   
2. now download the tesseract ocr v5 binary from the given link and setup it on your system.  
   [Tesseract ocr v5](https://github.com/UB-Mannheim/tesseract/wiki)
3. After installation and setup is done. now create a .env file and add two attributes in it  
   ``` tesspath = ""
   PORT = 3000```
4. In the tesspath you have to give the path to your tesseract ocr along with /tesseract.exe at the end.
   ![image](https://github.com/user-attachments/assets/b8c4c3b2-e923-4e53-a025-7bbc4583574d)
   ![image](https://github.com/user-attachments/assets/faf924b0-054e-4aa0-9192-e3a1d32a2b76)

   example - path is c:/programfiles/tesseract ocr/
   then we will add /tesseract.exe at the end of this and pass as a parameter.
6. You are good to go now u can test the api on any api tester of your choice.
   # Some Screenshot
    ![image](https://github.com/user-attachments/assets/fc4ea114-d404-4708-a87b-0399c5fea7a5)

   
