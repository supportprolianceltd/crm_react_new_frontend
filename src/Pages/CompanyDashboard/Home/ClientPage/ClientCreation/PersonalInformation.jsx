import React, { useState } from 'react';
import { ArrowLeftIcon, CloudArrowUpIcon, XMarkIcon, DocumentIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const About = () => {

      const navigate = useNavigate();
      const [file, setFile] = useState(null);
      const [previewUrl, setPreviewUrl] = useState(null);
    
      // Allowed file types
      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/svg+xml',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
    
      
      // Handle file select
      const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile && allowedTypes.includes(selectedFile.type)) {
          setFile(selectedFile);
          if (selectedFile.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(selectedFile));
          } else {
            setPreviewUrl(null); // non-image, show icon
          }
        } else {
          alert('Invalid file type. Please upload an image, PDF, or Word document.');
        }
      };
    
      // Handle drag & drop
      const handleDrop = (e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && allowedTypes.includes(droppedFile.type)) {
          setFile(droppedFile);
          if (droppedFile.type.startsWith('image/')) {
            setPreviewUrl(URL.createObjectURL(droppedFile));
          } else {
            setPreviewUrl(null);
          }
        } else {
          alert('Invalid file type. Please upload an image, PDF, or Word document.');
        }
      };
    
      const handleDragOver = (e) => {
        e.preventDefault();
      };
    
      // Remove file
      const removeFile = () => {
        setFile(null);
        setPreviewUrl(null);
      };


  return (
<div className='Davv-Pils'>
        <div className='Davv-Pils-Box KKhn-GYH-Part'>
             <div className='form-section'>
            <h3>Upload Profile Photo</h3>

                <div className='GHuh-Form-Input'>
              <div
                className='upload-area'
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {file ? (
                  <div className="file-preview-container" style={{ opacity: 1 }}>
                    <div className="preview-content">
                      {previewUrl ? (
                        <div className="image-preview-container">
                          <img src={previewUrl} alt="Preview" className="file-preview-image" />
                        </div>
                      ) : (
                        <div className="file-icon-container">
                          <DocumentIcon className="h-10 w-10 text-gray-600" />
                        </div>
                      )}
                      <div className="file-info">
                        <span className="file-name">{file?.name}</span>
                        <span className="file-size">{(file?.size / 1024).toFixed(1)} KB</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="remove-file-btn"
                      aria-label="Remove file"
                      onClick={removeFile}
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="file-upload"
                      accept=".jpg,.jpeg,.png,.gif,.svg,.pdf,.doc,.docx"
                      className="file-input"
                      onChange={handleFileChange}
                      hidden
                    />
                    <label htmlFor="file-upload" className="upload-label">
                      <CloudArrowUpIcon className='upload-icon h-10 w-10' />
                      <p>Click or drag and drop to upload</p>
                      <p className="file-types">Images, PDF, DOC, DOCX (max. 2MB)</p>
                    </label>
                  </>
                )}
              </div>
            </div>

            </div>

              <div className='form-section'>
                <h3>Basic Information</h3>

                 <div className='GHuh-Form-Input'>
                <label>Title</label>
                <div>
                <select name='materialType'>
                  <option>Mr</option>
                  <option>Mrs</option>
                  <option>Miss</option>
                  <option>Others</option>
                </select>
                </div>
              </div>


               <div className='input-row'>
              <div className='GHuh-Form-Input'>
                <label>First Name</label>
                <input type='text' name='requestItem' />
              </div>
               <div className='GHuh-Form-Input'>
                <label>Last Name</label>
                <input type='text' name='requestItem' />
              </div>
            </div>



            </div>

            <div className='form-section'>
            <h3>Contact Details</h3>
            </div>

   </div>
    </div>
  );
};


export default About;
