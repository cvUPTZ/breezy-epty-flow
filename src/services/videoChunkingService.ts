
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
  private static readonly CHUNK_SIZE = 40 * 1024 * 1024; // 40MB to stay well under 50MB limit

  /**
   * Split a video file into chunks
   */
  static splitVideoFile(file: File): Promise<{ chunks: Blob[], metadata: Omit<ChunkedVideoMetadata, 'chunks'> }> {
    return new Promise((resolve) => {
      const chunkSize = this.CHUNK_SIZE;
      const totalChunks = Math.ceil(file.size / chunkSize);
      const chunks: Blob[] = [];
      const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

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

  /**
   * Upload video chunks to storage
   */
  static async uploadVideoChunks(
    chunks: Blob[], 
    metadata: Omit<ChunkedVideoMetadata, 'chunks'>,
    onProgress?: (progress: number) => void
  ): Promise<ChunkedVideoMetadata> {
    const { supabase } = await import('@/integrations/supabase/client');
    const uploadedChunks: VideoChunk[] = [];
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const chunkFileName = `${metadata.id}_chunk_${i.toString().padStart(3, '0')}.part`;
      
      console.log(`Uploading chunk ${i + 1}/${chunks.length}: ${chunkFileName}`);

      const { data, error } = await supabase.storage
        .from('videos')
        .upload(chunkFileName, chunk, { 
          cacheControl: '3600', 
          upsert: false,
          contentType: 'application/octet-stream'
        });

      if (error) {
        console.error(`Failed to upload chunk ${i}:`, error);
        throw new Error(`Failed to upload chunk ${i + 1}: ${error.message}`);
      }

      uploadedChunks.push({
        id: `${metadata.id}_${i}`,
        chunkIndex: i,
        totalChunks: chunks.length,
        path: data.path,
        size: chunk.size
      });

      // Report progress
      if (onProgress) {
        const progress = ((i + 1) / chunks.length) * 100;
        onProgress(progress);
      }
    }

    return {
      ...metadata,
      chunks: uploadedChunks
    };
  }

  /**
   * Create a signed URL for the first chunk to use as video source
   * Instead of reassembling all chunks, we'll use signed URLs approach
   */
  static async getChunkedVideoUrl(metadata: ChunkedVideoMetadata): Promise<string> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    console.log(`Getting signed URL for chunked video: ${metadata.id}`);

    try {
      // For now, let's try to get a signed URL for the first chunk
      // This is a temporary solution - ideally we'd need a backend service to reassemble
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

      console.log('Successfully created signed URL for first chunk');
      return data.signedUrl;
      
    } catch (error: any) {
      console.error('Error getting chunked video URL:', error);
      throw new Error(`Failed to get chunked video URL: ${error.message}`);
    }
  }

  /**
   * Create a blob URL from video chunks for playback
   * This is kept as fallback but won't be used by default due to memory constraints
   */
  static async reassembleVideoFromChunks(metadata: ChunkedVideoMetadata): Promise<string> {
    const { supabase } = await import('@/integrations/supabase/client');
    const chunkBlobs: Blob[] = [];

    console.log(`Reassembling video from ${metadata.totalChunks} chunks`);

    try {
      // Download all chunks with better error handling
      for (const chunkInfo of metadata.chunks.sort((a, b) => a.chunkIndex - b.chunkIndex)) {
        console.log(`Downloading chunk ${chunkInfo.chunkIndex + 1}/${metadata.totalChunks}`);
        
        const { data, error } = await supabase.storage
          .from('videos')
          .download(chunkInfo.path);

        if (error) {
          console.error(`Failed to download chunk ${chunkInfo.chunkIndex}:`, error);
          throw new Error(`Failed to download chunk ${chunkInfo.chunkIndex}: ${error.message}`);
        }

        if (!data) {
          throw new Error(`No data received for chunk ${chunkInfo.chunkIndex}`);
        }

        chunkBlobs.push(data);
      }

      // Combine chunks into a single blob
      console.log('Combining chunks into single blob...');
      const combinedBlob = new Blob(chunkBlobs, { type: metadata.mimeType });
      
      // Create blob URL for video playback
      const blobUrl = URL.createObjectURL(combinedBlob);
      console.log('Successfully created blob URL for reassembled video');
      
      return blobUrl;
      
    } catch (error: any) {
      console.error('Error reassembling video from chunks:', error);
      throw new Error(`Failed to reassemble video: ${error.message}`);
    }
  }

  /**
   * Delete all chunks of a video
   */
  static async deleteVideoChunks(metadata: ChunkedVideoMetadata): Promise<void> {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const pathsToDelete = metadata.chunks.map(chunk => chunk.path);
    
    if (pathsToDelete.length > 0) {
      await supabase.storage.from('videos').remove(pathsToDelete);
    }
  }

  /**
   * Check if a file needs to be chunked
   */
  static needsChunking(file: File): boolean {
    return file.size > this.CHUNK_SIZE;
  }
}
