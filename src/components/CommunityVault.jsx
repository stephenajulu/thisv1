import React, { useState, useEffect } from 'react';
import { BookOpen, Search, ArrowRight, User, Calendar, Layers, ShieldCheck, Heart, GitBranch, FileText, ArrowUpRight } from 'lucide-react';
import { database } from '../data/database';

export default function CommunityVault({ onNavigate }) {
  const vaultNotes = database.notes;
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Synchronize selected note ID when vaultNotes loads or changes
  useEffect(() => {
    if (vaultNotes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(vaultNotes[0].id);
    }
  }, [vaultNotes, selectedNoteId]);

  const activeNote = vaultNotes.find(n => n.id === selectedNoteId) || vaultNotes[0];

  const filteredNotes = vaultNotes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.body.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Wiki-link parser to render text as dynamic links
  const parseWikiLinks = (text) => {
    if (!text) return "";
    const parts = text.split(/(\[\[[a-zA-Z0-9_-]+\]\])/g);
    
    return parts.map((part, idx) => {
      const match = part.match(/^\[\[([a-zA-Z0-9_-]+)\]\]$/);
      if (match) {
        const id = match[1];
        // Check if id is a condition or remedy in the database
        const condition = database.conditions.find(c => c.id === id);
        const remedy = database.remedies.find(r => r.id === id);
        const noteRef = vaultNotes.find(n => n.id === id);

        if (condition) {
          return (
            <button
              key={idx}
              onClick={() => onNavigate('condition', id)}
              className="inline-flex items-center gap-0.5 text-sky-600 hover:text-sky-800 hover:underline bg-sky-50 px-1.5 py-0.5 rounded font-black font-mono select-none"
            >
              <span>{condition.name}</span>
              <ArrowUpRight className="h-2.5 w-2.5" />
            </button>
          );
        } else if (remedy) {
          return (
            <button
              key={idx}
              onClick={() => onNavigate('remedy', id)}
              className="inline-flex items-center gap-0.5 text-emerald-700 hover:text-emerald-950 hover:underline bg-emerald-50 px-1.5 py-0.5 rounded font-black font-mono select-none"
            >
              <span>{remedy.name}</span>
              <ArrowUpRight className="h-2.5 w-2.5" />
            </button>
          );
        } else if (noteRef) {
          return (
            <button
              key={idx}
              onClick={() => setSelectedNoteId(id)}
              className="inline-flex items-center gap-0.5 text-indigo-600 hover:text-indigo-800 hover:underline bg-indigo-50 px-1.5 py-0.5 rounded font-bold select-none"
            >
              <span>{noteRef.title}</span>
              <ArrowUpRight className="h-2.5 w-2.5" />
            </button>
          );
        }
        return <code key={idx} className="bg-slate-100 px-1 rounded text-slate-700 font-mono text-[10px]">{id}</code>;
      }
      return part;
    });
  };

  // SVG network graph coordinate mapper
  const renderObsidianGraph = () => {
    if (!activeNote) return null;

    // Extract all wiki-link IDs from the active note
    const linkedIds = [];
    const regex = /\[\[([a-zA-Z0-9_-]+)\]\]/g;
    let match;
    while ((match = regex.exec(activeNote.body)) !== null) {
      linkedIds.push(match[1]);
    }

    const centralX = 150;
    const centralY = 150;
    const radius = 90;

    // Calculate node coordinates in a circle around the center
    const nodes = linkedIds.map((id, index) => {
      const angle = (index / linkedIds.length) * 2 * Math.PI;
      const x = centralX + radius * Math.cos(angle);
      const y = centralY + radius * Math.sin(angle);
      
      const condition = database.conditions.find(c => c.id === id);
      const remedy = database.remedies.find(r => r.id === id);
      const noteRef = vaultNotes.find(n => n.id === id);

      let label = id;
      let type = 'unknown';
      let color = '#64748b'; // slate

      if (condition) {
        label = condition.name;
        type = 'condition';
        color = '#0284c7'; // sky-600
      } else if (remedy) {
        label = remedy.name;
        type = 'remedy';
        color = '#059669'; // emerald-600
      } else if (noteRef) {
        label = noteRef.title;
        type = 'note';
        color = '#4f46e5'; // indigo-600
      }

      return { id, label, type, x, y, color };
    });

    return (
      <svg viewBox="0 0 300 300" className="w-full max-w-[280px] mx-auto bg-slate-950 border border-slate-800 rounded-3xl shadow-lg no-print">
        {/* Draw connection edges/lines */}
        {nodes.map(node => (
          <line
            key={`edge-${node.id}`}
            x1={centralX}
            y1={centralY}
            x2={node.x}
            y2={node.y}
            stroke="#334155"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            className="animate-pulse"
          />
        ))}

        {/* Central Active Node */}
        <circle
          cx={centralX}
          cy={centralY}
          r="10"
          fill="#4f46e5"
          className="animate-pulse"
        />
        <text
          x={centralX}
          y={centralY - 14}
          fill="#e2e8f0"
          fontSize="9"
          fontWeight="bold"
          textAnchor="middle"
          className="select-none pointer-events-none"
        >
          {activeNote.title.split(' ').slice(0, 3).join(' ') + '...'}
        </text>

        {/* Surrounding Linked Nodes */}
        {nodes.map(node => (
          <g 
            key={`node-${node.id}`}
            onClick={() => {
              if (node.type === 'condition') onNavigate('condition', node.id);
              else if (node.type === 'remedy') onNavigate('remedy', node.id);
            }}
            className="cursor-pointer group"
          >
            <circle
              cx={node.x}
              cy={node.y}
              r="7"
              fill={node.color}
              className="transition-transform group-hover:scale-125"
            />
            <text
              x={node.x}
              y={node.y - 10}
              fill="#94a3b8"
              fontSize="7.5"
              fontWeight="semibold"
              textAnchor="middle"
              className="select-none pointer-events-none group-hover:fill-slate-100 transition-colors"
            >
              {node.label.split(' ').slice(0, 2).join(' ')}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Visual Header */}
      <div className="glass-panel p-6 bg-white border-l-4 border-l-indigo-600 shadow-sm no-print">
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2 text-slate-800">
          <GitBranch className="h-5.5 w-5.5 text-indigo-600 animate-pulse" />
          THIS Community Vaults (Obsidian-Style Links)
        </h2>
        <p className="text-xs text-slate-500">
          Explore research journals published by tropical medicine clinicians, interconnected dynamically through interactive backlinked graph nodes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Notes list */}
        <div className="lg:col-span-4 space-y-4 no-print">
          <div className="glass-panel p-4 bg-white border border-slate-100 shadow-sm space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              />
            </div>

            <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
              {filteredNotes.map(note => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                    selectedNoteId === note.id
                      ? 'bg-indigo-50/50 border-indigo-400 text-indigo-950 font-bold shadow-sm'
                      : 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {note.category}
                    </span>
                    <span className="text-[8px] text-slate-400 font-bold">{note.date}</span>
                  </div>
                  <span className="text-xs font-black line-clamp-2 leading-snug">{note.title}</span>
                  <p className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
                    <User className="h-3 w-3" /> By {note.author}
                  </p>
                </button>
              ))}

              {filteredNotes.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-6 italic">No notes found matching query.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Active Note Viewer & Obsidian SVG Graph */}
        <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-12 gap-6">
          {activeNote ? (
            <>
              {/* Note body frame */}
              <div className="md:col-span-8 glass-panel p-6 bg-white border border-slate-100 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100">
                      Category: {activeNote.category}
                    </span>
                    <span className="text-[10px] text-slate-450 font-bold">{activeNote.date}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-slate-800 leading-snug pt-1">{activeNote.title}</h3>
                  <span className="text-[9px] text-slate-400 font-bold block">Authored by {activeNote.author}</span>
                </div>

                {/* Parsed wiki links text */}
                <div className="text-xs text-slate-700 leading-relaxed font-medium space-y-4">
                  {parseWikiLinks(activeNote.body)}
                </div>
              </div>

              {/* Obsidian-Style Graph Panel */}
              <div className="md:col-span-4 space-y-4 no-print text-center flex flex-col justify-center">
                <div className="glass-panel p-4 bg-white border border-slate-100 shadow-sm space-y-3">
                  <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1 border-b border-slate-100 pb-1.5">
                    <GitBranch className="h-3.5 w-3.5 text-indigo-600" />
                    Obsidian Link Graph
                  </h4>
                  {renderObsidianGraph()}
                  <span className="text-[8.5px] text-slate-400 font-bold block leading-normal mt-2">
                    Click surrounding nodes to instantly navigate to their specific medical or drug registry pages.
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="col-span-12 glass-panel p-10 text-center flex flex-col items-center justify-center min-h-[250px] bg-white">
              <FileText className="h-10 w-10 text-slate-350 mb-2" />
              <h4 className="font-bold text-slate-650">Select a research note to view</h4>
              <p className="text-xs text-slate-405 mt-1">Select a community note from the left list to review research and graph networks.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
