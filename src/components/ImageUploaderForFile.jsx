export default function ImageUploader() {
  return (
    <div className="upload-box">
      <input type="file" id="upload" hidden />
      <label htmlFor="upload">
        <span className="upload-text">
          Click to upload <span className="drag">or drag and drop</span>
          <br />
          <small>SVG, PNG, JPG or GIF (max. 800x400px)</small>
        </span>
      </label>
    </div>
  );
}
