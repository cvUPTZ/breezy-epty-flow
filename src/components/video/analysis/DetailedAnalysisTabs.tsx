import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { List, Dribbble, Flag, Target, Plus, Trash2, Clock, Goal, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

// --- Data Types ---
export interface MatchPhase {
  id: string;
  type: 'Attacking' | 'Defensive' | 'Transition';
  startTime: number;
  endTime: number;
  notes: string;
}

export type PossessionOutcome = 'Goal' | 'Shot' | 'Turnover' | 'Foul' | 'Out of Play';
export interface Possession {
    id: string;
    startTime: number;
    endTime: number;
    duration: number;
    playersInvolved: string;
    passCount: number;
    outcome: PossessionOutcome;
    notes: string;
}

export type SetPieceType = 'Corner Kick' | 'Free Kick (Direct)' | 'Free Kick (Indirect)' | 'Throw-in' | 'Penalty';
export interface SetPiece {
    id: string;
    timestamp: number;
    type: SetPieceType;
    outcome: string;
    notes: string;
}

export type TacticalCategory = 'Team Formation' | 'Attacking Pattern' | 'Defensive Shape' | 'Player Positioning' | 'Opposition Strength' | 'Opposition Weakness';
export interface TacticalNote {
    id: string;
    timestamp: number;
    category: TacticalCategory;
    note: string;
}

// --- Helper Functions ---
const formatTime = (seconds: number) => {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// --- Panel Components ---

const MatchPhasesPanel: React.FC<{
    currentTime: number;
    phases: MatchPhase[];
    onAddPhase: (phase: Omit<MatchPhase, 'id'>) => void;
    onDeletePhase: (id: string) => void;
}> = ({ currentTime, phases, onAddPhase, onDeletePhase }) => {
  const [currentPhase, setCurrentPhase] = React.useState<{ type: MatchPhase['type'] | null, startTime: number | null, notes: string }>({
    type: null,
    startTime: null,
    notes: ''
  });

  const handleAdd = () => {
    if (!currentPhase.type || currentPhase.startTime === null) {
      toast.error('Please select a phase type and set a start time.');
      return;
    }
    if (currentTime <= currentPhase.startTime) {
      toast.error('End time must be after the start time.');
      return;
    }

    onAddPhase({
      type: currentPhase.type,
      startTime: currentPhase.startTime,
      endTime: currentTime,
      notes: currentPhase.notes,
    });

    setCurrentPhase({ type: null, startTime: null, notes: '' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Phases</CardTitle>
        <CardDescription>Log attacking, defensive, and transition phases of the match.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded-lg space-y-4">
            <h3 className="font-semibold">Log New Phase</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select onValueChange={(value: MatchPhase['type']) => setCurrentPhase(p => ({ ...p, type: value }))} value={currentPhase.type || ''}>
                    <SelectTrigger><SelectValue placeholder="Select Phase Type" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Attacking">Attacking</SelectItem>
                        <SelectItem value="Defensive">Defensive</SelectItem>
                        <SelectItem value="Transition">Transition</SelectItem>
                    </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => setCurrentPhase(p => ({ ...p, startTime: currentTime }))}>
                    <Clock className="w-4 h-4 mr-2" />
                    Set Start: {currentPhase.startTime !== null ? formatTime(currentPhase.startTime) : '...'}
                </Button>
                 <Button variant="outline" disabled>Set End: {formatTime(currentTime)}</Button>
            </div>
            <Textarea placeholder="Add notes for this phase..." value={currentPhase.notes} onChange={(e) => setCurrentPhase(p => ({ ...p, notes: e.target.value }))} />
            <Button onClick={handleAdd} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Phase</Button>
        </div>
        <div className="space-y-2">
            <h3 className="font-semibold">Logged Phases</h3>
            {phases.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No phases logged yet.</p> : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {phases.map(phase => (
                        <div key={phase.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                            <div>
                                <p className="font-medium">{phase.type} Phase</p>
                                <p className="text-sm text-muted-foreground">{formatTime(phase.startTime)} - {formatTime(phase.endTime)}</p>
                                {phase.notes && <p className="text-xs italic mt-1">"{phase.notes}"</p>}
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => onDeletePhase(phase.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
};

const PossessionAnalysisPanel: React.FC<{
    currentTime: number;
    possessions: Possession[];
    onAddPossession: (possession: Omit<Possession, 'id'>) => void;
    onDeletePossession: (id: string) => void;
}> = ({ currentTime, possessions, onAddPossession, onDeletePossession }) => {
    const [current, setCurrent] = React.useState({
        startTime: null as number | null,
        playersInvolved: '',
        passCount: '',
        outcome: null as PossessionOutcome | null,
        notes: ''
    });

    const handleAdd = () => {
        if (current.startTime === null || !current.outcome) {
            toast.error('Please set a start time and select an outcome.');
            return;
        }
        if (currentTime <= current.startTime) {
            toast.error('End time must be after the start time.');
            return;
        }

        onAddPossession({
            startTime: current.startTime,
            endTime: currentTime,
            duration: currentTime - current.startTime,
            playersInvolved: current.playersInvolved,
            passCount: parseInt(current.passCount, 10) || 0,
            outcome: current.outcome,
            notes: current.notes
        });

        setCurrent({ startTime: null, playersInvolved: '', passCount: '', outcome: null, notes: '' });
    };

    const getOutcomeIcon = (outcome: PossessionOutcome) => {
        switch (outcome) {
            case 'Goal': return <Goal className="w-4 h-4 text-green-500" />;
            case 'Shot': return <CheckCircle className="w-4 h-4 text-blue-500" />;
            case 'Turnover': return <XCircle className="w-4 h-4 text-red-500" />;
            case 'Foul': return <AlertCircle className="w-4 h-4 text-yellow-500" />;
            case 'Out of Play': return <Flag className="w-4 h-4 text-gray-500" />;
            default: return null;
        }
    };

    return (
        <Card>
            <CardHeader><CardTitle>Possession Analysis</CardTitle><CardDescription>Log individual possession chains with key details and outcomes.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg space-y-4">
                    <h3 className="font-semibold">Log New Possession</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Button variant="outline" onClick={() => setCurrent(p => ({ ...p, startTime: currentTime }))}><Clock className="w-4 h-4 mr-2" />Set Start: {current.startTime !== null ? formatTime(current.startTime) : '...'}</Button>
                        <Button variant="outline" disabled>Set End: {formatTime(currentTime)}</Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Players involved (e.g., 7, 10, 9)" value={current.playersInvolved} onChange={e => setCurrent(p => ({...p, playersInvolved: e.target.value}))} />
                        <Input type="number" placeholder="Number of passes" value={current.passCount} onChange={e => setCurrent(p => ({...p, passCount: e.target.value}))} />
                    </div>
                    <Select onValueChange={(value: PossessionOutcome) => setCurrent(p => ({ ...p, outcome: value }))} value={current.outcome || ''}>
                        <SelectTrigger><SelectValue placeholder="Select Possession Outcome" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Goal">Goal</SelectItem>
                            <SelectItem value="Shot">Shot</SelectItem>
                            <SelectItem value="Turnover">Turnover</SelectItem>
                            <SelectItem value="Foul">Foul</SelectItem>
                            <SelectItem value="Out of Play">Out of Play</SelectItem>
                        </SelectContent>
                    </Select>
                    <Textarea placeholder="Add notes for this possession..." value={current.notes} onChange={(e) => setCurrent(p => ({ ...p, notes: e.target.value }))} />
                    <Button onClick={handleAdd} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Possession</Button>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold">Logged Possessions</h3>
                    {possessions.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No possessions logged yet.</p> : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {possessions.map(p => (
                                <div key={p.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">{getOutcomeIcon(p.outcome)}<p className="font-medium">Possession: {formatTime(p.startTime)} - {formatTime(p.endTime)}</p></div>
                                        <div className="text-sm text-muted-foreground ml-6 space-y-1 mt-1">
                                            <p><strong>Outcome:</strong> {p.outcome}</p>
                                            <p><strong>Duration:</strong> {p.duration.toFixed(1)}s, <strong>Passes:</strong> {p.passCount}</p>
                                            {p.playersInvolved && <p><strong>Players:</strong> {p.playersInvolved}</p>}
                                            {p.notes && <p className="text-xs italic mt-1">"{p.notes}"</p>}
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => onDeletePossession(p.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const SetPieceAnalysisPanel: React.FC<{
    currentTime: number;
    setPieces: SetPiece[];
    onAddSetPiece: (setPiece: Omit<SetPiece, 'id'>) => void;
    onDeleteSetPiece: (id: string) => void;
}> = ({ currentTime, setPieces, onAddSetPiece, onDeleteSetPiece }) => {
    const [current, setCurrent] = React.useState({ type: null as SetPieceType | null, outcome: '', notes: '' });

    const handleAdd = () => {
        if (!current.type) { toast.error('Please select a set piece type.'); return; }
        onAddSetPiece({ timestamp: currentTime, type: current.type, outcome: current.outcome, notes: current.notes });
        setCurrent({ type: null, outcome: '', notes: '' });
    };

    return (
        <Card>
            <CardHeader><CardTitle>Set Piece Analysis</CardTitle><CardDescription>Log and analyze key set piece events.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg space-y-4">
                    <h3 className="font-semibold">Log New Set Piece</h3>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Event Time: {formatTime(currentTime)}</span></div>
                    <Select onValueChange={(value: SetPieceType) => setCurrent(p => ({...p, type: value}))} value={current.type || ''}>
                        <SelectTrigger><SelectValue placeholder="Select Set Piece Type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Corner Kick">Corner Kick</SelectItem>
                            <SelectItem value="Free Kick (Direct)">Free Kick (Direct)</SelectItem>
                            <SelectItem value="Free Kick (Indirect)">Free Kick (Indirect)</SelectItem>
                            <SelectItem value="Throw-in">Throw-in</SelectItem>
                            <SelectItem value="Penalty">Penalty</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input placeholder="Outcome (e.g., Goal, Shot on target, Cleared)" value={current.outcome} onChange={e => setCurrent(p => ({...p, outcome: e.target.value}))} />
                    <Textarea placeholder="Describe the setup, movements, and key player actions..." value={current.notes} onChange={e => setCurrent(p => ({...p, notes: e.target.value}))} />
                    <Button onClick={handleAdd} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Set Piece</Button>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold">Logged Set Pieces</h3>
                    {setPieces.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No set pieces logged yet.</p> : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {setPieces.map(sp => (
                                <div key={sp.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50">
                                    <div className="flex-1">
                                        <p className="font-medium">{sp.type} at {formatTime(sp.timestamp)}</p>
                                        <p className="text-sm text-muted-foreground"><strong>Outcome:</strong> {sp.outcome || 'N/A'}</p>
                                        {sp.notes && <p className="text-xs italic mt-1">"{sp.notes}"</p>}
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => onDeleteSetPiece(sp.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

const TacticalAnalysisPanel: React.FC<{
    currentTime: number;
    notes: TacticalNote[];
    onAddNote: (note: Omit<TacticalNote, 'id'>) => void;
    onDeleteNote: (id: string) => void;
}> = ({ currentTime, notes, onAddNote, onDeleteNote }) => {
    const [current, setCurrent] = React.useState({ category: null as TacticalCategory | null, note: '' });

    const handleAdd = () => {
        if (!current.category || !current.note.trim()) { toast.error('Please select a category and write a note.'); return; }
        onAddNote({ timestamp: currentTime, category: current.category, note: current.note });
        setCurrent({ category: null, note: '' });
    };

    return (
        <Card>
            <CardHeader><CardTitle>Tactical & Opposition Analysis</CardTitle><CardDescription>Log tactical patterns, formations, and opposition insights.</CardDescription></CardHeader>
            <CardContent className="space-y-6">
                <div className="p-4 border rounded-lg space-y-4">
                    <h3 className="font-semibold">Log New Tactical Note</h3>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4" /><span>Event Time: {formatTime(currentTime)}</span></div>
                    <Select onValueChange={(value: TacticalCategory) => setCurrent(p => ({...p, category: value}))} value={current.category || ''}>
                        <SelectTrigger><SelectValue placeholder="Select Tactical Category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Team Formation">Team Formation</SelectItem>
                            <SelectItem value="Attacking Pattern">Attacking Pattern</SelectItem>
                            <SelectItem value="Defensive Shape">Defensive Shape</SelectItem>
                            <SelectItem value="Player Positioning">Player Positioning</SelectItem>
                            <SelectItem value="Opposition Strength">Opposition Strength</SelectItem>
                            <SelectItem value="Opposition Weakness">Opposition Weakness</SelectItem>
                        </SelectContent>
                    </Select>
                    <Textarea placeholder="Describe your tactical observation here..." value={current.note} onChange={e => setCurrent(p => ({...p, note: e.target.value}))} rows={4} />
                    <Button onClick={handleAdd} className="w-full"><Plus className="w-4 h-4 mr-2" />Add Tactical Note</Button>
                </div>
                <div className="space-y-2">
                    <h3 className="font-semibold">Logged Tactical Notes</h3>
                    {notes.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">No tactical notes logged yet.</p> : (
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {notes.map(note => (
                                <div key={note.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50">
                                    <div className="flex-1">
                                        <p className="font-medium">{note.category} at {formatTime(note.timestamp)}</p>
                                        <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{note.note}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => onDeleteNote(note.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

interface DetailedAnalysisTabsProps {
  currentTime: number;
  // State for all analysis data
  phases: MatchPhase[];
  possessions: Possession[];
  setPieces: SetPiece[];
  tacticalNotes: TacticalNote[];
  // Handlers for updating state
  onAddPhase: (phase: Omit<MatchPhase, 'id'>) => void;
  onDeletePhase: (id: string) => void;
  onAddPossession: (possession: Omit<Possession, 'id'>) => void;
  onDeletePossession: (id: string) => void;
  onAddSetPiece: (setPiece: Omit<SetPiece, 'id'>) => void;
  onDeleteSetPiece: (id: string) => void;
  onAddTacticalNote: (note: Omit<TacticalNote, 'id'>) => void;
  onDeleteTacticalNote: (id:string) => void;
}

export const DetailedAnalysisTabs: React.FC<DetailedAnalysisTabsProps> = (props) => {
  return (
    <Tabs defaultValue="phases" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="phases"><List className="w-4 h-4 mr-2" />Phases</TabsTrigger>
        <TabsTrigger value="possession"><Dribbble className="w-4 h-4 mr-2" />Possession</TabsTrigger>
        <TabsTrigger value="set_pieces"><Flag className="w-4 h-4 mr-2" />Set Pieces</TabsTrigger>
        <TabsTrigger value="tactics"><Target className="w-4 h-4 mr-2" />Tactics</TabsTrigger>
      </TabsList>
      <TabsContent value="phases">
        <MatchPhasesPanel currentTime={props.currentTime} phases={props.phases} onAddPhase={props.onAddPhase} onDeletePhase={props.onDeletePhase} />
      </TabsContent>
      <TabsContent value="possession">
        <PossessionAnalysisPanel currentTime={props.currentTime} possessions={props.possessions} onAddPossession={props.onAddPossession} onDeletePossession={props.onDeletePossession} />
      </TabsContent>
      <TabsContent value="set_pieces">
        <SetPieceAnalysisPanel currentTime={props.currentTime} setPieces={props.setPieces} onAddSetPiece={props.onAddSetPiece} onDeleteSetPiece={props.onDeleteSetPiece} />
      </TabsContent>
      <TabsContent value="tactics">
        <TacticalAnalysisPanel currentTime={props.currentTime} notes={props.tacticalNotes} onAddNote={props.onAddTacticalNote} onDeleteNote={props.onDeleteTacticalNote} />
      </TabsContent>
    </Tabs>
  );
};