import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { saveAs } from 'file-saver';

const PdfConverter = () => {
  const [sourceFile, setSourceFile] = useState(null);
  const [conversionType, setConversionType] = useState('compress');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setSourceFile(file);
    } else {
      alert('Please upload a valid PDF file');
    }
  };

  const compressPdf = async (pdfDoc) => {
    // Simple compression by reducing image quality
    const pages = pdfDoc.getPages();
    for (const page of pages) {
      const { width, height } = page.getSize();
      const scaledPage = await pdfDoc.embedPage(page, { width: width * 0.8, height: height * 0.8 });
      page.drawPage(scaledPage, { x: width * 0.1, y: height * 0.1 });
    }
    return pdfDoc;
  };

  const rotatePdf = async (pdfDoc) => {
    const pages = pdfDoc.getPages();
    pages.forEach(page => {
      page.setRotation(page.getRotation().angle + 90);
    });
    return pdfDoc;
  };

  const convertPdf = async () => {
    if (!sourceFile) {
      alert('Please upload a PDF file first');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await sourceFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);

      let processedDoc;
      switch(conversionType) {
        case 'compress':
          processedDoc = await compressPdf(pdfDoc);
          break;
        case 'rotate':
          processedDoc = await rotatePdf(pdfDoc);
          break;
        default:
          throw new Error('Invalid conversion type');
      }

      const pdfBytes = await processedDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      saveAs(blob, `converted_${sourceFile.name}`);
    } catch (error) {
      console.error('Conversion error:', error);
      alert('PDF conversion failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col border-4 border-dashed w-full h-32 hover:bg-gray-100 hover:border-purple-300 group">
          <div className="flex flex-col items-center justify-center pt-7">
            <svg 
              className="w-10 h-10 text-purple-400 group-hover:text-purple-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              ></path>
            </svg>
            <p className="lowercase text-sm text-gray-400 group-hover:text-purple-600 pt-1 tracking-wider">
              {sourceFile ? sourceFile.name : 'Select a PDF file'}
            </p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept=".pdf"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      <div className="flex space-x-4">
        <select 
          value={conversionType}
          onChange={(e) => setConversionType(e.target.value)}
          className="flex-grow p-2 border rounded"
        >
          <option value="compress">Compress PDF</option>
          <option value="rotate">Rotate PDF</option>
        </select>

        <button 
          onClick={convertPdf}
          disabled={!sourceFile || isProcessing}
          className="bg-purple-500 text-white px-4 py-2 rounded 
            hover:bg-purple-600 
            disabled:opacity-50 
            disabled:cursor-not-allowed 
            transition-colors duration-300"
        >
          {isProcessing ? 'Processing...' : 'Convert PDF'}
        </button>
      </div>
    </div>
  );
};

export default PdfConverter;