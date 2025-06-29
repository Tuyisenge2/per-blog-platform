"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { orpc } from "@/utils/orpc";
import Pusher from "pusher-js";

export default function Home() {
  const [messages, setMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  // 🔗 Setup real-time listener
  useEffect(() => {
    const pusher = new Pusher("6e2d29ee27817f62d38a", {
      cluster: "ap2",
    });
    const channel = pusher.subscribe("chat-channel");
    channel.bind("new-message", (data: { message: string }) => {
      setMessages((prev) => [...prev, data.message]);
    });
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, []);

  // 📤 Send message via orpc
  const pusherRouter = useMutation(
    orpc.pusherRouter.mutationOptions({
      onError: (error) => {
        console.error("Post creation failed:", error);
      },
    })
  );

  const handlePusher = async () => {
    if (!message) return;
    await pusherRouter.mutateAsync({ message });
    setMessage("");
  };

  // ✅ Displaying API health
  const healthCheck = useQuery(orpc.healthCheck.queryOptions());

  return (
    <div className="container mx-auto max-w-3xl px-4 py-2">
      <h2 className="mb-2 text-xl font-semibold">Real-time Chat</h2>

      {/* 🔧 API Status */}
      <div className="mb-4 flex items-center gap-2">
        <div
          className={`h-2 w-2 rounded-full ${
            healthCheck.data ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="text-sm text-muted-foreground">
          {healthCheck.isLoading
            ? "Checking..."
            : healthCheck.data
            ? "Connected"
            : "Disconnected"}
        </span>
      </div>

      {/* 📝 Input + Send Button */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Type a message"
          className="flex-1 border px-3 py-1 rounded"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        {/** biome-ignore lint/a11y/useButtonType: '' */}
        <button
          onClick={handlePusher}
          className="px-4 py-1 bg-blue-600 text-white rounded"
        >
          Send
        </button>
      </div>

      {/* 📥 Message List */}
      <ul className="space-y-1 list-disc list-inside">
        {messages.map((msg, index) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: '
<li key={index}>{msg}</li>
        ))}
      </ul>
    </div>
  );
}









// "use client";
// import { useMutation, useQuery } from "@tanstack/react-query";
// //import type { AppType } from '../../../server/src/index'
// import { hc } from "hono/client";
// import { useRouter } from "next/navigation";
// import { useEffect, useState } from "react";
// import { authClient } from "@/lib/auth-client";
// import { orpc } from "@/utils/orpc";
// import Pusher from "pusher-js";

// const TITLE_TEXT = `yuyi `;

// export default function Home() {
//   const [messages, setMessages] = useState<string[]>([]);
//   const [message, setMessage] = useState("");

//   // biome-ignore lint/correctness/useExhaustiveDependencies: '
//   useEffect(() => {
//     // Connect to Pusher
//     const pusher = new Pusher("6e2d29ee27817f62d38a", {
//       cluster: "ap2",
//     });

//     const channel = pusher.subscribe("chat-channel");

//     // Bind to 'new-message'
//     channel.bind(
//       "new-message",
//       (data: { message: string }) => {
//         setMessages((prev: any) => [...prev, data.message]);
//       },
//       []
//     );
//     return () => {
//       channel.unbind_all();
//       channel.unsubscribe();
//       pusher.disconnect();
//     };
//   }, [setMessages]);

//   // const sendMessage = async () => {
//   // 	if (!message) return;

//   // 	await fetch('http://localhost:3000/message', {
//   // 		method: 'POST',
//   // 		headers: {
//   // 			'Content-Type': 'application/json',
//   // 		},
//   // 		body: JSON.stringify({ message }),
//   // 	});

//   // 	setMessage('');
//   // };

//   //   const router = useRouter();
//   // const { data: session, isPending } = authClient.useSession();
//   // const privateData = useQuery(orpc.privateData.queryOptions());

//   // useEffect(() => {
//   //   if (!session && !isPending) {
//   //     router.push("/login");
//   //   }
//   // }, [session, isPending]);

//   // if (isPending) {
//   //   return <div>Loading...</div>;
//   // }

//   // async function CreatePostButton() {
//   //   const t = useQuery(
//   //     orpc.createPost.queryOptions({
//   //       input: { title: "Hello", body: "Hono is a cool project" },
//   //     })
//   //   );
//   //   const r = useQuery(
//   //     orpc.addPost.queryOptions({
//   //       input: {
//   //         title: "title 1",
//   //         content: "Hono is my fav stack",
//   //         categoryId: 1,
//   //         authorId: "lBZVYuBa0vooER30Q2LO4OLD60M1dnVI",
//   //       } as any,
//   //     })
//   //   );
//   //   console.log("ererere", t, r);
//   // }

//   ///  CreatePostButton();

//   const healthCheck = useQuery(orpc.healthCheck.queryOptions());
//   //const handlepusher= ()=>{
//   const pusherRouter = useMutation(orpc.pusherRouter.mutationOptions(
// 	{
// 			onSuccess: () => {
// 				},
// 			onError: (error) => {
// 				console.error("Post creation failed:", error);
// 			},
// 		}
//   ));

//   const handlePusher = async () => {
//     pusherRouter.mutateAsync({ message: message });
//   };

//   console.log("pusherRouter", pusherRouter);
//   return (
//     <div className='container mx-auto max-w-3xl px-4 py-2'>
//       <pre className='overflow-x-auto font-mono text-sm'>{TITLE_TEXT}</pre>
//       <div className='grid gap-6'>
//         <section className='rounded-lg border p-4'>
//           <h2 className='mb-2 font-medium'>API Status</h2>
//           <div className='flex items-center gap-2'>
//             <div
//               className={`h-2 w-2 rounded-full ${
//                 healthCheck.data ? "bg-green-500" : "bg-red-500"
//               }`}
//             />
//             <span className='text-sm text-muted-foreground'>
//               {healthCheck.isLoading
//                 ? "Checking..."
//                 : healthCheck.data
//                 ? "Connected"
//                 : "Disconnected"}
//             </span>
//           </div>
// 		  <div className="mt-4">
//       <input type="text" className="mt-1 mb-3 " value={message} onChange={(e) => setMessage(e.target.value)} />
// 			{/** biome-ignore lint/a11y/useButtonType: '' */}
//           <button onClick={handlePusher}>submit</button>
// 		  </div>
//         </section>
//       </div>
//     </div>
//   );
// }
