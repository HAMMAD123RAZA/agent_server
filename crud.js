// // crudFunctions.js
// const { 
//   collection, 
//   addDoc, 
//   doc, 
//   updateDoc, 
//   deleteDoc, 
//   getDoc, 
//   getDocs, 
//   query, 
//   where, 
//   orderBy, 
//   limit, 
//   serverTimestamp 
// } = require("firebase/firestore");
// const { db } = require("./utils/firebase"); // Adjust path as needed

// // Dynamic CRUD handler - checks method from request (like Remix loader/action)
// const handleCrudRequest = async (req, res) => {
//   const method = req.method;
  
//   // Handle GET requests (read operations)
//   if (method === "GET") {
//     try {
//       console.log("📖 Starting read operation...");
      
//       // Get specific document by ID
//       if (req.params.id) {
//         console.log("🔍 Fetching document with ID:", req.params.id);
        
//         const docRef = doc(db, "crud", req.params.id);
//         const docSnap = await getDoc(docRef);
        
//         if (!docSnap.exists()) {
//           return res.status(404).json({
//             success: false,
//             message: "Document not found"
//           });
//         }
        
//         const documentData = {
//           id: docSnap.id,
//           ...docSnap.data(),
//           createdAt: docSnap.data().createdAt?.toDate()?.toISOString() || null,
//           updatedAt: docSnap.data().updatedAt?.toDate()?.toISOString() || null
//         };
        
//         console.log("✅ Document fetched successfully");
//         return res.json({
//           success: true,
//           message: "Document retrieved successfully",
//           data: documentData
//         });
//       }
      
//       // Get all documents or filtered results
//       console.log("📋 Fetching documents from crud collection");
      
//       const crudRef = collection(db, "crud");
//       let queryRef = crudRef;
      
//       // Apply filters from query parameters
//       const status = req.query.status;
//       const limitParam = req.query.limit;
//       const orderByParam = req.query.orderBy || "createdAt";
//       const orderDirection = req.query.order || "desc";
      
//       // Build query with filters
//       if (status) {
//         queryRef = query(queryRef, where("status", "==", status));
//       }
      
//       // Add ordering
//       queryRef = query(queryRef, orderBy(orderByParam, orderDirection));
      
//       // Add limit if specified
//       if (limitParam && !isNaN(parseInt(limitParam))) {
//         queryRef = query(queryRef, limit(parseInt(limitParam)));
//       }
      
//       const querySnapshot = await getDocs(queryRef);
//       const documents = [];
      
//       querySnapshot.forEach((doc) => {
//         documents.push({
//           id: doc.id,
//           ...doc.data(),
//           createdAt: doc.data().createdAt?.toDate()?.toISOString() || null,
//           updatedAt: doc.data().updatedAt?.toDate()?.toISOString() || null
//         });
//       });
      
//       console.log(`✅ Retrieved ${documents.length} documents`);
      
//       return res.json({
//         success: true,
//         message: `Retrieved ${documents.length} documents`,
//         data: documents,
//         meta: {
//           count: documents.length,
//           filters: { status, limit: limitParam, orderBy: orderByParam, order: orderDirection }
//         }
//       });

//     } catch (error) {
//       console.error("❌ Error reading documents:", error);
      
//       let errorMessage = "Failed to retrieve documents";
//       let statusCode = 500;
      
//       if (error.code === 'permission-denied') {
//         errorMessage = "Permission denied. Check Firebase security rules.";
//         statusCode = 403;
//       } else if (error.code === 'unavailable') {
//         errorMessage = "Firebase service temporarily unavailable. Please try again.";
//         statusCode = 503;
//       }
      
//       return res.status(statusCode).json({
//         success: false,
//         message: errorMessage,
//         error: error.message,
//         errorCode: error.code || 'unknown'
//       });
//     }
//   }

//   // Handle POST requests (create new document)
//   if (method === "POST") {
//     try {
//       console.log("🚀 Starting document creation process...");
      
//       // Parse the request body
//       const requestData = req.body;
//       console.log("📋 Received data:", requestData);
      
//       const crudRef = collection(db, "crud");
//       console.log("📁 CRUD collection reference created");
      
//       // Prepare data for insertion
//       const dataToInsert = {
//         ...requestData,
//         createdAt: serverTimestamp(),
//         updatedAt: serverTimestamp(),
//         status: requestData.status || 'active',
//       };
      
//       console.log("💾 Data prepared for insertion:", dataToInsert);
      
//       // Insert document into Firestore
//       const docRef = await addDoc(crudRef, dataToInsert);
//       console.log("✅ Document created with ID:", docRef.id);
      
//       // Return success response
//       return res.status(201).json({
//         success: true,
//         message: "Document created successfully",
//         data: {
//           id: docRef.id,
//           ...dataToInsert,
//           createdAt: new Date().toISOString(),
//           updatedAt: new Date().toISOString()
//         }
//       });

//     } catch (error) {
//       console.error("❌ Error creating document:", error);
      
//       let errorMessage = "Failed to create document";
//       let statusCode = 500;
      
//       if (error.code === 'permission-denied') {
//         errorMessage = "Permission denied. Check Firebase security rules.";
//         statusCode = 403;
//       } else if (error.code === 'unavailable') {
//         errorMessage = "Firebase service temporarily unavailable. Please try again.";
//         statusCode = 503;
//       }
      
//       return res.status(statusCode).json({
//         success: false,
//         message: errorMessage,
//         error: error.message,
//         errorCode: error.code || 'unknown'
//       });
//     }
//   }

//   // Handle PUT/PATCH requests (update existing document)
//   if (method === "PUT" || method === "PATCH") {
//     try {
//       console.log("🔄 Starting document update process...");
      
//       const documentId = req.params.id;
//       if (!documentId) {
//         return res.status(400).json({
//           success: false,
//           message: "Document ID is required for updates"
//         });
//       }
      
//       const requestData = req.body;
//       console.log("📋 Received update data:", requestData);
      
//       // Check if document exists first
//       const docRef = doc(db, "crud", documentId);
//       const docSnap = await getDoc(docRef);
      
//       if (!docSnap.exists()) {
//         return res.status(404).json({
//           success: false,
//           message: "Document not found"
//         });
//       }
      
//       // Prepare data for update
//       const dataToUpdate = {
//         ...requestData,
//         updatedAt: serverTimestamp(),
//       };
      
//       // Remove fields that shouldn't be updated
//       delete dataToUpdate.createdAt;
//       delete dataToUpdate.id;
      
//       console.log("💾 Data prepared for update:", dataToUpdate);
      
//       // Update document in Firestore
//       await updateDoc(docRef, dataToUpdate);
//       console.log("✅ Document updated successfully");
      
//       return res.json({
//         success: true,
//         message: "Document updated successfully",
//         data: {
//           id: documentId,
//           ...dataToUpdate,
//           updatedAt: new Date().toISOString()
//         }
//       });

//     } catch (error) {
//       console.error("❌ Error updating document:", error);
      
//       let errorMessage = "Failed to update document";
//       let statusCode = 500;
      
//       if (error.code === 'permission-denied') {
//         errorMessage = "Permission denied. Check Firebase security rules.";
//         statusCode = 403;
//       } else if (error.code === 'not-found') {
//         errorMessage = "Document not found";
//         statusCode = 404;
//       } else if (error.code === 'unavailable') {
//         errorMessage = "Firebase service temporarily unavailable. Please try again.";
//         statusCode = 503;
//       }
      
//       return res.status(statusCode).json({
//         success: false,
//         message: errorMessage,
//         error: error.message,
//         errorCode: error.code || 'unknown'
//       });
//     }
//   }
 
//   // Handle DELETE requests (delete document)
//   if (method === "DELETE") {
//     try {
//       console.log("🗑️ Starting document deletion process...");
      
//       const documentId = req.params.id;
//       if (!documentId) {
//         return res.status(400).json({
//           success: false,
//           message: "Document ID is required for deletion"
//         });
//       }
      
//       // Check if document exists first
//       const docRef = doc(db, "crud", documentId);
//       const docSnap = await getDoc(docRef);
      
//       if (!docSnap.exists()) {
//         return res.status(404).json({
//           success: false,
//           message: "Document not found"
//         });
//       }
      
//       // Store document data before deletion for response
//       const documentData = {
//         id: docSnap.id,
//         ...docSnap.data()
//       };
      
//       console.log("🔍 Document found, proceeding with deletion");
      
//       // Delete document from Firestore
//       await deleteDoc(docRef);
//       console.log("✅ Document deleted successfully");
      
//       return res.json({
//         success: true,
//         message: "Document deleted successfully",
//         data: {
//           id: documentId,
//           deletedAt: new Date().toISOString(),
//           deletedDocument: documentData
//         }
//       });

//     } catch (error) {
//       console.error("❌ Error deleting document:", error);
      
//       let errorMessage = "Failed to delete document";
//       let statusCode = 500;
      
//       if (error.code === 'permission-denied') {
//         errorMessage = "Permission denied. Check Firebase security rules.";
//         statusCode = 403;
//       } else if (error.code === 'not-found') {
//         errorMessage = "Document not found";
//         statusCode = 404;
//       } else if (error.code === 'unavailable') {
//         errorMessage = "Firebase service temporarily unavailable. Please try again.";
//         statusCode = 503;
//       }
      
//       return res.status(statusCode).json({
//         success: false,
//         message: errorMessage,
//         error: error.message,
//         errorCode: error.code || 'unknown'
//       });
//     }
//   }

//   // Return error for unsupported methods
//   return res.status(405).json({
//     success: false,
//     message: "Method not allowed. Only GET, POST, PUT, PATCH, and DELETE requests are accepted."
//   });
// };

// module.exports = {
//   handleCrudRequest
// };


// crudFunctions.js
const { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} = require("firebase/firestore");
const { db } = require("./utils/firebase.js"); // Adjust path as needed

// Dynamic CRUD handler - handles all methods like Remix
const handleCrudOperations = async (req, res) => {
  const method = req.method;
  
  // Handle GET requests (read operations)
  if (method === "GET") {
    try {
      console.log("📖 Starting read operation...");
      
      // Get specific document by ID
      if (req.params.id) {
        console.log("🔍 Fetching document with ID:", req.params.id);
        
        const docRef = doc(db, "crud", req.params.id);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
          return res.status(404).json({
            success: false,
            message: "Document not found"
          });
        }
        
        const documentData = {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate()?.toISOString() || null,
          updatedAt: docSnap.data().updatedAt?.toDate()?.toISOString() || null
        };
        
        console.log("✅ Document fetched successfully");
        return res.json({
          success: true,
          message: "Document retrieved successfully",
          data: documentData
        });
      }
      
      // Get all documents or filtered results
      console.log("📋 Fetching documents from crud collection");
      
      const crudRef = collection(db, "crud");
      let queryRef = crudRef;
      
      // Apply filters from query parameters
      const status = req.query.status;
      const limitParam = req.query.limit;
      const orderByParam = req.query.orderBy || "createdAt";
      const orderDirection = req.query.order || "desc";
      
      // Build query with filters
      if (status) {
        queryRef = query(queryRef, where("status", "==", status));
      }
      
      // Add ordering
      queryRef = query(queryRef, orderBy(orderByParam, orderDirection));
      
      // Add limit if specified
      if (limitParam && !isNaN(parseInt(limitParam))) {
        queryRef = query(queryRef, limit(parseInt(limitParam)));
      }
      
      const querySnapshot = await getDocs(queryRef);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate()?.toISOString() || null,
          updatedAt: doc.data().updatedAt?.toDate()?.toISOString() || null
        });
      });
      
      console.log(`✅ Retrieved ${documents.length} documents`);
      
      return res.json({
        success: true,
        message: `Retrieved ${documents.length} documents`,
        data: documents,
        meta: {
          count: documents.length,
          filters: { status, limit: limitParam, orderBy: orderByParam, order: orderDirection }
        }
      });

    } catch (error) {
      console.error("❌ Error reading documents:", error);
      
      let errorMessage = "Failed to retrieve documents";
      let statusCode = 500;
      
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Check Firebase security rules.";
        statusCode = 403;
      } else if (error.code === 'unavailable') {
        errorMessage = "Firebase service temporarily unavailable. Please try again.";
        statusCode = 503;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: error.message,
        errorCode: error.code || 'unknown'
      });
    }
  }
  
  // Handle POST requests (create new document)
  if (method === "POST") {
    try {
      console.log("🚀 Starting document creation process...");
      
      // Parse the request body
      const requestData = req.body;
      console.log("📋 Received data:", requestData);
      
      const crudRef = collection(db, "crud");
      console.log("📁 CRUD collection reference created");
      
      // Prepare data for insertion
      const dataToInsert = {
        ...requestData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: requestData.status || 'active',
      };
      
      console.log("💾 Data prepared for insertion:", dataToInsert);
      
      // Insert document into Firestore
      const docRef = await addDoc(crudRef, dataToInsert);
      console.log("✅ Document created with ID:", docRef.id);
      
      // Return success response
      return res.status(201).json({
        success: true,
        message: "Document created successfully",
        data: {
          id: docRef.id,
          ...dataToInsert,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error("❌ Error creating document:", error);
      
      let errorMessage = "Failed to create document";
      let statusCode = 500;
      
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Check Firebase security rules.";
        statusCode = 403;
      } else if (error.code === 'unavailable') {
        errorMessage = "Firebase service temporarily unavailable. Please try again.";
        statusCode = 503;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: error.message,
        errorCode: error.code || 'unknown'
      });
    }
  }
  
  // Handle PUT/PATCH requests (update existing document)
  if (method === "PUT" || method === "PATCH") {
    try {
      console.log("🔄 Starting document update process...");
      
      const documentId = req.params.id;
      if (!documentId) {
        return res.status(400).json({
          success: false,
          message: "Document ID is required for updates"
        });
      }
      
      const requestData = req.body;
      console.log("📋 Received update data:", requestData);
      
      // Check if document exists first
      const docRef = doc(db, "crud", documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return res.status(404).json({
          success: false,
          message: "Document not found"
        });
      }
      
      // Prepare data for update
      const dataToUpdate = {
        ...requestData,
        updatedAt: serverTimestamp(),
      };
      
      // Remove fields that shouldn't be updated
      delete dataToUpdate.createdAt;
      delete dataToUpdate.id;
      
      console.log("💾 Data prepared for update:", dataToUpdate);
      
      // Update document in Firestore
      await updateDoc(docRef, dataToUpdate);
      console.log("✅ Document updated successfully");
      
      return res.json({
        success: true,
        message: "Document updated successfully",
        data: {
          id: documentId,
          ...dataToUpdate,
          updatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error("❌ Error updating document:", error);
      
      let errorMessage = "Failed to update document";
      let statusCode = 500;
      
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Check Firebase security rules.";
        statusCode = 403;
      } else if (error.code === 'not-found') {
        errorMessage = "Document not found";
        statusCode = 404;
      } else if (error.code === 'unavailable') {
        errorMessage = "Firebase service temporarily unavailable. Please try again.";
        statusCode = 503;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: error.message,
        errorCode: error.code || 'unknown'
      });
    }
  }
  
  // Handle DELETE requests (delete document)
  if (method === "DELETE") {
    try {
      console.log("🗑️ Starting document deletion process...");
      
      const documentId = req.params.id;
      if (!documentId) {
        return res.status(400).json({
          success: false,
          message: "Document ID is required for deletion"
        });
      }
      
      // Check if document exists first
      const docRef = doc(db, "crud", documentId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        return res.status(404).json({
          success: false,
          message: "Document not found"
        });
      }
      
      // Store document data before deletion for response
      const documentData = {
        id: docSnap.id,
        ...docSnap.data()
      };
      
      console.log("🔍 Document found, proceeding with deletion");
      
      // Delete document from Firestore
      await deleteDoc(docRef);
      console.log("✅ Document deleted successfully");
      
      return res.json({
        success: true,
        message: "Document deleted successfully",
        data: {
          id: documentId,
          deletedAt: new Date().toISOString(),
          deletedDocument: documentData
        }
      });

    } catch (error) {
      console.error("❌ Error deleting document:", error);
      
      let errorMessage = "Failed to delete document";
      let statusCode = 500;
      
      if (error.code === 'permission-denied') {
        errorMessage = "Permission denied. Check Firebase security rules.";
        statusCode = 403;
      } else if (error.code === 'not-found') {
        errorMessage = "Document not found";
        statusCode = 404;
      } else if (error.code === 'unavailable') {
        errorMessage = "Firebase service temporarily unavailable. Please try again.";
        statusCode = 503;
      }
      
      return res.status(statusCode).json({
        success: false,
        message: errorMessage,
        error: error.message,
        errorCode: error.code || 'unknown'
      });
    }
  }
  
  // Return error for unsupported methods
  return res.status(405).json({
    success: false,
    message: "Method not allowed. Only GET, POST, PUT, PATCH, and DELETE requests are accepted."
  });
};

module.exports = {
  handleCrudOperations
};