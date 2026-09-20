import React, { useState } from 'react';
import { AppState, ExerciseItem } from '../types';
import { generateDefaultCycle, PRESCRIPTION_OPTIONS } from '../data';
import { ChevronUp, ChevronDown, Edit3, Copy, Trash2, Plus, ArrowLeft } from 'lucide-react';

interface EditorViewProps {
  state: AppState;
  updateState: (updater: (prev: AppState) => AppState) => void;
}

export function EditorView({ state, updateState }: EditorViewProps) {
  const { currentCycle } = state;
  const [editCycle, setEditCycle] = useState(currentCycle);
  const [category, setCategory] = useState<'circuit' | 'recoveryCardio' | 'power'>('circuit');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const ensureCycleExists = (cNum: number) => {
    if (!state.cycles[cNum]) {
      const confirm = window.confirm(
        `Cycle ${cNum} doesn't exist yet. Initialize it using Cycle ${cNum - 1}'s configuration?`
      );
      if (confirm) {
        updateState(prev => {
          const clone = JSON.parse(
            JSON.stringify(prev.cycles[cNum - 1] || generateDefaultCycle(1))
          );
          clone.completedDays = [];
          clone.testResults = null;
          return { ...prev, cycles: { ...prev.cycles, [cNum]: clone } };
        });
      } else {
        setEditCycle(currentCycle);
      }
    }
  };

  const cycleData = state.cycles[editCycle];
  if (!cycleData) return null;
  const list = cycleData[category] || [];

  const handleUpdateList = (newList: ExerciseItem[]) => {
    updateState(prev => ({
      ...prev,
      cycles: {
        ...prev.cycles,
        [editCycle]: {
          ...prev.cycles[editCycle],
          [category]: newList
        }
      }
    }));
  };

  const moveItem = (index: number, dir: number) => {
    if (index + dir < 0 || index + dir >= list.length) return;
    const arr = [...list];
    const temp = arr[index];
    arr[index] = arr[index + dir];
    arr[index + dir] = temp;
    handleUpdateList(arr);
  };

  const removeItem = (index: number) => {
    if (window.confirm("Remove this exercise slot?")) {
      const arr = [...list];
      arr.splice(index, 1);
      handleUpdateList(arr);
    }
  };

  const duplicateItem = (index: number) => {
    const arr = [...list];
    const newItem: ExerciseItem = JSON.parse(JSON.stringify(arr[index]));
    newItem.id = Date.now().toString();
    arr.splice(index + 1, 0, newItem);
    handleUpdateList(arr);
  };

  const addItem = () => {
    const arr = [...list];
    arr.push({
      id: Date.now().toString(),
      name: 'New Exercise',
      instruction: '',
      prescriptionType: 'Technical failure',
      prescriptionValue: ''
    });
    handleUpdateList(arr);
    setEditingIndex(arr.length - 1);
  };

  const saveExerciseEdit = (updatedItem: ExerciseItem) => {
    if (editingIndex === null) return;
    const arr = [...list];
    arr[editingIndex] = updatedItem;
    handleUpdateList(arr);
    setEditingIndex(null);
  };

  return (
    <div id="editor-view-container" className="p-4 sm:p-6 max-w-lg mx-auto pb-24">
      {/* Target cycle & category selectors */}
      <div className="mb-6 bg-zinc-950 border border-zinc-900 p-4 rounded-2xl">
        <label htmlFor="target-cycle-select" className="block text-zinc-400 text-xs font-bold mb-2 uppercase tracking-wider">
          Target Cycle
        </label>
        <select
          id="target-cycle-select"
          value={editCycle}
          onChange={e => {
            const val = Number(e.target.value);
            setEditCycle(val);
            ensureCycleExists(val);
          }}
          className="w-full bg-zinc-900 text-white font-bold"
        >
          {Array.from({
            length: Math.max(currentCycle + 5, Object.keys(state.cycles).length)
          }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              Cycle {i + 1} {i + 1 === currentCycle ? '(Current)' : ''}
            </option>
          ))}
        </select>

        <label className="block text-zinc-400 text-xs font-bold mb-2 uppercase tracking-wider mt-4">
          Workout Category
        </label>
        <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          {[
            { k: 'circuit' as const, l: 'CIRCUIT' },
            { k: 'recoveryCardio' as const, l: 'REC+CARDIO' },
            { k: 'power' as const, l: 'POWER' }
          ].map(cat => (
            <button
              key={cat.k}
              id={`cat-btn-${cat.k}`}
              type="button"
              onClick={() => {
                setCategory(cat.k);
                setEditingIndex(null);
              }}
              className={`py-2 px-2 text-xs font-bold rounded-lg transition text-center ${
                category === cat.k
                  ? 'bg-white text-black shadow'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {cat.l}
            </button>
          ))}
        </div>
      </div>

      {/* Editing Form or Movement List */}
      {editingIndex !== null && list[editingIndex] ? (
        <ExerciseEditor
          item={list[editingIndex]}
          onSave={saveExerciseEdit}
          onCancel={() => setEditingIndex(null)}
        />
      ) : (
        <div className="space-y-3">
          <div className="flex justify-between items-center px-1 mb-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
              {list.length} Exercises Configured
            </span>
          </div>

          {list.map((item, index) => (
            <div
              key={item.id}
              id={`exercise-card-${item.id}`}
              className="bg-zinc-950 border border-zinc-900 hover:border-zinc-800 p-4 rounded-2xl transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-start gap-2.5">
                  <span className="text-zinc-500 font-mono font-bold text-xs mt-1">
                    {(index + 1).toString().padStart(2, '0')}.
                  </span>
                  <div>
                    <span className="font-bold text-base sm:text-lg text-white block">
                      {item.name}
                    </span>
                    <span className="text-xs text-zinc-400 mt-0.5 block">
                      {item.prescriptionType}
                      {item.prescriptionValue ? ` — ${item.prescriptionValue}` : ''}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    id={`move-up-${index}`}
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-20 transition"
                    title="Move up"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    id={`move-down-${index}`}
                    onClick={() => moveItem(index, 1)}
                    disabled={index === list.length - 1}
                    className="p-1.5 text-zinc-400 hover:text-white disabled:opacity-20 transition"
                    title="Move down"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {item.instruction && (
                <p className="text-xs text-zinc-400 mb-3 pl-6 line-clamp-2">
                  {item.instruction}
                </p>
              )}

              <div className="flex gap-2 border-t border-zinc-900 pt-3 mt-1">
                <button
                  id={`edit-exercise-btn-${index}`}
                  onClick={() => setEditingIndex(index)}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>EDIT</span>
                </button>
                <button
                  id={`duplicate-exercise-btn-${index}`}
                  onClick={() => duplicateItem(index)}
                  className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>DUPLICATE</span>
                </button>
                <button
                  id={`remove-exercise-btn-${index}`}
                  onClick={() => removeItem(index)}
                  className="flex-1 bg-red-950/50 hover:bg-red-900/60 border border-red-900/40 text-red-300 text-xs font-bold py-2 px-3 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>REMOVE</span>
                </button>
              </div>
            </div>
          ))}

          <button
            id="add-exercise-slot-btn"
            onClick={addItem}
            className="w-full border-2 border-dashed border-zinc-800 hover:border-zinc-500 text-zinc-400 hover:text-white font-bold py-4 rounded-2xl transition flex items-center justify-center gap-2 mt-4 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ ADD EXERCISE SLOT</span>
          </button>
        </div>
      )}
    </div>
  );
}

interface ExerciseEditorProps {
  item: ExerciseItem;
  onSave: (item: ExerciseItem) => void;
  onCancel: () => void;
}

function ExerciseEditor({ item, onSave, onCancel }: ExerciseEditorProps) {
  const [form, setForm] = useState<ExerciseItem>({ ...item });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form onSubmit={handleSubmit} id="exercise-editor-form" className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl">
      <div className="flex items-center justify-between mb-5 border-b border-zinc-900 pb-3">
        <h3 className="font-bold text-sm uppercase text-white tracking-wider flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-zinc-400" />
          <span>Edit Movement</span>
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1 uppercase tracking-wider">
            Movement Name
          </label>
          <input
            id="edit-movement-name"
            type="text"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1 uppercase tracking-wider">
            Prescription Type
          </label>
          <select
            id="edit-prescription-type"
            value={form.prescriptionType}
            onChange={e => setForm({ ...form, prescriptionType: e.target.value })}
          >
            {PRESCRIPTION_OPTIONS.map(opt => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1 uppercase tracking-wider">
            Target Value (e.g. 5 reps, 90s, 30 mins)
          </label>
          <input
            id="edit-prescription-value"
            type="text"
            value={form.prescriptionValue}
            onChange={e => setForm({ ...form, prescriptionValue: e.target.value })}
            placeholder="Optional value..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1 uppercase tracking-wider">
            Instructions & Form Cues
          </label>
          <textarea
            id="edit-instruction"
            rows={3}
            value={form.instruction}
            onChange={e => setForm({ ...form, instruction: e.target.value })}
            placeholder="Execution cues and stop conditions..."
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-sky-400 mb-1 uppercase tracking-wider">
            Future Progression Idea
          </label>
          <input
            id="edit-future-upgrade"
            type="text"
            value={form.possibleNextVariation || ''}
            onChange={e => setForm({ ...form, possibleNextVariation: e.target.value })}
            placeholder="e.g. Weighted pull-ups or archer push-ups"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-zinc-400 mb-1 uppercase tracking-wider">
            User Notes
          </label>
          <input
            id="edit-user-notes"
            type="text"
            value={form.userNotes || ''}
            onChange={e => setForm({ ...form, userNotes: e.target.value })}
            placeholder="Personal observations, grip width, height setting..."
          />
        </div>
      </div>

      <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-900">
        <button
          type="button"
          id="cancel-edit-btn"
          onClick={onCancel}
          className="flex-1 bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3.5 rounded-xl transition cursor-pointer"
        >
          CANCEL
        </button>
        <button
          type="submit"
          id="save-edit-btn"
          className="flex-1 bg-white hover:bg-zinc-200 text-black font-black py-3.5 rounded-xl transition cursor-pointer"
        >
          SAVE CHANGES
        </button>
      </div>
    </form>
  );
}
