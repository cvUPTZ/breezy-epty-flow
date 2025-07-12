
// Player Tracking Web Worker for real-time processing
class PlayerTrackingWorker {
  constructor() {
    this.isProcessing = false;
    this.detectionModel = null;
    this.trackingHistory = new Map();
  }

  async initializeModel() {
    // In production, load actual ML model (YOLO, etc.)
    // For now, simulate model initialization
    return new Promise(resolve => {
      setTimeout(() => {
        this.detectionModel = { initialized: true };
        resolve();
      }, 1000);
    });
  }

  processFrame(imageData, timestamp, config) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    // Simulate player detection and tracking
    const players = this.detectPlayers(imageData, config);
    const trackedPlayers = this.trackPlayers(players, timestamp);

    self.postMessage({
      type: 'tracking_data',
      data: trackedPlayers
    });

    this.isProcessing = false;
  }

  detectPlayers(imageData, config) {
    // Simulate player detection
    const mockPlayers = [];
    const numPlayers = 4 + Math.floor(Math.random() * 8); // 4-12 players

    for (let i = 0; i < numPlayers; i++) {
      mockPlayers.push({
        id: `player_${i}`,
        bbox: {
          x: Math.random() * imageData.width * 0.8,
          y: Math.random() * imageData.height * 0.8,
          width: 40 + Math.random() * 20,
          height: 80 + Math.random() * 40
        },
        confidence: 0.6 + Math.random() * 0.4,
        team: Math.random() > 0.5 ? 'home' : 'away'
      });
    }

    return mockPlayers;
  }

  trackPlayers(detections, timestamp) {
    const trackedPlayers = [];

    detections.forEach((detection, index) => {
      const playerId = `player_${index}`;
      const position = {
        x: detection.bbox.x + detection.bbox.width / 2,
        y: detection.bbox.y + detection.bbox.height / 2
      };

      // Calculate velocity from previous position
      let velocity = { x: 0, y: 0 };
      let speed = 0;

      if (this.trackingHistory.has(playerId)) {
        const prevData = this.trackingHistory.get(playerId);
        const timeDiff = timestamp - prevData.timestamp;
        
        if (timeDiff > 0) {
          velocity.x = (position.x - prevData.position.x) / timeDiff;
          velocity.y = (position.y - prevData.position.y) / timeDiff;
          speed = Math.sqrt(velocity.x ** 2 + velocity.y ** 2);
        }
      }

      // Update tracking history
      this.trackingHistory.set(playerId, {
        position,
        timestamp,
        velocity,
        speed
      });

      trackedPlayers.push({
        playerId,
        position,
        velocity,
        speed,
        team: detection.team,
        jerseyNumber: (index % 11) + 1,
        confidence: detection.confidence,
        timestamp
      });
    });

    return trackedPlayers;
  }
}

const worker = new PlayerTrackingWorker();

self.onmessage = async function(event) {
  const { type, imageData, timestamp, config } = event.data;

  switch (type) {
    case 'init':
      await worker.initializeModel();
      self.postMessage({ type: 'initialized' });
      break;
      
    case 'process_frame':
      worker.processFrame(imageData, timestamp, config);
      break;
      
    default:
      console.warn('Unknown message type:', type);
  }
};
