import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

export default upload;

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//       cb(null, 'uploads/'); // Directory to save files
//     },
//     filename: function (req, file, cb) {
//       cb(null, Date.now() + '-' + file.originalname); // Save the file with a timestamp to avoid name conflicts
//     }
//   });
  
//   // Initialize upload
//   const upload = multer({ storage: storage });

//   export default upload;