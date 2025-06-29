"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { IoMdClose } from "react-icons/io";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

interface Post {
	id: number;
	title: string;
	content: string;
	image_url: string | null;
	category_id: number | null;
	created_at: string;
}

export default function PostsPage() {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();
	const privateData = useQuery(orpc.privateData.queryOptions());
	const [showSinglePost, setShowSinglePost] = useState(false);
	const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
	const [selectedCategory, setSelectedCategory] = useState<number | "all">(
		"all",
	);
	const deletePostMutation = useMutation(
		orpc.deletePost.mutationOptions({
			onSuccess: () => {
				router.push("/posts");
			},
			onError: (error) => {
				console.error("Post creation failed:", error);
			},
		}),
	);
	const {
		data: categories,
		isLoading: catLoader,
		error: categoryError,
	} = useQuery(orpc.getAllCategories.queryOptions());
	// Fetch posts using oRPC
	const {
		data: posts,
		isLoading,
		error,
	} = useQuery(orpc.getAllpost.queryOptions());

	useEffect(() => {
		if (!session && !isPending) {
			router.push("/login");
		}
	}, [session, isPending]);

	// Helper function to extract first sentence
	const getFirstSentence = (text: string) => {
		const sentenceMatch = text.match(/^.*?[.!?](?=\s|$)/);
		return sentenceMatch
			? sentenceMatch[0]
			: text.split(/\s+/).slice(0, 10).join(" ");
	};

	const handleEdit = (id: number, e: React.MouseEvent) => {
		e.stopPropagation();
		router.push(`/posts/edit/${id}`);
	};

	const handleDelete = async (id: number, e: React.MouseEvent) => {
		e.stopPropagation();
		if (window.confirm("Are you sure you want to delete this post?")) {
			try {
				//   await deletePost(id);

				deletePostMutation.mutate({ id });
				//        setPosts(posts.filter((post) => post.id !== id));
			} catch (error) {
				console.error("Failed to delete post:", error);
			}
		}
	};

	if (error) {
		return (
			<div className="text-center py-12">
				<h3 className="text-xl font-medium text-gray-600">
					Error loading posts
				</h3>
				<p className="text-gray-500 mt-2">
					Failed to load posts. Please try again later.
				</p>
			</div>
		);
	}

	if (isPending || (!isPending && !session)) {
		// Show loader while checking or redirecting
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
			</div>
		);
	}

	return (
		<div className="container mx-auto px-4 py-8">
			<div className="flex justify-between items-center mb-8">
				<h1 className="text-3xl font-bold">Blog Posts</h1>
				<Link
					href="/posts/create"
					className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
				>
					Create New Post
				</Link>
			</div>

			{/* Category Filter */}
			<div className="mb-6 overflow-x-auto">
				<div className="flex gap-2 pb-2">
					<button
						onClick={() => setSelectedCategory("all")}
						className={`px-4 py-2 rounded-lg whitespace-nowrap ${
							selectedCategory === "all"
								? "bg-red-600 text-white"
								: "bg-gray-200 hover:bg-gray-300"
						}`}
					>
						All Posts
					</button>
					{categories &&
						categories.map((category) => (
							<button
								key={category.id}
								onClick={() => setSelectedCategory(category.id)}
								className={`px-4 py-2 rounded-lg whitespace-nowrap ${
									selectedCategory === category.id
										? "bg-red-600 text-white"
										: "bg-gray-200 hover:bg-gray-300"
								}`}
							>
								{category.name}
							</button>
						))}
				</div>
			</div>

			{/* Posts Grid */}
			<div className="w-full">
				{posts?.length === 0 ? (
					<div className="text-center py-12">
						<h3 className="text-xl font-medium text-gray-600">
							No posts found
						</h3>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
						{posts
							?.filter(
								(post) =>
									selectedCategory === "all" ||
									post.category_id === selectedCategory,
							)
							.map((post) => {
								const formattedDate = new Date(
									post.created_at,
								).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								});

								return (
									<div
										key={post.id}
										className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative group"
										onClick={() => {
											setShowSinglePost(true);
											setSelectedPostId(post.id);
										}}
									>
										<div className="absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
											<button
												onClick={(e) => handleEdit(post.id, e)}
												className="p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition"
											>
												<FiEdit2 className="text-gray-600" />
											</button>
											<button
												onClick={(e) => handleDelete(post.id, e)}
												className="p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition"
											>
												<FiTrash2 className="text-red-600" />
											</button>
										</div>

										<div className="h-48 relative overflow-hidden">
											{/* {post.image_url ? (
                      <Image
                        src={post.image_url}
                        alt={post.title}
                        fill
                        className='object-cover'
                        sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
                      />
                    ) : (
                      <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
                        <span className='text-gray-400'>No Image</span>
                      </div>
                    )} */}

											{post.image_url && post.image_url.startsWith("http") ? (
												<Image
													src={post.image_url}
													alt={post.title}
													fill
													className="object-cover"
													sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
												/>
											) : (
												<div className="w-full h-full bg-gray-200 flex items-center justify-center">
													<span className="text-gray-400">No Image</span>
												</div>
											)}
										</div>

										<div className="p-4">
											<h3 className="text-lg font-semibold line-clamp-2">
												{post.title}
											</h3>
											<p className="text-gray-500 text-sm">{formattedDate}</p>
											<p className="text-gray-600 mt-2 line-clamp-2">
												{getFirstSentence(post.content)}
											</p>
										</div>
									</div>
								);
							})}
					</div>
				)}
			</div>

			{/* Single Post Modal */}
			{showSinglePost && selectedPostId && (
				<div className="fixed inset-0 z-50 overflow-y-auto">
					<div
						className="fixed inset-0 bg-black/80"
						onClick={() => setShowSinglePost(false)}
					></div>

					<div className="relative bg-white rounded-lg max-w-4xl w-full mx-auto my-8 p-6 max-h-[90vh] overflow-y-auto">
						<button
							className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
							onClick={() => setShowSinglePost(false)}
						>
							<IoMdClose className="text-2xl text-gray-500" />
						</button>

						{posts
							?.filter((post) => post.id === selectedPostId)
							.map((post) => {
								const formattedDate = new Date(
									post.created_at,
								).toLocaleDateString("en-US", {
									year: "numeric",
									month: "long",
									day: "numeric",
								});

								return (
									<div key={post.id} className="space-y-6">
										{post.image_url && post.image_url.startsWith("http") ? (
											<div className="relative h-64 rounded-lg overflow-hidden">
												<Image
													src={post.image_url}
													alt={post.title}
													fill
													className="object-cover"
												/>
											</div>
										) : (
											<div className="w-full h-full bg-gray-200 flex items-center justify-center">
												<span className="text-gray-400">No Image</span>
											</div>
										)}

										<div className="space-y-4">
											<h2 className="text-2xl font-bold">{post.title}</h2>
											<p className="text-gray-500 text-sm">{formattedDate}</p>
											<div className="prose max-w-none">
												{post.content
													.split("\n\n")
													.map((paragraph: any, i: any) => (
														<p key={i} className="mb-4">
															{paragraph}
														</p>
													))}
											</div>
										</div>
									</div>
								);
							})}
					</div>
				</div>
			)}
		</div>
	);
}

// "use client";

// import Image from "next/image";
// import { IoMdClose } from "react-icons/io";
// import { FiEdit2, FiTrash2 } from "react-icons/fi";
// import { useEffect, useState } from "react";
// import Link from "next/link";
// import { useRouter } from "next/navigation";
// import { useQuery } from "@tanstack/react-query";
// import { orpc } from "@/utils/orpc";
// // import { getPostsByAuthor, deletePost } from "@/actions/posts";
// // import { getAllCategories } from "@/actions/categories";

// interface Post {
//   id: number;
//   title: string;
//   content: string;
//   image_url: string | null;
//   category_id: number | null;
//   created_at: string;
//   category_name?: string;
// }

// interface Category {
//   id: number;
//   name: string;
// }

// interface User {
//   id: number;
//   username: string;
//   email: string;
//   is_admin: boolean;
// }

// export default function PostsPage() {
//   const router = useRouter();
//   const [showSinglePost, setShowSinglePost] = useState(false);
//   const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
//   const [posts, setPosts] = useState<Post[]>([]);
//   const [categories, setCategories] = useState<Category[]>([]);
//   const [selectedCategory, setSelectedCategory] = useState<number | "all">("all");
//   const [loading, setLoading] = useState(true);
//   const [currentUser, setCurrentUser] = useState<User | null>(null);

//   // useEffect(() => {
//   //   // Get user from localStorage
//   //   const userData = localStorage.getItem('user');
//   //   if (userData) {
//   //     const user = JSON.parse(userData);
//   //     setCurrentUser(user);
//   //   } else {
//   //     // Redirect to login if no user found
//   //     router.push('/login');
//   //   }
//   // }, [router]);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!currentUser?.id) return;
//       try {
//         const [postsData, categoriesData] = await Promise.all([
//    [] , [],
//         ]);

//         const enhancedPosts = postsData.map((post:any) => ({
//           ...post,
//           category_name:
//             "Uncategorized",
//         }));

//         setPosts(enhancedPosts);
//         setCategories(categoriesData);
//       } catch (err) {
//         console.error("Failed to fetch data:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [currentUser?.id]);

//      const t = useQuery(orpc.getAllpost.queryOptions()
//     );
//     console.log('TTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTtttDDDDDDDDDDDDDDDDDDDDDDDDDDdd',t?.data)

//   // Helper function to extract first sentence
//   const getFirstSentence = (text: string) => {
//     const sentenceMatch = text.match(/^.*?[.!?](?=\s|$)/);
//     return sentenceMatch ? sentenceMatch[0] : text.split(/\s+/).slice(0, 10).join(' ');
//   };

//   const handleDelete = async (id: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     if (window.confirm("Are you sure you want to delete this post?")) {
//       try {
//      //   await deletePost(id);
//         deletePostMutation.mutate({});
// //        setPosts(posts.filter((post) => post.id !== id));
//       } catch (error) {
//         console.error("Failed to delete post:", error);
//       }
//     }
//   };

//   const handleEdit = (id: number, e: React.MouseEvent) => {
//     e.stopPropagation();
//     router.push(`/posts/edit/${id}`);
//   };

//   const filteredPosts =
//     selectedCategory === "all"
//       ? posts
//       : posts.filter((post) => post.category_id === selectedCategory);

//   if (!currentUser) {
//     return (
//       <div className="flex justify-center items-center min-h-screen">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
//       </div>
//     );
//   }

//   if (loading) {
//     return (
//       <div className='flex justify-center items-center min-h-screen'>
//         <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600'></div>
//       </div>
//     );
//   }

//   return (
//     <div className='container mx-auto px-4 py-8'>
//       <div className='flex justify-between items-center mb-8'>
//         <div>
//           <h1 className='text-3xl font-bold'>My Blog Posts</h1>
//           <p className="text-gray-600">Welcome back, {currentUser.username}</p>
//         </div>
//         <Link
//           href='/posts/create'
//           className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition'
//         >
//           Create New Post
//         </Link>
//       </div>

//       {/* Category Filter */}
//       <div className='mb-6 overflow-x-auto'>
//         <div className='flex gap-2 pb-2'>
//           <button
//             onClick={() => setSelectedCategory("all")}
//             className={`px-4 py-2 rounded-lg whitespace-nowrap ${
//               selectedCategory === "all"
//                 ? "bg-red-600 text-white"
//                 : "bg-gray-200 hover:bg-gray-300"
//             }`}
//           >
//             All Posts
//           </button>
//           {categories.map((category) => (
//             <button
//               key={category.id}
//               onClick={() => setSelectedCategory(category.id)}
//               className={`px-4 py-2 rounded-lg whitespace-nowrap ${
//                 selectedCategory === category.id
//                   ? "bg-red-600 text-white"
//                   : "bg-gray-200 hover:bg-gray-300"
//               }`}
//             >
//               {category.name}
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Posts Grid */}
//       <div className='w-full'>
//         {filteredPosts.length === 0 ? (
//           <div className="text-center py-12">
//             <h3 className="text-xl font-medium text-gray-600">No posts found</h3>
//             <p className="text-gray-500 mt-2">
//               You haven't created any posts yet. Click "Create New Post" to get started.
//             </p>
//           </div>
//         ) : (
//           <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
//             {filteredPosts.map((post) => {
//               const formattedDate = new Date(post.created_at).toLocaleDateString(
//                 "en-US",
//                 {
//                   year: "numeric",
//                   month: "long",
//                   day: "numeric",
//                 }
//               );

//               return (
//                 <div
//                   key={post.id}
//                   className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 relative group'
//                   onClick={() => {
//                     setShowSinglePost(true);
//                     setSelectedPostId(post.id);
//                   }}
//                 >
//                   <div className='absolute top-4 right-4 flex gap-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity'>
//                     <button
//                       onClick={(e) => handleEdit(post.id, e)}
//                       className='p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition'
//                     >
//                       <FiEdit2 className='text-gray-600' />
//                     </button>
//                     <button
//                       onClick={(e) => handleDelete(post.id, e)}
//                       className='p-2 bg-white rounded-full shadow-md hover:bg-red-50 transition'
//                     >
//                       <FiTrash2 className='text-red-600' />
//                     </button>
//                   </div>

//                   <div className='h-48 relative overflow-hidden'>
//                     {post.image_url ? (
//                       <Image
//                         src={post.image_url}
//                         alt={post.title}
//                         fill
//                         className='object-cover'
//                         sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
//                       />
//                     ) : (
//                       <div className='w-full h-full bg-gray-200 flex items-center justify-center'>
//                         <span className='text-gray-400'>No Image</span>
//                       </div>
//                     )}
//                   </div>

//                   <div className='p-4'>
//                     <div className='flex justify-between items-start mb-2'>
//                       <h3 className='text-lg font-semibold line-clamp-2'>
//                         {post.title}
//                       </h3>
//                       <span className='text-xs px-2 py-1 bg-gray-100 rounded-full'>
//                         {post.category_name}
//                       </span>
//                     </div>
//                     <p className='text-gray-500 text-sm'>{formattedDate}</p>
//                     <p className='text-gray-600 mt-2 line-clamp-2'>
//                       {getFirstSentence(post.content)}
//                     </p>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>

//       {/* Single Post Modal */}
//       {showSinglePost && selectedPostId && (
//         <div className='fixed inset-0 z-50 overflow-y-auto'>
//           <div
//             className='fixed inset-0 bg-black/80'
//             onClick={() => setShowSinglePost(false)}
//           ></div>

//           <div className='relative bg-white rounded-lg max-w-4xl w-full mx-auto my-8 p-6 max-h-[90vh] overflow-y-auto'>
//             <button
//               className='absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100'
//               onClick={() => setShowSinglePost(false)}
//             >
//               <IoMdClose className='text-2xl text-gray-500' />
//             </button>

//             {posts
//               .filter((post) => post.id === selectedPostId)
//               .map((post) => {
//                 const formattedDate = new Date(
//                   post.created_at
//                 ).toLocaleDateString("en-US", {
//                   year: "numeric",
//                   month: "long",
//                   day: "numeric",
//                 });

//                 return (
//                   <div key={post.id} className='space-y-6'>
//                     {post.image_url && (
//                       <div className='relative h-64 rounded-lg overflow-hidden'>
//                         <Image
//                           src={post.image_url}
//                           alt={post.title}
//                           fill
//                           className='object-cover'
//                         />
//                       </div>
//                     )}

//                     <div className='space-y-4'>
//                       <div className='flex justify-between items-start'>
//                         <h2 className='text-2xl font-bold'>{post.title}</h2>
//                         <span className='text-sm px-3 py-1 bg-gray-100 rounded-full'>
//                           {post.category_name}
//                         </span>
//                       </div>

//                       <p className='text-gray-500 text-sm'>{formattedDate}</p>

//                       <div className='prose max-w-none'>
//                         {post.content.split("\n\n").map((paragraph, i) => (
//                           <p key={i} className='mb-4'>
//                             {paragraph}
//                           </p>
//                         ))}
//                       </div>
//                     </div>
//                   </div>
//                 );
//               })}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }
