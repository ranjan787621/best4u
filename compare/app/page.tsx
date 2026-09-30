'use client';

import { useState } from 'react';

export default function Home() {
  const [items, setItems] = useState('');
  const [pincode, setPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleCompare = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items || !pincode) {
      alert('Kripya Pincode aur Items dono bharein!');
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, pincode }),
      });

      const data = await res.json();
      if (data.result) {
        setResult(data.result);
      } else {
        setResult(data.error || 'Kuch galat hua, kripya dubara try karein.');
      }
    } catch (err) {
      setResult('Error fetching comparison. Server check karein.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-900 text-white p-6 flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-6 text-green-400">
        ⚡ Universal Price & Delivery Comparator
      </h1>

      <form onSubmit={handleCompare} className="bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-md space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Pincode</label>
          <input
            type="text"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="e.g., 110001"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Cart Items</label>
          <textarea
            value={items}
            onChange={(e) => setItems(e.target.value)}
            placeholder="e.g., Hyderabadi Biryani, Amul Milk 1L"
            className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-green-400 h-24"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-bold py-2 rounded transition duration-200 disabled:opacity-50"
        >
          {loading ? 'Comparing Prices Across Apps...' : 'Compare Cart Prices'}
        </button>
      </form>

      {result && (
        <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-md w-full max-w-2xl whitespace-pre-wrap leading-relaxed border border-green-500">
          <h2 className="text-xl font-bold text-green-400 mb-3">⚡ Live Comparison Result:</h2>
          {result}
        </div>
      )}
    </main>
  );
}