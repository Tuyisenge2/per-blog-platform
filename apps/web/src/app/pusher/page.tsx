"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";

export default function PusherClient() {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    // Connect to Pusher
    const pusher = new Pusher("6e2d29ee27817f62d38a", {
      cluster: "ap2",
    });

    const channel = pusher.subscribe("chat-channel");

    // Bind to 'new-message'
    channel.bind("new-message", (data: { message: string }) => {
      setMessages((prev) => [...prev, data.message]);
    });

    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  
  const sendMessage = async () => {
    if (!message) return;

    await fetch("http://localhost:3000/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    setMessage("");
  };

  return (
    <div className='mt-6'>
      <h2 className='text-xl font-semibold mb-2'>Simple Pusher Chat</h2>
      <div className='flex gap-2 mb-4'>
        <input
          type='text'
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder='Type a message'
          className='border p-2 rounded w-full'
        />
        {/** biome-ignore lint/a11y/useButtonType: '' */}
        <button
          onClick={sendMessage}
          className='bg-blue-600 text-white px-4 py-2 rounded'
        >
          Send
        </button>
      </div>
      <ul className='space-y-1'>
        {messages.map((msg, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: ''
          <li key={i} className='bg-gray-100 p-2 rounded'>
            {msg}
          </li>
        ))}
      </ul>
    </div>
  );
}
