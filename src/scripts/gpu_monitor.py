#!/usr/bin/env python3
"""
GPU Monitor Client for RTX 4060 Detection Service
Runs on your PC and sends real GPU metrics to the inference management system.

Usage:
    python gpu_monitor.py --api-key YOUR_API_KEY_HERE
    python gpu_monitor.py --api-key YOUR_API_KEY_HERE --test
    python gpu_monitor.py --api-key YOUR_API_KEY_HERE --interval 10
"""

import argparse
import json
import time
import uuid
import logging
import requests
import platform
import subprocess
import sys
from datetime import datetime
from typing import Dict, Any, Optional, List

# Try to import GPU monitoring libraries
try:
    import pynvml
    HAS_PYNVML = True
except ImportError:
    HAS_PYNVML = False

try:
    import GPUtil
    HAS_GPUTIL = True
except ImportError:
    HAS_GPUTIL = False

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('gpu_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class GPUMonitor:
    def __init__(self, api_key: str, server_url: str = "http://localhost:3000", node_id: Optional[str] = None):
        self.api_key = api_key
        self.server_url = server_url.rstrip('/')
        self.node_id = node_id or str(uuid.uuid4())
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json',
            'X-Node-ID': self.node_id
        })
        
        # Initialize GPU monitoring
        self.gpu_lib = self._detect_gpu_library()
        self._initialize_gpu_monitoring()
        
        logger.info(f"GPU Monitor initialized with {self.gpu_lib} library")
        logger.info(f"Node ID: {self.node_id}")

    def _detect_gpu_library(self) -> str:
        """Auto-detect the best available GPU monitoring library"""
        if HAS_PYNVML:
            return "pynvml"
        elif HAS_GPUTIL:
            return "gputil"
        elif self._has_nvidia_smi():
            return "nvidia-smi"
        else:
            logger.warning("No GPU monitoring library found, using fallback mode")
            return "fallback"

    def _has_nvidia_smi(self) -> bool:
        """Check if nvidia-smi is available"""
        try:
            subprocess.run(['nvidia-smi', '--version'], 
                          capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    def _initialize_gpu_monitoring(self):
        """Initialize the selected GPU monitoring library"""
        if self.gpu_lib == "pynvml":
            try:
                pynvml.nvmlInit()
                self.device_count = pynvml.nvmlDeviceGetCount()
                logger.info(f"Initialized pynvml with {self.device_count} GPU(s)")
            except Exception as e:
                logger.error(f"Failed to initialize pynvml: {e}")
                self.gpu_lib = "fallback"
        
        elif self.gpu_lib == "gputil":
            try:
                GPUtil.getGPUs()  # Test if it works
                logger.info("Initialized GPUtil successfully")
            except Exception as e:
                logger.error(f"Failed to initialize GPUtil: {e}")
                self.gpu_lib = "fallback"

    def get_gpu_metrics(self) -> Dict[str, Any]:
        """Get current GPU metrics using the best available method"""
        try:
            if self.gpu_lib == "pynvml":
                return self._get_metrics_pynvml()
            elif self.gpu_lib == "gputil":
                return self._get_metrics_gputil()
            elif self.gpu_lib == "nvidia-smi":
                return self._get_metrics_nvidia_smi()
            else:
                return self._get_metrics_fallback()
        except Exception as e:
            logger.error(f"Error getting GPU metrics: {e}")
            return self._get_metrics_fallback()

    def _get_metrics_pynvml(self) -> Dict[str, Any]:
        """Get metrics using pynvml (most accurate)"""
        handle = pynvml.nvmlDeviceGetHandleByIndex(0)  # Use first GPU
        
        # Get utilization
        util = pynvml.nvmlDeviceGetUtilizationRates(handle)
        
        # Get memory info
        mem_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
        
        # Get temperature
        temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
        
        # Get power draw
        try:
            power = pynvml.nvmlDeviceGetPowerUsage(handle) / 1000.0  # Convert mW to W
        except:
            power = 0
        
        # Get clock speeds
        try:
            gpu_clock = pynvml.nvmlDeviceGetClockInfo(handle, pynvml.NVML_CLOCK_GRAPHICS)
            mem_clock = pynvml.nvmlDeviceGetClockInfo(handle, pynvml.NVML_CLOCK_MEM)
        except:
            gpu_clock = mem_clock = 0

        # Get GPU name and info
        name = pynvml.nvmlDeviceGetName(handle).decode('utf-8')
        
        return {
            'utilization': util.gpu,
            'memoryUsed': mem_info.used // 1024 // 1024,  # Convert to MB
            'memoryTotal': mem_info.total // 1024 // 1024,  # Convert to MB
            'temperature': temp,
            'powerDraw': power,
            'clockSpeed': gpu_clock,
            'memoryClockSpeed': mem_clock,
            'gpuName': name,
            'library': 'pynvml'
        }

    def _get_metrics_gputil(self) -> Dict[str, Any]:
        """Get metrics using GPUtil"""
        gpus = GPUtil.getGPUs()
        if not gpus:
            return self._get_metrics_fallback()
        
        gpu = gpus[0]  # Use first GPU
        return {
            'utilization': gpu.load * 100,
            'memoryUsed': gpu.memoryUtil * gpu.memoryTotal,
            'memoryTotal': gpu.memoryTotal,
            'temperature': gpu.temperature,
            'powerDraw': 0,  # GPUtil doesn't provide power info
            'clockSpeed': 0,  # GPUtil doesn't provide clock info
            'memoryClockSpeed': 0,
            'gpuName': gpu.name,
            'library': 'gputil'
        }

    def _get_metrics_nvidia_smi(self) -> Dict[str, Any]:
        """Get metrics using nvidia-smi command"""
        try:
            cmd = [
                'nvidia-smi',
                '--query-gpu=name,utilization.gpu,memory.used,memory.total,temperature.gpu,power.draw,clocks.gr,clocks.mem',
                '--format=csv,noheader,nounits'
            ]
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            values = result.stdout.strip().split(', ')
            
            return {
                'utilization': float(values[1]),
                'memoryUsed': float(values[2]),
                'memoryTotal': float(values[3]),
                'temperature': float(values[4]),
                'powerDraw': float(values[5]) if values[5] != '[N/A]' else 0,
                'clockSpeed': float(values[6]) if values[6] != '[N/A]' else 0,
                'memoryClockSpeed': float(values[7]) if values[7] != '[N/A]' else 0,
                'gpuName': values[0],
                'library': 'nvidia-smi'
            }
        except Exception as e:
            logger.error(f"nvidia-smi failed: {e}")
            return self._get_metrics_fallback()

    def _get_metrics_fallback(self) -> Dict[str, Any]:
        """Fallback metrics for testing without GPU"""
        import random
        return {
            'utilization': random.uniform(20, 80),
            'memoryUsed': random.uniform(2000, 6000),
            'memoryTotal': 8192,  # 8GB for RTX 4060
            'temperature': random.uniform(45, 75),
            'powerDraw': random.uniform(80, 120),
            'clockSpeed': random.uniform(1500, 2500),
            'memoryClockSpeed': 8001,
            'gpuName': 'RTX 4060 (Simulated)',
            'library': 'fallback'
        }

    def get_system_info(self) -> Dict[str, Any]:
        """Get system information"""
        return {
            'platform': platform.platform(),
            'python_version': platform.python_version(),
            'hostname': platform.node(),
            'cpu_count': platform.machine(),
            'gpu_library': self.gpu_lib,
            'timestamp': datetime.now().isoformat()
        }

    def register_node(self) -> bool:
        """Register this node with the server"""
        try:
            system_info = self.get_system_info()
            gpu_metrics = self.get_gpu_metrics()
            
            payload = {
                'nodeId': self.node_id,
                'capabilities': ['yolo', 'detection', 'tracking', 'gpu-acceleration'],
                'systemInfo': system_info,
                'initialMetrics': gpu_metrics,
                'status': 'online'
            }
            
            response = self.session.post(f'{self.server_url}/api/node/register', json=payload)
            
            if response.status_code == 200:
                logger.info("Node registered successfully")
                return True
            else:
                logger.error(f"Failed to register node: {response.status_code} - {response.text}")
                return False
                
        except Exception as e:
            logger.error(f"Registration failed: {e}")
            return False

    def send_heartbeat(self) -> bool:
        """Send heartbeat with current metrics"""
        try:
            metrics = self.get_gpu_metrics()
            payload = {
                'timestamp': datetime.now().isoformat(),
                'status': 'alive',
                'metrics': metrics,
                'activeJobs': 0,  # TODO: Track active jobs
                'uptime': time.time()  # Simple uptime tracking
            }
            
            response = self.session.post(f'{self.server_url}/api/heartbeat', json=payload)
            
            if response.status_code == 200:
                logger.debug("Heartbeat sent successfully")
                return True
            else:
                logger.warning(f"Heartbeat failed: {response.status_code}")
                return False
                
        except Exception as e:
            logger.error(f"Heartbeat error: {e}")
            return False

    def test_connection(self) -> bool:
        """Test connection to server"""
        try:
            response = self.session.get(f'{self.server_url}/api/health')
            if response.status_code == 200:
                logger.info("✅ Connection test successful")
                logger.info(f"Server response: {response.json()}")
                return True
            else:
                logger.error(f"❌ Connection test failed: {response.status_code}")
                return False
        except Exception as e:
            logger.error(f"❌ Connection test error: {e}")
            return False

    def run_monitor(self, interval: int = 30):
        """Run the monitoring loop"""
        logger.info(f"Starting GPU monitor with {interval}s interval...")
        
        # Register node
        if not self.register_node():
            logger.error("Failed to register node, continuing anyway...")
        
        failure_count = 0
        max_failures = 5
        
        try:
            while True:
                success = self.send_heartbeat()
                
                if success:
                    failure_count = 0
                    metrics = self.get_gpu_metrics()
                    logger.info(f"📊 GPU: {metrics['utilization']:.1f}% | "
                              f"Mem: {metrics['memoryUsed']:.0f}/{metrics['memoryTotal']:.0f}MB | "
                              f"Temp: {metrics['temperature']:.0f}°C | "
                              f"Power: {metrics['powerDraw']:.1f}W")
                else:
                    failure_count += 1
                    logger.warning(f"Heartbeat failed ({failure_count}/{max_failures})")
                    
                    if failure_count >= max_failures:
                        logger.error("Too many consecutive failures, exiting...")
                        break
                
                time.sleep(interval)
                
        except KeyboardInterrupt:
            logger.info("Monitoring stopped by user")
        except Exception as e:
            logger.error(f"Monitor error: {e}")
        finally:
            logger.info("GPU monitor stopped")

def install_dependencies():
    """Install required dependencies"""
    packages = ['pynvml', 'GPUtil', 'requests']
    
    for package in packages:
        try:
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
            print(f"✅ Installed {package}")
        except subprocess.CalledProcessError:
            print(f"❌ Failed to install {package}")

def main():
    parser = argparse.ArgumentParser(description='GPU Monitor Client for RTX 4060')
    parser.add_argument('--api-key', required=True, help='Your PC node API key')
    parser.add_argument('--server-url', default='http://localhost:3000', help='Server URL')
    parser.add_argument('--node-id', help='Custom node ID (auto-generated if not provided)')
    parser.add_argument('--interval', type=int, default=30, help='Heartbeat interval in seconds')
    parser.add_argument('--test', action='store_true', help='Run single test and exit')
    parser.add_argument('--install-deps', action='store_true', help='Install required dependencies')
    
    args = parser.parse_args()
    
    if args.install_deps:
        install_dependencies()
        return
    
    # Create monitor instance
    monitor = GPUMonitor(args.api_key, args.server_url, args.node_id)
    
    if args.test:
        # Test mode
        print("🔧 Testing GPU monitoring...")
        metrics = monitor.get_gpu_metrics()
        print(f"📊 GPU Metrics: {json.dumps(metrics, indent=2)}")
        
        print("\n🔧 Testing server connection...")
        success = monitor.test_connection()
        
        print(f"\n{'✅ All tests passed!' if success else '❌ Some tests failed'}")
        return
    
    # Run continuous monitoring
    monitor.run_monitor(args.interval)

if __name__ == '__main__':
    main()