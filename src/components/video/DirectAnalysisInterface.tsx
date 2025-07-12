// src/components/video/DirectAnalysisInterface.tsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ReactSketchCanvasRef } from 'react-sketch-canvas';
import { EnhancedVideoPlayer, VideoPlayerRef } from './EnhancedVideoPlayer';
import { AnnotationToolbox } from './analysis/AnnotationToolbox';
import { CameraMovementEstimator } from './analysis/CameraMovementEstimator';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Download, Settings as SettingsIcon, XSquare, Camera } from 'lucide-react';
import { EventTypeManager, LocalEventType as EventTypeDefinition, PropertyDefinition } from './analysis/EventTypeManager';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// New Annotation Interfaces
interface BaseAnnotation {
  id: string;
  type: 'freehand' | 'rectangle' | 'circle' | 'line' | 'arrow' | 'text';
  color: string;
  strokeWidth?: number;
}

interface FreehandAnnotation extends BaseAnnotation {
  type: 'freehand';
  paths: Array<{ x: number; y: number }>; // Compatible with react-sketch-canvas Point
}

interface ShapeAnnotation extends BaseAnnotation {
  type: 'rectangle' | 'circle' | 'line' | 'arrow';
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  endX?: number;
  endY?: number;
  fillColor?: string;
}

interface TextAnnotation extends BaseAnnotation {
  type: 'text';
  x: number;
  y: number;
  text: string;
  fontFamily?: string;
  fontSize?: number;
}

type AnnotationObject = FreehandAnnotation | ShapeAnnotation | TextAnnotation;

// Updated LocalTaggedEvent Interface
export interface LocalTaggedEvent {
  id: string;
  timestamp: number;
  typeId: string; 
  typeName: string; 
  notes?: string;
  annotations?: AnnotationObject[] | null; // Updated field
  customPropertyValues?: {
    [propertyDefinitionId: string]: string | number | boolean | null;
  };
}

interface CameraMovement {
  timestamp: number;
  x: number;
  y: number;
  z: number;
  confidence: number;
  movementType: 'pan' | 'tilt' | 'zoom' | 'static';
}

interface DirectAnalysisInterfaceProps {
  videoUrl: string;
}

export const DirectAnalysisInterface: React.FC<DirectAnalysisInterfaceProps> = ({ videoUrl }) => {
  const videoPlayerRef = useRef<VideoPlayerRef>(null);
  const canvasRef = useRef<ReactSketchCanvasRef>(null);

  const [videoDimensions, setVideoDimensions] = useState({ width: 0, height: 0 });
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const [taggedEvents, setTaggedEvents] = useState<LocalTaggedEvent[]>([]);
  const [selectedEventForAnnotation, setSelectedEventForAnnotation] = useState<LocalTaggedEvent | null>(null);

  // Camera movement state
  const [cameraMovements, setCameraMovements] = useState<CameraMovement[]>([]);
  const [isCameraAnalysisEnabled, setIsCameraAnalysisEnabled] = useState(false);
  const [showCameraMovementPanel, setShowCameraMovementPanel] = useState(false);

  // State for Event Type Definitions
  const [eventTypeDefs, setEventTypeDefinitions] = useState<EventTypeDefinition[]>([]);
  const [showEventTypeManager, setShowEventTypeManager] = useState(false);
  const [selectedEventTypeIdForTagging, setSelectedEventTypeIdForTagging] = useState<string>('');
  const [currentCustomPropValues, setCurrentCustomPropValues] = useState<{ [propId: string]: string | number | boolean | null }>({});

  // Filter State
  const [filterEventTypeId, setFilterEventTypeId] = useState<string>('');
  const [filterPropertyId, setFilterPropertyId] = useState<string>('');
  const [filterPropertyValue, setFilterPropertyValue] = useState<string>('');
  const [availableFilterProperties, setAvailableFilterProperties] = useState<PropertyDefinition[]>([]);
  const [activeFiltersDescription, setActiveFiltersDescription] = useState<string | null>(null);

  const formatTime = (seconds: number | null | undefined): string => {
    if (seconds === null || seconds === undefined || isNaN(seconds) || seconds < 0) return '00:00';
    const totalSeconds = Math.floor(seconds);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Convert YouTube URL to direct video URL if possible
  const getDirectVideoUrl = useCallback((url: string): string => {
    try {
      const urlObj = new URL(url);
      
      // Handle YouTube URLs
      if (urlObj.hostname.includes('youtube.com') || urlObj.hostname.includes('youtu.be')) {
        // For now, return the original URL - we'll need a backend service to get direct URLs
        toast.info('YouTube videos require special handling. Consider using direct video URLs for better compatibility.');
        return url;
      }
      
      return url;
    } catch (error) {
      return url;
    }
  }, []);

  const processedVideoUrl = useMemo(() => getDirectVideoUrl(videoUrl), [videoUrl, getDirectVideoUrl]);

  useEffect(() => {
    // Reset state when video URL changes
    setTaggedEvents([]);
    setSelectedEventForAnnotation(null);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setCameraMovements([]);
    setIsCameraAnalysisEnabled(false);
    if (canvasRef.current) canvasRef.current.resetCanvas();
    setFilterEventTypeId('');
    setFilterPropertyId('');
    setFilterPropertyValue('');
    setActiveFiltersDescription(null);
  }, [videoUrl]);

  const handleVideoLoadedMetadata = useCallback(() => {
    if (videoPlayerRef.current) {
      const videoDuration = videoPlayerRef.current.getDuration();
      setDuration(videoDuration);
      // Set dimensions based on a standard video aspect ratio
      setVideoDimensions({
        width: 1280,
        height: 720,
      });
    }
  }, []);

  const handlePlayPause = useCallback(() => {
    if (videoPlayerRef.current) {
      if (isPlaying) {
        videoPlayerRef.current.pause();
      } else {
        videoPlayerRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback((time: number) => {
    setCurrentTime(time);
  }, []);

  const handleCameraMovementDetected = useCallback((movement: CameraMovement) => {
    setCameraMovements(prev => [...prev.slice(-100), movement]); // Keep last 100 movements
    
    // Optionally auto-tag significant camera movements
    if (movement.confidence > 0.8 && movement.movementType !== 'static') {
      console.log(`Significant ${movement.movementType} detected at ${formatTime(movement.timestamp)}`);
    }
  }, []);

  const handleSaveAnnotationToEvent = useCallback(async (newAnnotations: AnnotationObject[]) => {
    if (selectedEventForAnnotation) {
      setTaggedEvents(prevEvents =>
        prevEvents.map(event =>
          event.id === selectedEventForAnnotation.id
            ? { ...event, annotations: newAnnotations } 
            : event
        )
      );
      setSelectedEventForAnnotation(prev => prev ? {...prev, annotations: newAnnotations} : null);
      toast.success(`Annotations saved for event "${selectedEventForAnnotation.typeName}" at ${formatTime(selectedEventForAnnotation.timestamp)}`);
    } else {
      toast.info("No event selected to save annotations to. Click an event to select it for annotation.");
    }
  }, [selectedEventForAnnotation]);

  const handleAddEventTypeDefinition = (newTypeData: { name: string; color?: string }) => {
    const newEventType: EventTypeDefinition = { id: crypto.randomUUID(), name: newTypeData.name, color: newTypeData.color, properties: [] };
    setEventTypeDefinitions(prev => [...prev, newEventType]);
    toast.success(`Event type "${newEventType.name}" created.`);
  };

  const handleDeleteEventTypeDefinition = (typeIdToDelete: string) => {
    const typeToDelete = eventTypeDefs.find(et => et.id === typeIdToDelete);
    if (window.confirm(`Are you sure you want to delete event type "${typeToDelete?.name}"? This will also remove associated tags and active filters if this type was used.`)) {
        setEventTypeDefinitions(prev => prev.filter(et => et.id !== typeIdToDelete));
        setTaggedEvents(prevTagged => prevTagged.filter(te => te.typeId !== typeIdToDelete));
        if (selectedEventTypeIdForTagging === typeIdToDelete) setSelectedEventTypeIdForTagging('');
        if (filterEventTypeId === typeIdToDelete) handleClearFilter();
        toast.info(`Event type "${typeToDelete?.name}" and its tags deleted.`);
    }
  };
  
  const handleUpdateEventTypeDefinition = (updatedType: EventTypeDefinition) => {
    setEventTypeDefinitions(prev => prev.map(et => et.id === updatedType.id ? updatedType : et));
    if (filterEventTypeId === updatedType.id && activeFiltersDescription) {
        const propName = availableFilterProperties.find(p => p.id === filterPropertyId)?.name || 'Unknown Property';
        setActiveFiltersDescription(`Type: ${updatedType.name}, ${propName} = "${filterPropertyValue}"`);
    }
    toast.info(`Event type "${updatedType.name}" updated.`);
  };
  
  useEffect(() => {
    if (!selectedEventTypeIdForTagging) {
      setCurrentCustomPropValues({});
      return;
    }
    const eventType = eventTypeDefs.find(et => et.id === selectedEventTypeIdForTagging);
    if (eventType && eventType.properties.length > 0) {
      const initialValues: { [propId: string]: string | number | boolean | null } = {};
      eventType.properties.forEach(prop => {
        initialValues[prop.id] = prop.defaultValue !== undefined ? prop.defaultValue :
                                  prop.dataType === 'boolean' ? false :
                                  prop.dataType === 'number' ? 0 : '';
      });
      setCurrentCustomPropValues(initialValues);
    } else {
      setCurrentCustomPropValues({});
    }
  }, [selectedEventTypeIdForTagging, eventTypeDefs]);

  const handleCustomPropValueChange = (propId: string, value: string | number | boolean | null) => {
    setCurrentCustomPropValues(prev => ({ ...prev, [propId]: value }));
  };

  const handleAddTaggedEvent = () => {
    if (!selectedEventTypeIdForTagging) { toast.error("Please select an event type."); return; }
    if (!videoPlayerRef.current) return;
    const eventType = eventTypeDefs.find(et => et.id === selectedEventTypeIdForTagging);
    if (!eventType) { toast.error("Selected event type not found."); return; }

    const timestamp = videoPlayerRef.current.getCurrentTime();
    const newEvent: LocalTaggedEvent = {
      id: crypto.randomUUID(), timestamp, typeId: eventType.id, typeName: eventType.name,
      notes: '', annotations: null, customPropertyValues: { ...currentCustomPropValues }, // Initialize annotations as null
    };
    setTaggedEvents(prev => [...prev, newEvent].sort((a,b) => a.timestamp - b.timestamp));
    setSelectedEventForAnnotation(newEvent); 
    toast.success(`Event "${eventType.name}" tagged at ${formatTime(timestamp)}. Selected for annotation.`);
    
    if (eventType.properties.length > 0) {
      const initialValues: { [propId: string]: string | number | boolean | null } = {};
      eventType.properties.forEach(prop => {
          initialValues[prop.id] = prop.defaultValue !== undefined ? prop.defaultValue :
                                    prop.dataType === 'boolean' ? false :
                                    prop.dataType === 'number' ? 0 : '';
      });
      setCurrentCustomPropValues(initialValues);
    } else {
      setCurrentCustomPropValues({});
    }
  };
  
  const handleSelectEventForAnnotation = (event: LocalTaggedEvent) => { 
    if (selectedEventForAnnotation?.id === event.id) {
      setSelectedEventForAnnotation(null);
      if(canvasRef.current) canvasRef.current.resetCanvas();
    } else {
      setSelectedEventForAnnotation(event);
    }
  };

  const handleDeleteTaggedEvent = (eventId: string) => { 
    setTaggedEvents(prev => prev.filter(e => e.id !== eventId));
    if (selectedEventForAnnotation?.id === eventId) {
      setSelectedEventForAnnotation(null);
      if (canvasRef.current) canvasRef.current.resetCanvas();
    }
    toast.success("Event deleted.");
  };

  const handleExportData = () => {
    if (taggedEvents.length === 0 && eventTypeDefs.length === 0 && cameraMovements.length === 0) {
      toast.info("No data to export (no events tagged, no event types defined, and no camera movements detected).");
      return;
    }
    const dataToExport = { 
      videoUrl, 
      analysisDate: new Date().toISOString(), 
      eventTypeDefinitions: eventTypeDefs, 
      taggedEvents,
      cameraMovements: cameraMovements
    };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    let filename = "video_analysis_data.json";
    try {
      const urlObject = new URL(videoUrl); 
      const pathnameParts = urlObject.pathname.split('/');
      const lastPart = pathnameParts[pathnameParts.length - 1];
      if (lastPart && lastPart.includes('.')) filename = `${lastPart.split('.')[0]}_analysis.json`;
      else if (lastPart && lastPart.trim() !== '') filename = `${lastPart}_analysis.json`;
    } catch (e) { console.warn("Could not generate filename from video URL, using default.", e); }
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("Analysis data exported successfully!");
  };

  useEffect(() => {
    if (filterEventTypeId) {
      const eventType = eventTypeDefs.find(et => et.id === filterEventTypeId);
      setAvailableFilterProperties(eventType?.properties || []);
      setFilterPropertyId(''); 
      setFilterPropertyValue('');
    } else {
      setAvailableFilterProperties([]);
      setFilterPropertyId('');
      setFilterPropertyValue('');
    }
  }, [filterEventTypeId, eventTypeDefs]);

  const handleApplyFilter = () => {
    if (!filterEventTypeId || !filterPropertyId || filterPropertyValue.trim() === '') {
        toast.info("Please select an event type, a property, and enter a value to filter by.");
        if (filterPropertyValue.trim() === '' && activeFiltersDescription) handleClearFilter();
        return;
    }
    const typeName = eventTypeDefs.find(et => et.id === filterEventTypeId)?.name || 'Unknown Type';
    const propName = availableFilterProperties.find(p => p.id === filterPropertyId)?.name || 'Unknown Property';
    setActiveFiltersDescription(`Type: ${typeName}, ${propName} = "${filterPropertyValue}"`);
  };

  const handleClearFilter = () => {
    setFilterEventTypeId('');
    setFilterPropertyId('');
    setFilterPropertyValue('');
    setAvailableFilterProperties([]);
    setActiveFiltersDescription(null);
    toast.success("Filters cleared.");
  };
  
  const filteredTaggedEvents = useMemo(() => {
    if (!activeFiltersDescription || !filterEventTypeId || !filterPropertyId || filterPropertyValue.trim() === '') {
      return taggedEvents;
    }
    return taggedEvents.filter(event => {
      if (event.typeId !== filterEventTypeId) return false;
      if (!event.customPropertyValues) return false;
      const propValue = event.customPropertyValues[filterPropertyId];
      if (propValue === undefined || propValue === null) return false;
      const propDef = availableFilterProperties.find(p => p.id === filterPropertyId);
      if (propDef?.dataType === 'number') return Number(propValue) === Number(filterPropertyValue);
      if (propDef?.dataType === 'boolean') return String(propValue).toLowerCase() === filterPropertyValue.toLowerCase();
      return String(propValue).toLowerCase().includes(filterPropertyValue.toLowerCase());
    });
  }, [taggedEvents, filterEventTypeId, filterPropertyId, filterPropertyValue, activeFiltersDescription, availableFilterProperties]);

  const renderCustomPropertyFields = () => {
    if (!selectedEventTypeIdForTagging) return null;
    const eventType = eventTypeDefs.find(et => et.id === selectedEventTypeIdForTagging);
    if (!eventType || eventType.properties.length === 0) return null;
    return (
      <div className="mt-3 mb-2 space-y-3 p-3 border-t">
        <h5 className="text-xs font-semibold text-gray-600">Custom Properties for "{eventType.name}"</h5>
        {eventType.properties.map(prop => (
          <div key={prop.id}>
            <Label htmlFor={`prop-${prop.id}`} className="text-xs font-medium">{prop.name}</Label>
            {prop.dataType === 'text' && (
              <Input id={`prop-${prop.id}`} type="text" value={(currentCustomPropValues[prop.id] as string) || ''} onChange={e => handleCustomPropValueChange(prop.id, e.target.value)} className="h-8 text-xs"/>
            )}
            {prop.dataType === 'number' && (
              <Input id={`prop-${prop.id}`} type="number" value={(currentCustomPropValues[prop.id] as number) || 0} onChange={e => handleCustomPropValueChange(prop.id, parseFloat(e.target.value))} className="h-8 text-xs"/>
            )}
            {prop.dataType === 'boolean' && (
              <div className="flex items-center space-x-2 mt-1">
                <Checkbox id={`prop-${prop.id}`} checked={!!currentCustomPropValues[prop.id]} onCheckedChange={checked => handleCustomPropValueChange(prop.id, !!checked)} />
                <Label htmlFor={`prop-${prop.id}`} className="text-xs"> {currentCustomPropValues[prop.id] ? "Yes" : "No"} </Label>
              </div>
            )}
            {prop.dataType === 'select' && prop.selectOptions && (
              <Select value={(currentCustomPropValues[prop.id] as string) || ''} onValueChange={value => handleCustomPropValueChange(prop.id, value)}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder={`Select ${prop.name}`} /></SelectTrigger>
                <SelectContent>{prop.selectOptions.map(option => <SelectItem key={option} value={option} className="text-xs">{option}</SelectItem>)}</SelectContent>
              </Select>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row justify-between items-center">
        <CardTitle className="text-lg">Analysis Workspace</CardTitle>
        <div className="flex items-center gap-2">
            <Button onClick={() => setShowCameraMovementPanel(prev => !prev)} variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" /> Camera Analysis
            </Button>
            <Button onClick={() => setShowEventTypeManager(prev => !prev)} variant="outline" size="sm">
                <SettingsIcon className="h-4 w-4 mr-2" /> Manage Event Types
            </Button>
            <Button onClick={handleExportData} variant="outline" size="sm" title="Export analysis data as JSON" disabled={duration === 0 || (taggedEvents.length === 0 && eventTypeDefs.length === 0 && cameraMovements.length === 0) }>
                <Download className="h-4 w-4 mr-2" /> Export Data
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showCameraMovementPanel && (
          <div className="mb-4 p-4 border rounded-lg bg-slate-50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Checkbox 
                  id="camera-analysis" 
                  checked={isCameraAnalysisEnabled}
                  onCheckedChange={(checked) => setIsCameraAnalysisEnabled(checked === true)}
                />
                <Label htmlFor="camera-analysis">Enable Camera Movement Analysis</Label>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowCameraMovementPanel(false)}>
                <XSquare className="h-4 w-4 mr-1"/> Close Panel
              </Button>
            </div>
            <CameraMovementEstimator
              videoElement={videoPlayerRef.current}
              isAnalyzing={isCameraAnalysisEnabled && isPlaying}
              onMovementDetected={handleCameraMovementDetected}
            />
          </div>
        )}

        {showEventTypeManager && (
          <div className="mb-4">
            <EventTypeManager
              eventTypes={eventTypeDefs}
              onAddEventType={handleAddEventTypeDefinition}
              onUpdateEventType={handleUpdateEventTypeDefinition}
              onDeleteEventType={handleDeleteEventTypeDefinition}
              onClose={() => setShowEventTypeManager(false)}
            />
          </div>
        )}

        <div className="mb-4">
          <EnhancedVideoPlayer
            ref={videoPlayerRef}
            videoUrl={processedVideoUrl}
            onTimeUpdate={handleTimeUpdate}
            onDurationChange={setDuration}
            onLoadedMetadata={handleVideoLoadedMetadata}
            className="w-full"
          />
          <AnnotationToolbox 
            canvasRef={canvasRef} 
            videoDimensions={videoDimensions}
            initialAnnotations={selectedEventForAnnotation?.annotations || null}
            onSaveAnnotations={handleSaveAnnotationToEvent}
            canSave={!!selectedEventForAnnotation && videoDimensions.width > 0}
            disabled={videoDimensions.width === 0} 
          />
        </div>

        {/* Filter Section */}
        <div className="my-3 p-3 border rounded-md bg-gray-50">
          <h4 className="text-sm font-medium mb-2">Filter Events</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 items-end">
              <div>
                  <Label htmlFor="filter-event-type" className="text-xs">Event Type</Label>
                  <Select onValueChange={setFilterEventTypeId} value={filterEventTypeId} disabled={eventTypeDefs.length === 0}>
                      <SelectTrigger id="filter-event-type" className="h-8 text-xs"><SelectValue placeholder="Select Type" /></SelectTrigger>
                      <SelectContent>{eventTypeDefs.map(et => <SelectItem key={et.id} value={et.id} className="text-xs">{et.name}</SelectItem>)}</SelectContent>
                  </Select>
              </div>
              <div>
                  <Label htmlFor="filter-property" className="text-xs">Property</Label>
                  <Select onValueChange={setFilterPropertyId} value={filterPropertyId} disabled={!filterEventTypeId || availableFilterProperties.length === 0}>
                      <SelectTrigger id="filter-property" className="h-8 text-xs"><SelectValue placeholder="Select Property" /></SelectTrigger>
                      <SelectContent>{availableFilterProperties.map(p => <SelectItem key={p.id} value={p.id} className="text-xs">{p.name} ({p.dataType})</SelectItem>)}</SelectContent>
                  </Select>
              </div>
              <div>
                  <Label htmlFor="filter-value" className="text-xs">Value</Label>
                  <Input id="filter-value" value={filterPropertyValue} onChange={e => setFilterPropertyValue(e.target.value)} placeholder="Enter value" disabled={!filterPropertyId} className="h-8 text-xs" />
              </div>
              <div className="flex gap-2">
                  <Button onClick={handleApplyFilter} size="sm" className="h-8 text-xs" disabled={!filterPropertyId || filterPropertyValue.trim() === ''}>Apply</Button>
                  <Button onClick={handleClearFilter} variant="outline" size="sm" className="h-8 text-xs" disabled={!activeFiltersDescription}>Clear</Button>
              </div>
          </div>
          {activeFiltersDescription && <p className="text-xs text-blue-600 mt-1">Active Filter: {activeFiltersDescription}</p>}
        </div>

        <div className="my-3 p-3 border rounded-md">
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-medium text-sm">Tag Event</h4>
          </div>
          <div className="flex items-center gap-2 mb-2">
              <Select value={selectedEventTypeIdForTagging} onValueChange={setSelectedEventTypeIdForTagging} 
                disabled={duration === 0 || eventTypeDefs.length === 0}>
                <SelectTrigger className="w-full md:w-[200px] h-8 text-xs"><SelectValue placeholder="Select Event Type" /></SelectTrigger>
                <SelectContent>
                  {/* === FIX START === */}
                  {eventTypeDefs.length === 0 && (
                    <p className="p-2 text-xs text-muted-foreground">
                      Define types first via Manager
                    </p>
                  )}
                  {/* === FIX END === */}
                  {eventTypeDefs.map(et => (<SelectItem key={et.id} value={et.id} style={{ color: et.color }} className="text-xs">{et.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Button size="sm" onClick={handleAddTaggedEvent} disabled={duration === 0 || !selectedEventTypeIdForTagging}>Tag Event</Button>
            </div>
            
          {renderCustomPropertyFields()}

          <div className="max-h-60 overflow-y-auto space-y-1 mt-2">
            {filteredTaggedEvents.length === 0 && <p className="text-xs text-gray-500">{activeFiltersDescription ? 'No events match filter.' : 'No events tagged yet.'}</p>}
            {filteredTaggedEvents.map(event => {
              const eventType = eventTypeDefs.find(etd => etd.id === event.typeId);
              return (
                <div key={event.id} onClick={() => handleSelectEventForAnnotation(event)}
                  className={`p-2 text-xs rounded border cursor-pointer ${selectedEventForAnnotation?.id === event.id ? 'bg-blue-100 border-blue-300' : 'hover:bg-gray-50'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-semibold" style={eventType?.color ? {color: eventType.color} : {}}>{event.typeName}</span> @ {formatTime(event.timestamp)}
                      {event.annotations && event.annotations.length > 0 && <span className="ml-1 text-blue-500">(A)</span>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleDeleteTaggedEvent(event.id);}} title="Delete Event">X</Button>
                  </div>
                  {event.customPropertyValues && Object.keys(event.customPropertyValues).length > 0 && (
                    <div className="mt-1 pt-1 border-t border-gray-200">
                      {eventType?.properties.filter(propDef => event.customPropertyValues![propDef.id] !== undefined && event.customPropertyValues![propDef.id] !== null && String(event.customPropertyValues![propDef.id]).trim() !== '')
                        .map(propDef => {
                          const value = event.customPropertyValues![propDef.id];
                          return (
                            <div key={propDef.id} className="text-gray-600">
                              <span className="font-medium text-gray-700">{propDef.name}:</span> {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                            </div>
                          );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
           <p className="text-xs text-gray-500 mt-1">{filteredTaggedEvents.length} of {taggedEvents.length} events shown.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
           <Card>
              <CardHeader className="pb-2 pt-3"><CardTitle className="text-base">Quick Stats</CardTitle></CardHeader>
              <CardContent className="text-sm">
                <p>Total Events: {taggedEvents.length}</p>
                <p>Events with Annotations: {taggedEvents.filter(e => e.annotations && e.annotations.length > 0).length}</p>
                <p>Event Types Defined: {eventTypeDefs.length}</p>
                <p>Camera Movements: {cameraMovements.length}</p>
              </CardContent>
            </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectAnalysisInterface;
