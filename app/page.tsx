"use client";
import { useState } from "react";

export default function Home() {
  const [items, setItems] = useState<string[]>([]);
  const [value, setValue] = useState("");

  function addItem() {
    if (!value.trim()) return;
    setItems([...items, value]);
    setValue("");
  }

  return (
    <div className="p-10 space-y-4">
      <div className="flex space-x-2">
        <input
          className="border p-2 rounded flex-1"
          placeholder="Add item..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button onClick={addItem} className="px-4 bg-green-600 text-white rounded">
          Add
        </button>
      </div>

      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="p-3 border bg-gray-50 shadow-sm text-black rounded"
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
