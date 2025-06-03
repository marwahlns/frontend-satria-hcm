import React from "react";

const PdfPreview = ({ fileUrl }) => {
  return (
    <div className="pdf-preview">
      <iframe
        src={fileUrl}
        width="100%"
        height="120px" // Menampilkan preview PDF dalam ukuran kecil
        style={{ border: "none" }}
        title="PDF Preview"
      />
    </div>
  );
};

export default PdfPreview;
