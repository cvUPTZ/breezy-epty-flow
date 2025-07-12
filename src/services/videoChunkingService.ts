
export interface VideoChunk {
  id: string;
  chunkIndex: number;
  totalChunks: number;
  path: string;
  size: number;
}

export interface ChunkedVideoMetadata {
  id: string;
  originalFileName: string;
  totalSize: number;
  totalChunks: number;
  chunks: VideoChunk[];
  mimeType: string;
}

export class VideoChunkingService {
  private static readonly CHUNK_SIZE = 35 * 1024 * 1024; // Reduced to 35MB for better reliability
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY = 2000; // 2 seconds

  static splitVideoFile(file: File): Promise<{ chunks: Blob[], metadata: Omit<ChunkedVideoMetadata, 'chunks'> }> {
    return new Promise((resolve) => {
      const chunkSize = this.CHUNK_SIZE;
      const totalChunks = Math.ceil(file.size / chunkSize);
      const chunks: Blob[] = [];
      const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      console.log(`Splitting ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB) into ${totalChunks} chunks`);

      for (let i = 0; i < totalChunks; i++) {
        const start = i * chunkSize;
        const end = Math.min(start + chunkSize, file.size);
        const chunk = file.slice(start, end);
        chunks.push(chunk);
      }

      const metadata = {
        id: videoId,
        originalFileName: file.name,
        totalSize: file.size,
        totalChunks,
        mimeType: file.type
      };

      resolve({ chunks, metadata });
    });
  }

  private static async uploadChunkWithRetry(
    chunkBlob: Blob,
    chunkFileName: string,
    chunkIndex: number,
    totalChunks: number
  ): Promise<{ path: string; size: number }> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        console.log(`Uploading chunk ${chunkIndex + 1}/${totalChunks} (attempt ${attempt}/${this.MAX_RETRIES}): ${(chunkBlob.size / 1024 / 1024).toFixed(1)}MB`);

        const { data, error } = await supabase.storage
          .from('videos')
          .upload(chunkFileName, chunkBlob, { 
            cacheControl: '3600', 
            upsert: false,
            contentType: 'application/octet-stream'
          });

        if (error) {
          throw new Error(`Upload error: ${error.message}`);
        }

        if (!data?.path) {
          throw new Error('No upload path returned');
        }

        console.log(`✅ Chunk ${chunkIndex + 1}/${totalChunks} uploaded successfully`);
        return { path: data.path, size: chunkBlob.size };

      } catch (error: any) {
        console.error(`❌ Chunk ${chunkIndex + 1} upload attempt ${attempt} failed:`, error.message);
        
        if (attempt === this.MAX_RETRIES) {
          throw new Error(`Failed to upload chunk ${chunkIndex + 1} after ${this.MAX_RETRIES} attempts: ${error.message}`);
        }
        
        // Wait before retrying with exponential backoff
        const delay = this.RETRY_DELAY * Math.pow(2, attempt - 1);
        console.log(`Retrying chunk ${chunkIndex + 1} in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error(`Failed to upload chunk ${chunkIndex + 1}`);
  }

  static async uploadVideoChunks(
    chunks: Blob[], 
    metadata: Omit<ChunkedVideoMetadata, 'chunks'>,
    onProgress?: (progress: number) => void
  ): Promise<ChunkedVideoMetadata> {
    const uploadedChunks: VideoChunk[] = [];
    
    console.log(`🚀 Starting chunked upload: ${chunks.length} chunks for ${metadata.originalFileName}`);
    
    try {
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const chunkFileName = `${metadata.id}_chunk_${i.toString().padStart(3, '0')}.part`;
        
        // Upload chunk with retry logic
        const { path, size } = await this.uploadChunkWithRetry(chunk, chunkFileName, i, chunks.length);
        
        uploadedChunks.push({
          id: `${metadata.id}_${i}`,
          chunkIndex: i,
          totalChunks: chunks.length,
          path,
          size
        });

        // Report progress
        const progress = ((i + 1) / chunks.length) * 100;
        console.log(`📊 Progress: ${progress.toFixed(1)}% (${i + 1}/${chunks.length} chunks)`);
        onProgress?.(progress);

        // Small delay between uploads to prevent overwhelming
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200));
        }
      }

      console.log(`✅ All ${chunks.length} chunks uploaded successfully!`);
      
      return {
        ...metadata,
        chunks: uploadedChunks
      };

    } catch (error: any) {
      console.error(`💥 Chunked upload failed:`, error);
      
      // Cleanup uploaded chunks on failure
      if (uploadedChunks.length > 0) {
        console.log(`🧹 Cleaning up ${uploadedChunks.length} uploaded chunks...`);
        try {
          const { supabase } = await import('@/integrations/supabase/client');
          const pathsToDelete = uploadedChunks.map(chunk => chunk.path);
          await supabase.storage.from('videos').remove(pathsToDelete);
          console.log('✅ Cleanup completed');
        } catch (cleanupError) {
          console.warn('⚠️ Cleanup failed:', cleanupError);
        }
      }
      
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  static async getChunkedVideoUrl(metadata: ChunkedVideoMetadata): Promise<string> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    try {
      const firstChunk = metadata.chunks.find(chunk => chunk.chunkIndex === 0);
      
      if (!firstChunk) {
        throw new Error('No chunks found in metadata');
      }

      const { data, error } = await supabase.storage
        .from('videos')
        .createSignedUrl(firstChunk.path, 3600);

      if (error) {
        throw new Error(`Failed to create signed URL: ${error.message}`);
      }

      return data.signedUrl;
      
    } catch (error: any) {
      console.error('Error getting chunked video URL:', error);
      throw new Error(`Failed to get chunked video URL: ${error.message}`);
    }
  }

  static async reassembleVideoFromChunks(metadata: ChunkedVideoMetadata): Promise<string> {
    const { supabase } = await import('@/integrations/supabase/client');
    const chunkBlobs: Blob[] = [];

    console.log(`🔄 Reassembling video from ${metadata.totalChunks} chunks`);

    try {
      for (const chunkInfo of metadata.chunks.sort((a, b) => a.chunkIndex - b.chunkIndex)) {
        console.log(`⬇️ Downloading chunk ${chunkInfo.chunkIndex + 1}/${metadata.totalChunks}`);
        
        const { data, error } = await supabase.storage
          .from('videos')
          .download(chunkInfo.path);

        if (error) {
          throw new Error(`Failed to download chunk ${chunkInfo.chunkIndex}: ${error.message}`);
        }

        if (!data) {
          throw new Error(`No data received for chunk ${chunkInfo.chunkIndex}`);
        }

        chunkBlobs.push(data);
      }

      console.log('🔧 Combining chunks into single blob...');
      const combinedBlob = new Blob(chunkBlobs, { type: metadata.mimeType });
      
      const blobUrl = URL.createObjectURL(combinedBlob);
      console.log('✅ Video reassembly completed');
      
      return blobUrl;
      
    } catch (error: any) {
      console.error('Error reassembling video from chunks:', error);
      throw new Error(`Failed to reassemble video: ${error.message}`);
    }
  }

  static async deleteVideoChunks(metadata: ChunkedVideoMetadata): Promise<void> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const pathsToDelete = metadata.chunks.map(chunk => chunk.path);
    
    if (pathsToDelete.length > 0) {
      console.log(`🗑️ Deleting ${pathsToDelete.length} video chunks`);
      const { error } = await supabase.storage.from('videos').remove(pathsToDelete);
      if (error) {
        console.error('Error deleting video chunks:', error);
        throw new Error(`Failed to delete video chunks: ${error.message}`);
      }
    }
  }

  static needsChunking(file: File): boolean {
    const needsChunking = file.size > this.CHUNK_SIZE;
    console.log(`File: ${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB) needs chunking: ${needsChunking}`);
    return needsChunking;
  }
}
