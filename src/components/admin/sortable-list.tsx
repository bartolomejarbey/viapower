"use client";

import { useEffect, useState, type ReactNode } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  children,
}: {
  items: T[];
  onReorder: (ids: string[]) => void | Promise<void>;
  children: (item: T) => ReactNode;
}) {
  const [order, setOrder] = useState(items);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setOrder(items), [items]);
  useEffect(() => setMounted(true), []);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldI = order.findIndex((i) => i.id === active.id);
    const newI = order.findIndex((i) => i.id === over.id);
    if (oldI < 0 || newI < 0) return;
    const prev = order;
    const next = arrayMove(order, oldI, newI);
    setOrder(next); // optimistic
    // If the server reorder fails (e.g. expired session, concurrent delete),
    // roll the canvas back to the last known-good order instead of silently
    // keeping a fake order that vanishes on the next reload.
    Promise.resolve(onReorder(next.map((i) => i.id))).catch((err) => {
      console.error("[reorder] failed — reverting", err);
      setOrder(prev);
    });
  }

  // Avoid SSR/CSR markup mismatch from dnd-kit's generated ids: render a plain
  // list on the server and during the first paint, then enable drag-and-drop.
  if (!mounted) {
    return (
      <div className="flex flex-col gap-3">
        {order.map((item) => (
          <div key={item.id} className="flex items-stretch gap-3">
            <div className="w-10 shrink-0 border border-line-strong bg-surface" />
            <div className="min-w-0 flex-1">{children(item)}</div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleEnd}>
      <SortableContext items={order.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="flex flex-col gap-3">
          {order.map((item) => (
            <Row key={item.id} id={item.id}>
              {children(item)}
            </Row>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function Row({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-stretch gap-3 ${isDragging ? "z-10 opacity-70" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="flex w-10 shrink-0 cursor-grab items-center justify-center border border-line-strong bg-surface text-ink-dim transition-colors hover:text-red-bright active:cursor-grabbing"
        aria-label="Přetáhnout pro změnu pořadí"
        type="button"
      >
        <GripVertical size={16} />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
