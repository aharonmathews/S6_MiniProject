// src/ipfs.js
import { create } from 'ipfs-http-client';

// Connect to local IPFS node
const ipfs = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http',
});

const ipfsService = {
  add: async (content) => {
    try {
      // For string content, ensure it's properly encoded
      const contentToAdd = typeof content === 'string' 
        ? new TextEncoder().encode(content) 
        : content;
        
      const result = await ipfs.add(contentToAdd);
      return result; // This object has a 'path' property with the CID
    } catch (error) {
      console.error("IPFS upload error:", error);
      throw error;
    }
  },
  
  uploadFile: async (file) => {
    try {
      const result = await ipfs.add(file);
      return result.path; // CID
    } catch (error) {
      console.error("IPFS upload error:", error);
      throw error;
    }
  },

  fetchFile: async (cid) => {
    try {
      const chunks = [];
      for await (const chunk of ipfs.cat(cid)) {
        chunks.push(chunk);
      }

      const content = new TextDecoder().decode(
        new Uint8Array(chunks.flatMap((chunk) => Array.from(chunk)))
      );

      return content;
    } catch (error) {
      console.error("IPFS fetch error:", error);
      throw error;
    }
  },
};

export default ipfsService;