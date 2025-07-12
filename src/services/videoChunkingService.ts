
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
   * Create a blob URL from video chunks for playback
   */
  static async reassembleVideoFromChunks(metadata: ChunkedVideoMetadata): Promise<string> {
    const { supabase } = await import('@/integrations/supabase/client');
    const chunkBlobs: Blob[] = [];

    console.log(`Reassembling video from ${metadata.totalChunks} chunks`);

    // Download all chunks
    for (const chunkInfo of metadata.chunks.sort((a, b) => a.chunkIndex - b.chunkIndex)) {
      const { data, error } = await supabase.storage
        .from('videos')
        .download(chunkInfo.path);

      if (error) {
        throw new Error(`Failed to download chunk ${chunkInfo.chunkIndex}: ${error.message}`);
      }

      chunkBlobs.push(data);
    }

    // Combine chunks into a single blob
    const combinedBlob = new Blob(chunkBlobs, { type: metadata.mimeType });
    
    // Create blob URL for video playback
    return URL.createObjectURL(combinedBlob);
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
